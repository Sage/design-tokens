# Design: MCP Hardening (Test Suite + Report + Documentation)

**Date:** 2026-05-28
**Status:** Draft for review
**Branch:** `feat/enriched-tokens-mcp` (continuation)
**Builds on:** `docs/superpowers/specs/2026-05-27-sage-tokens-mcp-enriched-design.md`

## Goal

Before considering a Phase 2 upstream PR to Sage, subject the enriched MCP server
to a thorough hardening pass that:

1. **Proves data integrity** against the existing Sage build outputs (no silent
   token loss; values match what Sage ships today),
2. **Stresses the tool API** against adversarial/edge-case inputs,
3. **Verifies the real wire protocol** by talking to the spawned server over
   MCP/stdio, and
4. **Validates realistic AI-agent query scenarios** end-to-end.

All four classes run as part of `npm test`. A separate `npm run mcp:report`
generates a snapshot Markdown for documentation and PR artefacts. The
`mcp/README.md` documents what the server does, how to run it, and what the
hardening guarantees.

## Non-goals (explicitly out of scope)

- Performance/load benchmarks — at 1532 tokens, latency is trivial.
- End-user "how-to" guide for downstream consumers — this is a later phase;
  documentation will grow into `mcp/README.md` naturally.
- CI pipeline changes — `npm test` already runs in CI; the new tests join
  automatically.
- Multi-OS test matrix — repo targets Node ≥22; one OS is sufficient.

## Architecture

```
tests/hardening/
  data-integrity.test.ts     # all 1532 tokens: schema, refChain, consistency vs dist
  adversarial-input.test.ts  # malformed tool args: createTools stays robust
  mcp-e2e.test.ts            # real server subprocess via @modelcontextprotocol/sdk Client
  agent-scenarios.test.ts    # typical AI agent queries → expected results
  self-containment.test.ts   # repo is self-contained: no external paths, docs complete

scripts/mcp-report.ts            # statistics → mcp/REPORT.md (token counts, refChain histogram, …)
scripts/verify-fresh-clone.sh    # optional: documents the fresh-clone setup as executable steps

mcp/README.md                # new: what the MCP does, how to run, what hardening guarantees
mcp/REPORT.md                # generated snapshot, committed (see Report section)
README.md                    # root README: add a short MCP section linking to mcp/README.md
```

All hardening files use `.ts` and follow the existing `tests/` style
(vitest, `describe`/`it`/`expect`, ESM `.js` imports, file-read at module
load — same pattern as `tests/light-all.test.ts`).

## Test class 1: Data integrity (`tests/hardening/data-integrity.test.ts`)

**Most important for an eventual upstream PR.** Proves the enriched MCP output
matches what Sage already ships and contains no silent omissions.

### Invariants over the merged map (`dist/mcp/tokens.json`)

For every one of the ~1532 entries:

- Required fields present: `name`, `type`, `value`, `layer`, `category`,
  `refChain`. `reference` may be `null`; `description` is optional.
- `layer ∈ {"core", "global", "mode", "component"}`.
- `category` is non-empty.
- `refChain` is either an array of strings, or a `{light, dark}` object with
  array values (mode-divergent references).
- The map key equals `entry.name` (no key/name drift).

### refChain termination

For every token whose `refChain` is non-empty (in either mode form), the
final referenced path resolves to a literal — i.e. the last segment must
map to a token in `dist/mcp/tokens.json` whose `reference` is `null`.
This catches dangling or broken alias chains.

### Completeness vs. `dist/css`

Reading the standard CSS outputs with the repo's existing `parseCSSFile`
utility (`tests/utils/index.ts`):

- Every `--var` declared in `dist/css/global.css`, `dist/css/light.css`,
  `dist/css/dark.css`, and `dist/css/components/*.css` corresponds to a
  token in `dist/mcp/tokens.json` with the matching name (after stripping
  the `--` prefix). No token is silently lost.

This is a one-way check (CSS → MCP). The MCP additionally surfaces `core`
tokens, which Sage's build does not emit to CSS as standalone variables
(`core` is a source layer consumed by other layers). The reverse direction
(every MCP token must appear in CSS) would therefore fail by design for
the `core` layer and is intentionally not asserted. `core` token
correctness is covered by the schema invariants and refChain termination
checks instead.

### Value consistency

For resolved values (where the CSS contains a literal, not a `var()`
reference):

- For `layer ∈ {"global", "mode"}`: `MCP.value` for the relevant mode
  must exactly equal the CSS value.

For `layer === "component"` CSS often contains `var(--…)` references
rather than literals. In that case:

- The first `var(--name)` referenced by the component CSS must equal the
  first entry of the MCP token's `refChain` (after CSS-name → dotted-path
  conversion, mirroring the format's name transform).

If a component-CSS value happens to be a literal (no `var()`), the test
falls through to the resolved-value comparison above. This handles both
shapes without arbitrarily skipping tokens.

### Sample counts

- Total tokens > 1000.
- At least one token per expected category from `data/tokens/components/`.

## Test class 2: Adversarial input (`tests/hardening/adversarial-input.test.ts`)

Drives `createTools` directly (no server spawn). Verifies the pure logic
layer handles malformed inputs without crashes or silent `undefined`s.

### `get_token`
- `name: null`, `undefined`, `""`, a number, a 10 KB string, special chars
  (`{`, `}`, `\n`) → returns `{found: false}` with a meaningful error
  message, never throws.
- `mode: "oops"` → throws with a clear "Invalid mode" message (this is the
  guard added in the final-review fix).

### `search_tokens`
- `query: ""`, `"   "` (whitespace-only), Unicode characters, 10 KB string,
  array/object/number → does not throw, returns a result object with
  `count` and `results` (possibly empty).
- `limit: 0` → returns `results: []`, `truncated: false`.
- `limit: -1` → returns a sensible result (either empty or a non-negative
  slice — verify behaviour and assert it stays stable).
- `limit: 99999` → returns up to actual matches, `truncated: false`.
- `layer: "unknown-layer"` → returns empty `results` (filter rejects all),
  no throw.

### `list_tokens_by_category`
- `category: "does-not-exist"` → returns `{count: 0, tokens: []}`,
  `truncated: false`.
- `limit: 0` → returns `{count: matching.length, tokens: [], truncated: …}`
  (using the corrected `truncated` logic from the final-review fix).

Each adversarial case is one focused test with a clear name; failure
messages identify the exact malformed input.

## Test class 3: End-to-end over MCP protocol (`tests/hardening/mcp-e2e.test.ts`)

The "real" hardening test. Spawns `mcp/server.js` as a subprocess and
talks to it through `@modelcontextprotocol/sdk` Client +
`StdioClientTransport`. Exercises the same wire path an AI assistant uses.

### Setup/teardown
- `beforeAll`: spawn the server via `StdioClientTransport`, call
  `client.connect()`.
- `afterAll`: `await client.close()` — verify no process leaks (check the
  child's exit signal in a teardown assertion).

### Cases
- `tools/list` returns exactly the four expected tool names, in any order,
  each with a non-empty description and a JSON Schema `inputSchema`.
- `tools/call` for `get_token` with a known kebab-case name returns a
  text-content response whose JSON parses to a `{found: true, token}`
  matching the data-integrity invariants.
- `tools/call` for `search_tokens` with `{query: "color", layer: "core"}`
  returns `count > 0`, all results with `layer === "core"`.
- `tools/call` for `list_categories` returns the expected category names.
- `tools/call` for `list_tokens_by_category` with a known category returns
  a non-empty token list including `description` for known-described
  tokens (e.g. `core-color-black`).
- `tools/call` with an unknown tool name returns `isError: true` with a
  structured error body.

### Fallback if the SDK Client API differs from expectation
If `@modelcontextprotocol/sdk` v1.29 client API surface does not match the
spawning pattern described, fall back to: spawn `node mcp/server.js`
directly via `child_process.spawn`, write framed JSON-RPC requests to
stdin, read responses from stdout. Document the chosen approach in the
test file's top comment.

## Test class 4: Realistic agent scenarios (`tests/hardening/agent-scenarios.test.ts`)

Qualitative tests against `createTools` with the real `dist/mcp/tokens.json`.
Phrased as "an agent asks X, MCP should return Y-ish" — not exact-result
assertions (those would brittle on data updates).

### Cases
- `"button primary background color"` → `search_tokens` returns
  `count ≥ 1`, results include a name containing both "button" and
  "primary" and "bg".
- `"focus outline"` → at least one result with `category === "focus"`.
- `"global space 100"` → returns `global-space-100` token (exact match
  expected since this name is stable).
- `get_token({name: "core-color-black"})` → token has a non-empty
  `description` (proves the description pass-through works against real
  data).
- `get_token({name: "button-typical-primary-bg-default", mode: "dark"})`
  → `value` is a single string (mode-reduced), not an object.
- `search_tokens({query: "color", layer: "core"})` → every result has
  `layer === "core"`.

Each test uses lower-bound assertions (`>= 1` matches, contains expected
substrings) rather than exact lists, so token additions don't break the
suite.

## Test class 5: Repository self-containment (`tests/hardening/self-containment.test.ts`)

Asserts that the repository works as a standalone artefact after a fresh clone:
no external paths, no orphan documentation, no reliance on any prior local
installation outside the repo. This is what makes the work credible as a
candidate for upstream contribution — anyone checking out the branch must be
able to run the MCP without inheriting our local history.

### Tests

- **No host-absolute paths in versioned code.** A scan over all
  git-tracked files under `mcp/`, `scripts/`, `tests/`, and the repo root
  (excluding `docs/superpowers/` — historical work documents) finds zero
  occurrences of `/Users/`, `/home/`, or a `C:\` drive prefix.
- **No references to a legacy external wrapper.** A scan of the same
  scope finds zero occurrences of the legacy wrapper filename
  (`Sage-Design-Tokens/index.js`). Historical specs under
  `docs/superpowers/` are exempt and may reference it for context.
- **`mcp/README.md` exists with required sections.** The file is present
  and its `##` headings include (case-insensitive substring match):
  "what", "running", "tools", "hardening", "roadmap".
- **Root `README.md` references the MCP.** Contains either a heading
  mentioning MCP or a link to `mcp/README.md`.
- **`mcp/package.json` is self-contained.** Parses as valid JSON; has a
  `dependencies` map listing `@modelcontextprotocol/sdk`; the lockfile
  `mcp/package-lock.json` is present (reproducible installs).
- **`dist/mcp/tokens.json` is reproducible without secrets.** The build
  step that produces it does not require any env var (notably
  `FIGMA_ACCESS_TOKEN`) — the file is present after `npm run build` even
  when a later postbuild step (icons fetch) fails. The test verifies this
  by checking that `scripts/postbuild.ts` invokes the merge before the
  icon fetch (textual check on the IIFE ordering).

### Optional helper

`scripts/verify-fresh-clone.sh` documents the fresh-clone setup as an
executable script: `npm ci` at the root, `npm run build`, then
`(cd mcp && npm ci)`. It is not invoked by `npm test` — it is a sanity
aid that doubles as living documentation for onboarding. Referenced from
`mcp/README.md`'s "Running it" section.

## Report script (`scripts/mcp-report.ts`)

Reads `dist/mcp/tokens.json` and writes `mcp/REPORT.md`. Run via
`npm run mcp:report` (new entry in root `package.json` `scripts`).

### Contents
- Header with generation date and current git commit SHA + branch.
- Totals: total tokens, breakdown by `layer`, breakdown by `category`.
- refChain depth histogram: how many tokens have refChain length 0, 1,
  2, 3, 4+.
- Description coverage: count and percentage of tokens with a
  `description` field.
- Mode divergence: how many tokens have `{light, dark}` value (different
  per mode) vs. a single string value (identical or mode-independent).
- Per-layer sample: 3 token names per layer (deterministic — first three
  by name order).

### Output handling
`mcp/REPORT.md` is regenerated on each `npm run mcp:report` and is
committed (not gitignored). Committing the snapshot makes the hardening
state visible in PR diffs — anyone reviewing the eventual Sage upstream PR
sees the current numbers without needing to run the script. It is not
generated as part of `npm run build` (would clutter every build).

## Documentation (`mcp/README.md`)

A new top-level file inside the `mcp/` directory, mirroring the tone of
the rest of the Sage repo (English, brief, factual, with a copyright
header matching other source files).

### Structure (sections, in order)
1. **What it is** — two-sentence summary: an MCP server exposing the
   enriched `@sage/design-tokens` build with light/dark values,
   `$description` context, and resolved alias/layer chains.
2. **Running it** — point an MCP client at `mcp/server.js` after running
   `npm run build` in the repo root. Example for Claude Code config.
3. **Tools** — four bullets, one per tool, each with input/output
   highlights.
4. **Data source** — `dist/mcp/tokens.json`; built by the
   `custom/json-enriched` format + the postbuild light/dark merge.
5. **Hardening** — four bullets, one per test class, each one line
   ("what it guarantees" + file path). Link to `REPORT.md` for the
   current snapshot.
6. **Roadmap** — single line: "Phase 2: contribute the enriched format
   upstream to `@sage/design-tokens` so the MCP can ship with the
   package."

No TODO stubs for the future user-facing how-to — that content grows in
when written.

## Risks and unknowns

- **`@modelcontextprotocol/sdk` v1.29 client API**: the Client +
  `StdioClientTransport` pattern is the documented v1.x shape, but the
  exact import paths / lifecycle methods are confirmed during E2E test
  implementation. Fallback to raw spawning is documented above.
- **Component CSS value shape**: the data-integrity test assumes
  `dist/css/components/*.css` uses `var()` references for component
  tokens with aliases. If some component CSS files contain literals
  instead, the per-token comparison falls through to the resolved-value
  branch — this is intentional, not a special case.
- **Adversarial limit values**: `-1` behaviour with `Array.slice(0, -1)`
  returns all-but-the-last element. The test will assert and document
  the chosen behaviour rather than prescribe one — current code accepts
  the slice semantics.

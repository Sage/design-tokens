# Design: Enriched Sage Tokens MCP (Phase 1)

**Date:** 2026-05-27
**Status:** Draft for review
**Topic:** Standalone MCP server inside the repo that delivers Sage Design Tokens with
light/dark values, `$description` context, and resolved alias/layer chains.
Replaces an earlier external wrapper prototype.

## Motivation

An earlier external wrapper prototype consumed the published npm package
`@sage/design-tokens` (export `js/common`) — the leanest dist output, pure
`key → value` pairs. Three structural deficiencies drove that architecture choice;
each is solved here at the root:

| Deficiency | Cause |
|---|---|
| **Light missing** | A flattened index keyed by token name without a mode prefix causes name collisions: `light`/`dark` share keys (`modeColorNone`…), `dark` overwrites `light` during indexing → the `light` category disappears. No data loss in the source — an indexing bug. |
| **No context** | All published dist outputs (`js`, `json`, `css`, `scss`) are flattened. `$description` exists only in the source files `data/tokens/*.json`, and `data/` is not published to the npm package. |
| **No layers** | The dist is fully resolved. The 4-layer architecture (core → global → mode → component) together with alias references and `$extensions` lives exclusively in `data/tokens/*.json`. |

Key point: context and layers exist **only** in `data/tokens/` of this repo. An
MCP that wraps the npm dist artefact externally cannot structurally deliver them;
an MCP that lives inside the repo and builds against the source can.

## Goal & Scope

- **Phase 1 (this spec):** Run the MCP locally against the repo source, with light+dark,
  context, and resolved alias chains. Data source = local `design-tokens` repo
  (freshness via `git pull` + `npm run build`).
- **Phase 2 (separate spec, NOT here):** Contribute the enriched build format upstream
  to Sage as a PR, making it part of `@sage/design-tokens`.

### Chosen approach: B — Enriched build format

A new style-dictionary format produces an enriched JSON. Rationale over alternatives:

- **A (custom resolver in the MCP):** rejected — would re-implement the style-dictionary/sd-transforms
  resolution (lch modifier, resolveMath, mode overrides); correctness risk on values.
- **C (hybrid merge from `data/tokens` + `dist/json`):** rejected — the key mapping
  source (`core.color.black`) ↔ dist (`modeColorBrandDefault`) is built internally by
  style-dictionary; hard to reconstruct correctly externally, no upstream artefact.
- **B:** Resolution comes from the official pipeline (values exactly as in CSS), builds on
  the existing `*WithRefs` formats, and the enriched JSON IS the Phase 2 upstream artefact.

## Architecture

All three parts live in the `design-tokens` repo (so Phase 2 is a coherent PR folder):

```
data/tokens/*.json  ──(build)──▶  dist/mcp/tokens.json  ──(reads)──▶  mcp/server.js  ──stdio──▶ Claude
   (source: $desc,                 (enriched,                           (thin wrapper)
    aliases, layers)                light+dark, refs)
```

- The MCP code lives in the repo under `mcp/` with its own `package.json` and dependencies —
  a self-contained component with no external paths.
- Onboarding: `npm install` + `npm run build` in the repo root, `npm install` in `mcp/`,
  then point the MCP client (e.g. Claude Code) at `mcp/server.js`. The exact steps are
  documented in `mcp/README.md` (separate spec).

## Component 1: Enriched token format

### Output schema (per token in `dist/mcp/tokens.json`)

```json
{
  "name": "button-primary-bg-default",
  "type": "color",
  "value": { "light": "#000000", "dark": "#FFFFFF" },
  "layer": "component",
  "category": "button",
  "reference": "{mode.color.brand.default}",
  "refChain": ["mode.color.brand.default", "core.color.black"],
  "description": "Base color for secondary, Tertiary and Subtle buttons…"
}
```

Field sourcing:

- `name` — `token.name` (kebab-case, via `name/kebab` transform).
- `type` — `token.$type`.
- `value` — resolved `token.value` from the official resolution. For mode-dependent tokens
  an object `{ light, dark }`; for mode-independent ones (core/global) a single string.
- `layer` — derived from the token path/source file: `core | global | mode | component`.
- `category` — component/file name (as today: `button`, `input`, `global`, …).
- `reference` — `token.original.$value` if it is a `{…}` reference; otherwise `null`.
- `refChain` — recursively resolved alias chain from the direct reference to the literal token.
- `description` — `token.$description` (may be absent → omit).

## Component 2: Build

- New format `custom/json-enriched` in `scripts/formats/outputEnrichedJSON.ts`,
  registered in `scripts/style-dictionary.ts` (analogous to `custom/json-with-refs`).
  Operates over `dictionary.allTokens` and accesses `name`, `value`,
  `original.$value`, `$type`, `$description` per token; `refChain` via recursive reference following.
- Because the build runs separately per mode (`build.ts` iterates `modes`), the format
  produces `dist/mcp/tokens.light.json` and `dist/mcp/tokens.dark.json`.
- A step in `scripts/postbuild.ts` merges both into `dist/mcp/tokens.json` with
  `value: { light, dark }`. Mode-independent tokens (identical value in both) receive a
  string. **This deliberate merge fixes the light bug at the root** (light is unified rather than overwritten).

## Component 3: MCP server (`mcp/server.js`)

Thin wrapper, loads `dist/mcp/tokens.json` into an in-memory index at startup.
Tools:

| Tool | Behaviour |
|---|---|
| `get_token(name, mode?)` | Returns the token with `value` (both modes) + `reference` + `refChain` + `description` + `layer`. `mode?` (`light`\|`dark`) reduces `value` to a single string. Fuzzy fallback on name mismatch. |
| `search_tokens(query, category?, layer?, limit?)` | Multi-word substring search over token names, optionally filtered by `category` and/or `layer` (`core`\|`global`\|`mode`\|`component`). Results include `value` + `description`. |
| `list_categories()` | Lists all categories (`core`, `global`, `mode`, plus each component) with token count. |
| `list_tokens_by_category(category, limit?)` | Lists tokens in a category with name, value, and description. |

No separate `get_token_chain` tool — the chain is included in `get_token` (YAGNI).

## Error handling

- Start without `dist/mcp/tokens.json` → clear message "Build missing, run `npm run build`"
  (no silent empty index).
- Token not found → fuzzy suggestions (as today).
- Invalid `layer`/`mode` → error with allowed values.

## Tests (vitest)

- **Light-bug regression:** A `mode-color-*` token has different `value.light`/`value.dark`,
  and `light` is not lost.
- **Format test:** `button-primary-bg-default` → checks `value.light/dark`, `refChain`,
  `description`, `layer`.
- **MCP function:** `get_token`, `search_tokens` with `layer` filter against a fixture `tokens.json`.

## Explicitly out of scope

- stdio transport only (no HTTP).
- No auto-rebuild/watch — freshness via `git pull` + `npm run build`.
- No additional modes beyond light/dark.
- Phase 2 (upstream PR to Sage) is a separate spec/plan.

## Open risks

- **`refChain` construction:** style-dictionary provides reference utilities, but the recursive
  resolution across multiple layers must be verified against real tokens during implementation
  (e.g. tokens with `$extensions` modifiers or math expressions).
- **light/dark merge assumption:** Assumes token names are identical across both mode builds.
  Verify during implementation with a diff of the two mode outputs.

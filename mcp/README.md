<!--
Copyright © 2026 The Sage Group plc or its licensors. All Rights reserved.
-->

# Sage Design Tokens MCP

An MCP (Model Context Protocol) server that exposes the Sage Design Tokens with
light/dark values, source `$description` context, and resolved alias/layer
chains. It reads a build artefact produced by this repo (`dist/mcp/tokens.json`)
and serves it to AI coding assistants over stdio.

## What it is

A self-contained component inside `@sage/design-tokens`. Source tokens in
`data/tokens/` are compiled by a style-dictionary build into
`dist/mcp/tokens.json` (enriched, light/dark merged). The server in `mcp/`
loads that file and serves four tools to MCP clients.

## Running it

```bash
# From the repo root, on a fresh clone:
npm install
npm run build              # produces dist/mcp/tokens.json (≈ 675 KB)
(cd mcp && npm install)    # installs the MCP SDK for the server runtime
```

Then point an MCP client at `mcp/server.js`. For Claude Code, add the
following entry to `~/.claude.json` under `mcpServers`:

```json
"sage-design-tokens": {
  "type": "stdio",
  "command": "node",
  "args": ["<absolute path to this repo>/mcp/server.js"],
  "env": {}
}
```

Restart the client. Verify with `list_categories` — the response should
include `core`, `global`, `mode`, and every component category. There is no
separate `light`/`dark` category; mode-dependent tokens carry `value:{light,dark}`
instead.

## Tools

| Tool | Purpose |
|---|---|
| `get_token(name, mode?)` | Look up a token by kebab-case name. Returns the enriched entry (value, type, layer, category, reference, refChain, description). With `mode = "light" \| "dark"`, mode-dependent fields are reduced to that mode's value. |
| `search_tokens(query, category?, layer?, limit?)` | Multi-word substring search over token names. Optional filters: `category`, `layer ∈ {core, global, mode, component}`. |
| `list_categories()` | All categories with token counts. |
| `list_tokens_by_category(category, limit?)` | All tokens in a category, including their `description` where available. |

## Data source

`dist/mcp/tokens.json` is a flat map keyed by kebab-case token name. Each entry
has the shape:

```json
{
  "name": "button-typical-primary-bg-default",
  "type": "color",
  "value": { "light": "#00811f", "dark": "#00f142" },
  "layer": "component",
  "category": "button",
  "reference": "{mode.color.action.main.default}",
  "refChain": { "light": ["mode.color.action.main.default", "core.color.brand.60"],
                "dark":  ["mode.color.action.main.default", "core.color.brand.40"] },
  "description": "..."
}
```

Mode-independent fields collapse to a single string instead of `{light, dark}`.

## Hardening

The MCP is covered by five test classes under `tests/hardening/`, all run by
`npm test`:

- `data-integrity.test.ts` — every token in `dist/mcp/tokens.json` satisfies
  the schema; every alias chain terminates at a literal; every `--var` in
  `dist/css/*` exists as a token; values match `dist/css` for resolved layers.
- `adversarial-input.test.ts` — `get_token` / `search_tokens` /
  `list_tokens_by_category` handle null / empty / oversized / Unicode /
  negative-limit inputs without crashing and with stable response shapes.
- `agent-scenarios.test.ts` — realistic AI-agent queries
  (multi-word search, mode reduction, layer filter, alias-chain visibility)
  return meaningful results.
- `mcp-e2e.test.ts` — the server is spawned as a subprocess and driven through
  the real MCP wire protocol via `@modelcontextprotocol/sdk` Client; all four
  tools answer correctly.
- `self-containment.test.ts` — no host-absolute paths, no references to a
  legacy external wrapper, this README contains the required sections, the
  root README points here, and `dist/mcp/tokens.json` is reproducible
  without secrets.

A snapshot of token counts, refChain depth, description coverage, and mode
divergence is committed alongside the source at [`REPORT.md`](./REPORT.md) and
can be regenerated with `npm run mcp:report`.

For a hands-off check that a fresh clone of the repo works end-to-end, see
`scripts/verify-fresh-clone.sh`.

## Roadmap

Phase 2: contribute the enriched build format upstream to `@sage/design-tokens`
so the MCP can ship with the package and downstream consumers can use it
without cloning the repo. Tracked separately.

# Enriched Tokens MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `sage-tokens-mcp` to deliver light/dark values, `$description` context and resolved alias/layer chains — sourced from a new enriched style-dictionary build output.

**Architecture:** A new style-dictionary format (`custom/json-enriched`) produces one enriched JSON file per mode. A postbuild step merges light+dark into `dist/mcp/tokens.json` with `value:{light,dark}`. The MCP server (`mcp/server.js`) reads only this single file and exposes extended tools. Everything lives in the `design-tokens` repo so that Phase 2 (upstream PR) is a self-contained folder.

**Tech Stack:** TypeScript, style-dictionary v5, @tokens-studio/sd-transforms, @modelcontextprotocol/sdk, vitest, Node ≥22.

**Spec:** `docs/superpowers/specs/2026-05-27-sage-tokens-mcp-enriched-design.md`

**Branch:** `feat/enriched-tokens-mcp` (already created)

---

## Design decisions (binding for all tasks)

**Enriched token schema** (entry in `dist/mcp/tokens.json`, key = token name in kebab-case):

```jsonc
{
  "button-primary-bg-default": {
    "name": "button-primary-bg-default",
    "type": "color",
    "value": { "light": "#000000", "dark": "#FFFFFF" },   // String if light==dark
    "layer": "component",                                   // core | global | mode | component
    "category": "button",                                   // button | global | core | mode
    "reference": "{mode.color.brand.default}",              // null if literal
    "refChain": ["mode.color.brand.default", "core.color.black"],
    "description": "Base color for ... buttons."            // missing if no $description
  }
}
```

**Merge rule (light/dark):** Per field `value`/`reference`/`refChain`: if equal (deep-equal) → single value; otherwise → `{ "light": …, "dark": … }`. `type`/`layer`/`category`/`description` are taken from the light build (identical in both modes).

**Layer/category derivation** from `token.filePath`:
- `/components/<x>.json` → layer `component`, category `<x>`
- `/mode/` → layer `mode`, category `mode`
- `/global/` → layer `global`, category `global`
- `/core.json` → layer `core`, category `core`

**Transform group for the mcp platform:** `groups.css` (provides kebab-case names via `name/kebab` and CSS-resolved values including `ts/color/modifiers`).

---

## Task 1: Create and register the enriched format

**Files:**
- Create: `scripts/formats/outputEnrichedJSON.ts`
- Modify: `scripts/style-dictionary.ts` (import + `registerFormat`)

- [ ] **Step 1: Write the format file**

Create `scripts/formats/outputEnrichedJSON.ts`:

```typescript
import { Dictionary, DesignToken } from "style-dictionary/types";
import { usesReferences, getReferences } from "style-dictionary/utils";

const layerFromFilePath = (fp = ""): string => {
  if (fp.includes("/components/")) return "component";
  if (fp.includes("/mode/")) return "mode";
  if (fp.includes("/global/")) return "global";
  if (fp.endsWith("/core.json") || fp.endsWith("core.json")) return "core";
  return "unknown";
};

const categoryFromFilePath = (fp = ""): string => {
  const m = fp.match(/\/components\/([^/]+)\.json$/);
  if (m && m[1]) return m[1];
  if (fp.includes("/mode/")) return "mode";
  if (fp.includes("/global/")) return "global";
  return "core";
};

// Follows a token's alias chain down to a literal. Linear (first reference), with cycle protection.
const buildRefChain = (token: DesignToken, dictionary: Dictionary): string[] => {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current: DesignToken | undefined = token;

  while (current) {
    const orig = current["original"]?.$value ?? current["original"]?.value;
    if (typeof orig !== "string" || !usesReferences(orig)) break;

    const refs = getReferences(orig, dictionary.tokens);
    if (!refs.length) break;

    const ref = refs[0];
    const refPath = ref.path.join(".");
    if (seen.has(refPath)) break;
    seen.add(refPath);
    chain.push(refPath);
    current = ref as unknown as DesignToken;
  }

  return chain;
};

/**
 * Custom format: emits an enriched, per-mode JSON map keyed by token name.
 * Carries resolved value, type, layer, category, raw reference, alias chain and description.
 */
export const outputEnrichedJSON = ({
  dictionary,
}: {
  dictionary: Dictionary;
  options?: Record<string, any>;
}) => {
  const out: Record<string, any> = {};

  dictionary.allTokens.forEach((token: DesignToken) => {
    if (!token.name) return;

    const orig = token["original"]?.$value ?? token["original"]?.value;
    const reference =
      typeof orig === "string" && usesReferences(orig) ? orig : null;

    const entry: Record<string, any> = {
      name: token.name,
      type: token.$type ?? token["type"],
      value: token.$value ?? token["value"],
      layer: layerFromFilePath(token["filePath"]),
      category: categoryFromFilePath(token["filePath"]),
      reference,
      refChain: buildRefChain(token, dictionary),
    };

    if (token.$description) entry["description"] = token.$description;

    out[token.name] = entry;
  });

  return JSON.stringify(out, null, 2);
};
```

- [ ] **Step 2: Register the format**

Modify `scripts/style-dictionary.ts` — add the import alongside the other format imports:

```typescript
import { outputEnrichedJSON } from "./formats/outputEnrichedJSON.js";
```

And add a `registerFormat` block alongside the existing ones:

```typescript
StyleDictionary.registerFormat({
  name: "custom/json-enriched",
  format: outputEnrichedJSON
});
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors in `scripts/formats/outputEnrichedJSON.ts`.

- [ ] **Step 4: Commit**

```bash
git add scripts/formats/outputEnrichedJSON.ts scripts/style-dictionary.ts
git commit -m "feat: add custom/json-enriched style-dictionary format"
```

---

## Task 2: Build the mcp platform (per-mode output)

**Files:**
- Modify: `scripts/build.ts` (mcp platform in `getModeConfig` + `buildPlatform("mcp")`)

- [ ] **Step 1: Add the mcp platform to `getModeConfig`**

In `scripts/build.ts`, inside the `platforms` object of `getModeConfig` (after the `json` block, before the closing `}` of `platforms`), add:

```typescript
      mcp: {
        buildPath: "dist/mcp/",
        transforms: groups.css,
        files: [
          {
            destination: `tokens.${modeName}.json`,
            format: "custom/json-enriched",
            options: {
              outputReferences: true
            }
          }
        ]
      }
```

Note: No `filter` → all tokens from the mode build (core+global+mode+components) land in one file.

- [ ] **Step 2: Build the mcp platform in the modes loop**

In `scripts/build.ts`, in the `modes.forEach(...)` loop, add after `await modeStyleDictionary.buildPlatform("json")`:

```typescript
  await modeStyleDictionary.buildPlatform("mcp")
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build completes; `dist/mcp/tokens.light.json` and `dist/mcp/tokens.dark.json` exist.

- [ ] **Step 4: Manually verify the per-mode output**

Run: `node -e "const t=require('./dist/mcp/tokens.light.json'); const e=t['button-primary-bg-default']; console.log(JSON.stringify(e,null,2))"`
Expected: object with `name`, `type`, `value` (string), `layer:"component"`, `category:"button"`, `reference`, `refChain` (array), optionally `description`.

- [ ] **Step 5: Commit**

```bash
git add scripts/build.ts
git commit -m "feat: build per-mode enriched MCP token output"
```

---

## Task 3: Light/dark merge in postbuild + tests

**Files:**
- Create: `scripts/utils/merge-mcp-tokens.ts`
- Modify: `scripts/postbuild.ts` (import + call in the IIFE)
- Create: `tests/mcp-tokens.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/mcp-tokens.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { readFileSync } from "fs";

const tokens = JSON.parse(
  readFileSync(resolve(cwd(), "dist/mcp/tokens.json"), "utf8")
);

describe("dist/mcp/tokens.json", () => {
  it("emits a single merged file keyed by token name", () => {
    expect(typeof tokens).toBe("object");
    expect(Object.keys(tokens).length).toBeGreaterThan(100);
  });

  it("carries enriched fields on a component token", () => {
    const t = tokens["button-primary-bg-default"];
    expect(t).toBeDefined();
    expect(t.layer).toBe("component");
    expect(t.category).toBe("button");
    expect(Array.isArray(t.refChain)).toBe(true);
  });

  it("regression: a mode-dependent token keeps BOTH light and dark values (light not lost)", () => {
    // at least one mode-color token must carry different light/dark values as an object
    const modeColorEntries = Object.values<any>(tokens).filter(
      (t) => t.category === "mode" && t.value && typeof t.value === "object"
    );
    expect(modeColorEntries.length).toBeGreaterThan(0);
    const sample = modeColorEntries[0];
    expect(sample.value).toHaveProperty("light");
    expect(sample.value).toHaveProperty("dark");
    expect(sample.value.light).not.toBe(sample.value.dark);
  });

  it("mode-independent tokens (global) carry a single string value", () => {
    const globalEntry = Object.values<any>(tokens).find(
      (t) => t.layer === "global"
    );
    expect(globalEntry).toBeDefined();
    expect(typeof globalEntry.value).toBe("string");
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `npx vitest run tests/mcp-tokens.test.ts`
Expected: FAIL — `dist/mcp/tokens.json` does not yet exist (file read throws).

- [ ] **Step 3: Write the merge utility**

Create `scripts/utils/merge-mcp-tokens.ts`:

```typescript
import fs from "fs-extra";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");

const deepEqual = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

// Merges a field across both modes: equal -> single value, else { light, dark }.
const mergeField = (light: unknown, dark: unknown): unknown =>
  deepEqual(light, dark) ? light : { light, dark };

export const mergeMCPTokens = (): void => {
  const lightPath = resolve(root, "dist/mcp/tokens.light.json");
  const darkPath = resolve(root, "dist/mcp/tokens.dark.json");

  if (!fs.existsSync(lightPath) || !fs.existsSync(darkPath)) {
    throw new Error("merge-mcp-tokens: per-mode token files missing; run the build first");
  }

  const light = fs.readJsonSync(lightPath);
  const dark = fs.readJsonSync(darkPath);

  const merged: Record<string, any> = {};
  const allNames = new Set([...Object.keys(light), ...Object.keys(dark)]);

  for (const name of allNames) {
    const l = light[name];
    const d = dark[name];
    const base = l ?? d;

    merged[name] = {
      name: base.name,
      type: base.type,
      value: mergeField(l?.value, d?.value),
      layer: base.layer,
      category: base.category,
      reference: mergeField(l?.reference, d?.reference),
      refChain: mergeField(l?.refChain, d?.refChain),
    };
    if (base.description) merged[name].description = base.description;
  }

  fs.outputJsonSync(resolve(root, "dist/mcp/tokens.json"), merged, { spaces: 2 });
  console.log("✅ Merged MCP tokens to dist/mcp/tokens.json");
};
```

- [ ] **Step 4: Call the merge in postbuild**

Modify `scripts/postbuild.ts` — add the import after the existing imports:

```typescript
import { mergeMCPTokens } from "./utils/merge-mcp-tokens.js"
```

In the final `(async () => { ... })()` IIFE, add after `createLightAllCss()`:

```typescript
  mergeMCPTokens()
```

- [ ] **Step 5: Run build + tests**

Run: `npm run build && npx vitest run tests/mcp-tokens.test.ts`
Expected: PASS (all 4 tests green).

- [ ] **Step 6: Commit**

```bash
git add scripts/utils/merge-mcp-tokens.ts scripts/postbuild.ts tests/mcp-tokens.test.ts
git commit -m "feat: merge light/dark enriched tokens into dist/mcp/tokens.json"
```

---

## Task 4: Rebuild the MCP server on the new source

**Files:**
- Create: `mcp/server.js`
- Create: `mcp/package.json`
- Create: `tests/mcp-server.test.ts`
- Create: `tests/fixtures/mcp-tokens.json`

- [ ] **Step 1: Create the test fixture**

Create `tests/fixtures/mcp-tokens.json`:

```json
{
  "button-primary-bg-default": {
    "name": "button-primary-bg-default",
    "type": "color",
    "value": { "light": "#000000", "dark": "#ffffff" },
    "layer": "component",
    "category": "button",
    "reference": "{mode.color.brand.default}",
    "refChain": ["mode.color.brand.default", "core.color.black"],
    "description": "Primary button background."
  },
  "core-color-black": {
    "name": "core-color-black",
    "type": "color",
    "value": "#000000",
    "layer": "core",
    "category": "core",
    "reference": null,
    "refChain": []
  },
  "global-space-100": {
    "name": "global-space-100",
    "type": "dimension",
    "value": "8px",
    "layer": "global",
    "category": "global",
    "reference": null,
    "refChain": []
  }
}
```

- [ ] **Step 2: Write the failing test for the server logic**

Create `tests/mcp-server.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { readFileSync } from "fs";
import { createTools } from "../mcp/server.js";

const tokens = JSON.parse(
  readFileSync(resolve(cwd(), "tests/fixtures/mcp-tokens.json"), "utf8")
);
const { getToken, searchTokens, listCategories, listTokensByCategory } =
  createTools(tokens);

describe("mcp server tools", () => {
  it("get_token returns enriched entry with both modes", () => {
    const r = getToken({ name: "button-primary-bg-default" });
    expect(r.found).toBe(true);
    expect(r.token.value).toEqual({ light: "#000000", dark: "#ffffff" });
    expect(r.token.refChain).toContain("core.color.black");
    expect(r.token.description).toBeDefined();
  });

  it("get_token with mode reduces value to a single string", () => {
    const r = getToken({ name: "button-primary-bg-default", mode: "dark" });
    expect(r.token.value).toBe("#ffffff");
  });

  it("search_tokens filters by layer", () => {
    const r = searchTokens({ query: "color", layer: "core" });
    expect(r.results.every((t: any) => t.layer === "core")).toBe(true);
    expect(r.results.length).toBeGreaterThan(0);
  });

  it("list_categories includes mode-merged categories", () => {
    const r = listCategories();
    const names = r.categories.map((c: any) => c.name);
    expect(names).toContain("button");
    expect(names).toContain("core");
  });

  it("list_tokens_by_category includes description", () => {
    const r = listTokensByCategory({ category: "button" });
    expect(r.tokens[0]).toHaveProperty("description");
  });
});
```

- [ ] **Step 3: Run test, verify failure**

Run: `npx vitest run tests/mcp-server.test.ts`
Expected: FAIL — `../mcp/server.js` does not exist / `createTools` undefined.

- [ ] **Step 4: Implement the server**

Create `mcp/server.js`:

```javascript
#!/usr/bin/env node
/**
 * Sage Design Tokens MCP Server (enriched).
 * Serves light/dark values, $description context and alias/layer chains
 * from the repo's dist/mcp/tokens.json build output.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, "../dist/mcp/tokens.json");

// Exported for unit testing — pure functions over a tokens map.
export function createTools(tokens) {
  const all = Object.values(tokens);
  const categories = [...new Set(all.map((t) => t.category))];

  const reduceMode = (token, mode) => {
    if (!mode) return token;
    const pick = (field) =>
      field && typeof field === "object" && ("light" in field || "dark" in field)
        ? field[mode]
        : field;
    return {
      ...token,
      value: pick(token.value),
      reference: pick(token.reference),
      refChain: pick(token.refChain),
    };
  };

  function getToken({ name, mode }) {
    const key = String(name).toLowerCase();
    if (tokens[key]) return { found: true, token: reduceMode(tokens[key], mode) };
    const match = all.find((t) => t.name.includes(key));
    if (match) return { found: true, token: reduceMode(match, mode), fuzzy: true };
    return { found: false, error: `Token '${name}' not found.` };
  }

  function searchTokens({ query, category, layer, limit = 20 }) {
    const q = String(query).toLowerCase().replace(/[\s-]/g, "");
    const results = all.filter((t) => {
      const nameMatch = t.name.replace(/-/g, "").includes(q);
      const catMatch = !category || t.category === category;
      const layerMatch = !layer || t.layer === layer;
      return nameMatch && catMatch && layerMatch;
    });
    return {
      count: results.length,
      results: results.slice(0, limit).map((t) => ({
        name: t.name,
        value: t.value,
        category: t.category,
        layer: t.layer,
        description: t.description,
      })),
      truncated: results.length > limit,
    };
  }

  function listCategories() {
    return {
      categories: categories.map((cat) => ({
        name: cat,
        count: all.filter((t) => t.category === cat).length,
      })),
    };
  }

  function listTokensByCategory({ category, limit = 50 }) {
    const results = all.filter((t) => t.category === category).slice(0, limit);
    return {
      category,
      count: results.length,
      tokens: results.map((t) => ({
        name: t.name,
        value: t.value,
        description: t.description,
      })),
      truncated: results.length === limit,
    };
  }

  return { getToken, searchTokens, listCategories, listTokensByCategory };
}

function loadTokens() {
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, "utf8"));
  } catch {
    throw new Error(
      `Enriched tokens not found at ${TOKENS_PATH}. Run 'npm run build' in the design-tokens repo first.`
    );
  }
}

// --- MCP wiring (only runs when executed directly, not when imported by tests) ---
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const tools = createTools(loadTokens());

  const server = new Server(
    { name: "sage-design-tokens", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_token",
        description:
          "Get a Sage design token by name. Returns light+dark value, type, layer, category, the raw alias reference, the resolved alias chain (refChain) and a description.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Token name in kebab-case, e.g. 'button-primary-bg-default'" },
            mode: { type: "string", enum: ["light", "dark"], description: "Optional: reduce value/reference/refChain to one mode" },
          },
          required: ["name"],
        },
      },
      {
        name: "search_tokens",
        description:
          "Search Sage design tokens by keyword. Optionally filter by category and/or by architecture layer (core, global, mode, component).",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query, e.g. 'button primary', 'color brand'" },
            category: { type: "string", description: "Optional category filter, e.g. 'button', 'global'" },
            layer: { type: "string", enum: ["core", "global", "mode", "component"], description: "Optional layer filter" },
            limit: { type: "number", description: "Max results (default 20)" },
          },
          required: ["query"],
        },
      },
      {
        name: "list_categories",
        description: "List all token categories with counts. Use before searching to see what's available.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "list_tokens_by_category",
        description: "List all tokens within a category, including descriptions.",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Category name from list_categories" },
            limit: { type: "number", description: "Max tokens (default 50)" },
          },
          required: ["category"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      let result;
      if (name === "get_token") result = tools.getToken(args);
      else if (name === "search_tokens") result = tools.searchTokens(args);
      else if (name === "list_categories") result = tools.listCategories();
      else if (name === "list_tokens_by_category") result = tools.listTokensByCategory(args);
      else throw new Error(`Unknown tool: ${name}`);

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

- [ ] **Step 5: Create the MCP package.json**

Create `mcp/package.json`:

```json
{
  "name": "sage-tokens-mcp",
  "version": "2.0.0",
  "description": "MCP server exposing enriched @sage/design-tokens (light/dark, context, layers) for AI coding assistants",
  "type": "module",
  "main": "server.js",
  "bin": { "sage-tokens-mcp": "./server.js" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0"
  }
}
```

- [ ] **Step 6: Install MCP dependencies**

Run: `cd mcp && npm install && cd ..`
Expected: `mcp/node_modules/@modelcontextprotocol` exists.

- [ ] **Step 7: Run test, verify success**

Run: `npx vitest run tests/mcp-server.test.ts`
Expected: PASS (all 5 tests green).

- [ ] **Step 8: Commit**

```bash
git add mcp/server.js mcp/package.json tests/mcp-server.test.ts tests/fixtures/mcp-tokens.json
git commit -m "feat: enriched MCP server reading dist/mcp/tokens.json"
```

---

## Task 5: Smoke-test the server against real data

**Files:**
- (no new files; manual verification)

- [ ] **Step 1: Server starts and reads real tokens**

Run:
```bash
node -e "import('./mcp/server.js').then(async m => { \
  const { readFileSync } = await import('fs'); \
  const t = JSON.parse(readFileSync('./dist/mcp/tokens.json','utf8')); \
  const tools = m.createTools(t); \
  console.log('categories:', tools.listCategories().categories.map(c=>c.name).join(', ')); \
  console.log('button-primary-bg-default:', JSON.stringify(tools.getToken({name:'button-primary-bg-default'}).token.value)); \
})"
```
Expected: category list contains `core`, `global`, `mode`, `button`, …; the button token shows `{ "light": …, "dark": … }`.

- [ ] **Step 2: Full test run**

Run: `npm test`
Expected: all tests green (existing + new `mcp-tokens` + `mcp-server`).

---

## Task 6: Reconfigure the MCP client (manual)

**Files:**
- Modify: `~/.claude.json` (entry `mcpServers.sage-design-tokens.args`)

- [ ] **Step 1: Point the args path at the new server**

In `~/.claude.json`, in the `sage-design-tokens` entry, change `args` from
`["/Users/ronnyhummitzsch/Projects/Sage-Design-Tokens/index.js"]`
to
`["/Users/ronnyhummitzsch/Projects/Sage-Design-Tokens/design-tokens/mcp/server.js"]`

- [ ] **Step 2: Restart Claude Code and verify the MCP**

After restart: call `list_categories`. Expected: contains `core`/`global`/`mode`/components (no separate `light`/`dark` any more). `get_token` for `button-primary-bg-default` returns `value:{light,dark}` + `refChain`.

- [ ] **Step 3: Mark the old wrapper as superseded**

The old server at `…/Sage-Design-Tokens/index.js` is no longer referenced. Do not delete it (it does not belong to this repo); add a short note there stating it has been replaced by `design-tokens/mcp/server.js`. Align with the user before removing anything outside the repo.

---

## Open risks / to verify during implementation

- **`getReferences` signature (Task 1):** `getReferences(value, dictionary.tokens)` and `ref.path` are the expected style-dictionary v5 API. If the `button-primary-bg-default` check in Task 2/Step 4 shows an empty `refChain`, inspect the API usage against `node_modules/style-dictionary` and correct it.
- **Mode-dependent references:** If a token uses different aliases in light/dark, `reference`/`refChain` correctly carries `{light,dark}` (covered by the generic merge rule) — the test in Task 3 only asserts on `value`; add an assertion for diverging `refChain` if needed.
- **`name` collision via `name/kebab`:** If two tokens resolve to the same name after the kebab transform, the format object will overwrite one. Cross-check the token count against `dist/json` in Task 2/Step 4; report any discrepancy.

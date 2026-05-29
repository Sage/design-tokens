/*
Copyright © 2026 The Sage Group plc or its licensors. All Rights reserved.
 */

/**
 * Builds a self-contained team-share bundle of the Sage Design Tokens MCP.
 *
 * Outputs to ../mcp-bundle/ (sibling of design-tokens/) with everything a
 * colleague needs to wire the MCP into their AI coding assistant without
 * cloning this repo: server.js + tools.js + a pre-built tokens.json + the
 * snapshot report + the standalone HTML demo + a README.
 *
 * This is a preview-distribution mechanism for the period before the MCP
 * lands upstream in @sage/design-tokens.
 *
 * Regenerate with `npm run build:bundle`.
 */

import fs from "fs-extra";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = resolve(root, "..", "mcp-bundle");

// ── Inputs ────────────────────────────────────────────────────────────────
const serverJs = fs.readFileSync(resolve(root, "mcp/server.js"), "utf8");
const toolsJs = fs.readFileSync(resolve(root, "mcp/tools.js"), "utf8");
const mcpPkg: any = fs.readJsonSync(resolve(root, "mcp/package.json"));
const tokensJsonPath = resolve(root, "dist/mcp/tokens.json");
const reportMd = fs.readFileSync(resolve(root, "mcp/REPORT.md"), "utf8");
const demoHtml = fs.readFileSync(resolve(root, "docs/mcp-demo.html"), "utf8");

if (!fs.existsSync(tokensJsonPath)) {
  throw new Error(`Missing ${tokensJsonPath}. Run 'npm run build' first.`);
}

const tokensJson = fs.readFileSync(tokensJsonPath, "utf8");
const tokenCount = Object.keys(JSON.parse(tokensJson)).length;

const gitOut = (args: string[]): string => {
  try { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return "unknown"; }
};
const commit = gitOut(["rev-parse", "--short", "HEAD"]);
const branch = gitOut(["rev-parse", "--abbrev-ref", "HEAD"]);
const today = new Date().toISOString().slice(0, 10);

// ── Adjust server.js to read tokens.json from the same directory ──────────
const adjustedServerJs = serverJs
  .replace(
    'const TOKENS_PATH = resolve(__dirname, "../dist/mcp/tokens.json");',
    'const TOKENS_PATH = resolve(__dirname, "./tokens.json");'
  )
  .replace(
    "Run 'npm run build' in the design-tokens repo first.",
    "The bundled tokens.json is missing — re-download or regenerate the bundle."
  );

if (adjustedServerJs === serverJs) {
  throw new Error("server.js path/error-message rewrite did not match — bundle would point at the wrong tokens.json");
}

// ── Adjust package.json for distribution ──────────────────────────────────
const bundlePkg: Record<string, unknown> = {
  name: "sage-tokens-mcp-preview",
  version: "0.1.0",
  description: "Preview MCP server bundle for Sage Design Tokens — light/dark, $description, refChain. Ships with a pre-built tokens.json snapshot.",
  type: "module",
  main: "server.js",
  bin: { "sage-tokens-mcp-preview": "./server.js" },
  private: true,
  dependencies: mcpPkg.dependencies,
};

// ── README (the bit a colleague actually reads) ───────────────────────────
const readme = `# Sage Design Tokens MCP — Preview

A self-contained Model Context Protocol server that exposes the Sage Design
Tokens to AI coding assistants (Claude Code, Cursor, …) — with **light + dark
values**, the source \`$description\` context, and the resolved alias / layer
chain.

This bundle is a **preview snapshot** ahead of any official upstream Sage
release. It ships with a pre-built \`tokens.json\` so you don't need to clone
or build the Sage \`design-tokens\` repo.

---

## Setup (one-time, ~30 seconds)

\`\`\`bash
cd sage-tokens-mcp-preview
npm install
\`\`\`

That installs the MCP SDK runtime. Then point your MCP client at \`server.js\`.

### Claude Code

Edit \`~/.claude.json\` and add this entry under \`mcpServers\` (replace the
absolute path with where this folder lives on your machine):

\`\`\`json
"sage-design-tokens": {
  "type": "stdio",
  "command": "node",
  "args": ["<absolute path to this folder>/server.js"],
  "env": {}
}
\`\`\`

Then **restart Claude Code**. Verify by asking it to call \`list_categories\`
— the response should include \`core\`, \`global\`, \`mode\`, and every
component category (\`button\`, \`input\`, \`message\`, …).

> **Alternative**: \`claude mcp add -s user sage-design-tokens node <absolute
> path>/server.js\` — picks up the right config scope automatically.

### Cursor / other MCP clients

Any MCP client that supports stdio transport. The command is
\`node <absolute path>/server.js\`.

---

## What you can ask

| Tool | Purpose |
|---|---|
| \`get_token(name, mode?)\` | Lookup by kebab-case name. Returns the enriched entry with both light and dark values, the raw alias reference, the resolved \`refChain\`, the source \`description\`, and the architecture \`layer\`. With \`mode = "light" \| "dark"\`, mode-dependent fields are reduced to that side. |
| \`search_tokens(query, category?, layer?, limit?)\` | Multi-word substring search over token names. Optional filters by \`category\` and / or \`layer ∈ {core, global, mode, component}\`. |
| \`list_categories()\` | All categories with token counts. |
| \`list_tokens_by_category(category, limit?)\` | All tokens in a category, including their \`description\` where present. |

---

## What's in this bundle

\`\`\`
sage-tokens-mcp-preview/
├── README.md          # this file
├── server.js          # the MCP server (stdio, ~110 lines)
├── tools.js           # pure query logic (no SDK dependency)
├── tokens.json        # pre-built token map (${tokenCount.toLocaleString("en-GB")} tokens)
├── REPORT.md          # snapshot of token counts, mode-divergence, refChain depth
├── demo.html          # single-file presentation explaining what this is
└── package.json       # MCP SDK dependency
\`\`\`

**Open \`demo.html\` in a browser** for a visual walkthrough — keyboard
navigation with arrow keys, \`Space\` for an index, \`T\` toggles dark mode,
\`F\` for fullscreen.

---

## Sample shape

A real entry from \`tokens.json\`:

\`\`\`json
{
  "button-typical-primary-bg-default": {
    "name": "button-typical-primary-bg-default",
    "type": "color",
    "value": { "light": "#00811f", "dark": "#00f142" },
    "layer": "component",
    "category": "button",
    "reference": "{mode.color.action.main.default}",
    "refChain": {
      "light": ["mode.color.action.main.default", "core.color.brand.60"],
      "dark":  ["mode.color.action.main.default", "core.color.brand.40"]
    }
  }
}
\`\`\`

Mode-independent fields (e.g. \`global-space-100\`) collapse to a single
string instead of a \`{light, dark}\` object.

---

## Updates

This is a **snapshot bundle** — it does not auto-track upstream changes to
\`@sage/design-tokens\`. When Sage publishes new tokens (or when this
preview is refreshed against the latest), you'll get a new bundle.

If you need the absolute latest values **before** the next bundle drops:

1. Clone the Sage design-tokens repo locally
2. Check out the \`feat/enriched-tokens-mcp\` branch (or wait for the
   upstream PR to land on \`master\`)
3. \`npm install && npm run build\`
4. Copy the resulting \`dist/mcp/tokens.json\` over \`tokens.json\` in this
   folder

---

## Where this is heading

This bundle is a stop-gap until the MCP server lands upstream in
\`@sage/design-tokens\` itself. When that happens, switch to the upstream
version — same tools, official maintenance, no manual snapshot updates.

---

**Snapshot details**

- Generated: \`${today}\`
- Source branch: \`${branch}\` @ \`${commit}\`
- Maintained by: \`ronny.hummitzsch@sage.com\`
`;

// ── Write the bundle ──────────────────────────────────────────────────────
fs.removeSync(out);
fs.mkdirSync(out, { recursive: true });

fs.writeFileSync(resolve(out, "server.js"), adjustedServerJs);
fs.writeFileSync(resolve(out, "tools.js"), toolsJs);
fs.writeJsonSync(resolve(out, "package.json"), bundlePkg, { spaces: 2 });
fs.writeFileSync(resolve(out, "tokens.json"), tokensJson);
fs.writeFileSync(resolve(out, "REPORT.md"), reportMd);
fs.writeFileSync(resolve(out, "demo.html"), demoHtml);
fs.writeFileSync(resolve(out, "README.md"), readme);

// ── Summary ───────────────────────────────────────────────────────────────
const totalSize = fs.readdirSync(out).reduce((acc, f) => acc + fs.statSync(resolve(out, f)).size, 0);
console.log(`✅ Wrote bundle to ${out}`);
console.log(`   ${tokenCount.toLocaleString("en-GB")} tokens · ${(totalSize / 1024).toFixed(1)} KB total`);
console.log(`   Source: ${branch} @ ${commit} · ${today}`);
console.log("");
console.log("Next steps for sharing:");
console.log("  1. cd ../mcp-bundle && npm install   (verifies install works)");
console.log("  2. Zip the folder or run 'npm pack' to make a .tgz");
console.log("  3. Share via Slack/Teams with the README as the primer");

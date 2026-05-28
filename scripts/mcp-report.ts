/*
Copyright © 2026 The Sage Group plc or its licensors. All Rights reserved.
 */

import fs from "fs-extra";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

interface TokenEntry {
  name: string;
  type: string;
  value: unknown;
  layer: string;
  category: string;
  reference: string | null | { light: string | null; dark: string | null };
  refChain: string[] | { light: string[]; dark: string[] };
  description?: string;
}

const tokens: Record<string, TokenEntry> = fs.readJsonSync(
  resolve(root, "dist/mcp/tokens.json")
);

const entries = Object.values(tokens);

const countBy = <K extends string>(arr: TokenEntry[], key: (t: TokenEntry) => K): Record<K, number> => {
  const out = {} as Record<K, number>;
  for (const t of arr) {
    const k = key(t);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
};

const chainLength = (t: TokenEntry): number => {
  const c = t.refChain;
  if (Array.isArray(c)) return c.length;
  if (c && typeof c === "object") return Math.max(c.light.length, c.dark.length);
  return 0;
};

const isModeDivergent = (t: TokenEntry): boolean =>
  !!t.value && typeof t.value === "object" && "light" in (t.value as any) && "dark" in (t.value as any);

const histogram = (lengths: number[]): Record<string, number> => {
  const bins: Record<string, number> = { "0": 0, "1": 0, "2": 0, "3": 0, "4+": 0 };
  for (const n of lengths) {
    const key = n >= 4 ? "4+" : String(n);
    bins[key] = (bins[key] ?? 0) + 1;
  }
  return bins;
};

const sampleByLayer = (layer: string, n: number): string[] => {
  const matches = entries
    .filter((t) => t.layer === layer)
    .map((t) => t.name)
    .sort();
  return matches.slice(0, n);
};

const totalsByLayer = countBy(entries, (t) => t.layer);
const totalsByCategory = countBy(entries, (t) => t.category);
const chainHist = histogram(entries.map(chainLength));
const withDescription = entries.filter((t) => typeof t.description === "string" && t.description.length > 0).length;
const modeDivergent = entries.filter(isModeDivergent).length;

const commit = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
})();
const branch = (() => {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
})();
const today = new Date().toISOString().slice(0, 10);

const fmtTable = (rows: Array<[string, number]>): string => {
  const lines = ["| Key | Count |", "|---|---|"];
  for (const [k, v] of rows) lines.push(`| ${k} | ${v} |`);
  return lines.join("\n");
};

const report = `<!--
Copyright © 2026 The Sage Group plc or its licensors. All Rights reserved.
-->

# MCP token snapshot

Generated: **${today}** · Commit: \`${commit}\` · Branch: \`${branch}\`

Regenerate with \`npm run mcp:report\`.

## Totals

- Total tokens: **${entries.length}**
- Tokens with \`description\`: **${withDescription}** (${((withDescription / entries.length) * 100).toFixed(1)}%)
- Mode-divergent values: **${modeDivergent}** of ${entries.length}

## By layer

${fmtTable(Object.entries(totalsByLayer).sort((a, b) => b[1] - a[1]) as Array<[string, number]>)}

## By category

${fmtTable(Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1]) as Array<[string, number]>)}

## refChain depth histogram

${fmtTable(Object.entries(chainHist) as Array<[string, number]>)}

## Samples (first three names per layer, alphabetical)

- **core**: ${sampleByLayer("core", 3).join(", ")}
- **global**: ${sampleByLayer("global", 3).join(", ")}
- **mode**: ${sampleByLayer("mode", 3).join(", ")}
- **component**: ${sampleByLayer("component", 3).join(", ")}
`;

fs.outputFileSync(resolve(root, "mcp/REPORT.md"), report);
console.log("✅ Wrote mcp/REPORT.md");

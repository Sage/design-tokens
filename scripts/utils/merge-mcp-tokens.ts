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
    // Description is taken from the base (light) build: it is mode-independent metadata defined once in the source tokens.
    if (base.description) merged[name].description = base.description;
  }

  fs.outputJsonSync(resolve(root, "dist/mcp/tokens.json"), merged, { spaces: 2 });
  console.log("✅ Merged MCP tokens to dist/mcp/tokens.json");
};

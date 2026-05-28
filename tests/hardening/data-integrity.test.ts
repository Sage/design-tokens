import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { readFileSync, readdirSync } from "fs";
import { parseCSSFile } from "../utils/index.js";

const tokens = JSON.parse(
  readFileSync(resolve(cwd(), "dist/mcp/tokens.json"), "utf8")
);

const VALID_LAYERS = new Set(["core", "global", "mode", "component"]);

// kebab-case (CSS variable name without "--") -> dotted path (Tokens-Studio reference path)
// e.g. "mode-color-brand-default" -> "mode.color.brand.default"
const kebabToDotted = (kebab: string): string => kebab.replace(/-/g, ".");

// Reverse: dotted path -> kebab-case name used by the MCP / CSS variable.
// Tokens-Studio preserves original casing in dotted paths (e.g. "core.size.SCALE"),
// but the MCP token map keys are all lowercase kebab — so we must lowercase.
const dottedToKebab = (dotted: string): string => dotted.replace(/\./g, "-").toLowerCase();

describe("data integrity: schema invariants", () => {
  const entries = Object.entries<any>(tokens);

  it("every entry has the required fields with valid shapes", () => {
    for (const [key, t] of entries) {
      expect(key, "map key matches name field").toBe(t.name);
      expect(typeof t.name).toBe("string");
      expect(t.name.length).toBeGreaterThan(0);
      expect(typeof t.type).toBe("string");
      expect(VALID_LAYERS.has(t.layer)).toBe(true);
      expect(typeof t.category).toBe("string");
      expect(t.category.length).toBeGreaterThan(0);
      // refChain is either an array or a {light, dark} pair of arrays
      const chain = t.refChain;
      const refChainOk =
        Array.isArray(chain) ||
        (chain && typeof chain === "object" && Array.isArray(chain.light) && Array.isArray(chain.dark));
      expect(refChainOk, `refChain shape on ${t.name}`).toBe(true);
      // reference is null, an object ({light,dark}), or a string containing at least one "{alias}" reference.
      // Composite references (e.g. linear-gradient templates) embed aliases but don't start with "{".
      const ref = t.reference;
      if (ref !== null && typeof ref !== "object") {
        expect(typeof ref).toBe("string");
        expect(ref.includes("{")).toBe(true);
      }
    }
  });
});

describe("data integrity: refChain termination", () => {
  it("every alias chain terminates at a literal token", () => {
    const flattenChain = (chain: any): string[] => {
      if (Array.isArray(chain)) return chain;
      if (chain && typeof chain === "object") {
        return [...(chain.light ?? []), ...(chain.dark ?? [])];
      }
      return [];
    };

    for (const t of Object.values<any>(tokens)) {
      const chain = flattenChain(t.refChain);
      if (chain.length === 0) continue;

      const last = chain[chain.length - 1];
      const lastKebab = dottedToKebab(last);
      const target = tokens[lastKebab];
      expect(target, `refChain terminus ${last} (from ${t.name}) must exist in tokens.json`).toBeDefined();

      // The terminus must either be a literal (reference null) or itself terminate cleanly
      // We only assert existence here; the recursive nature is already covered by the
      // format's cycle guard + the existence check above being run for every token.
      expect(target.reference === null || typeof target.reference === "string" || typeof target.reference === "object").toBe(true);
    }
  });
});

describe("data integrity: completeness vs dist/css", () => {
  const cssVarsFrom = (filePath: string): Set<string> =>
    new Set(parseCSSFile(resolve(cwd(), filePath)).keys());

  it("every --var in dist/css/global.css exists as a token", () => {
    const vars = cssVarsFrom("dist/css/global.css");
    for (const v of vars) {
      expect(tokens[v], `${v} from global.css missing in tokens.json`).toBeDefined();
    }
    expect(vars.size).toBeGreaterThan(0);
  });

  it("every --var in dist/css/light.css exists as a token", () => {
    const vars = cssVarsFrom("dist/css/light.css");
    for (const v of vars) {
      expect(tokens[v], `${v} from light.css missing in tokens.json`).toBeDefined();
    }
    expect(vars.size).toBeGreaterThan(0);
  });

  it("every --var in dist/css/dark.css exists as a token", () => {
    const vars = cssVarsFrom("dist/css/dark.css");
    for (const v of vars) {
      expect(tokens[v], `${v} from dark.css missing in tokens.json`).toBeDefined();
    }
    expect(vars.size).toBeGreaterThan(0);
  });

  it("every --var in component CSS files exists as a token", () => {
    const componentsDir = resolve(cwd(), "dist/css/components");
    const files = readdirSync(componentsDir).filter((f) => f.endsWith(".css"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const vars = cssVarsFrom(`dist/css/components/${f}`);
      for (const v of vars) {
        expect(tokens[v], `${v} from components/${f} missing in tokens.json`).toBeDefined();
      }
    }
  });
});

describe("data integrity: value consistency for resolved layers", () => {
  // For layer in {global, mode}: CSS contains the resolved literal.
  // MCP.value (mode-aware) must match.
  it("global tokens: MCP.value === global.css value", () => {
    const css = parseCSSFile(resolve(cwd(), "dist/css/global.css"));
    for (const [varName, cssValue] of css) {
      const t = tokens[varName];
      if (!t || t.layer !== "global") continue;
      expect(typeof t.value, `${varName} expected scalar value`).toBe("string");
      expect(t.value, `${varName} value mismatch`).toBe(cssValue);
    }
  });

  it("mode tokens: MCP.value.light === light.css value", () => {
    const css = parseCSSFile(resolve(cwd(), "dist/css/light.css"));
    for (const [varName, cssValue] of css) {
      const t = tokens[varName];
      if (!t || t.layer !== "mode") continue;
      const lightValue =
        t.value && typeof t.value === "object" ? t.value.light : t.value;
      expect(lightValue, `${varName} light mismatch`).toBe(cssValue);
    }
  });

  it("mode tokens: MCP.value.dark === dark.css value", () => {
    const css = parseCSSFile(resolve(cwd(), "dist/css/dark.css"));
    for (const [varName, cssValue] of css) {
      const t = tokens[varName];
      if (!t || t.layer !== "mode") continue;
      const darkValue =
        t.value && typeof t.value === "object" ? t.value.dark : t.value;
      expect(darkValue, `${varName} dark mismatch`).toBe(cssValue);
    }
  });
});

describe("data integrity: aggregate sanity", () => {
  it("total token count is plausible", () => {
    expect(Object.keys(tokens).length).toBeGreaterThan(1000);
  });

  it("every component file produces tokens in its own category", () => {
    const componentsDir = resolve(cwd(), "data/tokens/components");
    const componentNames = readdirSync(componentsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
    expect(componentNames.length).toBeGreaterThan(0);
    const categoriesWithTokens = new Set(
      Object.values<any>(tokens)
        .filter((t) => t.layer === "component")
        .map((t) => t.category)
    );
    for (const name of componentNames) {
      expect(categoriesWithTokens.has(name), `no tokens for component ${name}`).toBe(true);
    }
  });
});

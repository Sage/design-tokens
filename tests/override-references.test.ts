import { describe, expect, it } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import {
  parseCSSFile,
  parseCommonJSFile,
  parseES6File,
  parseJSONFile,
} from "./utils/index.js";
import { readFileSync } from "fs";

const distPath = resolve(cwd(), "dist");

const depthTokenKeys = [
  "global-depth-lvl0",
  "global-depth-lvl1",
  "global-depth-lvl2",
  "global-depth-lvl3",
  "global-depth-sticky-b",
  "global-depth-sticky-l",
  "global-depth-sticky-r",
  "global-depth-sticky-t",
];

const depthTokenCamelKeys = [
  "globalDepthLvl0",
  "globalDepthLvl1",
  "globalDepthLvl2",
  "globalDepthLvl3",
  "globalDepthStickyB",
  "globalDepthStickyL",
  "globalDepthStickyR",
  "globalDepthStickyT",
];

const isFontTypographyToken = (key: string) =>
  /^global-font-(fluid|static)-/.test(key) || /^globalFont(Fluid|Static)/.test(key);


function parseScssFile(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const tokens = new Map<string, string>();
  const regex = /^\$([^:]+):\s*([^;]+);/gm;

  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      tokens.set(match[1].trim(), match[2].trim());
    }
  }

  return tokens;
}

function mergeLooseExports(
  filePath: string,
  base: Map<string, string>,
  pattern: RegExp
): Map<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const merged = new Map(base);
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const [, key, rhs] = match;
    if (key && rhs && !merged.has(key)) {
      // raw RHS so objects/numbers inlcuded
      merged.set(key, rhs.trim());
    }
  }

  return merged;
}

type GlobalFormatCase = {
  name: string;
  filePath: string;
  globalTokens: Map<string, string>;
  depthKeys: string[];
  depthRefPrefix: string;
  nonDepthRefPatterns: RegExp[];
};

const globalFormatCases: GlobalFormatCase[] = [
  {
    name: "CSS",
    filePath: resolve(distPath, "css/global.css"),
    globalTokens: parseCSSFile(resolve(distPath, "css/global.css")),
    depthKeys: depthTokenKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
  {
    name: "SCSS",
    filePath: resolve(distPath, "scss/global.scss"),
    globalTokens: parseScssFile(resolve(distPath, "scss/global.scss")),
    depthKeys: depthTokenKeys,
    depthRefPrefix: "$mode-color-generic-depth-",
    nonDepthRefPatterns: [/\$[a-z0-9-]+/i],
  },
  {
    name: "JSON",
    filePath: resolve(distPath, "json/global.json"),
    globalTokens: parseJSONFile(resolve(distPath, "json/global.json")),
    depthKeys: depthTokenCamelKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
    {
    name: "CommonJS",
    filePath: resolve(distPath, "js/common/global.js"),
    globalTokens: mergeLooseExports(
      resolve(distPath, "js/common/global.js"),
      parseCommonJSFile(resolve(distPath, "js/common/global.js")),
      /module\.exports\.(\w+)\s*=\s*(.+);\s*$/gm // capture module.exports lines with RHS incl.
    ),
    depthKeys: depthTokenCamelKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
  {
    name: "ES module",
    filePath: resolve(distPath, "js/es6/global.js"),
    globalTokens: mergeLooseExports(
      resolve(distPath, "js/es6/global.js"),
      parseES6File(resolve(distPath, "js/es6/global.js")),
      /export const (\w+)\s*=\s*(.+);\s*$/gm // capture export const lines with RHS incl.
    ),
    depthKeys: depthTokenCamelKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
];

describe.each(globalFormatCases)(
  "Global depth references - $name",
  ({ globalTokens, depthKeys, depthRefPrefix, nonDepthRefPatterns, name, filePath }) => {
    it("intended depth tokens include mode refs", () => {
      depthKeys.forEach(tokenName => {
        const value = globalTokens.get(tokenName);

        expect(value).toBeTruthy();
        expect(value).toContain(depthRefPrefix);
      });
    });

    it("only includes refs for depth and typography tokens", () => {
      const depthSet = new Set(depthKeys);

      globalTokens.forEach((value, key) => {
        if (depthSet.has(key) || isFontTypographyToken(key)) {
          return;
        }

        nonDepthRefPatterns.forEach((pattern) => {
          expect(value).not.toMatch(pattern);
        });
      });
    });

    it("font typography tokens reference the global font family", () => {
      const familyRef = name.includes("SCSS")
        ? "$global-font-families-"
        : "var(--global-font-families-";

      if (name.includes("SCSS")) {
        const typographyValues = Array.from(globalTokens.entries())
          .filter(([key]) => isFontTypographyToken(key))
          .map(([, value]) => value);
       
        expect(typographyValues.some(v => v.includes(familyRef))).toBe(true);
        return;
      }

      const content = readFileSync(filePath, "utf-8");

      expect(content).toContain(familyRef);
    });
  }
);

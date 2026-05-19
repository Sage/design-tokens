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
];

const depthTokenCamelKeys = [
  "globalDepthLvl0",
  "globalDepthLvl1",
  "globalDepthLvl2",
  "globalDepthLvl3",
  "globalDepthStickyB",
  "globalDepthStickyL",
  "globalDepthStickyR",
];

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

type GlobalFormatCase = {
  name: string;
  globalTokens: Map<string, string>;
  depthKeys: string[];
  depthRefPrefix: string;
  nonDepthRefPatterns: RegExp[];
};

const globalFormatCases: GlobalFormatCase[] = [
  {
    name: "CSS",
    globalTokens: parseCSSFile(resolve(distPath, "css/global.css")),
    depthKeys: depthTokenKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
  {
    name: "SCSS",
    globalTokens: parseScssFile(resolve(distPath, "scss/global.scss")),
    depthKeys: depthTokenKeys,
    depthRefPrefix: "$mode-color-generic-depth-",
    nonDepthRefPatterns: [/\$[a-z0-9-]+/i],
  },
  {
    name: "JSON",
    globalTokens: parseJSONFile(resolve(distPath, "json/global.json")),
    depthKeys: depthTokenCamelKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
  {
    name: "CommonJS",
    globalTokens: parseCommonJSFile(resolve(distPath, "js/common/global.js")),
    depthKeys: depthTokenCamelKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
  {
    name: "ES module",
    globalTokens: parseES6File(resolve(distPath, "js/es6/global.js")),
    depthKeys: depthTokenCamelKeys,
    depthRefPrefix: "var(--mode-color-generic-depth-",
    nonDepthRefPatterns: [/var\(--/],
  },
];

describe("Global depth references", () => {
  globalFormatCases.forEach(({ name, globalTokens, depthKeys, depthRefPrefix, nonDepthRefPatterns }) => {
    it(`${name}: intended depth tokens include mode refs`, () => {
      depthKeys.forEach(tokenName => {
        const value = globalTokens.get(tokenName);
        expect(value).toBeTruthy();
        expect(value).toContain(depthRefPrefix);
      });
    });

    it(`${name}: non-depth tokens do not include any refs`, () => {
      const depthSet = new Set(depthKeys);

      globalTokens.forEach((value, key) => {
        if (depthSet.has(key)) {
          return;
        }

        nonDepthRefPatterns.forEach((pattern) => {
          expect(value).not.toMatch(pattern);
        });
      });
    });
  });
});
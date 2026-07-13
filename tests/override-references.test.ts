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


const isDepthToken = (key: string) => 
  (/^global-depth-/.test(key) || /^globalDepth/.test(key)) && !/none/.test(key) && !/None/.test(key);

const isFontTypographyToken = (key: string) =>
  /^global-font-(fluid|static)-/.test(key) || /^globalFont(Fluid|Static)/.test(key);

const isRadiusToken = (key: string) =>
  (/^global-radius-(container|action)-/.test(key) || /^globalRadius(Container|Action)/.test(key)) && !/circle/.test(key) && !/Circle/.test(key);

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
  nonDepthRefPatterns: RegExp[];
};

const globalFormatCases: GlobalFormatCase[] = [
  {
    name: "CSS",
    filePath: resolve(distPath, "css/global.css"),
    globalTokens: parseCSSFile(resolve(distPath, "css/global.css")),
    nonDepthRefPatterns: [/var\(--/],
  },
  {
    name: "SCSS",
    filePath: resolve(distPath, "scss/global.scss"),
    globalTokens: parseScssFile(resolve(distPath, "scss/global.scss")),
    nonDepthRefPatterns: [/\$[a-z0-9-]+/i],
  },
  {
    name: "JSON",
    filePath: resolve(distPath, "json/global.json"),
    globalTokens: parseJSONFile(resolve(distPath, "json/global.json")),
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
    nonDepthRefPatterns: [/var\(--/],
  },
];

describe.each(globalFormatCases)(
  "Global depth references - $name",
  ({ globalTokens, nonDepthRefPatterns, name, filePath }) => {
    it("intended depth tokens include mode refs", () => {
      const depthValues = Array.from(globalTokens.entries())
          .filter(([key]) => isDepthToken(key))
          .map(([, value]) => value);

      if (name.includes("SCSS")) {
        expect(depthValues.every(v => v.includes("$mode-color-generic-depth-"))).toBe(true);
        
        return;
      }

      expect(depthValues.every(v => v.includes("var(--mode-color-generic-depth-"))).toBe(true);
    });

    it("only includes refs for depth, typography and radius tokens", () => {
      const depthSet = new Set(
        Array.from(globalTokens.keys()).filter(key => isDepthToken(key))
      );

      globalTokens.forEach((value, key) => {
        if (depthSet.has(key) || isFontTypographyToken(key) || isRadiusToken(key)) {
          return;
        }

        nonDepthRefPatterns.forEach((pattern) => {
          expect(value).not.toMatch(pattern);
        });
      });
    });

    it("font typography tokens reference the global font family", () => {
      const typographyValues = Array.from(globalTokens.entries())
        .filter(([key]) => isFontTypographyToken(key))
        .map(([, value]) => value);
      const content = readFileSync(filePath, "utf-8");

      if (name.includes("SCSS")) {
        ["$global-font-families-heading", "$global-font-families-subheading", "$global-font-families-body", "$global-font-families-component", "$global-font-families-sage-icons"].forEach(key => {
          expect(content).toContain(key);
        });
        expect(typographyValues.every(v => v.includes("$global-font-families-"))).toBe(true);

        return;
      }

      if (name.includes("JSON") || name.includes("JS") || name.includes("ES module")) {
        ["globalFontFamiliesHeading", "globalFontFamiliesSubheading", "globalFontFamiliesBody", "globalFontFamiliesComponent", "globalFontFamiliesSageIcons"].forEach(key => {
          expect(content).toContain(key);
        });
      } else {
        ["var(--global-font-families-heading)", "var(--global-font-families-subheading)", "var(--global-font-families-body)", "var(--global-font-families-component)", "var(--global-font-families-sage-icons)"].forEach(key => {
          expect(content).toContain(key);
        });
      }

      expect(typographyValues.every(v => v.includes("var(--global-font-families-"))).toBe(true);
    });

    it("radius tokens reference the global radius scale", () => {
      const radiusValues = Array.from(globalTokens.entries())
          .filter(([key]) => isRadiusToken(key))
          .map(([, value]) => value);
      const content = readFileSync(filePath, "utf-8");

      if (name.includes("SCSS")) {
        expect(content).toContain("$global-radius-scale");
        expect(radiusValues.every(v => v.includes("$global-radius-scale"))).toBe(true);

        return;
      }

      if (name.includes("JSON") || name.includes("JS") || name.includes("ES module")) {
        expect(content).toContain("globalRadiusScale");
      } else {
        expect(content).toContain("var(--global-radius-scale)");
      }

      expect(radiusValues.every(v => v.includes("var(--global-radius-scale)"))).toBe(true);
    });
  }
);

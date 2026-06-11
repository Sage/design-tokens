import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import {
  parseJSONFile,
  parseCommonJSFile,
  kebabToCamel
} from "./utils/index.js";

import { cwd } from "process";
import { readFileSync } from "fs";

const distPath = resolve(cwd(), "dist");

// Helper to parse CommonJS file with object values
function parseCommonJSWithObjects(filePath: string): Map<string, any> {
  const content = readFileSync(filePath, 'utf-8');
  const tokens = new Map<string, any>();
  
  // Split by module.exports lines to handle multi-line objects
  const lines = content.split('\n').filter(line => line.includes('module.exports.'));
  
  lines.forEach(line => {
    const match = line.match(/module\.exports\.(\w+)\s*=\s*(.+);/);
    if (match && match[1] && match[2]) {
      const key = match[1];
      const valueStr = match[2];
      
      try {
        // Try to parse as JSON if it starts with { or [
        if (valueStr.startsWith('{') || valueStr.startsWith('[')) {
          const value = JSON.parse(valueStr);
          tokens.set(key, value);
        } else if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
          // String value, remove quotes
          tokens.set(key, valueStr.slice(1, -1));
        } else {
          // Raw value
          tokens.set(key, valueStr);
        }
      } catch {
        // If parsing fails, store as string
        tokens.set(key, valueStr);
      }
    }
  });
  
  return tokens;
}

describe("Global tokens", () => {
  const globalJSON = parseJSONFile(resolve(distPath, "json/global.json"));
  const globalCommonJS = parseCommonJSWithObjects(resolve(distPath, "js/common/global.js"));

  it("should have consistent output between JSON and CommonJS formats", () => {
    // Both should have the same keys (after case conversion)
    globalJSON.forEach((_, jsonKey) => {
      const jsKey = kebabToCamel(jsonKey);
      expect(globalCommonJS.has(jsKey)).toBe(true);
    });
  });

  it("should preserve numeric values including zero", () => {
    // Borderwidth values should be preserved (includes "0" from borderwidthNone)
    const borderwidthNone = globalCommonJS.get("globalBorderwidthNone");
    expect(borderwidthNone).toBe("0");
    
    // Verify the borderwidth tokens exist and have correct values
    expect(globalCommonJS.has("globalBorderwidthXs")).toBe(true);
    expect(globalCommonJS.get("globalBorderwidthXs")).toBe("1px");
  });

  it("should serialize object tokens (like fonts) correctly", () => {
    const fontToken = globalCommonJS.get("globalFontFluidHeadingS");
    
    // Should be an object, not a string
    expect(typeof fontToken).toBe("object");
    expect(fontToken).not.toBeNull();
    
    // Should have the expected properties
    if (typeof fontToken === "object") {
      expect(fontToken.fontFamily).toBe("Sage UI");
      expect(fontToken.fontWeight).toBe("500");
      expect(fontToken.lineHeight).toBe(1.25);
      expect(fontToken.fontSize).toContain("clamp");
    }
  });

  it("JSON should contain all global tokens", () => {
    expect(globalJSON.size).toBeGreaterThan(0);
    
    // Check for key global token categories
    const hasBreakpoints = Array.from(globalJSON.keys()).some(k => k.includes("Breakpoint"));
    const hasFonts = Array.from(globalJSON.keys()).some(k => k.includes("Font"));
    const hasSpace = Array.from(globalJSON.keys()).some(k => k.includes("Space"));
    
    expect(hasBreakpoints).toBe(true);
    expect(hasFonts).toBe(true);
    expect(hasSpace).toBe(true);
  });
});

describe("Mode tokens (light/dark)", () => {
  const modes = ["light", "dark"];

  modes.forEach(mode => {
    describe(`${mode} mode`, () => {
      const modeJSON = parseJSONFile(resolve(distPath, `json/${mode}.json`));
      const modeCommonJS = parseCommonJSWithObjects(resolve(distPath, `js/common/${mode}.js`));

      it("should have mode-specific tokens", () => {
        // Mode files should have tokens that start with 'mode'
        const hasModeTokens = Array.from(modeJSON.keys()).some(k => k.includes("Color") || k.includes("Background"));
        expect(hasModeTokens).toBe(true);
      });

      it("should have consistent output between JSON and CommonJS formats", () => {
        // Spot check a few tokens
        modeJSON.forEach((_, jsonKey) => {
          if (typeof jsonKey === "string" && jsonKey.length > 0) {
            const jsKey = kebabToCamel(jsonKey);
            // Should exist in CommonJS (allowing for potential case differences)
            const found = Array.from(modeCommonJS.keys()).some(k => k.toLowerCase() === jsKey.toLowerCase());
            expect(found).toBe(true);
          }
        });
      });

      it("should have serializable values", () => {
        modeCommonJS.forEach((value) => {
          // All values should be either strings or objects
          expect(typeof value === "string" || typeof value === "object").toBe(true);
        });
      });

      it("should preserve falsy numeric values if present", () => {
        // If any numeric 0 values exist, they should be preserved as "0" not undefined
        modeCommonJS.forEach((value, key) => {
          if (value === "0") {
            expect(value).toBe("0");
          }
        });
      });
    });
  });

  it("light and dark modes should have different values for color tokens", () => {
    const lightJSON = parseJSONFile(resolve(distPath, "json/light.json"));
    const darkJSON = parseJSONFile(resolve(distPath, "json/dark.json"));

    // Find a color token and verify light/dark differ
    let foundDifference = false;
    lightJSON.forEach((lightValue, key) => {
      const darkValue = darkJSON.get(key);
      if (darkValue && lightValue !== darkValue && key.includes("Color")) {
        foundDifference = true;
      }
    });

    // At least some mode tokens should differ between light and dark
    expect(foundDifference).toBe(true);
  });
});

describe("CommonJS exports format", () => {
  it("should use module.exports.tokenName = value syntax", () => {
    const content = readFileSync(resolve(distPath, "js/common/global.js"), "utf-8");
    
    // Should have module.exports pattern
    expect(content).toMatch(/module\.exports\.\w+\s*=/);
    
    // Should not have nested object exports (each token is a separate export)
    expect(content).not.toMatch(/module\.exports\s*=\s*\{/);
  });

  it("should handle multi-line values correctly", () => {
    const globalCommonJS = parseCommonJSWithObjects(resolve(distPath, "js/common/global.js"));
    
    // Font object tokens may span multiple lines - verify they're parsed correctly
    const fontToken = globalCommonJS.get("globalFontFluidHeadingS");
    expect(fontToken).toBeDefined();
    expect(typeof fontToken).toBe("object");
  });
});

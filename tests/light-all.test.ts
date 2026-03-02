import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseCSSFile } from "./utils/index.js";
import { cwd } from "process";
import { readdirSync } from "fs";

const distPath = resolve(cwd(), "dist");

describe("light-all.css", () => {
  const lightAllTokens = parseCSSFile(resolve(distPath, "css/light-all.css"));
  const globalTokens = parseCSSFile(resolve(distPath, "css/global.css"));
  const lightTokens = parseCSSFile(resolve(distPath, "css/light.css"));
  
  // Get all component CSS files
  const componentsDir = resolve(distPath, "css/components");
  const componentFiles = readdirSync(componentsDir).filter(file => file.endsWith(".css"));
  const componentTokens = new Map<string, string>();
  
  componentFiles.forEach(file => {
    const tokens = parseCSSFile(resolve(componentsDir, file));
    tokens.forEach((value, key) => {
      componentTokens.set(key, value);
    });
  });

  it("should include all global tokens", () => {
    globalTokens.forEach((value, key) => {
      expect(lightAllTokens.has(key)).toBe(true);
      expect(lightAllTokens.get(key)).toBe(value);
    });
  });

  it("should include all light mode tokens", () => {
    lightTokens.forEach((value, key) => {
      expect(lightAllTokens.has(key)).toBe(true);
      expect(lightAllTokens.get(key)).toBe(value);
    });
  });

  it("should include all component tokens", () => {
    componentTokens.forEach((value, key) => {
      expect(lightAllTokens.has(key)).toBe(true);
      expect(lightAllTokens.get(key)).toBe(value);
    });
  });

  it("should not include dark mode token values", () => {
    const darkTokens = parseCSSFile(resolve(distPath, "css/dark.css"));
    
    // Check that mode tokens use light values, not dark values
    lightAllTokens.forEach((lightAllValue, lightAllKey) => {
      if (lightAllKey.startsWith("mode-")) {
        // For mode tokens, verify they match the light.css values
        const lightValue = lightTokens.get(lightAllKey);
        if (lightValue) {
          expect(lightAllValue).toBe(lightValue);
        }
        
        // Make sure the value is NOT from dark.css (unless they coincidently match)
        const darkValue = darkTokens.get(lightAllKey);
        if (darkValue && lightValue && darkValue !== lightValue) {
          expect(lightAllValue).toBe(lightValue);
          expect(lightAllValue).not.toBe(darkValue);
        }
      }
    });
  });

  it("should have the correct total number of tokens", () => {
    const expectedTotal = new Set([
      ...globalTokens.keys(),
      ...lightTokens.keys(),
      ...componentTokens.keys(),
    ]).size;
    
    expect(lightAllTokens.size).toBe(expectedTotal);
  });
});

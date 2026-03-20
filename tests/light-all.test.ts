import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseCSSFile, isAlphabetical } from "./utils/index.js";
import { cwd } from "process";
import { readdirSync, readFileSync } from "fs";

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

  describe("section ordering", () => {
    const lightAllContent = readFileSync(
      resolve(distPath, "css/light-all.css"),
      "utf-8"
    );

    it("should have GLOBAL section in alphabetical order", () => {
      // Extract GLOBAL section (between /* GLOBAL */ and /* LIGHT */)
      const globalMatch = lightAllContent.match(
        /\/\*\s*GLOBAL\s*\*\/\n([\s\S]*?)\/\*\s*LIGHT\s*\*\//
      );
      
      expect(globalMatch).toBeTruthy();
      if (!globalMatch) return;
      
      // Extract token names from section
      const globalTokenNames = Array.from(
        globalMatch[1]!.matchAll(/--([a-z0-9-]+):/g)
      ).map(match => `--${match[1]}`);
      
      expect(globalTokenNames.length).toBeGreaterThan(0);
      expect(isAlphabetical(globalTokenNames)).toBe(true);
    });

    it("should have LIGHT section in alphabetical order", () => {
      // Extract LIGHT section (between /* LIGHT */ and /* COMPONENTS */)
      const lightMatch = lightAllContent.match(
        /\/\*\s*LIGHT\s*\*\/\n([\s\S]*?)\/\*\s*COMPONENTS\s*\*\//
      );
      
      expect(lightMatch).toBeTruthy();
      if (!lightMatch) return;
      
      // Extract token names from section
      const lightTokenNames = Array.from(
        lightMatch[1]!.matchAll(/--([a-z0-9-]+):/g)
      ).map(match => `--${match[1]}`);
      
      expect(lightTokenNames.length).toBeGreaterThan(0);
      expect(isAlphabetical(lightTokenNames)).toBe(true);
    });

    it("should have COMPONENTS section in alphabetical order", () => {
      // Extract COMPONENTS section (after /* COMPONENTS */)
      const componentsMatch = lightAllContent.match(
        /\/\*\s*COMPONENTS\s*\*\/\n([\s\S]*)/
      );
      
      expect(componentsMatch).toBeTruthy();
      if (!componentsMatch) return;
      
      // Extract token names from section
      const componentTokenNames = Array.from(
        componentsMatch[1]!.matchAll(/--([a-z0-9-]+):/g)
      ).map(match => `--${match[1]}`);
      
      expect(componentTokenNames.length).toBeGreaterThan(0);
      expect(isAlphabetical(componentTokenNames)).toBe(true);
    });
  });
});

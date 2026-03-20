import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseJSONFile, isAlphabetical, getTokenNames } from "./utils/index.js";
import { cwd } from "process";
import { readdirSync } from "fs";

const distPath = resolve(cwd(), "dist");

describe("JSON token ordering", () => {
  describe("Components", () => {
    // Dynamically load all component JSON files from the dist directory
    const componentsDir = resolve(distPath, "json/components");
    const components = readdirSync(componentsDir)
      .filter(file => file.endsWith(".json"))
      .map(file => file.replace(".json", ""));

    // Test each component file for alphabetical ordering
    components.forEach(component => {
      it(`should have ${component}.json tokens in a-z order`, () => {
        const jsonTokens = parseJSONFile(resolve(distPath, `json/components/${component}.json`));
        const keys = getTokenNames(jsonTokens);
        
        expect(isAlphabetical(keys)).toBe(true);
        
        // Show which keys are out of order for debugging
        if (!isAlphabetical(keys)) {
          console.log(`Out of order keys in ${component}.json:`, keys);
        }
      });
    });
  });

  describe("Global and Mode files", () => {
    // Test global and mode files (light.json, dark.json, global.json)
    const filesToTest = [
      { name: "light.json", path: "json/light.json" },
      { name: "dark.json", path: "json/dark.json" },
      { name: "global.json", path: "json/global.json" },
    ];

    filesToTest.forEach(({ name, path }) => {
      it(`should have ${name} tokens in a-z order`, () => {
        const jsonTokens = parseJSONFile(resolve(distPath, path));
        const keys = getTokenNames(jsonTokens);
        
        expect(isAlphabetical(keys)).toBe(true);
        
        // Show which keys are out of order for debugging
        if (!isAlphabetical(keys)) {
          console.log(`Out of order keys in ${name}:`, keys);
        }
      });
    });
  });
});

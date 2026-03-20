import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseCSSFile, isAlphabetical, getTokenNames } from "./utils/index.js";
import { cwd } from "process";
import { readdirSync } from "fs";

const distPath = resolve(cwd(), "dist");

describe("CSS custom properties ordering", () => {
  describe("Components", () => {
    // Dynamically load all component CSS files from the dist directory
    const componentsDir = resolve(distPath, "css/components");
    const components = readdirSync(componentsDir)
      .filter(file => file.endsWith(".css"))
      .map(file => file.replace(".css", ""));

    // Test each component CSS file for alphabetical ordering
    components.forEach(component => {
      it(`should have ${component}.css properties in a-z order`, () => {
        const cssData = parseCSSFile(resolve(distPath, `css/components/${component}.css`));
        const properties = getTokenNames(cssData);
        
        expect(isAlphabetical(properties)).toBe(true);
        
        // Show which properties are out of order for debugging
        if (!isAlphabetical(properties)) {
          console.log(`Out of order properties in ${component}.css:`, properties);
        }
      });
    });
  });

  describe("Global and Mode files", () => {
    // Test global and mode files (light.css, dark.css, global.css)
    const filesToTest = [
      { name: "light.css", path: "css/light.css" },
      { name: "dark.css", path: "css/dark.css" },
      { name: "global.css", path: "css/global.css" },
    ];

    filesToTest.forEach(({ name, path }) => {
      it(`should have ${name} properties in a-z order`, () => {
        const cssData = parseCSSFile(resolve(distPath, path));
        const properties = getTokenNames(cssData);
        
        expect(isAlphabetical(properties)).toBe(true);
        
        // Show which properties are out of order for debugging
        if (!isAlphabetical(properties)) {
          console.log(`Out of order properties in ${name}:`, properties);
        }
      });
    });
  });
});

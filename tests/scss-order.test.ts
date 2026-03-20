import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseSCSSFile, isAlphabetical, getTokenNames } from "./utils/index.js";
import { cwd } from "process";
import { readdirSync } from "fs";

const distPath = resolve(cwd(), "dist");

describe("SCSS variables ordering", () => {
  describe("Components", () => {
    // Dynamically load all component SCSS files from the dist directory
    const componentsDir = resolve(distPath, "scss/components");
    const components = readdirSync(componentsDir)
      .filter(file => file.endsWith(".scss"))
      .map(file => file.replace(".scss", ""));

    // Test each component SCSS file for alphabetical ordering
    components.forEach(component => {
      it(`should have ${component}.scss variables in a-z order`, () => {
        const scssData = parseSCSSFile(resolve(distPath, `scss/components/${component}.scss`));
        const variables = getTokenNames(scssData);
        
        expect(isAlphabetical(variables)).toBe(true);
        
        // Show which variables are out of order for debugging
        if (!isAlphabetical(variables)) {
          console.log(`Out of order variables in ${component}.scss:`, variables);
        }
      });
    });
  });

  describe("Global and Mode files", () => {
    // Test global and mode files (light.scss, dark.scss, global.scss)
    const filesToTest = [
      { name: "light.scss", path: "scss/light.scss" },
      { name: "dark.scss", path: "scss/dark.scss" },
      { name: "global.scss", path: "scss/global.scss" },
    ];

    filesToTest.forEach(({ name, path }) => {
      it(`should have ${name} variables in a-z order`, () => {
        const scssData = parseSCSSFile(resolve(distPath, path));
        const variables = getTokenNames(scssData);
        
        expect(isAlphabetical(variables)).toBe(true);
        
        // Show which variables are out of order for debugging
        if (!isAlphabetical(variables)) {
          console.log(`Out of order variables in ${name}:`, variables);
        }
      });
    });
  });
});

import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseCommonJSFile, isAlphabetical, getTokenNames } from "./utils/index.js";
import { cwd } from "process";
import { readdirSync } from "fs";

const distPath = resolve(cwd(), "dist");

describe("CommonJS token ordering", () => {
  describe("Components", () => {
    // fetch all component names from common/components directory
    const componentsDir = resolve(distPath, "js/common/components");
    const components = readdirSync(componentsDir)
      .filter(file => file.endsWith(".js") && !file.endsWith(".d.ts"))
      .map(file => file.replace(".js", ""));

    components.forEach(component => {
      it(`should have ${component}.js exports in a-z order`, () => {
        const cjsData = parseCommonJSFile(resolve(distPath, `js/common/components/${component}.js`));
        const exports = getTokenNames(cjsData);
        
        expect(isAlphabetical(exports)).toBe(true);
        
        // Show which exports are out of order for debugging
        if (!isAlphabetical(exports)) {
          console.log(`Out of order exports in ${component}.js:`, exports);
        }
      });
    });
  });

  describe("Global and Mode files", () => {
    const filesToTest = [
      { name: "light.js", path: "js/common/light.js" },
      { name: "dark.js", path: "js/common/dark.js" },
      { name: "global.js", path: "js/common/global.js" },
    ];

    filesToTest.forEach(({ name, path }) => {
      it(`should have ${name} exports in a-z order`, () => {
        const cjsData = parseCommonJSFile(resolve(distPath, path));
        const exports = getTokenNames(cjsData);
        
        expect(isAlphabetical(exports)).toBe(true);
        
        // Show which exports are out of order for debugging
        if (!isAlphabetical(exports)) {
          console.log(`Out of order exports in ${name}:`, exports);
        }
      });
    });
  });
});

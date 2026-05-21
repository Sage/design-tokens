import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseES6File, isAlphabetical, getTokenNames } from "./utils/index.js";
import { cwd } from "process";
import { readdirSync } from "fs";

const distPath = resolve(cwd(), "dist");

describe("ES6 token ordering", () => {
  const componentsDir = resolve(distPath, "js/es6/components");
  const components = readdirSync(componentsDir)
    .filter(file => file.endsWith(".js") && !file.endsWith(".d.ts"))
    .map(file => file.replace(".js", ""));

  components.forEach(component => {
    it(`should have ${component}.js exports in a-z order`, () => {
      const es6Data = parseES6File(resolve(distPath, `js/es6/components/${component}.js`));
      const exports = getTokenNames(es6Data);
      const ordered = isAlphabetical(exports);

      if (!ordered) {
        console.log(`Out of order exports in ${component}.js:`, exports);
      }
      expect(ordered).toBe(true);
    });
  });

  const filesToTest = [
    { name: "light.js", path: "js/es6/light.js" },
    { name: "dark.js", path: "js/es6/dark.js" },
    { name: "global.js", path: "js/es6/global.js" },
  ];

  filesToTest.forEach(({ name, path }) => {
    it(`should have ${name} exports in a-z order`, () => {
      const es6Data = parseES6File(resolve(distPath, path));
      const exports = getTokenNames(es6Data);
      const ordered = isAlphabetical(exports);

      if (!ordered) {
        console.log(`Out of order exports in ${name}:`, exports);
      }
      expect(ordered).toBe(true);
    });
  });
});

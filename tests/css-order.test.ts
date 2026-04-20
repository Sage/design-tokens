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
  const componentsDir = resolve(distPath, "css/components");
  const components = readdirSync(componentsDir)
    .filter(file => file.endsWith(".css"))
    .map(file => file.replace(".css", ""));

  components.forEach(component => {
    it(`should have ${component}.css properties in a-z order`, () => {
      const cssData = parseCSSFile(resolve(distPath, `css/components/${component}.css`));
      const properties = getTokenNames(cssData);
      const ordered = isAlphabetical(properties);

      if (!ordered) {
        console.log(`Out of order properties in ${component}.css:`, properties);
      }
      expect(ordered).toBe(true);
    });
  });

  const filesToTest = [
    { name: "light.css", path: "css/light.css" },
    { name: "dark.css", path: "css/dark.css" },
    { name: "global.css", path: "css/global.css" },
  ];

  filesToTest.forEach(({ name, path }) => {
    it(`should have ${name} properties in a-z order`, () => {
      const cssData = parseCSSFile(resolve(distPath, path));
      const properties = getTokenNames(cssData);
      const ordered = isAlphabetical(properties);

      if (!ordered) {
        console.log(`Out of order properties in ${name}:`, properties);
      }
      expect(ordered).toBe(true);
    });
  });
});

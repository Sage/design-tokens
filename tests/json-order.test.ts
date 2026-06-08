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
  const componentsDir = resolve(distPath, "json/components");
  const components = readdirSync(componentsDir)
    .filter(file => file.endsWith(".json"))
    .map(file => file.replace(".json", ""));

  components.forEach(component => {
    it(`should have ${component}.json tokens in a-z order`, () => {
      const jsonTokens = parseJSONFile(resolve(distPath, `json/components/${component}.json`));
      const keys = getTokenNames(jsonTokens);
      const ordered = isAlphabetical(keys);

      if (!ordered) {
        console.log(`Out of order keys in ${component}.json:`, keys);
      }
      expect(ordered).toBe(true);
    });
  });

  const filesToTest = [
    { name: "light.json", path: "json/light.json" },
    { name: "dark.json", path: "json/dark.json" },
    { name: "global.json", path: "json/global.json" },
  ];

  filesToTest.forEach(({ name, path }) => {
    it(`should have ${name} tokens in a-z order`, () => {
      const jsonTokens = parseJSONFile(resolve(distPath, path));
      const keys = getTokenNames(jsonTokens);
      const ordered = isAlphabetical(keys);

      if (!ordered) {
        console.log(`Out of order keys in ${name}:`, keys);
      }
      expect(ordered).toBe(true);
    });
  });
});

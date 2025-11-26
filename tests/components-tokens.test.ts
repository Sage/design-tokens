import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import {
  parseCSSFile,
  parseJSONFile,
  parseCommonJSFile,
  parseES6File,
  kebabToCamel
} from "./utils/index.js";

import { cwd } from "process";
import { readdirSync } from "fs";

const distPath = resolve(cwd(), "dist");

// fetch all component names from css/components directory
const componentsDir = resolve(distPath, "css/components");
const components = readdirSync(componentsDir)
  .filter(file => file.endsWith(".css"))
  .map(file => file.replace(".css", ""));

components.forEach(component => {
  describe(`The ${component} component`, () => {
    it("should have consistent output across all formats", () => {
      const cssTokens = parseCSSFile(resolve(distPath, `css/components/${component}.css`));
      const jsonTokens = parseJSONFile(resolve(distPath, `json/components/${component}.json`));
      const jsTokens = parseCommonJSFile(resolve(distPath, `js/common/components/${component}.js`));
      const es6Tokens = parseES6File(resolve(distPath, `js/es6/components/${component}.js`));
      
      // All formats should have the same number of tokens
      expect(cssTokens.size).toBe(jsonTokens.size);
      expect(cssTokens.size).toBe(jsTokens.size);
      expect(cssTokens.size).toBe(es6Tokens.size);
      
      // Values should match across formats
      cssTokens.forEach((cssValue, cssKey) => {
        const camelKey = kebabToCamel(cssKey);
        expect(jsonTokens.get(camelKey)).toBe(cssValue);
        expect(jsTokens.get(camelKey)).toBe(cssValue);
        expect(es6Tokens.get(camelKey)).toBe(cssValue);
      });
    });
  });
});

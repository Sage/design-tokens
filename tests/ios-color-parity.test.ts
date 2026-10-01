import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { cwd } from "process";
import { describe, expect, it } from "vitest";
import {
  ColorMode,
  JSONTokenMap,
  SwiftNamespaces,
  parseSwiftNamespace,
  readJSONTokens,
  resolveJSONColors,
  resolveSwiftColors,
} from "./utils/color-parity.js";

const distPath = resolve(cwd(), "dist");
const iosPath = resolve(distPath, "ios");
const jsonPath = resolve(distPath, "json");
const componentFiles = readdirSync(resolve(jsonPath, "components")).filter(file => file.endsWith(".json"));

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
const readSwift = (filePath: string): string => readFileSync(resolve(iosPath, filePath), "utf-8");

const globalJSON = readJSONTokens(resolve(jsonPath, "global.json"));
const modeJSON: Record<ColorMode, JSONTokenMap> = {
  light: readJSONTokens(resolve(jsonPath, "light.json")),
  dark: readJSONTokens(resolve(jsonPath, "dark.json")),
};

const swiftNamespaces: SwiftNamespaces = new Map();

for (const mode of ["light", "dark"] as const) {
  const namespace = `SageTokens${titleCase(mode)}`;
  swiftNamespaces.set(namespace, parseSwiftNamespace(readSwift(`${mode}.swift`), namespace));
}

swiftNamespaces.set(
  "SageTokensGlobal",
  parseSwiftNamespace(readSwift("global.swift"), "SageTokensGlobal"),
);

for (const file of componentFiles) {
  const component = file.replace(".json", "");
  const content = readSwift(`components/${component}.swift`);

  for (const prefix of ["Light", "Dark", ""]) {
    const namespace = `SageTokens${prefix}${titleCase(component)}`;
    const tokens = parseSwiftNamespace(content, namespace);
    if (tokens.size > 0) swiftNamespaces.set(namespace, tokens);
  }
}

const expectColorParity = (
  tokenName: string,
  jsonValue: unknown,
  jsonRegistry: JSONTokenMap,
  swiftTokens: Map<string, string>,
  mode: ColorMode,
  label: string,
): void => {
  const expected = resolveJSONColors(jsonValue, jsonRegistry);
  const expression = swiftTokens.get(tokenName);

  expect(expression, `${label}.${tokenName} is missing from the Swift output`).toBeDefined();
  expect(
    resolveSwiftColors(expression ?? "", swiftNamespaces, mode),
    `${label}.${tokenName} does not resolve to the same RGBA hex value(s)`,
  ).toEqual(expected);
};

describe("iOS and JSON color parity", () => {
  for (const mode of ["light", "dark"] as const) {
    it(`resolves every ${mode} mode token to the same RGBA hex value`, () => {
      const namespace = `SageTokens${titleCase(mode)}`;
      const swiftTokens = swiftNamespaces.get(namespace) ?? new Map();
      const registry = { ...globalJSON, ...modeJSON[mode] };

      expect([...swiftTokens.keys()].sort()).toEqual(Object.keys(modeJSON[mode]).sort());

      for (const [tokenName, value] of Object.entries(modeJSON[mode])) {
        expectColorParity(tokenName, value, registry, swiftTokens, mode, mode);
      }
    });

    it(`resolves every adaptive global color to the ${mode} mode hex value`, () => {
      const swiftTokens = swiftNamespaces.get("SageTokensGlobal") ?? new Map();
      const registry = { ...globalJSON, ...modeJSON[mode] };

      for (const [tokenName, value] of Object.entries(globalJSON)) {
        if (resolveJSONColors(value, registry).length > 0) {
          expectColorParity(tokenName, value, registry, swiftTokens, mode, `global/${mode}`);
        }
      }
    });
  }

  for (const file of componentFiles) {
    const component = file.replace(".json", "");

    it(`resolves every ${component} component color to the same RGBA hex value`, () => {
      const componentJSON = readJSONTokens(resolve(jsonPath, "components", file));

      for (const mode of ["light", "dark"] as const) {
        const registry = { ...globalJSON, ...modeJSON[mode], ...componentJSON };
        const colorTokens = Object.entries(componentJSON).filter(([, value]) => {
          return resolveJSONColors(value, registry).length > 0;
        });
        const namespace = `SageTokens${titleCase(mode)}${titleCase(component)}`;
        const swiftTokens = swiftNamespaces.get(namespace) ?? new Map();

        expect([...swiftTokens.keys()].sort()).toEqual(colorTokens.map(([name]) => name).sort());

        for (const [tokenName, value] of colorTokens) {
          expectColorParity(tokenName, value, registry, swiftTokens, mode, `${component}/${mode}`);
        }
      }
    });
  }
});

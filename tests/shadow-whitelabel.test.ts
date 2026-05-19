import {
  describe,
  it,
  expect,
} from "vitest";
import { resolve } from "path";
import { parseCSSFile } from "./utils/index.js";
import { cwd } from "process";

const distPath = resolve(cwd(), "dist");

const resolveDepthValue = (globalValue: string, modeTokens: Map<string, string>): string => {
  return globalValue
    .replace(/var\(--mode-color-generic-depth-faint\)/g, modeTokens.get("mode-color-generic-depth-faint") ?? "")
    .replace(/var\(--mode-color-generic-depth-delicate\)/g, modeTokens.get("mode-color-generic-depth-delicate") ?? "")
    .replace(/var\(--mode-color-generic-depth-soft\)/g, modeTokens.get("mode-color-generic-depth-soft") ?? "");
};

describe("global shadow tokens", () => {
  const globalTokens = parseCSSFile(resolve(distPath, "css/global.css"));
  const lightModeTokens = parseCSSFile(resolve(distPath, "css/light.css"));
  const darkModeTokens = parseCSSFile(resolve(distPath, "css/dark.css"));

  const depthKeys = [
    "global-depth-lvl0",
    "global-depth-lvl1",
    "global-depth-lvl2",
    "global-depth-lvl3",
    "global-depth-sticky-b",
    "global-depth-sticky-l",
    "global-depth-sticky-r",
  ];

  const expectedDepthRefMap = new Map<string, string[]>([
    ["global-depth-lvl0", ["faint", "soft"]],
    ["global-depth-lvl1", ["faint", "soft"]],
    ["global-depth-lvl2", ["faint", "delicate"]],
    ["global-depth-lvl3", ["faint", "faint"]],
    ["global-depth-sticky-b", ["faint", "soft"]],
    ["global-depth-sticky-l", ["faint", "faint"]],
    ["global-depth-sticky-r", ["faint", "faint"]],
  ]);

  it("should preserve references to mode depth tokens in global.css", () => {
    depthKeys.forEach((depthKey) => {
      const depthValue = globalTokens.get(depthKey);
      expect(depthValue, `Missing ${depthKey}`).toBeDefined();
      expect(depthValue).toContain("var(--mode-color-generic-depth-");

      const modeRefs = depthValue?.match(/var\(--mode-color-generic-depth-(faint|delicate|soft)\)/g) ?? [];
      const expectedRefs = expectedDepthRefMap.get(depthKey)?.map((ref) => `var(--mode-color-generic-depth-${ref})`) ?? [];

      expect(modeRefs).toEqual(expectedRefs);
    });
  });

  it("should not inject mode depth references into non-depth global tokens", () => {
    globalTokens.forEach((value, key) => {
      if (!key.startsWith("global-depth-")) {
        expect(value).not.toContain("mode-color-generic-depth-");
      }
    });
  });

  it("should keep global typography tokens free of malformed substitutions", () => {
    const typographyProbeKeys = [
      "global-font-fluid-comp-medium-xs",
      "global-font-fluid-comp-regular-m",
      "global-font-static-comp-regular-l",
      "global-font-static-comp-placeholder-xl",
    ];

    typographyProbeKeys.forEach((tokenKey) => {
      const tokenValue = globalTokens.get(tokenKey);
      expect(tokenValue, `Missing ${tokenKey}`).toBeDefined();
      expect(tokenValue).not.toContain("stepvar(");
      expect(tokenValue).not.toContain("5var(");
      expect(tokenValue).not.toContain("undefined");
    });
  });

  it("should resolve to different depth values between light and dark themes", () => {
    depthKeys.forEach((depthKey) => {
      const globalValue = globalTokens.get(depthKey);
      expect(globalValue, `Missing ${depthKey}`).toBeDefined();

      const resolvedLight = resolveDepthValue(globalValue as string, lightModeTokens);
      const resolvedDark = resolveDepthValue(globalValue as string, darkModeTokens);

      expect(resolvedLight).not.toBe(resolvedDark);
    });
  });
});

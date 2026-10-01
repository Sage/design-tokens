import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { cwd } from "process";
import { describe, expect, it } from "vitest";

const iosPath = resolve(cwd(), "dist/ios");

const readSwift = (path: string): string => readFileSync(resolve(iosPath, path), "utf-8");

const swiftTokenValue = (content: string, name: string): string | undefined => {
  return content.match(new RegExp(`public static let ${name} = (.+)`))?.[1];
}

describe("iOS Swift tokens", () => {
  it("generates separate global, light, and dark namespaces", () => {
    expect(existsSync(resolve(iosPath, "core.swift"))).toBe(false);
    expect(existsSync(resolve(iosPath, "global.swift"))).toBe(true);
    expect(readSwift("global.swift")).toContain("public enum SageTokensGlobal");
    expect(readSwift("light.swift")).toContain("public enum SageTokensLight");
    expect(readSwift("dark.swift")).toContain("public enum SageTokensDark");
    expect(existsSync(resolve(iosPath, "mode.swift"))).toBe(false);
  });

  it("generates one component set with light and dark namespaces", () => {
    const iosComponents = readdirSync(resolve(iosPath, "components")).map(file => file.replace(".swift", ""));
    const jsonComponents = readdirSync(resolve(cwd(), "dist/json/components")).map(file => file.replace(".json", ""));

    expect(iosComponents.sort()).toEqual(jsonComponents.sort());
    expect(readSwift("components/profile.swift")).toContain("public enum SageTokensProfile");
    expect(readSwift("components/button.swift")).toContain("public enum SageTokensLightButton");
    expect(readSwift("components/button.swift")).toContain("public enum SageTokensDarkButton");
    expect(existsSync(resolve(iosPath, "light/components"))).toBe(false);
    expect(existsSync(resolve(iosPath, "dark/components"))).toBe(false);
  });

  it("emits native scalar values without web-only syntax", () => {
    const outputs = [
      readSwift("global.swift"),
      readSwift("light.swift"),
      readSwift("dark.swift"),
      readSwift("components/button.swift"),
    ].join("\n");

    expect(outputs).toContain("UIColor(");
    expect(outputs).toContain("CGFloat(");
    expect(outputs).not.toContain("linear-gradient");
    expect(outputs).not.toContain("[object Object]");
  });

  it("emits supported native token types", () => {
    expect(readSwift("global.swift")).toContain("public struct SageTokenGradientStop: Sendable");
    expect(readSwift("global.swift")).toContain("public struct SageTokenGradient: Sendable");
    expect(readSwift("global.swift")).toContain("public enum SageTokenShadowKind: Sendable");
    expect(readSwift("global.swift")).toContain("public struct SageTokenShadow: Sendable");
    expect(readSwift("global.swift")).toContain("public struct SageTokenTypography: Sendable");
    expect(swiftTokenValue(readSwift("light.swift"), "modeColorActionAiGradActive")).toContain("SageTokenGradient(");
    expect(swiftTokenValue(readSwift("components/focus.swift"), "focusShadowDefault")).toContain("[SageTokenShadow](");
    expect(swiftTokenValue(readSwift("global.swift"), "globalFontFamiliesHeading")).toBe("\"Sage UI\"");
    expect(readSwift("global.swift")).toContain("fontWeight: .regular, lineHeight: CGFloat(1.500), fontSize: CGFloat(14.00)");
    expect(readSwift("global.swift")).not.toContain("globalFontFluid");
    expect(swiftTokenValue(readSwift("global.swift"), "globalBorderwidthXs")).toBe("CGFloat(1.00)");
    expect(readSwift("global.swift")).toContain("SageTokensDark.modeColorGenericDepthFaint");
    expect(readSwift("global.swift")).toContain("x: CGFloat(6.00), y: CGFloat(6.00), blur: CGFloat(30.00)");
  });

  it("preserves component references to the selected mode namespace", () => {
    const componentButton = readSwift("components/button.swift");

    expect(componentButton).toContain("SageTokensLight.modeColorActionMainDefault");
    expect(componentButton).toContain("SageTokensDark.modeColorActionMainDefault");
    expect(readSwift("components/profile.swift")).toContain("SageTokensGlobal.globalSizeXs");
    expect(componentButton).toContain("SageTokensLightButton.buttonNone");
    expect(componentButton).toContain("SageTokensDarkButton.buttonNone");
  });
});

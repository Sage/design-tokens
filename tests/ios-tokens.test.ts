import { existsSync, readFileSync } from "fs";
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

  it("emits structured composite tokens", () => {
    expect(readSwift("global.swift")).toContain("public struct SageTokenGradient");
    expect(readSwift("global.swift")).toContain("public struct SageTokenShadow");
    expect(readSwift("global.swift")).toContain("public struct SageTokenTypography");
    expect(swiftTokenValue(readSwift("light.swift"), "modeColorActionAiGradActive")).toContain("SageTokenGradient(");
    expect(swiftTokenValue(readSwift("components/focus.swift"), "focusShadowDefault")).toContain("[SageTokenShadow](");
    expect(swiftTokenValue(readSwift("components/profile.swift"), "profileFontInitialsXs")).toBe(
      "SageTokensGlobal.globalFontStaticCompPlaceholderXs",
    );
    expect(swiftTokenValue(readSwift("global.swift"), "globalFontFamiliesHeading")).toBe("\"Sage UI\"");
    expect(readSwift("global.swift")).toContain("fontWeight: .regular, lineHeight: CGFloat(1.500), fontSize: CGFloat(14.00)");
    expect(readSwift("global.swift")).not.toContain("globalFontFluid");
    expect(swiftTokenValue(readSwift("global.swift"), "globalBorderwidthXs")).toBe("CGFloat(1.00)");
    expect(swiftTokenValue(readSwift("global.swift"), "globalRadiusContainer2Xs")).toBe("CGFloat(2.00)");
    expect(readSwift("global.swift")).toContain("SageTokensDark.modeColorGenericDepthFaint");
    expect(swiftTokenValue(readSwift("light.swift"), "modeColorNone")).toContain("alpha: 0.000");
    expect(swiftTokenValue(readSwift("light.swift"), "modeColorGenericDepthSoft")).toContain("alpha: 0.200");
    expect(swiftTokenValue(readSwift("dark.swift"), "modeColorActionInactiveMask")).toContain("alpha: 0.400");
    expect(swiftTokenValue(readSwift("dark.swift"), "modeColorActionInactiveDefault")).toContain("alpha: 0.302");
    expect(swiftTokenValue(readSwift("dark.swift"), "modeColorActionMainActive")).toContain("green: 0.953");
    expect(readSwift("global.swift")).toContain("x: CGFloat(6.00), y: CGFloat(6.00), blur: CGFloat(30.00)");
  });

  it("preserves component references to the selected mode namespace", () => {
    const componentButton = readSwift("components/button.swift");

    expect(componentButton).toContain("SageTokensLight.modeColorActionMainDefault");
    expect(componentButton).toContain("SageTokensDark.modeColorActionMainDefault");
    expect(swiftTokenValue(readSwift("components/profile.swift"), "profileSizeOutsideXs")).toBe(
      "SageTokensGlobal.globalSizeXs",
    );
    expect(componentButton).toContain("SageTokensLightButton.buttonNone");
    expect(componentButton).toContain("SageTokensDarkButton.buttonNone");
    expect(readSwift("components/profile.swift")).toContain("public static let profileSizeOutsideMl = CGFloat(56.00)");
    expect(componentButton).toContain("SageTokensLight.modeColorActionAiGradDefault");
    expect(componentButton).toContain("SageTokensDark.modeColorActionAiGradDefault");
    expect(swiftTokenValue(readSwift("light.swift"), "modeColorActionAiGradDefault")).toContain("SageTokenGradient(");
    expect(readSwift("components/progress.swift")).toContain(
      "SageTokensLight.modeColorStatusSkeletonStop1",
    );
  });
});
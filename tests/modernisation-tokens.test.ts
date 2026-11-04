import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { sync } from "glob";

const distPath = resolve("dist");
const modernisation = JSON.parse(readFileSync(resolve(distPath, "json/theme/modernisation.json"), "utf8"));

describe("modernisation tokens", () => {
  it("exports only the overrides, preserving mode references", () => {
    expect(modernisation).toEqual({
      buttonTypicalToggleBgDefault: "var(--mode-color-generic-bg-faint)",
      buttonTypicalToggleBorderDefault: "var(--mode-color-none)",
      containerModalBorderDefault: "var(--mode-color-none)",
      containerStandardBorderDefault: "var(--mode-color-generic-fg-faint)",
      navPrimaryBgActive: "var(--mode-color-generic-bg-delicate)",
      navPrimaryBgDefault: "var(--mode-color-generic-surface-trace)",
      navPrimaryBgChild: "var(--mode-color-generic-surface-trace)",
      navPrimaryBgChildAlt: "var(--mode-color-generic-surface-trace)",
      navPrimaryBgHover: "var(--mode-color-generic-bg-faint)",
      navPrimaryBgSelected: "var(--mode-color-generic-bg-inverse-nought)",
      navPrimaryBorderDefault: "var(--mode-color-none)",
      navPrimaryDivider: "var(--mode-color-generic-fg-soft)",
      navPrimaryLabelActive: "var(--mode-color-action-nav-with-default)",
      navPrimaryLabelDefault: "var(--mode-color-action-nav-with-default)",
      navPrimaryLabelDefaultAlt: "var(--mode-color-generic-txt-moderate)",
      navPrimaryLabelHover: "var(--mode-color-action-nav-with-default)",
      tabBorderActiveAlt: "var(--mode-color-none)",
      tabBorderActiveOutline: "var(--mode-color-generic-surface-nought)",
      tabBorderDefault: "var(--mode-color-generic-fg-faint)",
      tabBgActive: "var(--mode-color-none)"
    });
    expect(Object.values(modernisation).every(value =>
      typeof value === "string" && /^var\(--mode-.*\)$/.test(value)
    )).toBe(true);
  });

  it("generates a single JSON artifact", () => {
    expect(sync("**/modernisation.*", { cwd: distPath })).toEqual(["json/theme/modernisation.json"]);
  });

  it("keeps overrides out of standard component outputs", () => {
    const nav = JSON.parse(readFileSync(resolve(distPath, "json/components/nav.json"), "utf8"));
    expect(nav.navPrimaryBgActive).toBe("var(--mode-color-action-nav-active)");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { sync } from "glob";

const distPath = resolve("dist");
const modernisation = JSON.parse(readFileSync(resolve(distPath, "json/theme/modernisation.json"), "utf8"));

describe("modernisation tokens", () => {
  it("exports only the overrides, preserving mode references", () => {
    expect(Object.keys(modernisation)).toHaveLength(17);
    expect(modernisation).toMatchObject({
      buttonTypicalToggleBgDefault: "var(--mode-color-generic-bg-faint)",
      buttonTypicalToggleBorderDefault: "var(--mode-color-none)",
      navPrimaryBgActive: "var(--mode-color-generic-bg-delicate)",
      navPrimaryBgDefault: "var(--mode-color-generic-surface-trace)",
      navPrimaryBgSelected: "var(--mode-color-generic-bg-inverse-nought)",
      navPrimaryLabelDefault: "var(--mode-color-action-nav-with-default)"
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

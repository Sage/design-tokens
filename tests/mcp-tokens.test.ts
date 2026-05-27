import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { readFileSync } from "fs";

const tokens = JSON.parse(
  readFileSync(resolve(cwd(), "dist/mcp/tokens.json"), "utf8")
);

describe("dist/mcp/tokens.json", () => {
  it("emits a single merged file keyed by token name", () => {
    expect(typeof tokens).toBe("object");
    expect(Object.keys(tokens).length).toBeGreaterThan(1000);
  });

  it("carries enriched fields on a component token", () => {
    const t = tokens["button-typical-primary-bg-default"];
    expect(t).toBeDefined();
    expect(t.layer).toBe("component");
    expect(t.category).toBe("button");
    // refChain is a flat array when identical across modes, or { light, dark } when it diverges
    const chain = t.refChain;
    const isArrayOrModePair =
      Array.isArray(chain) ||
      (!!chain && Array.isArray(chain.light) && Array.isArray(chain.dark));
    expect(isArrayOrModePair).toBe(true);
  });

  it("regression: a mode-dependent token keeps BOTH light and dark values (light not lost)", () => {
    const modeColorEntries = Object.values<any>(tokens).filter(
      (t) => t.category === "mode" && t.value && typeof t.value === "object"
    );
    expect(modeColorEntries.length).toBeGreaterThan(0);
    const sample = modeColorEntries[0];
    expect(sample.value).toHaveProperty("light");
    expect(sample.value).toHaveProperty("dark");
    expect(sample.value.light).not.toBe(sample.value.dark);
  });

  it("mode-independent tokens (global) carry a single string value", () => {
    const globalEntry = Object.values<any>(tokens).find(
      (t) => t.layer === "global"
    );
    expect(globalEntry).toBeDefined();
    expect(typeof globalEntry.value).toBe("string");
  });
});

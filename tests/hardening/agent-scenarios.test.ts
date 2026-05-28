import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { readFileSync } from "fs";
import { createTools } from "../../mcp/tools.js";

const tokens = JSON.parse(
  readFileSync(resolve(cwd(), "dist/mcp/tokens.json"), "utf8")
);
const { getToken, searchTokens } = createTools(tokens);

describe("agent scenario: looking up a button primary color", () => {
  it("multi-word query 'button primary' returns multiple primary-button matches", () => {
    const r = searchTokens({ query: "button primary", limit: 10 });
    expect(r.count, "no matches found for 'button primary'").toBeGreaterThan(0);
    const allContainBoth = r.results.every(
      (t: any) => t.name.includes("button") && t.name.includes("primary")
    );
    expect(allContainBoth, "every result should contain both terms").toBe(true);
  });
});

describe("agent scenario: getting context for a core token", () => {
  it("core-color-black carries its source $description", () => {
    const r = getToken({ name: "core-color-black" });
    expect(r.found).toBe(true);
    expect(typeof r.token.description).toBe("string");
    expect(r.token.description.length).toBeGreaterThan(20);
  });
});

describe("agent scenario: mode-aware reduction", () => {
  it("get_token with mode = dark reduces value to a single string", () => {
    // Pick the first mode-dependent token deterministically by name
    const sample = Object.values<any>(tokens).find(
      (t) => t.category === "mode" && t.value && typeof t.value === "object"
    );
    expect(sample, "expected at least one mode-dependent token").toBeDefined();
    const r = getToken({ name: sample.name, mode: "dark" });
    expect(r.found).toBe(true);
    expect(typeof r.token.value, "value should be a string after mode reduction").toBe("string");
  });
});

describe("agent scenario: layer-scoped exploration", () => {
  it("'color' filtered by layer=core returns only core tokens", () => {
    const r = searchTokens({ query: "color", layer: "core", limit: 50 });
    expect(r.count).toBeGreaterThan(0);
    expect(r.results.every((t: any) => t.layer === "core")).toBe(true);
  });

  it("'space' filtered by layer=global returns only global tokens", () => {
    const r = searchTokens({ query: "space", layer: "global", limit: 50 });
    expect(r.count).toBeGreaterThan(0);
    expect(r.results.every((t: any) => t.layer === "global")).toBe(true);
  });
});

describe("agent scenario: alias chain is visible", () => {
  it("a component token exposes a non-empty refChain to a core literal", () => {
    const buttonToken = Object.values<any>(tokens).find(
      (t) => t.layer === "component" && t.category === "button" && t.reference
    );
    expect(buttonToken, "no referencing button token found").toBeDefined();

    const chain = Array.isArray(buttonToken.refChain)
      ? buttonToken.refChain
      : buttonToken.refChain?.light ?? [];
    expect(chain.length, "refChain should be non-empty").toBeGreaterThan(0);
    expect(chain[chain.length - 1].startsWith("core."), "chain should terminate at a core literal").toBe(true);
  });
});

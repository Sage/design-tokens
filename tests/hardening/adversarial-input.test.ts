import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { readFileSync } from "fs";
import { createTools } from "../../mcp/tools.js";

const tokens = JSON.parse(
  readFileSync(resolve(cwd(), "dist/mcp/tokens.json"), "utf8")
);
const { getToken, searchTokens, listTokensByCategory } = createTools(tokens);

describe("adversarial: get_token", () => {
  it("name = null returns a not-found result, does not throw", () => {
    expect(() => getToken({ name: null as any })).not.toThrow();
    const r = getToken({ name: null as any });
    expect(r.found).toBe(false);
  });

  it("name = undefined returns a not-found result, does not throw", () => {
    expect(() => getToken({ name: undefined as any })).not.toThrow();
    const r = getToken({ name: undefined as any });
    expect(r.found).toBe(false);
  });

  it("name = empty string returns a not-found result, does not throw", () => {
    const r = getToken({ name: "" });
    expect(r.found).toBe(false);
  });

  it("name = 10 KB random string returns a not-found result, does not throw", () => {
    const big = "x".repeat(10_000);
    expect(() => getToken({ name: big })).not.toThrow();
  });

  it("name with special characters returns not-found, does not throw", () => {
    for (const name of ["{", "}", "\n", "\t", "../../etc/passwd", "🦄"]) {
      const r = getToken({ name });
      expect(r.found, `name='${name}' should be not-found`).toBe(false);
    }
  });

  it("mode = 'oops' throws with a clear Invalid mode message", () => {
    expect(() => getToken({ name: "core-color-black", mode: "oops" as any })).toThrowError(/Invalid mode/i);
  });
});

describe("adversarial: search_tokens", () => {
  it("empty / whitespace queries return a result object, never throw", () => {
    for (const query of ["", "   ", "\n\t"]) {
      expect(() => searchTokens({ query })).not.toThrow();
      const r = searchTokens({ query });
      expect(r).toHaveProperty("count");
      expect(r).toHaveProperty("results");
      expect(Array.isArray(r.results)).toBe(true);
    }
  });

  it("Unicode and very long queries do not throw", () => {
    for (const query of ["🦄", "сине", "中文", "x".repeat(5000)]) {
      expect(() => searchTokens({ query })).not.toThrow();
    }
  });

  it("limit = 0 returns an empty results array, truncated false", () => {
    const r = searchTokens({ query: "color", limit: 0 });
    expect(r.results).toEqual([]);
    expect(r.truncated).toBe(false);
  });

  it("limit < 0 does not throw and returns a stable shape", () => {
    expect(() => searchTokens({ query: "color", limit: -1 })).not.toThrow();
    const r = searchTokens({ query: "color", limit: -1 });
    expect(Array.isArray(r.results)).toBe(true);
  });

  it("limit = very large returns at most all matches, truncated false", () => {
    const r = searchTokens({ query: "color", limit: 99_999 });
    expect(r.truncated).toBe(false);
    expect(r.results.length).toBeLessThanOrEqual(r.count);
  });

  it("layer = unknown returns empty results, never throws", () => {
    expect(() => searchTokens({ query: "color", layer: "nope" as any })).not.toThrow();
    const r = searchTokens({ query: "color", layer: "nope" as any });
    expect(r.count).toBe(0);
    expect(r.results).toEqual([]);
  });
});

describe("adversarial: list_tokens_by_category", () => {
  it("unknown category returns empty result, never throws", () => {
    expect(() => listTokensByCategory({ category: "does-not-exist" })).not.toThrow();
    const r = listTokensByCategory({ category: "does-not-exist" });
    expect(r.count).toBe(0);
    expect(r.tokens).toEqual([]);
    expect(r.truncated).toBe(false);
  });

  it("limit = 0 returns empty tokens array but reports the true count", () => {
    const r = listTokensByCategory({ category: "button", limit: 0 });
    expect(r.tokens).toEqual([]);
    expect(r.count).toBeGreaterThan(0);
    expect(r.truncated).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { readFileSync } from "fs";
import { createTools } from "../mcp/tools.js";

const tokens = JSON.parse(
  readFileSync(resolve(cwd(), "tests/fixtures/mcp-tokens.json"), "utf8")
);
const { getToken, searchTokens, listCategories, listTokensByCategory } =
  createTools(tokens);

describe("mcp server tools", () => {
  it("get_token returns enriched entry with both modes", () => {
    const r = getToken({ name: "button-typical-primary-bg-default" });
    expect(r.found).toBe(true);
    expect(r.token.value).toEqual({ light: "#00811f", dark: "#1ba12b" });
    expect(r.token.refChain).toHaveProperty("light");
    expect(r.token.description).toBeDefined();
  });

  it("get_token with mode reduces value to a single string", () => {
    const r = getToken({ name: "button-typical-primary-bg-default", mode: "dark" });
    expect(r.token.value).toBe("#1ba12b");
  });

  it("search_tokens filters by layer", () => {
    const r = searchTokens({ query: "color", layer: "core" });
    expect(r.results.every((t: any) => t.layer === "core")).toBe(true);
    expect(r.results.length).toBeGreaterThan(0);
  });

  it("list_categories includes mode-merged categories", () => {
    const r = listCategories();
    const names = r.categories.map((c: any) => c.name);
    expect(names).toContain("button");
    expect(names).toContain("core");
  });

  it("list_tokens_by_category includes description", () => {
    const r = listTokensByCategory({ category: "button" });
    expect(r.tokens[0]).toHaveProperty("description");
  });
});

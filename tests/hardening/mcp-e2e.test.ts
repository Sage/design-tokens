import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { resolve } from "path";
import { cwd } from "process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Spawns the real mcp/server.js as a subprocess and talks to it over stdio.
let client: Client;
let transport: StdioClientTransport;

beforeAll(async () => {
  transport = new StdioClientTransport({
    command: "node",
    args: [resolve(cwd(), "mcp/server.js")],
  });
  client = new Client(
    { name: "mcp-hardening-test", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(transport);
}, 30_000);

afterAll(async () => {
  await client.close();
});

const callTool = async (name: string, args: Record<string, unknown>) => {
  const res = await client.callTool({ name, arguments: args });
  expect(res.isError, `tool ${name} returned isError=true`).toBeFalsy();
  const block = (res.content as Array<{ type: string; text: string }>)[0];
  expect(block.type).toBe("text");
  return JSON.parse(block.text);
};

describe("MCP E2E: tools/list", () => {
  it("returns exactly the four expected tools with schemas", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "get_token",
      "list_categories",
      "list_tokens_by_category",
      "search_tokens",
    ]);
    for (const t of tools) {
      expect(typeof t.description).toBe("string");
      expect(t.description.length).toBeGreaterThan(10);
      expect(t.inputSchema).toBeDefined();
      expect((t.inputSchema as any).type).toBe("object");
    }
  });
});

describe("MCP E2E: tools/call", () => {
  it("get_token returns a found enriched entry for a known token", async () => {
    const r = await callTool("get_token", { name: "core-color-black" });
    expect(r.found).toBe(true);
    expect(r.token.name).toBe("core-color-black");
    expect(typeof r.token.description).toBe("string");
  });

  it("get_token with mode reduces a mode-divergent value to a single string", async () => {
    // Find a mode token that is genuinely divergent (value is an object), not a coincidentally-scalar one
    const list = await callTool("list_tokens_by_category", { category: "mode", limit: 100 });
    const fullTokens = await Promise.all(
      list.tokens.slice(0, 20).map((t: any) => callTool("get_token", { name: t.name }))
    );
    const divergent = fullTokens.find(
      (r: any) => r.token.value && typeof r.token.value === "object"
    );
    expect(divergent, "expected at least one mode-divergent token in the first 20 of category 'mode'").toBeDefined();

    const r = await callTool("get_token", { name: divergent.token.name, mode: "dark" });
    expect(r.found).toBe(true);
    expect(typeof r.token.value, "value should be a single string after mode reduction").toBe("string");
    // And the reduced value must be the dark side of the divergent object
    expect(r.token.value).toBe((divergent.token.value as any).dark);
  });

  it("search_tokens with layer=core returns only core tokens", async () => {
    const r = await callTool("search_tokens", { query: "color", layer: "core" });
    expect(r.count).toBeGreaterThan(0);
    expect(r.results.every((t: any) => t.layer === "core")).toBe(true);
  });

  it("list_categories returns expected categories including core, mode, button", async () => {
    const r = await callTool("list_categories", {});
    const names = r.categories.map((c: any) => c.name);
    expect(names).toContain("core");
    expect(names).toContain("mode");
    expect(names).toContain("button");
  });

  it("list_tokens_by_category returns description for known-described tokens", async () => {
    const r = await callTool("list_tokens_by_category", { category: "core", limit: 50 });
    expect(r.count).toBeGreaterThan(0);
    const withDesc = r.tokens.filter((t: any) => typeof t.description === "string" && t.description.length > 0);
    expect(withDesc.length, "at least one core token should expose a description").toBeGreaterThan(0);
  });
});

describe("MCP E2E: error contract", () => {
  it("calling an unknown tool surfaces a failure (throws OR returns isError:true)", async () => {
    let outcome: "threw" | "isError" | "silent-success" = "silent-success";
    try {
      const res = await client.callTool({ name: "definitely-not-a-tool", arguments: {} });
      if ((res as any).isError === true) outcome = "isError";
    } catch {
      outcome = "threw";
    }
    expect(outcome, "unknown tool must not silently succeed").not.toBe("silent-success");
  });
});

#!/usr/bin/env node
/**
 * Sage Design Tokens MCP Server (enriched).
 * Serves light/dark values, $description context and alias/layer chains
 * from the repo's dist/mcp/tokens.json build output.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createTools } from "./tools.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, "../dist/mcp/tokens.json");

function loadTokens() {
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, "utf8"));
  } catch {
    throw new Error(
      `Enriched tokens not found at ${TOKENS_PATH}. Run 'npm run build' in the design-tokens repo first.`
    );
  }
}

const tools = createTools(loadTokens());

const server = new Server(
  { name: "sage-design-tokens", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_token",
      description:
        "Get a Sage design token by name. Returns light+dark value, type, layer, category, the raw alias reference, the resolved alias chain (refChain) and a description.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Token name in kebab-case, e.g. 'button-typical-primary-bg-default'" },
          mode: { type: "string", enum: ["light", "dark"], description: "Optional: reduce value/reference/refChain to one mode" },
        },
        required: ["name"],
      },
    },
    {
      name: "search_tokens",
      description:
        "Search Sage design tokens by keyword. Optionally filter by category and/or by architecture layer (core, global, mode, component).",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query, e.g. 'button primary', 'color brand'" },
          category: { type: "string", description: "Optional category filter, e.g. 'button', 'global'" },
          layer: { type: "string", enum: ["core", "global", "mode", "component"], description: "Optional layer filter" },
          limit: { type: "number", description: "Max results (default 20)" },
        },
        required: ["query"],
      },
    },
    {
      name: "list_categories",
      description: "List all token categories with counts. Use before searching to see what's available.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_tokens_by_category",
      description: "List all tokens within a category, including descriptions.",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", description: "Category name from list_categories" },
          limit: { type: "number", description: "Max tokens (default 50)" },
        },
        required: ["category"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result;
    if (name === "get_token") result = tools.getToken(args);
    else if (name === "search_tokens") result = tools.searchTokens(args);
    else if (name === "list_categories") result = tools.listCategories();
    else if (name === "list_tokens_by_category") result = tools.listTokensByCategory(args);
    else throw new Error(`Unknown tool: ${name}`);

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

#!/usr/bin/env bash
# Verify that a fresh clone of this repo can build the MCP and surface its tokens.
# Safe to re-run on an existing checkout.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ Installing root dependencies..."
npm ci

echo "▶ Building tokens (removing stale artefact first; Figma icon step may fail without FIGMA_ACCESS_TOKEN — that is fine)..."
rm -f dist/mcp/tokens.json
npm run build || true

if [[ ! -f dist/mcp/tokens.json ]]; then
  echo "✗ dist/mcp/tokens.json was not produced — check the build output above."
  exit 1
fi
echo "✓ dist/mcp/tokens.json present ($(wc -c < dist/mcp/tokens.json) bytes)"

echo "▶ Installing MCP server dependencies..."
(cd mcp && npm ci)

echo "▶ Running the hardening suite..."
npx vitest run tests/hardening

echo ""
echo "✓ Fresh clone verified. The MCP is ready to wire into a client."
echo "  Server entry point: $(pwd)/mcp/server.js"

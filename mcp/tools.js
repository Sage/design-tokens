/**
 * Pure token-query logic over an enriched tokens map (dist/mcp/tokens.json shape).
 * No MCP/SDK dependency — unit-testable in isolation.
 */
export function createTools(tokens) {
  const all = Object.values(tokens);
  const categories = [...new Set(all.map((t) => t.category))];

  const reduceMode = (token, mode) => {
    if (!mode) return token;
    if (mode !== "light" && mode !== "dark") {
      throw new Error(`Invalid mode '${mode}'. Expected 'light' or 'dark'.`);
    }
    const pick = (field) =>
      field && typeof field === "object" && ("light" in field || "dark" in field)
        ? field[mode]
        : field;
    return {
      ...token,
      value: pick(token.value),
      reference: pick(token.reference),
      refChain: pick(token.refChain),
    };
  };

  function getToken({ name, mode }) {
    const key = String(name).toLowerCase();
    if (!key) return { found: false, error: `Token '${name}' not found.` };
    if (tokens[key]) return { found: true, token: reduceMode(tokens[key], mode) };
    const match = all.find((t) => t.name.includes(key));
    if (match) return { found: true, token: reduceMode(match, mode), fuzzy: true };
    return { found: false, error: `Token '${name}' not found.` };
  }

  function searchTokens({ query, category, layer, limit = 20 }) {
    const terms = String(query).toLowerCase().split(/[\s-]+/).filter(Boolean);
    const results = all.filter((t) => {
      const name = t.name.replace(/-/g, "");
      const nameMatch = terms.every((term) => name.includes(term));
      const catMatch = !category || t.category === category;
      const layerMatch = !layer || t.layer === layer;
      return nameMatch && catMatch && layerMatch;
    });
    return {
      count: results.length,
      results: results.slice(0, limit).map((t) => ({
        name: t.name,
        value: t.value,
        category: t.category,
        layer: t.layer,
        description: t.description,
      })),
      truncated: limit > 0 && results.length > limit,
    };
  }

  function listCategories() {
    return {
      categories: categories.map((cat) => ({
        name: cat,
        count: all.filter((t) => t.category === cat).length,
      })),
    };
  }

  function listTokensByCategory({ category, limit = 50 }) {
    const matching = all.filter((t) => t.category === category);
    const results = matching.slice(0, limit);
    return {
      category,
      count: matching.length,
      tokens: results.map((t) => ({
        name: t.name,
        value: t.value,
        description: t.description,
      })),
      truncated: matching.length > limit,
    };
  }

  return { getToken, searchTokens, listCategories, listTokensByCategory };
}

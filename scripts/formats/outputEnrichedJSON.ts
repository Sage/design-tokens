import { Dictionary, TransformedToken } from "style-dictionary/types";
import { usesReferences, getReferences } from "style-dictionary/utils";

const layerFromFilePath = (fp = ""): string => {
  if (fp.includes("/components/")) return "component";
  if (fp.includes("/mode/")) return "mode";
  if (fp.includes("/global/")) return "global";
  if (fp.endsWith("/core.json") || fp.endsWith("core.json")) return "core";
  return "unknown";
};

const categoryFromFilePath = (fp = ""): string => {
  const m = fp.match(/\/components\/([^/]+)\.json$/);
  if (m && m[1]) return m[1];
  if (fp.includes("/mode/")) return "mode";
  if (fp.includes("/global/")) return "global";
  return "core";
};

// Folgt der Alias-Kette von einem Token bis zum Literal. Linear (erste Referenz), mit Zyklusschutz.
const buildRefChain = (token: TransformedToken, dictionary: Dictionary): string[] => {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current: TransformedToken | undefined = token;

  while (current) {
    const orig = current["original"]?.$value ?? current["original"]?.value;
    if (typeof orig !== "string" || !usesReferences(orig)) break;

    const refs = getReferences(orig, dictionary.tokens);
    const ref = refs[0];
    if (!ref) break;

    const refPath = ref.path.join(".");
    if (seen.has(refPath)) break;
    seen.add(refPath);
    chain.push(refPath);
    current = ref;
  }

  return chain;
};

/**
 * Custom format: emits an enriched, per-mode JSON map keyed by token name.
 * Carries resolved value, type, layer, category, raw reference, alias chain and description.
 */
export const outputEnrichedJSON = ({
  dictionary,
}: {
  dictionary: Dictionary;
  options?: Record<string, any>;
}) => {
  const out: Record<string, any> = {};

  dictionary.allTokens.forEach((token: TransformedToken) => {
    if (!token.name) return;

    const orig = token["original"]?.$value ?? token["original"]?.value;
    const reference =
      typeof orig === "string" && usesReferences(orig) ? orig : null;

    const entry: Record<string, any> = {
      name: token.name,
      type: token.$type ?? token["type"],
      value: token.$value ?? token["value"],
      layer: layerFromFilePath(token["filePath"]),
      category: categoryFromFilePath(token["filePath"]),
      reference,
      refChain: buildRefChain(token, dictionary),
    };

    if (token.$description) entry["description"] = token.$description;

    out[token.name] = entry;
  });

  return JSON.stringify(out, null, 2);
};

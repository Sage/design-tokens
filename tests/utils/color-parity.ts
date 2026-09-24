import { readFileSync } from "fs";

export type ColorMode = "light" | "dark";
export type JSONTokenMap = Record<string, unknown>;
export type SwiftNamespaces = Map<string, Map<string, string>>;

export const readJSONTokens = (filePath: string): JSONTokenMap => {
  return JSON.parse(readFileSync(filePath, "utf-8")) as JSONTokenMap;
};

const kebabToCamel = (value: string): string => {
  return value.replace(/-([a-z0-9])/g, (_, character: string) => character.toUpperCase());
};

const hexToRgba = (value: string): string => {
  const raw = value.slice(1).toLowerCase();
  const expanded = raw.length === 3 || raw.length === 4
    ? [...raw].map(character => character.repeat(2)).join("")
    : raw;

  return `#${expanded.length === 6 ? `${expanded}ff` : expanded}`;
};

const swiftChannelToHex = (value: string): string => {
  // Swift colors are emitted to three decimal places. Rounding the channel back
  // to an 8-bit value recovers the exact byte from which it was generated.
  return Math.round(Number(value) * 255).toString(16).padStart(2, "0");
};

export const parseSwiftNamespace = (content: string, namespace: string): Map<string, string> => {
  const marker = `public enum ${namespace} {`;
  const start = content.indexOf(marker);

  if (start < 0) {
    return new Map();
  }

  const bodyStart = start + marker.length;
  let depth = 1;
  let end = bodyStart;

  for (; end < content.length && depth > 0; end += 1) {
    if (content[end] === "{") depth += 1;
    if (content[end] === "}") depth -= 1;
  }

  const body = content.slice(bodyStart, end - 1);
  const tokens = new Map<string, string>();
  const declarations = /public static let (\w+) = ([\s\S]*?)(?=\n\s*public static let|\s*$)/g;

  for (const match of body.matchAll(declarations)) {
    const name = match[1];
    const expression = match[2];
    if (name && expression) tokens.set(name, expression.trim());
  }

  return tokens;
};

export const resolveJSONColors = (
  value: unknown,
  registry: JSONTokenMap,
  seen = new Set<string>(),
): string[] => {
  const expression = typeof value === "string" ? value : JSON.stringify(value);
  const colors: string[] = [];
  const colorOrReference = /#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b|\btransparent\b|var\(--([^)]+)\)/gi;

  for (const match of expression.matchAll(colorOrReference)) {
    if (match[0].startsWith("#")) {
      colors.push(hexToRgba(match[0]));
      continue;
    }

    if (match[0].toLowerCase() === "transparent") {
      colors.push("#00000000");
      continue;
    }

    const referenceName = match[1] ? kebabToCamel(match[1]) : undefined;
    if (!referenceName || registry[referenceName] === undefined) continue;
    if (seen.has(referenceName)) throw new Error(`Circular JSON token reference: ${referenceName}`);

    colors.push(...resolveJSONColors(
      registry[referenceName],
      registry,
      new Set([...seen, referenceName]),
    ));
  }

  return colors;
};

export const resolveSwiftColors = (
  expression: string,
  namespaces: SwiftNamespaces,
  mode: ColorMode,
  seen = new Set<string>(),
): string[] => {
  const adaptiveColor = /UIColor \{ traits in\s*traits\.userInterfaceStyle == \.dark \? (SageTokensDark\.\w+) : (SageTokensLight\.\w+)\s*\}/g;
  const modeExpression = expression.replace(
    adaptiveColor,
    (_, dark: string, light: string) => mode === "dark" ? dark : light,
  );
  const colors: string[] = [];
  const colorOrReference = /UIColor\(red: ([\d.]+), green: ([\d.]+), blue: ([\d.]+), alpha: ([\d.]+)\)|(UIColor\.clear)|(SageTokens\w+)\.(\w+)/g;

  for (const match of modeExpression.matchAll(colorOrReference)) {
    if (match[1] && match[2] && match[3] && match[4]) {
      colors.push(`#${swiftChannelToHex(match[1])}${swiftChannelToHex(match[2])}${swiftChannelToHex(match[3])}${swiftChannelToHex(match[4])}`);
      continue;
    }

    if (match[5]) {
      colors.push("#00000000");
      continue;
    }

    const namespace = match[6];
    const tokenName = match[7];
    if (!namespace || !tokenName) continue;

    const referenceId = `${namespace}.${tokenName}`;
    if (seen.has(referenceId)) throw new Error(`Circular Swift token reference: ${referenceId}`);

    const referencedExpression = namespaces.get(namespace)?.get(tokenName);
    if (referencedExpression) {
      colors.push(...resolveSwiftColors(
        referencedExpression,
        namespaces,
        mode,
        new Set([...seen, referenceId]),
      ));
    }
  }

  return colors;
};

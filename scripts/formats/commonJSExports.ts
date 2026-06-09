import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";

/**
 * Custom format to output ensure commonJS variables output in the same format as ESM
 * This only runs on non-component files as components are handled in commonJSWithRefs
 * @param dictionary The style dictionary object containing all tokens
 * @returns The processed commonJS variables in the same format as the ES6 output
 */
export const formatCommonJSExports = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
  const { outputReferences = false } = options;

  const tokens = dictionary.allTokens
    .map((token: DesignToken) => {
      const shouldOutputRef = typeof outputReferences === "function" ? outputReferences(token) : outputReferences;

      if (shouldOutputRef) {
        const originalValue = token["original"]?.value ?? token["original"]?.$value;
        return `module.exports.${token.name} = "${outputRefForToken(originalValue, token)}";`;
      }

      const value = token.$value ?? token.value;
      const serialized = typeof value === "object" ? JSON.stringify(value) : `"${value}"`;
      return `module.exports.${token.name} = ${serialized};`;
    })
    .join('\n');

  return tokens + '\n';
}

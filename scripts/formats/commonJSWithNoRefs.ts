import { Dictionary, DesignToken } from "style-dictionary/types";
import { sortAlphabetically } from "../utils/sortTokens.js";

/**
 * Custom format handler for CommonJS export output without CSS variable references.
 * 
 * This format is used for global and mode files (light.js, dark.js, global.js).
 * It generates individual `module.exports.tokenName = "value";` statements with
 * direct token values, matching the ES6 output format for consistency across
 * module systems (CommonJS for Node.js compatibility).
 * 
 * Exports are alphabetically sorted to ensure consistent, predictable order.
 * 
 * @param dictionary The style dictionary object containing all tokens
 * @returns CommonJS module string with alphabetically sorted export statements
 */
export const outputCommonJSWithNoRefs = ({dictionary}: {dictionary: Dictionary}) => {
  // Build array of token exports with their names and formatted export statements
  const tokenExports = dictionary.allTokens
    .filter((token: DesignToken) => token.name)
    .map((token: DesignToken) => {
      const value = token.$value || token.value;
      return {
        name: token.name,
        export: `module.exports.${token.name} = "${value}";`
      };
    });

  // Sort exports alphabetically by token name using shared sortAlphabetically utility
  const sortedExports = tokenExports.sort((a, b) => {
    const aName = a.name ?? '';
    const bName = b.name ?? '';
    return sortAlphabetically(aName, bName);
  });

  // Extract export statements and join with newlines
  const exports = sortedExports.map(item => item.export).join('\n');
  return exports + '\n';
}


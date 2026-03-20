import { Dictionary, DesignToken } from "style-dictionary/types";
import { sortAlphabetically } from "../utils/sortTokens.js";

/**
 * Custom format handler for ES6 export statement output without CSS variable references.
 * 
 * This format is used for global and mode files (light.js, dark.js, global.js).
 * It generates individual `export const tokenName = "value";` statements with
 * direct token values (no CSS variable references).
 * 
 * Exports are alphabetically sorted to ensure consistent, predictable order
 * that aligns with other format handlers.
 * 
 * @param dictionary The style dictionary object containing all tokens
 * @returns ES6 module string with alphabetically sorted export statements
 */
export const outputES6 = ({dictionary}: {dictionary: Dictionary}) => {
    // Build array of token exports with their names and formatted export statements
    const tokenExports = dictionary.allTokens
      .filter((token: DesignToken) => token.name)
      .map((token: DesignToken) => {
        const value = token.value || token.$value;
        return {
          name: token.name,
          export: `export const ${token.name} = "${value}";`
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

import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";
import { sortAlphabetically } from "../utils/sortTokens.js";

/**
 * Custom format handler for CommonJS export output with CSS variable references.
 * 
 * This format is used for component token files in dist/js/common/components/.
 * It generates individual `module.exports.tokenName = "value";` statements with
 * CSS variable references (e.g., var(--mode-color-*)) to support white-labeling,
 * matching the ES6 output format for consistency across module systems.
 * 
 * Exports are alphabetically sorted to ensure consistent, predictable order.
 * 
 * @param dictionary The style dictionary object containing all tokens
 * @param options Optional parameters for the output format
 * @returns CommonJS module string with alphabetically sorted export statements
 */
export const outputCommonJSWithRefs = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
    const { outputReferences = true } = options;

    // Build array of token exports with their names and formatted export statements
    const tokenExports = dictionary.allTokens
      .filter((token: DesignToken) => outputReferences && token.name)
      .map((token: DesignToken) => {
        const originalValue = token["original"]?.value || token["original"]?.$value;
        // Convert token value to CSS variable reference where applicable
        const exportValue = outputRefForToken(originalValue, token);
        return {
          name: token.name,
          export: `module.exports.${token.name} = "${exportValue}";`
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

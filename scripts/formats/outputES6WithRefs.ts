import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";
import { sortAlphabetically } from "../utils/sortTokens.js";

/**
 * Custom format handler for ES6 export statement output with CSS variable references.
 * 
 * This format is used for component token files in dist/js/es6/components/.
 * It generates individual `export const tokenName = "value";` statements with
 * CSS variable references (e.g., var(--mode-color-*)) to support white-labeling.
 * 
 * Exports are alphabetically sorted to ensure consistent, predictable order that
 * aligns with other format handlers (JSON, CommonJS, CSS, SCSS).
 * 
 * @param dictionary The style dictionary object containing all tokens
 * @param options Optional parameters for the output format
 * @returns ES6 module string with alphabetically sorted export statements
 */
export const outputES6WithRefs = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
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
          export: `export const ${token.name} = "${exportValue}";`
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


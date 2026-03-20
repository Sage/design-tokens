import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";
import { sortAlphabetically } from "../utils/sortTokens.js";

/**
 * Custom format handler for JSON output with CSS variable references.
 * 
 * This format is used for component token files in dist/json/components/.
 * It outputs tokens as JSON with CSS variable references (e.g., var(--mode-color-*))
 * to support white-labeling and dynamic theming.
 * 
 * The output is alphabetically sorted by token name to ensure consistent,
 * predictable token files that are easy to review and diff.
 * 
 * @param dictionary The style dictionary object containing all tokens
 * @param options Optional parameters for the output format
 * @returns JSON string with alphabetically sorted tokens and CSS variable references
 */
export const outputJSONWithRefs = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
    const { outputReferences = true } = options;
    
    // Build token object from all tokens in the dictionary
    const tokenObject = dictionary.allTokens.reduce((acc: Record<string, any>, token: DesignToken) => {
      const originalValue = token["original"].value || token["original"].$value;

      if (outputReferences && token.name) {
        // Convert token value to CSS variable reference where applicable
        acc[token.name] = outputRefForToken(originalValue, token);
      }

      return acc;
    }, {});
    
    // Sort keys alphabetically using shared sortAlphabetically utility for consistency
    // across all formats (JSON, ES6, CommonJS, CSS, SCSS)
    const sortedKeys = Object.keys(tokenObject).sort(sortAlphabetically);
    const sortedObject: Record<string, any> = {};
    
    // Rebuild object with sorted keys to preserve key order in output
    for (const key of sortedKeys) {
      sortedObject[key] = tokenObject[key];
    }
    
    return JSON.stringify(sortedObject, null, 2);
  }
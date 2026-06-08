import { Dictionary, DesignToken } from "style-dictionary/types";
import { sortAlphabetically } from "../utils/sortTokens.js";

/**
 * Custom format handler for JSON output without CSS variable references.
 * 
 * This format is used for global and mode files (light.json, dark.json, global.json).
 * It outputs token values directly without CSS variable references.
 * Tokens are alphabetically sorted to ensure consistent output.
 * 
 * @param dictionary The style dictionary object containing all tokens
 * @returns JSON string with alphabetically sorted token values
 */
export const outputJSONWithNoRefs = ({dictionary}: {dictionary: Dictionary}) => {
    // Build token object from all tokens in the dictionary
    const tokenObject = dictionary.allTokens.reduce((acc: Record<string, any>, token: DesignToken) => {
      const value = token.value || token.$value;

      if (token.name) {
        acc[token.name] = value;
      }

      return acc;
    }, {});
    
    // Sort keys alphabetically using shared sortAlphabetically utility
    const sortedKeys = Object.keys(tokenObject).sort(sortAlphabetically);
    const sortedObject: Record<string, any> = {};
    
    // Rebuild object with sorted keys to preserve key order in output
    for (const key of sortedKeys) {
      sortedObject[key] = tokenObject[key];
    }
    
    return JSON.stringify(sortedObject, null, 2);
  }

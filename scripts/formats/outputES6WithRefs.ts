import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";

/**
 * Custom format to ensure ES6 variables output with CSS variable references to support white-labelling
 * @param dictionary The style dictionary object containing all tokens
 * @param options Optional parameters for the output format
 * @returns The processed ES6 variables with CSS variable references for values
 */
export const outputES6WithRefs = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
    const { outputReferences = true } = options;

    const tokens = dictionary.allTokens
      .map((token: DesignToken) => {
        const originalValue = token["original"]?.value || token["original"]?.$value;
        
        if (outputReferences && token.name) {
          return `export const ${token.name} = "${outputRefForToken(originalValue, token)}";`;
        }

        return "";
      })
      .join('\n');

    return tokens + '\n';
  }

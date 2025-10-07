import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";

/**
 * Custom format to ensure JSON outputs with CSS variable references where applicable
 * @param dictionary The style dictionary object containing all tokens
 * @param options Optional parameters for the output format
 * @returns The processed JSON string with CSS variable references for values
 */
export const outputJSONWithRefs = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
    const { outputReferences = true } = options;
    
    return JSON.stringify(
      dictionary.allTokens.reduce((acc: Record<string, any>, token: DesignToken) => {
        const originalValue = token["original"].value || token["original"].$value;

        if (outputReferences && token.name) {
          acc[token.name] = outputRefForToken(originalValue, token);
        }

        return acc;
      }, {}),
      null,
      2
    );
  }
import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";

/**
 * Custom format to output ensure commonJS variables output in the same format as ESM with CSS variable references to support white-labelling
 * @param dictionary The style dictionary object containing all tokens
 * @param options Optional parameters for the output format
 * @returns The processed commonJS variables with CSS variable references for values
 */
export const outputCommonJSWithRefs = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
    const { outputReferences = true } = options;

    const tokens = dictionary.allTokens
      .map((token: DesignToken) => {
        const originalValue = token["original"]?.value || token["original"]?.$value;

        if (outputReferences && token.name) {
          return `module.exports.${token.name} = "${outputRefForToken(originalValue, token)}";`;
        }

        return "";
      })
      .join('\n');

    return tokens + '\n';
  }

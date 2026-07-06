import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken, resolveTypographyObject } from "./outputRefForToken.js";

const formatNonRefValue = (token: DesignToken): unknown => {
  const value = token.$value ?? token.value;

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const original = token["original"]?.$value ?? token["original"]?.value;
    if (original && typeof original === "object") {
      return resolveTypographyObject(
        original as Record<string, unknown>,
        value as Record<string, unknown>
      );
    }
    return value;
  }

  return String(value);
};

/**
 * Custom format to ensure JSON outputs with CSS variable references where applicable
 * @param dictionary The style dictionary object containing all tokens
 * @param options Optional parameters for the output format
 * @returns The processed JSON string with CSS variable references for values
 */
export const outputJSONWithRefs = ({dictionary, options = {}}: {dictionary: Dictionary, options?: Record<string, any>}) => {
    const { outputReferences = true } = options;

    const shouldOutputRef = (token: DesignToken): boolean => {
      if (typeof outputReferences === "function") {
        return outputReferences(token);
      }

      return Boolean(outputReferences);
    };
    
    return JSON.stringify(
      dictionary.allTokens.reduce((acc: Record<string, any>, token: DesignToken) => {
        const originalValue = token["original"].value ?? token["original"].$value;

        if (token.name) {
          acc[token.name] = shouldOutputRef(token)
            ? outputRefForToken(originalValue, token)
            : formatNonRefValue(token);
        }

        return acc;
      }, {}),
      null,
      2
    );
  }
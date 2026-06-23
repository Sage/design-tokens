import { Dictionary, DesignToken } from "style-dictionary/types";
import { outputRefForToken } from "./outputRefForToken.js";

const formatTypographyValue = (value: Record<string, unknown>): string => {
  const fontSize = typeof value["fontSize"] === "string" ? value["fontSize"] : "";
  const fontFamily = typeof value["fontFamily"] === "string" ? value["fontFamily"] : "";
  const fontWeight = typeof value["fontWeight"] === "string" ? value["fontWeight"] : "";
  const lineHeight = typeof value["lineHeight"] === "string" ? value["lineHeight"] : "";

  const sizeSegment = lineHeight ? `${fontSize}/${lineHeight}` : fontSize;
  const weighted = fontWeight ? `${fontWeight} ${sizeSegment}` : sizeSegment;

  return `${weighted} ${fontFamily}`.trim();
};

const formatNonRefValue = (value: unknown): string => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const objectValue = value as Record<string, unknown>;

    if (typeof objectValue["fontSize"] === "string" && typeof objectValue["fontFamily"] === "string") {
      return formatTypographyValue(objectValue);
    }

    return JSON.stringify(objectValue);
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
            : formatNonRefValue(token.$value || token.value);
        }

        return acc;
      }, {}),
      null,
      2
    );
  }
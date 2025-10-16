import { DesignToken } from "style-dictionary/types";
import { usesReferences } from 'style-dictionary/utils';

/**
 * Helper: Converts a reference path to proper kebab-case for CSS variable names
 * @param refPath The reference path (e.g., "mode.color.action.mainWithDefault")
 * @returns The kebab-case CSS variable name
 */
const convertToKebabCase = (refPath: string): string => {
  return refPath
    .split('.')
    .map(segment => {
      // Convert camelCase segments to kebab-case
      return segment
        .replace(/([a-z\d])([A-Z])/g, '$1-$2') // Handle lowercase/digit + uppercase
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Handle consecutive capitals
        .toLowerCase();
    })
    .join('-');
};

/**
 * Helper: Outputs a token value, replacing references with CSS variable references
 * @param originalValue The original value of the token, which may include references
 * @param token The design token object
 * @returns The processed value with CSS variable references where applicable
 */
export const outputRefForToken = (originalValue: string, token: DesignToken): string => {
  if (usesReferences(originalValue)) {
    if (originalValue.startsWith("linear-gradient(")) {
      const linearCSSValue = originalValue.replace(
        /\{([^}]+)\}/g,
        (_, refPath) => `var(--${convertToKebabCase(refPath)})`
      );

      return linearCSSValue;
    } else {
      const refPath = originalValue.slice(1, -1);
      const cssVarName = 'var(--' + convertToKebabCase(refPath) + ')';
      return cssVarName;
    }
  } else {
    return String(token.$value || token.value);
  }
};

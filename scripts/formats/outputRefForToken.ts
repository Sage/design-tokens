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
 * Helper: Check if a value contains mathematical operations
 */
const containsOperation = (value: string): boolean => {
  // Don't wrap if it's already wrapped in calc()
  if (value.trim().startsWith('calc(')) {
    return false;
  }

  // Only wrap if there are operators with spaces around them or at the end
  // This catches: "/ 2", " * 1.5", " + 10px", " - 5px"
  return /\s[\+\-\*\/]\s|\s[\+\-\*\/]$|[\+\-\*\/]\s/.test(value);
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
      // need to ensure camelCase references are converted to kebab-case for CSS variable usage
      // also needed to ensure other complex formats are handled properly
      // e.g. withDefault becomes with-default
      // e.g. {container.size.fluid.items.m} / 2 becomes var(--container-size-fluid-items-m) / 2
      const processedValue = originalValue.replace(
        /\{([^}]+)\}/g,
        (_, refPath) => `var(--${convertToKebabCase(refPath)})`
      );

      // Check if the processed value contains operations and wrap in calc()
      // e.g. {container.size.fluid.items.m} / 2 becomes calc(var(--container-size-fluid-items-m) / 2)
      if (containsOperation(processedValue)) {
        return `calc(${processedValue})`;
      }

      return processedValue;
    }
  } else {
    return String(token.$value || token.value);
  }
};

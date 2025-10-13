import { DesignToken } from "style-dictionary/types";
import { usesReferences } from 'style-dictionary/utils';

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
      (_, refPath) => `var(--${refPath.replace(/\./g, '-')})`
    );

    return linearCSSValue;
  } else {
    const refPath = originalValue.slice(1, -1);
      const cssVarName = 'var(--' + refPath.replace(/\./g, '-') + ')';
      return cssVarName;
    }
  } else {
    return String(token.$value || token.value);
  }

  return "";
}
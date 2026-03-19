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
 * Helper: Replace {references} with var(--kebab-case) in a string value
 */
const processReferences = (value: string): string => {
  if (typeof value !== 'string') return String(value);
  if (usesReferences(value)) {
    return value.replace(
      /\{([^}]+)\}/g,
      (_, refPath) => `var(--${convertToKebabCase(refPath)})`
    );
  }
  return value;
};

/**
 * Helper: Add px unit to plain numeric strings
 */
const addPx = (value: string): string => {
  if (usesReferences(value)) {
    return processReferences(value);
  }

  if (Number(value) !== 0 && /^-?\d+(\.\d+)?$/.test(value)) {
    return `${value}px`;
  }

  return value;
};

type BoxShadowTokenValue = Array<{
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  type: string;
}>;

/**
 * Helper: Convert a boxShadow array to a CSS box-shadow string
 */
const processBoxShadow = (
  shadows: BoxShadowTokenValue

): string => {
  return shadows.map(({offsetX, offsetY, blur, spread, color, type}) => {
    const prefix = type === 'innerShadow' ? 'inset ' : '';
    const x = addPx(offsetX);
    const y = addPx(offsetY);
    const blurValue = addPx(blur);
    const spreadValue = addPx(spread);
    const colorValue = processReferences(color);

    return `${prefix}${x} ${y} ${blurValue} ${spreadValue} ${colorValue}`;
  }).join(', ');
};

type TypographyTokenValue = {
  fontFamily: string;
  fontWeight: string;
  lineHeight: string;
  fontSize: string;
};

/**
 * Helper: Convert a typography object to a CSS font shorthand string
 */
const processTypography = (
  typography: TypographyTokenValue
): string => {
  const fontWeight = processReferences(typography.fontWeight);
  const fontSize = processReferences(typography.fontSize);
  const lineHeight = processReferences(typography.lineHeight);
  const fontFamily = processReferences(typography.fontFamily);
  
  return `${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`;
};

/**
 * Helper: Outputs a token value, replacing references with CSS variable references
 * @param originalValue The original value of the token, which may include references
 * @param token The design token object
 * @returns The processed value with CSS variable references where applicable
 */
export const outputRefForToken = (originalValue: string | TypographyTokenValue | BoxShadowTokenValue, token: DesignToken): string => {
  // Handle boxShadow arrays
  if (Array.isArray(originalValue)) {
    return processBoxShadow(originalValue);
  }

  // Handle typography objects
  if (typeof originalValue === 'object') {
    return processTypography(originalValue);
  }

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

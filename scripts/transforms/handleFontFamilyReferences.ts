import { convertToKebabCase } from "../utils/convert-to-kebab-case.js";
import type { DesignToken } from "style-dictionary/types";

const buildTypographyShorthand = (
  token: DesignToken,
  formatRef: (kebab: string) => string
): string => {
  const original = (token["original"]?.$value ?? token["original"]?.value) ?? {};
  const resolved = (token.$value ?? token.value) ?? {};

  const rawFamily = original.fontFamily as string | undefined;
  const family = rawFamily && /\{global\./.test(rawFamily)
    ? rawFamily.replace(/\{([^}]+)\}/g, (_m, p) => formatRef(convertToKebabCase(p)))
    : resolved.fontFamily;

  const sizePart = resolved.lineHeight ? `${resolved.fontSize}/${resolved.lineHeight}` : resolved.fontSize;
  const weighted = resolved.fontWeight ? `${resolved.fontWeight} ${sizePart}` : sizePart;
  return `${weighted} ${family}`.trim();
};

export const handleFontFamiliesReferencesCSS = (token: DesignToken): string =>
  buildTypographyShorthand(token, (kebab) => `var(--${kebab})`);

export const handleFontFamiliesReferencesScss = (token: DesignToken): string =>
  buildTypographyShorthand(token, (kebab) => `$${kebab}`);

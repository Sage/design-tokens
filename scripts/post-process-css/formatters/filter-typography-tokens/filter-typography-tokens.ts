import { ContextTokens } from "../../context-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";
import { Decorator } from "../decorator";

/**
 * TODOs:
 * - For the assumption that there's always a mirror adaptive/responsive token,
 *  throw an error when this isn't the case for both global & component tokens
 */
export class FilterTypographyTokens extends Decorator {
  private readonly globalResponsiveRegex =
    /^--global-typography-responsive-.*$/;
  private readonly globalAdaptiveRegex = /^--global-typography-adaptive-.*$/;

  /**
   * Whilst typography tokens are currently specified in Figma, it is the responsive typography tokens that
   * are intended for use. Adaptive typography tokens are only present due to Figma not currently allowing
   * the clamp function. By stripping out this tokens, it would save ~10% of the total line count from the
   * CSS output.
   *
   * NOTE: For "frozenproduct" context tokens we do the opposite and remove responsive tokens to maintain
   * backward compatibility purposes. For other contexts we remove adaptive tokens to be future facing.
   * @param tokens Tokens to format.
   * @returns Formatted tokens.
   */
  public override formatTokens(tokens: ContextTokens) {
    this.filterTokens(tokens);
    this.formatTokenNames(tokens);

    return super.formatTokens(tokens);
  }

  private filterTokens(tokens: ContextTokens) {
    const removeTokensRegex =
      tokens.context === "frozenproduct"
        ? this.globalResponsiveRegex
        : this.globalAdaptiveRegex;

    tokens.screenSizes.forEach((screenSize) => {
      const filteredGlobalTokens = screenSize.global
        .map((token) => token.name)
        .filter((token) => removeTokensRegex.test(token));

      screenSize.global = screenSize.global.filter(
        (token) => !filteredGlobalTokens.includes(token.name)
      );

      filteredGlobalTokens.forEach((token) => {
        screenSize.components = Object.keys(screenSize.components).reduce<
          Record<string, CssProperty[]>
        >((components, component) => {
          if (!screenSize.components[component]) {
            return {};
          }

          components[component] = screenSize.components[component].filter(
            (componentToken) => componentToken.value !== `var(${token})`
          );

          return components;
        }, {});
      });
    });
  }

  private formatTokenNames(tokens: ContextTokens) {
    const keepTokensRegex =
      tokens.context === "frozenproduct"
        ? this.globalAdaptiveRegex
        : this.globalResponsiveRegex;

    tokens.screenSizes.forEach((screenSize) => {
      const globalTypographyTokensToKeep = screenSize.global
        .map((token) => token.name)
        .filter((token) => keepTokensRegex.test(token));

      screenSize.global = screenSize.global.map((token) =>
        globalTypographyTokensToKeep.includes(token.name)
          ? this.removeTypographyType(token)
          : token
      );

      globalTypographyTokensToKeep.forEach((globalToken) => {
        screenSize.components = Object.keys(screenSize.components).reduce<
          Record<string, CssProperty[]>
        >((components, component) => {
          if (!screenSize.components[component]) {
            return {};
          }

          components[component] = screenSize.components[component].map(
            (token) =>
              token.value === `var(${globalToken})`
                ? this.removeTypographyType(token)
                : token
          );

          return components;
        }, {});
      });
    });
  }

  private removeTypographyType(token: CssProperty) {
    token.name = token.name.replace(/(-adaptive-|-responsive-)/, "-");
    token.value = token.value.replace(/(-adaptive-|-responsive-)/, "-");
    return token;
  }
}

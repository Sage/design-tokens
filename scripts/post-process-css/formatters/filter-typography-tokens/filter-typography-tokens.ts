import { ContextTokens } from "../../context-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";
import { Decorator } from "../decorator";

export class FilterTypographyTokens extends Decorator {
  private readonly globalResponsiveRegex =
    /^--global-typography-responsive-.*$/;
  private readonly globalAdaptiveRegex = /^--global-typography-adaptive-.*$/;

  /**
   * Whilst typography tokens are currently specified in Figma, it is the responsive typography tokens that
   * are intended for use. Adaptive typography tokens are only present due to Figma not currently allowing
   * the clamp function. By stripping out this tokens, it would save ~6% of the total line count from the
   * CSS output.
   *
   * NOTE: For "frozenproduct" context tokens we do the opposite and remove responsive tokens to maintain
   * backward compatibility purposes. For other contexts we remove adaptive tokens to be future facing.
   * @param tokens Tokens to format.
   * @returns Formatted tokens.
   */
  public override formatTokens(tokens: ContextTokens) {
    this.sanityCheckTokens(tokens);
    this.filterTokens(tokens);
    this.formatTokenNames(tokens);

    return super.formatTokens(tokens);
  }

  private filterTokens(tokens: ContextTokens) {
    const removeGlobalTokensRegex =
      tokens.context === "frozenproduct"
        ? this.globalResponsiveRegex
        : this.globalAdaptiveRegex;

    tokens.screenSizes.forEach((screenSize) => {
      const filteredGlobalTokens = screenSize.global
        .map((token) => token.name)
        .filter((token) => removeGlobalTokensRegex.test(token));

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
    const keepGlobalTokensRegex =
      tokens.context === "frozenproduct"
        ? this.globalAdaptiveRegex
        : this.globalResponsiveRegex;

    tokens.screenSizes.forEach((screenSize) => {
      const globalTypographyTokensToKeep = screenSize.global
        .map((token) => token.name)
        .filter((token) => keepGlobalTokensRegex.test(token));

      screenSize.global = screenSize.global.map((token) =>
        globalTypographyTokensToKeep.includes(token.name)
          ? this.formatTokenName(token)
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
                ? this.formatTokenName(token)
                : token
          );

          return components;
        }, {});
      });
    });
  }

  private formatTokenName(token: CssProperty) {
    token.name = this.removeTypographyType(token.name);
    token.value = this.removeTypographyType(token.value);
    return token;
  }

  private removeTypographyType(value: string) {
    return value.replace(/(-adaptive-|-responsive-)/, "-");
  }

  /**
   * Given that this formatter deletes and renames tokens, this checks assumptions made about the typography tokens. Specifically:
   * - Each typography token (global & component) should have a mirror adaptive/responsive token
   * - The value of the adaptive and responsive tokens should match (excluding the typography type)
   */
  private sanityCheckTokens(tokens: ContextTokens) {
    // Each typography token should have a mirror adaptive/responsive token
    tokens.screenSizes.forEach((screenSize) => {
      const responsiveGlobalTypographyTokens = screenSize.global
        .map((token) => token.name)
        .filter((token) => this.globalResponsiveRegex.test(token));
      const adaptiveGlobalTypographyTokens = screenSize.global
        .map((token) => token.name)
        .filter((token) => this.globalAdaptiveRegex.test(token));

      responsiveGlobalTypographyTokens.forEach((token) => {
        if (
          !adaptiveGlobalTypographyTokens
            .map((x) => this.removeTypographyType(x))
            .includes(this.removeTypographyType(token))
        ) {
          throw new Error(
            `Missing adaptive global typography token for responsive token: ${token} on min breakpoint: ${screenSize.minBreakpoint}, context: ${tokens.context}`
          );
        }
      });

      adaptiveGlobalTypographyTokens.forEach((token) => {
        if (
          !responsiveGlobalTypographyTokens
            .map((x) => this.removeTypographyType(x))
            .includes(this.removeTypographyType(token))
        ) {
          throw new Error(
            `Missing responsive global typography token for adaptive token: ${token} on min breakpoint: ${screenSize.minBreakpoint}, context: ${tokens.context}`
          );
        }
      });

      const responsiveGlobalTypographyTokensAsVar =
        responsiveGlobalTypographyTokens.map((x) => `var(${x})`);
      const adaptiveGlobalTypographyTokensAsVar =
        adaptiveGlobalTypographyTokens.map((x) => `var(${x})`);
      Object.keys(screenSize.components).forEach((component) => {
        const componentProps = screenSize.components[component];

        if (!componentProps) return;

        const componentResponsiveTypographyTokens = componentProps.filter(
          (token) => responsiveGlobalTypographyTokensAsVar.includes(token.value)
        );
        const componentAdaptiveTypographyTokens = componentProps.filter(
          (token) => adaptiveGlobalTypographyTokensAsVar.includes(token.value)
        );

        componentResponsiveTypographyTokens.forEach((token) => {
          const foundToken = componentAdaptiveTypographyTokens.find(
            (x) =>
              this.removeTypographyType(x.name) ===
              this.removeTypographyType(token.name)
          );

          if (!foundToken) {
            throw new Error(
              `Missing adaptive ${component} token for responsive token: ${token.name} on min breakpoint: ${screenSize.minBreakpoint}, context: ${tokens.context}`
            );
          }

          if (
            this.removeTypographyType(foundToken.value) !==
            this.removeTypographyType(token.value)
          ) {
            throw new Error(
              `Value mismatch on ${component} component for tokens ${token.name} and ${foundToken.name} on min breakpoint: ${screenSize.minBreakpoint}, context: ${tokens.context}`
            );
          }
        });

        componentAdaptiveTypographyTokens.forEach((token) => {
          const foundToken = componentResponsiveTypographyTokens.find(
            (x) =>
              this.removeTypographyType(x.name) ===
              this.removeTypographyType(token.name)
          );

          if (!foundToken) {
            throw new Error(
              `Missing responsive ${component} token for adaptive token: ${token.name} on min breakpoint: ${screenSize.minBreakpoint}, context: ${tokens.context}`
            );
          }

          if (
            this.removeTypographyType(foundToken.value) !==
            this.removeTypographyType(token.value)
          ) {
            throw new Error(
              `Value mismatch on ${component} component for tokens ${token.name} and ${foundToken.name} on min breakpoint: ${screenSize.minBreakpoint}, context: ${tokens.context}`
            );
          }
        });
      });
    });
  }
}

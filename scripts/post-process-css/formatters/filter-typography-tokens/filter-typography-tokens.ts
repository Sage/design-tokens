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
    this.removeTokens(tokens);
    this.formatTokenNames(tokens);

    return super.formatTokens(tokens);
  }

  private removeTokens(tokens: ContextTokens) {
    const removeGlobalTokensRegex =
      tokens.context === "frozenproduct"
        ? this.globalResponsiveRegex
        : this.globalAdaptiveRegex;

    tokens.screenSizes.forEach((screenSize) => {
      const filteredGlobalTokens = this.filterTokens(
        screenSize.global,
        removeGlobalTokensRegex
      );

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
            (componentToken) => componentToken.value !== this.toVar(token)
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
      const globalTypographyTokensToKeep = this.filterTokens(
        screenSize.global,
        keepGlobalTokensRegex
      );

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

  private filterTokens(tokens: CssProperty[], regex: RegExp): string[] {
    return tokens
      .map((token) => token.name)
      .filter((token) => regex.test(token));
  }

  private mapToVar(tokens: string[]): string[] {
    return tokens.map((x) => this.toVar(x));
  }

  private toVar(value: string): string {
    return `var(${value})`;
  }

  /**
   * Given that this formatter deletes and renames tokens, this checks assumptions made about the typography tokens. Specifically:
   * - Each typography token (global & component) should have a mirror adaptive/responsive token
   * - The value of the adaptive and responsive tokens should match (excluding the typography type)
   */
  private sanityCheckTokens(tokens: ContextTokens) {
    // Each typography token should have a mirror adaptive/responsive token
    tokens.screenSizes.forEach((screenSize) => {
      const responsiveGlobalTypographyTokens = this.filterTokens(
        screenSize.global,
        this.globalResponsiveRegex
      );
      const adaptiveGlobalTypographyTokens = this.filterTokens(
        screenSize.global,
        this.globalAdaptiveRegex
      );

      this.checkMissingTokens(
        responsiveGlobalTypographyTokens,
        adaptiveGlobalTypographyTokens,
        "adaptive",
        screenSize.minBreakpoint,
        tokens.context
      );

      this.checkMissingTokens(
        adaptiveGlobalTypographyTokens,
        responsiveGlobalTypographyTokens,
        "responsive",
        screenSize.minBreakpoint,
        tokens.context
      );

      const responsiveGlobalTypographyTokensAsVar = this.mapToVar(
        responsiveGlobalTypographyTokens
      );
      const adaptiveGlobalTypographyTokensAsVar = this.mapToVar(
        adaptiveGlobalTypographyTokens
      );

      Object.keys(screenSize.components).forEach((component) => {
        const componentProps = screenSize.components[component];
        if (!componentProps) return;

        const componentResponsiveTypographyTokens = this.filterComponentTokens(
          componentProps,
          responsiveGlobalTypographyTokensAsVar
        );
        const componentAdaptiveTypographyTokens = this.filterComponentTokens(
          componentProps,
          adaptiveGlobalTypographyTokensAsVar
        );

        this.checkComponentTokens(
          componentResponsiveTypographyTokens,
          componentAdaptiveTypographyTokens,
          component,
          screenSize.minBreakpoint,
          tokens.context
        );

        this.checkComponentTokens(
          componentAdaptiveTypographyTokens,
          componentResponsiveTypographyTokens,
          component,
          screenSize.minBreakpoint,
          tokens.context
        );
      });
    });
  }

  private filterComponentTokens(
    componentProps: CssProperty[],
    globalTokensAsVar: string[]
  ): CssProperty[] {
    return componentProps.filter((token) =>
      globalTokensAsVar.includes(token.value)
    );
  }

  private checkMissingTokens(
    sourceTokens: string[],
    targetTokens: string[],
    targetType: string,
    minBreakpoint: number,
    context: string
  ) {
    sourceTokens.forEach((token) => {
      if (
        !targetTokens
          .map((x) => this.removeTypographyType(x))
          .includes(this.removeTypographyType(token))
      ) {
        throw new Error(
          `Missing ${targetType} global typography token for ${
            targetType === "adaptive" ? "responsive" : "adaptive"
          } token: ${token} on min breakpoint: ${minBreakpoint}, context: ${context}`
        );
      }
    });
  }

  private checkComponentTokens(
    sourceTokens: CssProperty[],
    targetTokens: CssProperty[],
    component: string,
    minBreakpoint: number,
    context: string
  ) {
    sourceTokens.forEach((token) => {
      const foundToken = targetTokens.find(
        (x) =>
          this.removeTypographyType(x.name) ===
          this.removeTypographyType(token.name)
      );

      if (!foundToken) {
        throw new Error(
          `Missing ${component} token for ${token.name} on min breakpoint: ${minBreakpoint}, context: ${context}`
        );
      }

      if (
        this.removeTypographyType(foundToken.value) !==
        this.removeTypographyType(token.value)
      ) {
        throw new Error(
          `Value mismatch on ${component} component for tokens ${token.name} and ${foundToken.name} on min breakpoint: ${minBreakpoint}, context: ${context}`
        );
      }
    });
  }
}

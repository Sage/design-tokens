import { ContextTokens } from "../../context-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";
import { Decorator } from "../decorator";

export class FilterTypographyTokens extends Decorator {
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
    const regex =
      tokens.context === "frozenproduct"
        ? /^--global-typography-responsive-.*$/
        : /^--global-typography-adaptive-.*$/;

    tokens.screenSizes.forEach((screenSize) => {
      const filteredGlobalTokens = screenSize.global
        .map((token) => token.name)
        .filter((token) => regex.test(token));

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

    return super.formatTokens(tokens);
  }
}

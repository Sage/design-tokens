import { BrandTokens } from "../../brand-tokens.js";
import { CssProperty } from "../../css-parser/css-parser.types.js";
import { getSymetricalDifference } from "../../helpers.js";
import { ScreenSizeTokens } from "../../screen-size-tokens.js";
import { Decorator } from "../decorator.js";

export class LightDarkModeFormatter extends Decorator {
  /**
   * Applies "light" or "dark" to the suffix of each light/dark mode token name and for each instance where a light/dark mode token is used,
   * the light-dark css function is used. This allows consumers to switch between light and dark mode by changing the value of the `color-scheme`
   * css property either on a page or section level. An assumption is made that the lists of light and dark token names are the same.
   * @param tokens Tokens to format.
   * @returns Formatted tokens.
   */
  public override formatTokens(tokens: BrandTokens) {
    tokens.screenSizes.forEach((screenSize) => {
      this.sanityCheckModeTokens(screenSize);

      // Function above ensures that the lists of light and dark token names are the same. We can now use only one of them to loop through.
      const smallModeTokenNames = screenSize.light.map((token) => token.name);

      smallModeTokenNames.forEach((tokenName) =>
        this.formatScreenSizeModes(screenSize, tokenName)
      );

      screenSize.light.forEach((token) => (token.name = `${token.name}-light`));
      screenSize.dark.forEach((token) => (token.name = `${token.name}-dark`));
    });

    // // Function above ensures that the lists of light and dark token names are the same. We can now use only one of them to loop through.
    // const smallModeTokenNames = tokens.small.light.map((token) => token.name);

    // smallModeTokenNames.forEach((tokenName) =>
    //   this.formatScreenSizeModes(tokens.small, tokenName)
    // );

    // const largeModeTokenNames = tokens.large.light.map((token) => token.name);

    // largeModeTokenNames.forEach((tokenName) =>
    //   this.formatScreenSizeModes(tokens.large, tokenName)
    // );

    // tokens.small.light.forEach((token) => (token.name = `${token.name}-light`));
    // tokens.small.dark.forEach((token) => (token.name = `${token.name}-dark`));
    // tokens.large.light.forEach((token) => (token.name = `${token.name}-light`));
    // tokens.large.dark.forEach((token) => (token.name = `${token.name}-dark`));

    return super.formatTokens(tokens);
  }

  private formatScreenSizeModes(
    screenSizeTokens: ScreenSizeTokens,
    tokenName: string
  ) {
    const componentKeys = Object.keys(screenSizeTokens.components);

    for (const component of componentKeys) {
      const componentProps = screenSizeTokens.components[component];

      if (!componentProps) continue;

      componentProps.forEach((prop) => {
        prop.value =
          prop.value === `var(${tokenName})`
            ? `light-dark(var(${tokenName}-light), var(${tokenName}-dark))`
            : prop.value;
      });
    }
  }

  /**
   * Assumption is made that the lists of light and dark token names are the same. This verifies that.
   * @param tokens
   */
  private sanityCheckModeTokens(screenSize: ScreenSizeTokens) {
    const smallModeDifference = getSymetricalDifference(
      screenSize.light.map((token) => token.name),
      screenSize.dark.map((token) => token.name)
    );

    this.checkModeDifference(
      smallModeDifference,
      `${screenSize.minBreakpoint}px`
    );
  }

  private checkModeDifference(difference: string[], size: string) {
    if (difference.length > 0) {
      throw new Error(
        `The following tokens are not defined in both light and dark mode for min-width breakpoint ${size}: ${difference.join(
          ", "
        )}`
      );
    }
  }
}

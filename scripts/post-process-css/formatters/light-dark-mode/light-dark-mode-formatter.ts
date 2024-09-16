import { BrandTokens } from "../../brand-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { Decorator } from "../decorator";

export class LightDarkModeFormatter extends Decorator {
  /**
   * Applies "light" or "dark" to the suffix of each light/dark mode token name and for each instance where a light/dark mode token is used,
   * the light-dark css function is used. This allows consumers to switch between light and dark mode by changing the value of the `color-scheme`
   * css property either on a page or section level. An assumption is made that the lists of light and dark token names are the same.
   * @param tokens Tokens to format.
   * @returns Formatted tokens.
   */
  public override formatTokens(tokens: BrandTokens) {
    this.santiyCheckModeTokens(tokens);

    // Function above ensures that the lists of light and dark token names are the same. We can now use only one of them to loop through.
    const smallModeTokenNames = tokens.small.light.map((token) => token.name);

    smallModeTokenNames.forEach((tokenName) =>
      this.formatScreenSizeModes(tokens.small, tokenName)
    );

    const largeModeTokenNames = tokens.large.light.map((token) => token.name);

    largeModeTokenNames.forEach((tokenName) =>
      this.formatScreenSizeModes(tokens.large, tokenName)
    );

    tokens.small.light.forEach((token) => (token.name = `${token.name}-light`));
    tokens.small.dark.forEach((token) => (token.name = `${token.name}-dark`));
    tokens.large.light.forEach((token) => (token.name = `${token.name}-light`));
    tokens.large.dark.forEach((token) => (token.name = `${token.name}-dark`));

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
  private santiyCheckModeTokens(tokens: BrandTokens) {
    const smallModeDifference = this.getSymetricalDifference(
      tokens.small.light,
      tokens.small.dark
    );
    const largeModeDifference = this.getSymetricalDifference(
      tokens.large.light,
      tokens.large.dark
    );
    this.checkModeDifference(smallModeDifference, "small");
    this.checkModeDifference(largeModeDifference, "large");
  }

  private checkModeDifference(difference: string[], size: string) {
    if (difference.length > 0) {
      throw new Error(
        `The following tokens are not defined in both light and dark mode in ${size} screen size: ${difference.join(
          ", "
        )}`
      );
    }
  }

  private getSymetricalDifference(
    lightTokens: CssProperty[],
    darkTokens: CssProperty[]
  ) {
    const lightTokenNames = lightTokens.map((x) => x.name);
    const darkTokenNames = darkTokens.map((x) => x.name);

    let difference = lightTokenNames
      .filter((x) => !darkTokenNames.includes(x))
      .concat(darkTokenNames.filter((x) => !lightTokenNames.includes(x)));

    return difference;
  }
}
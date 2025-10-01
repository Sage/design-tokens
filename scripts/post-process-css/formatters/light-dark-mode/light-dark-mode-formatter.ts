import { getSymetricalDifference } from "../../helpers.js";
import { Decorator } from "../decorator.js";
import { ModeTokens } from "../mode-tokens/mode-tokens.js";

export class LightDarkModeFormatter extends Decorator {
  /**
   * Applies "light" or "dark" to the suffix of each light/dark mode token name and for each instance where a light/dark mode token is used,
   * the light-dark css function is used. This allows consumers to switch between light and dark mode by changing the value of the `color-scheme`
   * css property either on a page or section level. An assumption is made that the lists of light and dark token names are the same.
   * @param tokens Tokens to format.
   * @returns Formatted tokens.
   */
  public override formatTokens(tokens: ModeTokens) {
    this.sanityCheckModeTokens(tokens);

    // Function above ensures that the lists of light and dark token names are the same. We can now use only one of them to loop through.
    const smallModeTokenNames = tokens.light.map((token) => token.name);

    smallModeTokenNames.forEach((tokenName) =>
      this.formatScreenSizeModes(tokens, tokenName)
    );

    tokens.light.forEach((token) => (token.name = `${token.name}-light`));
    tokens.dark.forEach((token) => (token.name = `${token.name}-dark`));

    // Only keep references to white label tokens so they can be overridden
    tokens.light = tokens.light.filter((token) =>
      this.whiteLabelTokenNames
        .map((name) => `${name}-light`)
        .includes(token.name)
    );
    tokens.dark = tokens.dark.filter((token) =>
      this.whiteLabelTokenNames
        .map((name) => `${name}-dark`)
        .includes(token.name)
    );

    return super.formatTokens(tokens);
  }

  private readonly whiteLabelTokenNames = [
    "--mode-color-action-main-default",
    "--mode-color-action-main-inverse-default",
    "--mode-color-action-main-active",
    "--mode-color-action-main-inverse-active",
    "--mode-color-action-main-hover",
    "--mode-color-action-main-inverse-hover",
    "--mode-color-action-main-default-alt2",
    "--mode-color-action-main-inverse-default-alt2",
    "--mode-color-action-main-hover-alt2",
    "--mode-color-action-main-inverse-hover-alt2",
  ];

  private formatScreenSizeModes(
    screenSizeTokens: ModeTokens,
    tokenName: string
  ) {
    const componentKeys = Object.keys(screenSizeTokens.components);

    for (const component of componentKeys) {
      const componentProps = screenSizeTokens.components[component];

      if (!componentProps) continue;

      const lightToken = screenSizeTokens.light.find(
        (token) => token.name === tokenName
      );
      const darkToken = screenSizeTokens.dark.find(
        (token) => token.name === tokenName
      );

      if (!lightToken) throw new Error(`Light token not found: ${tokenName}`);
      if (!darkToken) throw new Error(`Dark token not found: ${tokenName}`);

      componentProps.forEach((prop) => {
        if (this.whiteLabelTokenNames.includes(tokenName))
          prop.value =
            prop.value === `var(${tokenName})`
              ? `light-dark(var(${tokenName}-light), var(${tokenName}-dark))`
              : prop.value;
        else
          prop.value =
            prop.value === `var(${tokenName})`
              ? `light-dark(${lightToken.value}, ${darkToken.value})`
              : prop.value;
      });
    }
  }

  /**
   * Assumption is made that the lists of light and dark token names are the same. This verifies that.
   * @param tokens
   */
  private sanityCheckModeTokens(screenSize: ModeTokens) {
    const smallModeDifference = getSymetricalDifference(
      screenSize.light.map((token) => token.name),
      screenSize.dark.map((token) => token.name)
    );

    this.checkModeDifference(smallModeDifference);
  }

  private checkModeDifference(difference: string[]) {
    if (difference.length > 0) {
      throw new Error(
        `The following tokens are not defined in both light and dark mode: ${difference.join(
          ", "
        )}`
      );
    }
  }
}

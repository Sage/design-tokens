import { BrandTokens } from "../../brand-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";
import { Decorator } from "../decorator";

export class ConsolidateScreenSizes extends Decorator {
    /**
     * Consolidates screen sizes by removing tokens that are the same in both small and large screen sizes from the large tokens, following a
     * mobile first approach. Makes the assumption that tokens are only defined one per screen size.
     * @param tokens Tokens to format.
     * @returns Consolidated tokens.
     */
  public override formatTokens(tokens: BrandTokens) {
    const matchesToken = (token: CssProperty, tokensToCompare: CssProperty[]) =>
      !tokensToCompare.find(
        (smallToken) =>
          smallToken.name === token.name && smallToken.value === token.value
      );

    tokens.large.global = tokens.large.global.filter((largeToken) =>
      matchesToken(largeToken, tokens.small.global)
    );
    tokens.large.light = tokens.large.light.filter((largeToken) =>
      matchesToken(largeToken, tokens.small.light)
    );
    tokens.large.dark = tokens.large.dark.filter((largeToken) =>
      matchesToken(largeToken, tokens.small.dark)
    );

    tokens.large.components = Object.keys(tokens.large.components).reduce<
      Record<string, CssProperty[]>
    >((components, component) => {
      if (!tokens.large.components[component]) {
        return {};
      }

      components[component] = tokens.large.components[component].filter(
        (largeToken) =>
          matchesToken(largeToken, tokens.small.components[component] || [])
      );
      return components;
    }, {});

    return tokens;
  }
}

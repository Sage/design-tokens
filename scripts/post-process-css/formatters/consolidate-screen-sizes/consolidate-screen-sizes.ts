import { ContextTokens } from "../../context-tokens.js";
import { CssProperty } from "../../css-parser/css-parser.types.js";
import { Decorator } from "../decorator.js";

interface ListObject {
  name: string;
  list: string[];
}

export class ConsolidateScreenSizes extends Decorator {
  /**
   * Consolidates screen sizes by removing tokens that are the same in descending screen sizes from following a
   * mobile first approach. Makes the assumption that tokens are only defined once per screen size.
   * @param tokens Tokens to format.
   * @returns Consolidated tokens.
   */
  public override formatTokens(tokens: ContextTokens) {
    this.sanityCheckTokens(tokens);

    const matchesToken = (token: CssProperty, tokensToCompare: CssProperty[]) =>
      !tokensToCompare.find(
        (smallToken) =>
          smallToken.name === token.name && smallToken.value === token.value
      );

    const sortedScreenSizes = tokens.screenSizes.sort(
      (a, b) => b.minBreakpoint - a.minBreakpoint
    );

    sortedScreenSizes.forEach((screenSize) => {
      const previousScreenSize = sortedScreenSizes.find(
        (size) => size.minBreakpoint < screenSize.minBreakpoint
      );

      if (!previousScreenSize) {
        return;
      }

      screenSize.global = screenSize.global.filter((largeToken) =>
        matchesToken(largeToken, previousScreenSize.global)
      );
      screenSize.light = screenSize.light.filter((largeToken) =>
        matchesToken(largeToken, previousScreenSize.light)
      );
      screenSize.dark = screenSize.dark.filter((largeToken) =>
        matchesToken(largeToken, previousScreenSize.dark)
      );

      screenSize.components = Object.keys(screenSize.components).reduce<
        Record<string, CssProperty[]>
      >((components, component) => {
        if (!screenSize.components[component]) {
          return {};
        }

        components[component] = screenSize.components[component].filter(
          (largeToken) =>
            matchesToken(
              largeToken,
              previousScreenSize.components[component] || []
            )
        );
        return components;
      }, {});
    });

    // Reorder back to mobile first
    tokens.screenSizes.sort((a, b) => a.minBreakpoint - b.minBreakpoint);
    return super.formatTokens(tokens);
  }

  private sanityCheckTokens(tokens: ContextTokens) {
    const tokenTypes = ["global", "light", "dark"] as const;

    tokenTypes.forEach((type) => {
      const tokensNotInAllSizes = this.getSymmetricalDifference(
        tokens.screenSizes.map((x) => ({
          name: `${x.minBreakpoint}px`,
          list: x[type].map((y) => y.name),
        }))
      );

      if (tokensNotInAllSizes.length > 0) {
        throw new Error(
          `${type.charAt(0).toUpperCase() + type.slice(1)} ${
            type === "global" ? "" : "mode "
          }tokens not present in all screen sizes: ${tokensNotInAllSizes
            .map((d) => `${d.token} (${d.contexts.join(", ")})`)
            .join(", ")}`
        );
      }
    });

    // Check component tokens
    const componentNames = new Set<string>();
    tokens.screenSizes.forEach((screenSize) => {
      Object.keys(screenSize.components).forEach((componentName) => {
        componentNames.add(componentName);
      });
    });

    componentNames.forEach((componentName) => {
      const componentTokensNotInAllSizes = this.getSymmetricalDifference(
        tokens.screenSizes.map((x) => ({
          name: `${x.minBreakpoint}px`,
          list: x.components[componentName]?.map((token) => token.name) || [],
        }))
      );

      if (componentTokensNotInAllSizes.length > 0) {
        throw new Error(
          `Tokens for ${componentName} not present in all screen sizes: ${componentTokensNotInAllSizes
            .map((d) => `${d.token} (${d.contexts.join(", ")})`)
            .join(", ")}`
        );
      }
    });
  }

  private getSymmetricalDifference(arrayOfObjects: ListObject[]) {
    if (arrayOfObjects.length === 0) {
      return [];
    }

    const totalLists = arrayOfObjects.length;
    const occurrenceMap: {
      [key: string]: { count: number; contexts: string[] };
    } = {};

    // Flatten the lists and count occurrences
    arrayOfObjects.forEach((obj) => {
      obj.list.forEach((str) => {
        if (!occurrenceMap[str]) {
          occurrenceMap[str] = { count: 1, contexts: [obj.name] };
        } else {
          occurrenceMap[str].count++;
          occurrenceMap[str].contexts.push(obj.name);
        }
      });
    });

    // Filter objects and their lists to include only strings not present in all lists
    const result = Object.entries(occurrenceMap)
      .filter(([_, value]) => value.count !== totalLists)
      .map(([key, value]) => ({
        token: key,
        contexts: value.contexts,
      }));

    return result;
  }
}

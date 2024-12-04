import { CssProperty } from "./css-parser/css-parser.types.js";
import { findDuplicates } from "./helpers.js";
import { ScreenSizeTokens } from "./screen-size-tokens.js";

const VALID_CONTEXT_NAMES = ["frozenproduct", "marketing", "product"] as const;
type ContextName = (typeof VALID_CONTEXT_NAMES)[number];
export class ContextTokens {
  public readonly context: ContextName;
  public screenSizes: ScreenSizeTokens[];

  constructor(contextName: string, screenSizes: ScreenSizeTokens[]) {
    if (!this.isValidContextName(contextName))
      throw new Error(`${contextName} is not an expected context name`);

    this.context = contextName;
    this.screenSizes = screenSizes;

    // At least one of the provided screen size tokens must have zero min-width breakpoint
    if (
      this.screenSizes.length > 0 &&
      !this.screenSizes.some((size) => !size.minBreakpoint)
    ) {
      throw new Error(
        "Context tokens must have at least one set of screen size tokens with zero min-width breakpoint"
      );
    }

    // Throw an error if there are duplicate min-width breakpoints
    const duplicateBreakpoints = findDuplicates(
      this.screenSizes.map((size) => size.minBreakpoint)
    );
    if (duplicateBreakpoints.length > 0) {
      throw new Error(
        `Duplicate min-width breakpoints found: ${duplicateBreakpoints.join(
          ", "
        )}`
      );
    }
  }

  private isValidContextName(value: string): value is ContextName {
    return (VALID_CONTEXT_NAMES as readonly string[]).includes(value);
  }

  public toString(): string {
    const sortedScreenSizes = this.screenSizes.sort(
      (a, b) => a.minBreakpoint - b.minBreakpoint
    );

    const sizesWithTokens = sortedScreenSizes.filter((size) => size.hasTokens);
    if (
      sizesWithTokens.length === 0 ||
      sizesWithTokens.every((size) => !size.hasTokens)
    ) {
      return "";
    }

    const lines: string[] = [];

    sizesWithTokens.forEach((size, i) => {
      // First is without a breakpoint or zero min-width so doesn't need a media query
      if (i === 0) {
        lines.push(...this.getTokenLines(size));
        lines.push("");
        return;
      }

      lines.push(`@media (width >= ${size.minBreakpoint}px) {`);
      lines.push(...this.getTokenLines(size, 2));
      lines.push("}");
      lines.push("");
    });

    return lines.join("\n");
  }

  private getTokenLines(tokens: ScreenSizeTokens, level: number = 1): string[] {
    const space = "  ";
    const rootSpace = space.repeat(level - 1);
    const tokenSpace = space.repeat(level);

    const lines: string[] = [];
    lines.push(`${rootSpace}:root {`);

    const addTokenSection = (title: string, tokenList: CssProperty[]) => {
      if (tokenList.length > 0) {
        if (lines.length > 1) lines.push("");
        lines.push(`${tokenSpace}/* ${title} */`);
        lines.push(
          tokenList
            .map(
              (p) =>
                `${tokenSpace}${p.name}: ${p.value};${
                  p.comment ? ` ${p.comment}` : ""
                }`
            )
            .join("\n")
        );
      }
    };

    addTokenSection("Global tokens", tokens.global);
    addTokenSection("Light mode tokens", tokens.light);
    addTokenSection("Dark mode tokens", tokens.dark);

    Object.keys(tokens.components).forEach((component) => {
      if (tokens.components[component]) {
        addTokenSection(
          `${component} component tokens`,
          tokens.components[component]
        );
      }
    });

    lines.push(`${rootSpace}}`);

    return lines;
  }
}

import { CssProperty } from "./css-parser/css-parser.types";
import { ScreenSizeTokens } from "./screen-size-tokens";

export class BrandTokens {
  constructor(
    private small: ScreenSizeTokens,
    private large: ScreenSizeTokens
  ) {}

  public toString(): string {
    if (!this.small.hasTokens && !this.large.hasTokens) {
      return "";
    }

    const lines: string[] = [];
    if (this.small.hasTokens) {
      lines.push(...this.getTokenLines(this.small));
      lines.push("");
    }

    if (this.large.hasTokens) {
      if (this.small.hasTokens) {
        lines.push("@media (width > 1024px) {"); // Perhaps this value should be a token to allow control from XD team?
      }

      lines.push(
        ...this.getTokenLines(this.large, this.small.hasTokens ? 2 : 1)
      );
      if (this.small.hasTokens) {
        lines.push("}");
      }
      lines.push("");
    }

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
          tokenList.map((p) => `${tokenSpace}${p.name}: ${p.value};`).join("\n")
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

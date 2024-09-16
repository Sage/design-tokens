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

  private getTokenLines(tokens: ScreenSizeTokens, level: number = 1) {
    const space = "  ";
    const rootSpace = space.repeat(level - 1);
    const tokenSpace = space.repeat(level);

    const lines: string[] = [];
    lines.push(`${rootSpace}:root {`);

    if (tokens.global.length > 0) {
      lines.push(`${tokenSpace}/* Global tokens */`);
      lines.push(
        tokens.global
          .map((p) => `${tokenSpace}${p.name}: ${p.value};`)
          .join("\n")
      );
    }

    if (tokens.light.length > 0) {
      if (lines.length > 1) lines.push("");
      lines.push(`${tokenSpace}/* Light mode tokens */`);
      lines.push(
        tokens.light
          .map((p) => `${tokenSpace}${p.name}: ${p.value};`)
          .join("\n")
      );
    }

    if (tokens.dark.length > 0) {
      if (lines.length > 1) lines.push("");
      lines.push(`${tokenSpace}/* Dark mode tokens */`);
      lines.push(
        tokens.dark.map((p) => `${tokenSpace}${p.name}: ${p.value};`).join("\n")
      );
    }

    const componentKeys = Object.keys(tokens.components);
    if (componentKeys.length > 0) {
      componentKeys.forEach((component) => {
        if (tokens.components[component]) {
          if (lines.length > 1) lines.push("");
          lines.push(`${tokenSpace}/* ${component} component tokens */`);
          lines.push(
            tokens.components[component]
              .map((p) => `${tokenSpace}${p.name}: ${p.value};`)
              .join("\n")
          );
        }
      });
    }

    lines.push(`${rootSpace}}`);

    return lines;
  }
}

import { CssProperty } from "../../css-parser/css-parser.types.js";

export class ModeTokens {
  constructor(
    public global: CssProperty[],
    public light: CssProperty[],
    public dark: CssProperty[],
    public components: Record<string, CssProperty[]>
  ) {
    this.global = global;
    this.light = light;
    this.dark = dark;
    this.components = components;
  }

  public get hasTokens(): boolean {
    return !!(
      this.global.length ||
      this.light.length ||
      this.dark.length ||
      Object.keys(this.components).length
    );
  }

  public toString(): string {
    if (!this.hasTokens) {
      return "";
    }

    const lines: string[] = [];
    const space = "  ";

    lines.push(":root {");

    const addTokenSection = (tokenList: CssProperty[]) => {
      if (tokenList.length) {
        lines.push(
          tokenList
            .map(
              (p) =>
                `${space}${p.name}: ${p.value};`
            )
            .join("\n")
        );
      }
    };

    // Add token sections
    addTokenSection(this.global);
    addTokenSection(this.light);

    // component tokens
    Object.keys(this.components).forEach((component) => {
      if (this.components[component]) {
        addTokenSection(this.components[component]);
      }
    });

    lines.push("}");
    lines.push("");

    // dark mode overrides
    if (this.dark.length) {
      lines.push("@media (prefers-color-scheme: dark) {");
      lines.push(`${space}:root {`);
      lines.push(
        this.dark
          .map(
            ({ name, value }) =>
              `${space}${space}${name}: ${value};`
          )
          .join("\n")
      );
      lines.push(`${space}}`);
      lines.push(`}`);
    }

    return lines.join("\n");
  }
}

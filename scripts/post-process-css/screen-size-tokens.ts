import { CssProperty } from "./css-parser/css-parser.types";

export class ScreenSizeTokens {
  constructor(
    public global: CssProperty[],
    public light: CssProperty[],
    public dark: CssProperty[],
    public components: Record<string, CssProperty[]>
  ) {}

  get hasTokens(): boolean {
    return (
      this.global.length > 0 ||
      this.light.length > 0 ||
      this.dark.length > 0 ||
      Object.keys(this.components).length > 0
    );
  }
}

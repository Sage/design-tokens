import { CssProperty } from "./css-parser/css-parser.types";

export class ScreenSizeTokens {
  public minBreakpoint: number | undefined;

  constructor(
    public global: CssProperty[],
    public light: CssProperty[],
    public dark: CssProperty[],
    public components: Record<string, CssProperty[]>
  ) {
    const minBreakpointValue = global.find(
      (p) => p.name === "--breakpoint-min-width"
    )?.value;

    if (minBreakpointValue !== undefined) {
      let minBreakpoint = parseInt(minBreakpointValue.replace("px", ""));
      if (Number.isNaN(minBreakpoint)) {
        throw new Error(
          `Breakpoint min width "${minBreakpointValue}" is not a number or a pixel value`
        );
      }

      this.minBreakpoint = minBreakpoint;
    }
  }

  get hasTokens(): boolean {
    return (
      this.global.length > 0 ||
      this.light.length > 0 ||
      this.dark.length > 0 ||
      Object.keys(this.components).length > 0
    );
  }
}

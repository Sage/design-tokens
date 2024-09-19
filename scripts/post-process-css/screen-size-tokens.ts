import { CssProperty } from "./css-parser/css-parser.types";

export class ScreenSizeTokens {
  public static readonly breakpointToken = "--breakpoint-min-width";
  public readonly minBreakpoint: number = 0;

  constructor(
    public global: CssProperty[],
    public light: CssProperty[],
    public dark: CssProperty[],
    public components: Record<string, CssProperty[]>
  ) {
    this.global = global.filter(
      (token) => token.name !== ScreenSizeTokens.breakpointToken
    );
    this.light = light;
    this.dark = dark;
    this.components = components;

    const minBreakpointValue = global.find(
      (p) => p.name === ScreenSizeTokens.breakpointToken
    )?.value;

    if (minBreakpointValue) {
      let minBreakpoint = parseInt(minBreakpointValue.replace("px", ""));
      if (Number.isNaN(minBreakpoint)) {
        throw new Error(
          `Breakpoint min width "${minBreakpointValue}" is not a number or a pixel value`
        );
      }

      this.minBreakpoint = minBreakpoint;
    }
  }

  public get hasTokens(): boolean {
    return (
      this.global.filter(
        (token) => token.name !== ScreenSizeTokens.breakpointToken
      ).length > 0 ||
      this.light.length > 0 ||
      this.dark.length > 0 ||
      Object.keys(this.components).length > 0
    );
  }
}

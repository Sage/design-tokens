import { expect } from "chai";
import { ScreenSizeTokens } from "./screen-size-tokens";
import { CssProperty } from "./css-parser/css-parser.types";

describe("ScreenSizeTokens", () => {
  describe("hasTokens", () => {
    const globalTokens: CssProperty[] = [
      {
        name: "--global-prop1",
        value: "value1",
        fullLine: "--global-prop1: value1;",
      },
    ];
    const lightTokens: CssProperty[] = [
      {
        name: "--prop1-light",
        value: "value1",
        fullLine: "--prop1-light: value1;",
      },
    ];
    const darkTokens: CssProperty[] = [
      {
        name: "--prop1-dark",
        value: "value1",
        fullLine: "--prop1-dark: value1;",
      },
    ];
    const componentTokens: Record<string, CssProperty[]> = {
      badge: [
        {
          name: "--badge-prop1",
          value: "badge-value1",
          fullLine: "--badge-prop1: badge-value1;",
        },
      ],
    };

    it("should return false when there are no tokens are available", () => {
      const tokens: ScreenSizeTokens = new ScreenSizeTokens([], [], [], {});
      expect(tokens.hasTokens).to.be.false;
    });

    it("should return true when there are all tokens available", () => {
      const tokens = new ScreenSizeTokens(
        globalTokens,
        lightTokens,
        darkTokens,
        componentTokens
      );

      expect(tokens.hasTokens).to.be.true;
    });

    it("should return true when there are only global tokens available", () => {
      const tokens = new ScreenSizeTokens(globalTokens, [], [], {});

      expect(tokens.hasTokens).to.be.true;
    });

    it("should return true when there are only light tokens available", () => {
      const tokens = new ScreenSizeTokens([], lightTokens, [], {});

      expect(tokens.hasTokens).to.be.true;
    });

    it("should return true when there are only light tokens available", () => {
      const tokens = new ScreenSizeTokens([], [], darkTokens, {});

      expect(tokens.hasTokens).to.be.true;
    });

    it("should return true when there are only component tokens available", () => {
      const tokens = new ScreenSizeTokens([], [], [], componentTokens);

      expect(tokens.hasTokens).to.be.true;
    });
  });
});

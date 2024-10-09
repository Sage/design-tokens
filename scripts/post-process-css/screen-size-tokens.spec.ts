import { expect } from "chai";
import { ScreenSizeTokens } from "./screen-size-tokens.js";
import { CssProperty } from "./css-parser/css-parser.types.js";

describe("ScreenSizeTokens", () => {
  describe("constructor", () => {
    it("should set minBreakpoint when --global-size-breakpoint-min-width is present", () => {
      const tokens = new ScreenSizeTokens(
        [
          {
            name: "--global-size-breakpoint-min-width",
            value: "1024px",
          },
        ],
        [],
        [],
        {}
      );

      expect(tokens.minBreakpoint).to.equal(1024);
    });

    it("should set minBreakpoint to zero when --global-size-breakpoint-min-width is not present", () => {
      const tokens = new ScreenSizeTokens(
        [
          {
            name: "--global-size-breakpoint-min-width",
            value: "",
          },
        ],
        [],
        [],
        {}
      );

      expect(tokens.minBreakpoint).to.be.equal(0);
    });

    it("should set minBreakpoint to zero when --global-size-breakpoint-min-width is blank", () => {
      const tokens = new ScreenSizeTokens([], [], [], {});

      expect(tokens.minBreakpoint).to.be.equal(0);
    });

    it("should throw an error when --global-size-breakpoint-min-width is not a number or a pixel value", () => {
      expect(
        () =>
          new ScreenSizeTokens(
            [
              {
                name: "--global-size-breakpoint-min-width",
                value: "ERROR",
              },
            ],
            [],
            [],
            {}
          )
      ).to.throw(
        'Breakpoint min width "ERROR" is not a number or a pixel value'
      );
    });
  });

  describe("hasTokens", () => {
    const globalTokens: CssProperty[] = [
      {
        name: "--global-prop1",
        value: "value1",
      },
    ];
    const lightTokens: CssProperty[] = [
      {
        name: "--prop1-light",
        value: "value1",
      },
    ];
    const darkTokens: CssProperty[] = [
      {
        name: "--prop1-dark",
        value: "value1",
      },
    ];
    const componentTokens: Record<string, CssProperty[]> = {
      badge: [
        {
          name: "--badge-prop1",
          value: "badge-value1",
        },
      ],
    };

    it("should return false when there are no tokens are available", () => {
      const tokens: ScreenSizeTokens = new ScreenSizeTokens([], [], [], {});
      expect(tokens.hasTokens).to.be.false;
    });

    it("should return false when there is only breakpoint token available", () => {
      const tokens: ScreenSizeTokens = new ScreenSizeTokens(
        [{ name: "--global-size-breakpoint-min-width", value: "0" }],
        [],
        [],
        {}
      );
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

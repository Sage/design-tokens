import { expect } from "chai";
import { ConsolidateScreenSizes } from "./consolidate-screen-sizes";
import { BrandTokens } from "../../brand-tokens";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";

describe("ConsolidateScreenSizes", () => {
  const consolidateScreenSizes = new ConsolidateScreenSizes();

  const populatedSmallTokens: CssProperty[] = [
    {
      name: "--global-prop1",
      value: "value1",
    },
    {
      name: "--global-prop2",
      value: "value2",
    },
    {
      name: "--global-prop3",
      value: "value3",
    },
  ];

  const populatedLargeTokens: CssProperty[] = [
    {
      name: "--global-prop1",
      value: "value1",
    },
    {
      name: "--global-prop2",
      value: "value2-large",
    },
    {
      name: "--global-prop3",
      value: "value3",
    },
  ];

  const expectedFilteredTokens: CssProperty[] = [
    {
      name: "--global-prop2",
      value: "value2-large",
    },
  ];

  describe("formatTokens", () => {
    it("should filter global large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens(populatedSmallTokens, [], [], {}),
        new ScreenSizeTokens(populatedLargeTokens, [], [], {})
      );

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        small: {
          global: populatedSmallTokens,
          light: [],
          dark: [],
          components: {},
          minBreakpoint: undefined,
        },
        large: {
          global: expectedFilteredTokens,
          light: [],
          dark: [],
          components: {},
          minBreakpoint: undefined,
        },
      });
    });

    it("should filter light large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], populatedSmallTokens, [], {}),
        new ScreenSizeTokens([], populatedLargeTokens, [], {})
      );

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        small: {
          global: [],
          light: populatedSmallTokens,
          dark: [],
          components: {},
          minBreakpoint: undefined,
        },
        large: {
          global: [],
          light: expectedFilteredTokens,
          dark: [],
          components: {},
          minBreakpoint: undefined,
        },
      });
    });

    it("should filter dark large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], [], populatedSmallTokens, {}),
        new ScreenSizeTokens([], [], populatedLargeTokens, {})
      );

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        small: {
          global: [],
          light: [],
          dark: populatedSmallTokens,
          components: {},
          minBreakpoint: undefined,
        },
        large: {
          global: [],
          light: [],
          dark: expectedFilteredTokens,
          components: {},
          minBreakpoint: undefined,
        },
      });
    });

    it("should filter component large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], [], [], {
          accordion: populatedSmallTokens,
          badge: [
            {
              name: "--global-prop1",
              value: "value1",
            },
          ],
          button: populatedSmallTokens,
        }),
        new ScreenSizeTokens([], [], [], {
          accordion: populatedLargeTokens,
          badge: [
            {
              name: "--global-prop1",
              value: "value1",
            },
          ],
          button: populatedLargeTokens,
        })
      );

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        small: {
          global: [],
          light: [],
          dark: [],
          components: {
            accordion: populatedSmallTokens,
            badge: [
              {
                name: "--global-prop1",
                value: "value1",
              },
            ],
            button: populatedSmallTokens,
          },
          minBreakpoint: undefined,
        },
        large: {
          global: [],
          light: [],
          dark: [],
          components: {
            accordion: expectedFilteredTokens,
            badge: [],
            button: expectedFilteredTokens,
          },
          minBreakpoint: undefined,
        },
      });
    });
  });
});

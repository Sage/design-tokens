import { expect } from "chai";
import { ConsolidateScreenSizes } from "./consolidate-screen-sizes";
import { BrandTokens } from "../../brand-tokens";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";

describe("ConsolidateScreenSizes", () => {
  const consolidateScreenSizes = new ConsolidateScreenSizes();

  const populatedSmallTokens: CssProperty[] = [
    { name: "--global-prop1", value: "value1" },
    { name: "--global-prop2", value: "value2" },
    { name: "--global-prop3", value: "value3" },
  ];

  const populatedLargeTokens: CssProperty[] = [
    { name: "--global-prop1", value: "value1" },
    { name: "--global-prop2", value: "value2-large" },
    { name: "--global-prop3", value: "value3" },
  ];

  const expectedFilteredTokens: CssProperty[] = [
    { name: "--global-prop2", value: "value2-large" },
  ];

  const largeGlobalBreakpointToken: CssProperty = {
    name: "--breakpoint-min-width",
    value: "1024px",
  };

  describe("formatTokens", () => {
    it("should throw an error if any global tokens are not found in all screen sizes", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens(
          [
            { name: "--breakpoint-min-width", value: "0" },
            { name: "--global-prop1", value: "value1" },
            { name: "--global-prop2", value: "value1" },
          ],
          [],
          [],
          {}
        ),
        new ScreenSizeTokens(
          [
            { name: "--breakpoint-min-width", value: "768" },
            { name: "--global-prop2", value: "value1" },
            { name: "--global-prop3", value: "value1" },
          ],
          [],
          [],
          {}
        ),
        new ScreenSizeTokens(
          [
            { name: "--breakpoint-min-width", value: "1024" },
            { name: "--global-prop2", value: "value1" },
            { name: "--global-prop3", value: "value1" },
          ],
          [],
          [],
          {}
        ),
      ]);

      expect(() => consolidateScreenSizes.formatTokens(tokens)).to.throw(
        "Global tokens not present in all screen sizes: --global-prop1 (0px), --global-prop3 (768px, 1024px)"
      );
    });

    it("should throw an error if any light mode tokens are not found in all screen sizes", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "0" }],
          [
            { name: "--global-prop1", value: "value1" },
            { name: "--global-prop2", value: "value1" },
          ],
          [],
          {}
        ),
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "768" }],
          [
            { name: "--global-prop2", value: "value1" },
            { name: "--global-prop3", value: "value1" },
          ],
          [],
          {}
        ),
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "1024" }],
          [
            { name: "--global-prop2", value: "value1" },
            { name: "--global-prop3", value: "value1" },
          ],
          [],
          {}
        ),
      ]);

      expect(() => consolidateScreenSizes.formatTokens(tokens)).to.throw(
        "Light mode tokens not present in all screen sizes: --global-prop1 (0px), --global-prop3 (768px, 1024px)"
      );
    });

    it("should throw an error if any dark mode tokens are not found in all screen sizes", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "0" }],
          [],
          [
            { name: "--global-prop1", value: "value1" },
            { name: "--global-prop2", value: "value1" },
          ],
          {}
        ),
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "768" }],
          [],
          [
            { name: "--global-prop2", value: "value1" },
            { name: "--global-prop3", value: "value1" },
          ],
          {}
        ),
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "1024" }],
          [],
          [
            { name: "--global-prop2", value: "value1" },
            { name: "--global-prop3", value: "value1" },
          ],
          {}
        ),
      ]);

      expect(() => consolidateScreenSizes.formatTokens(tokens)).to.throw(
        "Dark mode tokens not present in all screen sizes: --global-prop1 (0px), --global-prop3 (768px, 1024px)"
      );
    });

    it("should throw an error if any component tokens are not found in all screen sizes", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "0" }],
          [],
          [],
          {
            badge: [
              { name: "--global-prop1", value: "value1" },
              { name: "--global-prop2", value: "value1" },
            ],
          }
        ),
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "768" }],
          [],
          [],
          {
            badge: [
              { name: "--global-prop2", value: "value1" },
              { name: "--global-prop3", value: "value1" },
            ],
          }
        ),
        new ScreenSizeTokens(
          [{ name: "--breakpoint-min-width", value: "1024" }],
          [],
          [],
          {
            badge: [
              { name: "--global-prop2", value: "value1" },
              { name: "--global-prop3", value: "value1" },
            ],
          }
        ),
      ]);

      expect(() => consolidateScreenSizes.formatTokens(tokens)).to.throw(
        "Tokens for badge not present in all screen sizes: --global-prop1 (0px), --global-prop3 (768px, 1024px)"
      );
    });

    it("should filter global large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens(populatedSmallTokens, [], [], {}),
        new ScreenSizeTokens(
          [largeGlobalBreakpointToken, ...populatedLargeTokens],
          [],
          [],
          {}
        ),
      ]);

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        screenSizes: [
          {
            global: populatedSmallTokens,
            light: [],
            dark: [],
            components: {},
            minBreakpoint: 0,
          },
          {
            global: expectedFilteredTokens,
            light: [],
            dark: [],
            components: {},
            minBreakpoint: 1024,
          },
        ],
      });
    });

    it("should filter light large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens([], populatedSmallTokens, [], {}),
        new ScreenSizeTokens(
          [largeGlobalBreakpointToken],
          populatedLargeTokens,
          [],
          {}
        ),
      ]);

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        screenSizes: [
          {
            global: [],
            light: populatedSmallTokens,
            dark: [],
            components: {},
            minBreakpoint: 0,
          },
          {
            global: [],
            light: expectedFilteredTokens,
            dark: [],
            components: {},
            minBreakpoint: 1024,
          },
        ],
      });
    });

    it("should filter dark large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens([], [], populatedSmallTokens, {}),
        new ScreenSizeTokens(
          [largeGlobalBreakpointToken],
          [],
          populatedLargeTokens,
          {}
        ),
      ]);

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        screenSizes: [
          {
            global: [],
            light: [],
            dark: populatedSmallTokens,
            components: {},
            minBreakpoint: 0,
          },
          {
            global: [],
            light: [],
            dark: expectedFilteredTokens,
            components: {},
            minBreakpoint: 1024,
          },
        ],
      });
    });

    it("should filter component large screen tokens when the same value is applied to small screen tokens", () => {
      const tokens = new BrandTokens([
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
        new ScreenSizeTokens([largeGlobalBreakpointToken], [], [], {
          accordion: populatedLargeTokens,
          badge: [
            {
              name: "--global-prop1",
              value: "value1",
            },
          ],
          button: populatedLargeTokens,
        }),
      ]);

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        screenSizes: [
          {
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
            minBreakpoint: 0,
          },
          {
            global: [],
            light: [],
            dark: [],
            components: {
              accordion: expectedFilteredTokens,
              badge: [],
              button: expectedFilteredTokens,
            },
            minBreakpoint: 1024,
          },
        ],
      });
    });

    it("should filter global tokens as expected across multiple screen sizes", () => {
      // --global-prop1: Same value in all screen sizes. Gets removed in all but the smallest screen size.
      // --global-prop2: Overridden in large screen size + extra large with same value. Expected to be displayed in small and large screen sizes.
      // --global-prop3: Overridden in medium screen size + extra large with different value. Expected to be displayed in small, medium and extra large screen sizes.

      const smallSize = new ScreenSizeTokens(
        [
          { name: "--breakpoint-min-width", value: "0" },
          { name: "--global-prop1", value: "SMALL" },
          { name: "--global-prop2", value: "SMALL" },
          { name: "--global-prop3", value: "SMALL" },
        ],
        [],
        [],
        {}
      );
      const mediumSize = new ScreenSizeTokens(
        [
          { name: "--breakpoint-min-width", value: "768" },
          { name: "--global-prop1", value: "SMALL" },
          { name: "--global-prop2", value: "SMALL" },
          { name: "--global-prop3", value: "MEDIUM" },
        ],
        [],
        [],
        {}
      );
      const largeSize = new ScreenSizeTokens(
        [
          { name: "--breakpoint-min-width", value: "992" },
          { name: "--global-prop1", value: "SMALL" },
          { name: "--global-prop2", value: "LARGE" },
          { name: "--global-prop3", value: "MEDIUM" },
        ],
        [],
        [],
        {}
      );
      const extraLargeSize = new ScreenSizeTokens(
        [
          { name: "--breakpoint-min-width", value: "1200" },
          { name: "--global-prop1", value: "SMALL" },
          { name: "--global-prop2", value: "LARGE" },
          { name: "--global-prop3", value: "EXTRALARGE" },
        ],
        [],
        [],
        {}
      );

      const tokens = new BrandTokens([
        extraLargeSize,
        mediumSize,
        smallSize,
        largeSize,
      ]);

      const result = consolidateScreenSizes.formatTokens(tokens);
      expect(result).to.deep.equal({
        screenSizes: [
          {
            global: [
              { name: "--global-prop1", value: "SMALL" },
              { name: "--global-prop2", value: "SMALL" },
              { name: "--global-prop3", value: "SMALL" },
            ],
            light: [],
            dark: [],
            components: {},
            minBreakpoint: 0,
          },
          {
            global: [{ name: "--global-prop3", value: "MEDIUM" }],
            light: [],
            dark: [],
            components: {},
            minBreakpoint: 768,
          },
          {
            global: [{ name: "--global-prop2", value: "LARGE" }],
            light: [],
            dark: [],
            components: {},
            minBreakpoint: 992,
          },
          {
            global: [{ name: "--global-prop3", value: "EXTRALARGE" }],
            light: [],
            dark: [],
            components: {},
            minBreakpoint: 1200,
          },
        ],
      });
    });
  });
});

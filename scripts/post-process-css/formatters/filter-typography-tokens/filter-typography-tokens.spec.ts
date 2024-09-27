import { expect } from "chai";
import { ContextTokens } from "../../context-tokens";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { FilterTypographyTokens } from "./filter-typography-tokens";

describe("FilterTypographyTokens", () => {
  const filterAdaptiveTypography = new FilterTypographyTokens();

  describe("formatTokens", () => {
    it("should throw an error when a mirror adaptive global token is not found", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            {
              name: "--global-typography-responsive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {}
        ),
      ]);
      expect(() => filterAdaptiveTypography.formatTokens(tokens)).to.throw(
        "Missing adaptive global typography token for responsive token: --global-typography-responsive-display-l on min breakpoint: 0, context: product"
      );
    });

    it("should throw an error when a mirror responsive global token is not found", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {}
        ),
      ]);
      expect(() => filterAdaptiveTypography.formatTokens(tokens)).to.throw(
        "Missing responsive global typography token for adaptive token: --global-typography-adaptive-display-l on min breakpoint: 0, context: product"
      );
    });

    it("should throw an error when a mirror adaptive component token is not found", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            {
              name: "--global-typography-responsive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
            ],
          }
        ),
      ]);
      expect(() => filterAdaptiveTypography.formatTokens(tokens)).to.throw(
        "Missing adaptive badge token for responsive token: --badge-typography-responsive-l on min breakpoint: 0, context: product"
      );
    });

    it("should throw an error when a mirror responsive component token is not found", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            {
              name: "--global-typography-responsive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
            ],
          }
        ),
      ]);
      expect(() => filterAdaptiveTypography.formatTokens(tokens)).to.throw(
        "Missing responsive badge token for adaptive token: --badge-typography-adaptive-l on min breakpoint: 0, context: product"
      );
    });

    it("should throw an error when a mirror adaptive component token has an unexpected value", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            {
              name: "--global-typography-responsive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-s",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-adaptive-display-s",
              value: "900 40px/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-s)",
              },
            ],
          }
        ),
      ]);
      expect(() => filterAdaptiveTypography.formatTokens(tokens)).to.throw(
        "Value mismatch on badge component for tokens --badge-typography-adaptive-l and --badge-typography-responsive-l on min breakpoint: 0, context: product"
      );
    });

    it("should throw an error when a mirror responsive component token has an unexpected value", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            {
              name: "--global-typography-responsive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-s",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-adaptive-display-s",
              value: "900 40px/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-s)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
            ],
          }
        ),
      ]);
      expect(() => filterAdaptiveTypography.formatTokens(tokens)).to.throw(
        "Value mismatch on badge component for tokens --badge-typography-responsive-l and --badge-typography-adaptive-l on min breakpoint: 0, context: product"
      );
    });

    it("should filter adaptive tokens when supplied product context tokens", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            { name: "--global-size-breakpoint-min-width", value: "0" },
            {
              name: "--global-typography-adaptive-display-m",
              value: "900 35px/1.25 'Sage Headline'",
            },
            {
              name: "--global-space-adaptive-macro-scale",
              value: "0.8px",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-m",
              value:
                "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-l",
              value:
                "900 clamp(2.5187rem, 1.6647rem + 4.2703vi, 5.935rem)/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-adaptive-m",
                value: "var(--global-typography-adaptive-display-m)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
              {
                name: "--badge-typography-adaptive-size",
                value: "var(--global-space-adaptive-macro-scale)",
              },
              {
                name: "--badge-typography-responsive-m",
                value: "var(--global-typography-responsive-display-m)",
              },
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
            ],
          }
        ),
        new ScreenSizeTokens(
          [
            { name: "--global-size-breakpoint-min-width", value: "1024" },
            {
              name: "--global-typography-adaptive-display-m",
              value: "900 71px/1.25 'Sage Headline'",
            },
            {
              name: "--global-space-adaptive-macro-scale",
              value: "1px",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 95px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-m",
              value:
                "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-l",
              value:
                "900 clamp(2.5187rem, 1.6647rem + 4.2703vi, 5.935rem)/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-adaptive-m",
                value: "var(--global-typography-adaptive-display-m)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
              {
                name: "--badge-typography-adaptive-size",
                value: "var(--global-space-adaptive-macro-scale)",
              },
              {
                name: "--badge-typography-responsive-m",
                value: "var(--global-typography-responsive-display-m)",
              },
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
            ],
          }
        ),
      ]);

      const result = filterAdaptiveTypography.formatTokens(tokens);
      expect(result).to.deep.equal({
        context: "product",
        screenSizes: [
          {
            global: [
              {
                name: "--global-space-adaptive-macro-scale",
                value: "0.8px",
              },
              {
                name: "--global-typography-display-m",
                value:
                  "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
              },
              {
                name: "--global-typography-display-l",
                value:
                  "900 clamp(2.5187rem, 1.6647rem + 4.2703vi, 5.935rem)/1.25 'Sage Headline'",
              },
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-typography-adaptive-size",
                  value: "var(--global-space-adaptive-macro-scale)",
                },
                {
                  name: "--badge-typography-m",
                  value: "var(--global-typography-display-m)",
                },
                {
                  name: "--badge-typography-l",
                  value: "var(--global-typography-display-l)",
                },
              ],
            },
            minBreakpoint: 0,
          },
          {
            global: [
              {
                name: "--global-space-adaptive-macro-scale",
                value: "1px",
              },
              {
                name: "--global-typography-display-m",
                value:
                  "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
              },
              {
                name: "--global-typography-display-l",
                value:
                  "900 clamp(2.5187rem, 1.6647rem + 4.2703vi, 5.935rem)/1.25 'Sage Headline'",
              },
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-typography-adaptive-size",
                  value: "var(--global-space-adaptive-macro-scale)",
                },
                {
                  name: "--badge-typography-m",
                  value: "var(--global-typography-display-m)",
                },
                {
                  name: "--badge-typography-l",
                  value: "var(--global-typography-display-l)",
                },
              ],
            },
            minBreakpoint: 1024,
          },
        ],
      });
    });

    it("should filter responsive tokens when supplied frozenproduct context tokens", () => {
      const tokens = new ContextTokens("frozenproduct", [
        new ScreenSizeTokens(
          [
            { name: "--global-size-breakpoint-min-width", value: "0" },
            {
              name: "--global-typography-adaptive-display-m",
              value: "900 35px/1.25 'Sage Headline'",
            },
            {
              name: "--global-space-adaptive-macro-scale",
              value: "0.8px",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 40px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-m",
              value:
                "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-l",
              value:
                "900 clamp(2.5187rem, 1.6647rem + 4.2703vi, 5.935rem)/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-adaptive-m",
                value: "var(--global-typography-adaptive-display-m)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
              {
                name: "--badge-typography-adaptive-size",
                value: "var(--global-space-adaptive-macro-scale)",
              },
              {
                name: "--badge-typography-responsive-m",
                value: "var(--global-typography-responsive-display-m)",
              },
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
            ],
          }
        ),
        new ScreenSizeTokens(
          [
            { name: "--global-size-breakpoint-min-width", value: "1024" },
            {
              name: "--global-typography-adaptive-display-m",
              value: "900 71px/1.25 'Sage Headline'",
            },
            {
              name: "--global-space-adaptive-macro-scale",
              value: "1px",
            },
            {
              name: "--global-typography-adaptive-display-l",
              value: "900 95px/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-m",
              value:
                "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
            },
            {
              name: "--global-typography-responsive-display-l",
              value:
                "900 clamp(2.5187rem, 1.6647rem + 4.2703vi, 5.935rem)/1.25 'Sage Headline'",
            },
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-typography-adaptive-m",
                value: "var(--global-typography-adaptive-display-m)",
              },
              {
                name: "--badge-typography-adaptive-l",
                value: "var(--global-typography-adaptive-display-l)",
              },
              {
                name: "--badge-typography-adaptive-size",
                value: "var(--global-space-adaptive-macro-scale)",
              },
              {
                name: "--badge-typography-responsive-m",
                value: "var(--global-typography-responsive-display-m)",
              },
              {
                name: "--badge-typography-responsive-l",
                value: "var(--global-typography-responsive-display-l)",
              },
            ],
          }
        ),
      ]);

      const result = filterAdaptiveTypography.formatTokens(tokens);
      expect(result).to.deep.equal({
        context: "frozenproduct",
        screenSizes: [
          {
            global: [
              {
                name: "--global-typography-display-m",
                value: "900 35px/1.25 'Sage Headline'",
              },
              {
                name: "--global-space-adaptive-macro-scale",
                value: "0.8px",
              },
              {
                name: "--global-typography-display-l",
                value: "900 40px/1.25 'Sage Headline'",
              },
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-typography-m",
                  value: "var(--global-typography-display-m)",
                },
                {
                  name: "--badge-typography-l",
                  value: "var(--global-typography-display-l)",
                },
                {
                  name: "--badge-typography-adaptive-size",
                  value: "var(--global-space-adaptive-macro-scale)",
                },
              ],
            },
            minBreakpoint: 0,
          },
          {
            global: [
              {
                name: "--global-typography-display-m",
                value: "900 71px/1.25 'Sage Headline'",
              },
              {
                name: "--global-space-adaptive-macro-scale",
                value: "1px",
              },
              {
                name: "--global-typography-display-l",
                value: "900 95px/1.25 'Sage Headline'",
              },
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-typography-m",
                  value: "var(--global-typography-display-m)",
                },
                {
                  name: "--badge-typography-l",
                  value: "var(--global-typography-display-l)",
                },
                {
                  name: "--badge-typography-adaptive-size",
                  value: "var(--global-space-adaptive-macro-scale)",
                },
              ],
            },
            minBreakpoint: 1024,
          },
        ],
      });
    });
  });
});

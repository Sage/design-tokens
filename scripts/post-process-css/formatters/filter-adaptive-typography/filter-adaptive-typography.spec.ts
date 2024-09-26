import { expect } from "chai";
import { BrandTokens } from "../../brand-tokens";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { FilterAdaptiveTypography } from "./filter-adaptive-typography";

describe("FilterAdaptiveTypography", () => {
  const filterAdaptiveTypography = new FilterAdaptiveTypography();

  describe("formatTokens", () => {
    it("should format tokens as expected", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens(
          [
            { name: "--global-size-breakpoint-min-width", value: "0" },
            {
              name: "--global-typography-adaptive-display-m",
              value: "900 35px/1.25 'Sage Headline'",
            },
            {
              name: "--global-space-macro-scale",
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
                name: "--badge-typography-responsive-m",
                value: "var(--global-typography-responsive-display-m)",
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
              name: "--global-space-macro-scale",
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
                name: "--badge-typography-responsive-m",
                value: "var(--global-typography-responsive-display-m)",
              },
            ],
          }
        ),
      ]);

      const result = filterAdaptiveTypography.formatTokens(tokens);
      expect(result).to.deep.equal({
        screenSizes: [
          {
            global: [
              {
                name: "--global-space-macro-scale",
                value: "0.8px",
              },
              {
                name: "--global-typography-responsive-display-m",
                value:
                  "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
              },
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-typography-responsive-m",
                  value: "var(--global-typography-responsive-display-m)",
                },
              ],
            },
            minBreakpoint: 0,
          },
          {
            global: [
              {
                name: "--global-space-macro-scale",
                value: "1px",
              },
              {
                name: "--global-typography-responsive-display-m",
                value:
                  "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'",
              },
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-typography-responsive-m",
                  value: "var(--global-typography-responsive-display-m)",
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

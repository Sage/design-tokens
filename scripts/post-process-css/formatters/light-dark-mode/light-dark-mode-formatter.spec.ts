import { expect } from "chai";
import { BrandTokens } from "../../brand-tokens";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { CssProperty } from "../../css-parser/css-parser.types";
import { LightDarkModeFormatter } from "./light-dark-mode-formatter";

describe("LightDarkModeFormatter", () => {
  const lightDarkModeFormatter = new LightDarkModeFormatter();

  describe("formatTokens", () => {
    it("should throw error if small tokens are in both light and dark mode", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens(
          [],
          [
            { name: "--prop1", value: "" },
            { name: "--prop2", value: "" },
          ],
          [
            { name: "--prop2", value: "" },
            { name: "--prop3", value: "" },
          ],
          {}
        ),
        new ScreenSizeTokens([], [], [], {})
      );
      expect(() => lightDarkModeFormatter.formatTokens(tokens)).to.throw(
        "The following tokens are not defined in both light and dark mode in small screen size: --prop1, --prop3"
      );
    });

    it("should throw error if large tokens are in both light and dark mode", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], [], [], {}),
        new ScreenSizeTokens(
          [],
          [
            { name: "--prop1", value: "" },
            { name: "--prop2", value: "" },
          ],
          [
            { name: "--prop2", value: "" },
            { name: "--prop3", value: "" },
          ],
          {}
        )
      );
      expect(() => lightDarkModeFormatter.formatTokens(tokens)).to.throw(
        "The following tokens are not defined in both light and dark mode in large screen size: --prop1, --prop3"
      );
    });

    it("should format small tokens as expected", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens(
          [],
          [
            {
              name: "--modes-color-text",
              value: "#000000",
            },
          ],
          [
            {
              name: "--modes-color-text",
              value: "#ffffff",
            },
          ],
          {
            badge: [
              {
                name: "--badge-prop1",
                value: "var(--modes-color-text)",
              },
            ],
          }
        ),
        new ScreenSizeTokens([], [], [], {})
      );

      const result = lightDarkModeFormatter.formatTokens(tokens);
      expect(result).to.deep.equal({
        small: {
          global: [],
          light: [
            {
              name: "--modes-color-text-light",
              value: "#000000",
            },
          ],
          dark: [
            {
              name: "--modes-color-text-dark",
              value: "#ffffff",
            },
          ],
          components: {
            badge: [
              {
                name: "--badge-prop1",
                value:
                  "light-dark(var(--modes-color-text-light), var(--modes-color-text-dark))",
              },
            ],
          },
        },
        large: {
          global: [],
          light: [],
          dark: [],
          components: {},
        },
      });
    });

    it("should format large tokens as expected", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], [], [], {}),
        new ScreenSizeTokens(
          [],
          [
            {
              name: "--modes-color-text",
              value: "#000000",
            },
          ],
          [
            {
              name: "--modes-color-text",
              value: "#ffffff",
            },
          ],
          {
            badge: [
              {
                name: "--badge-prop1",
                value: "var(--modes-color-text)",
              },
            ],
          }
        ),
      );

      const result = lightDarkModeFormatter.formatTokens(tokens);
      expect(result).to.deep.equal({
        small: {
          global: [],
          light: [],
          dark: [],
          components: {},
        },
        large: {
          global: [],
          light: [
            {
              name: "--modes-color-text-light",
              value: "#000000",
            },
          ],
          dark: [
            {
              name: "--modes-color-text-dark",
              value: "#ffffff",
            },
          ],
          components: {
            badge: [
              {
                name: "--badge-prop1",
                value:
                  "light-dark(var(--modes-color-text-light), var(--modes-color-text-dark))",
              },
            ],
          },
        },
      });
    });
  });
});

import { expect } from "chai";
import { ContextTokens } from "../../context-tokens";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { LightDarkModeFormatter } from "./light-dark-mode-formatter";

describe("LightDarkModeFormatter", () => {
  const lightDarkModeFormatter = new LightDarkModeFormatter();

  describe("formatTokens", () => {
    it("should throw error if small tokens are in both light and dark mode", () => {
      const tokens = new ContextTokens("product", [
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
      ]);
      expect(() => lightDarkModeFormatter.formatTokens(tokens)).to.throw(
        "The following tokens are not defined in both light and dark mode for min-width breakpoint 0px: --prop1, --prop3"
      );
    });

    it("should throw error if large tokens are in both light and dark mode", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens([], [], [], {}),
        new ScreenSizeTokens(
          [{ name: "--global-size-breakpoint-min-width", value: "1024px" }],
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
      ]);
      expect(() => lightDarkModeFormatter.formatTokens(tokens)).to.throw(
        "The following tokens are not defined in both light and dark mode for min-width breakpoint 1024px: --prop1, --prop3"
      );
    });

    it("should format tokens as expected", () => {
      const tokens = new ContextTokens("product", [
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
        new ScreenSizeTokens(
          [{ name: "--global-size-breakpoint-min-width", value: "1024px" }],
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
      ]);

      const result = lightDarkModeFormatter.formatTokens(tokens);
      expect(result).to.deep.equal({
        context: "product",
        screenSizes: [
          {
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
            minBreakpoint: 0,
          },
          {
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
            minBreakpoint: 1024,
          },
        ],
      });
    });
  });
});

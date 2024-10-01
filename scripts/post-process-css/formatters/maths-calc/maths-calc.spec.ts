import { expect } from "chai";
import { BrandTokens } from "../../brand-tokens";
import { ScreenSizeTokens } from "../../screen-size-tokens";
import { MathsCalc } from "./maths-calc";

describe("MathsCalc", () => {
  const mathsCalc = new MathsCalc();

  describe("mathsCalc", () => {
    it("should format tokens as expected", () => {
      const tokens = new BrandTokens([
        new ScreenSizeTokens(
          [
            { name: "--global-prop1", value: "value1" },
            { name: "--global-prop2", value: "value1 value2" },
            { name: "--global-prop3", value: "value1 * value2" },
            { name: "--global-prop4", value: "value1 / value2" },
            { name: "--global-prop5", value: "value1 + value2" },
            { name: "--global-prop6", value: "value1 - value2" },
            { name: "--global-prop7", value: "value1 * value2 + value3" },
            { name: "--global-prop8", value: "value1 * value2 value3" },
            { name: "--global-prop9", value: "(value1 + value2) * value3" },
            { name: "--global-typography1", value: "900 clamp( 2rem , 1rem + 2vw , 4rem ) / 1.25 'Sage Headline'"},
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-prop1",
                value: "var(--global-prop1)",
              },
              {
                name: "--badge-prop2",
                value: "var(--global-prop1) * 2",
              },
              {
                name: "--badge-prop3",
                value: "var(--global-prop1) / 2",
              },
              {
                name: "--badge-prop4",
                value: "var(--global-prop1) + 2",
              },
              {
                name: "--badge-prop5",
                value: "var(--global-prop1) - 2",
              },
            ],
          }
        ),
        new ScreenSizeTokens(
          [
            { name: "--global-size-breakpoint-min-width", value: "1024px" },
            { name: "--global-prop1", value: "value1" },
            { name: "--global-prop2", value: "value1 value2" },
            { name: "--global-prop3", value: "value1 * value2" },
            { name: "--global-prop4", value: "value1 / value2" },
            { name: "--global-prop5", value: "value1 + value2" },
            { name: "--global-prop6", value: "value1 - value2" },
            { name: "--global-prop7", value: "value1 * value2 + value3" },
            { name: "--global-prop8", value: "value1 * value2 value3" },
            { name: "--global-prop9", value: "(value1 + value2) * value3" },
            { name: "--global-typography1", value: "900 clamp( 2rem , 1rem + 2vw , 4rem ) / 1.25 'Sage Headline'"},
          ],
          [],
          [],
          {
            badge: [
              {
                name: "--badge-prop1",
                value: "var(--global-prop1)",
              },
              {
                name: "--badge-prop2",
                value: "var(--global-prop1) * 2",
              },
              {
                name: "--badge-prop3",
                value: "var(--global-prop1) / 2",
              },
              {
                name: "--badge-prop4",
                value: "var(--global-prop1) + 2",
              },
              {
                name: "--badge-prop5",
                value: "var(--global-prop1) - 2",
              },
            ],
          }
        ),
      ]);

      const result = mathsCalc.formatTokens(tokens);
      expect(result).to.deep.equal({
        context: "product",
        screenSizes: [
          {
            global: [
              { name: "--global-prop1", value: "value1" },
              { name: "--global-prop2", value: "value1 value2" },
              { name: "--global-prop3", value: "calc(value1 * value2)" },
              { name: "--global-prop4", value: "calc(value1 / value2)" },
              { name: "--global-prop5", value: "calc(value1 + value2)" },
              { name: "--global-prop6", value: "calc(value1 - value2)" },
              { name: "--global-prop7", value: "calc(value1 * value2 + value3)" },
              { name: "--global-prop8", value: "calc(value1 * value2) value3" },
              { name: "--global-prop9", value: "calc((value1 + value2) * value3)" },
              { name: "--global-typography1", value: "900 calc(clamp( 2rem , calc(1rem + 2vw) , 4rem ) / 1.25) 'Sage Headline'"},
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-prop1",
                  value: "var(--global-prop1)",
                },
                {
                  name: "--badge-prop2",
                  value: "calc(var(--global-prop1) * 2)",
                },
                {
                  name: "--badge-prop3",
                  value: "calc(var(--global-prop1) / 2)",
                },
                {
                  name: "--badge-prop4",
                  value: "calc(var(--global-prop1) + 2)",
                },
                {
                  name: "--badge-prop5",
                  value: "calc(var(--global-prop1) - 2)",
                },
              ],
            },
            minBreakpoint: 0,
          },
          {
            global: [
              { name: "--global-prop1", value: "value1" },
              { name: "--global-prop2", value: "value1 value2" },
              { name: "--global-prop3", value: "calc(value1 * value2)" },
              { name: "--global-prop4", value: "calc(value1 / value2)" },
              { name: "--global-prop5", value: "calc(value1 + value2)" },
              { name: "--global-prop6", value: "calc(value1 - value2)" },
              { name: "--global-prop7", value: "calc(value1 * value2 + value3)" },
              { name: "--global-prop8", value: "calc(value1 * value2) value3" },
              { name: "--global-prop9", value: "calc((value1 + value2) * value3)" },
              { name: "--global-typography1", value: "900 calc(clamp( 2rem , calc(1rem + 2vw) , 4rem ) / 1.25) 'Sage Headline'"},
            ],
            light: [],
            dark: [],
            components: {
              badge: [
                {
                  name: "--badge-prop1",
                  value: "var(--global-prop1)",
                },
                {
                  name: "--badge-prop2",
                  value: "calc(var(--global-prop1) * 2)",
                },
                {
                  name: "--badge-prop3",
                  value: "calc(var(--global-prop1) / 2)",
                },
                {
                  name: "--badge-prop4",
                  value: "calc(var(--global-prop1) + 2)",
                },
                {
                  name: "--badge-prop5",
                  value: "calc(var(--global-prop1) - 2)",
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
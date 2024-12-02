import { expect } from "chai";
import { MathsCalc } from "./maths-calc";

describe("MathsCalc", () => {
  const mathsCalc = new MathsCalc();

  describe("mathsCalc", () => {
    it("should format tokens as expected", () => {
      const tokens = [
            { name: "--global-prop1", value: "value1" },
            { name: "--global-prop2", value: "value1 value2" },
            { name: "--global-prop3", value: "value1 * value2" },
            { name: "--global-prop4", value: "value1 / value2" },
            { name: "--global-prop5", value: "value1 + value2" },
            { name: "--global-prop6", value: "value1 - value2" },
            { name: "--global-prop7", value: "value1 * value2 + value3" },
            { name: "--global-prop8", value: "value1 * value2 value3" },
            { name: "--global-prop9", value: "(value1 + value2) * value3" },
            { name: "--global-prop10", value: "(value1 + value2) * (value3 - value4)" },
            { name: "--global-prop11", value: "(value1 + value2) * (value3 - value4) value5 - value6" },
            { name: "--global-typography1", value: "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'"},
            { name: "--global-typography2", value: "400 20px/1 sage-icons"},
          ]

      const result = mathsCalc.formatTokens(tokens);
      expect(result).to.deep.equal(
        [
          { name: "--global-prop1", value: "value1" },
          { name: "--global-prop2", value: "value1 value2" },
          { name: "--global-prop3", value: "calc(value1 * value2)" },
          { name: "--global-prop4", value: "calc(value1 / value2)" },
          { name: "--global-prop5", value: "calc(value1 + value2)" },
          { name: "--global-prop6", value: "calc(value1 - value2)" },
          { name: "--global-prop7", value: "calc(value1 * value2 + value3)" },
          { name: "--global-prop8", value: "calc(value1 * value2) value3" },
          { name: "--global-prop9", value: "calc((value1 + value2) * value3)" },
          { name: "--global-prop10", value: "calc((value1 + value2) * (value3 - value4))" },
          { name: "--global-prop11", value: "calc((value1 + value2) * (value3 - value4)) calc(value5 - value6)" },
          { name: "--global-typography1", value: "900 clamp(2.1588rem, 1.7083rem + 2.2525vw, 4.4113rem)/1.25 'Sage Headline'"},
          { name: "--global-typography2", value: "400 20px/1 sage-icons"},
        ]
      );
    });
  });
});
import { expect } from "chai";
import { CssParser } from "./css-parser";
import { CssProperty } from "./css-parser.types";

describe("CssParser", () => {
  const cssParser = new CssParser();

  it("should parse provided CSS contents", () => {
    const cssContent = `
:root {
    --main-bg-color: #ffffff;
    --main-text-color: #333333; /* Semi-colons(;) don't go in CSS values */
    --main-border-radius: 5px;  /* Colons(:) don't go in CSS values */
    --header-height: 60px; /* Header height */
}`;

    const result: CssProperty[] = cssParser.parseRootVariables(cssContent);
    expect(result).deep.equal([
      { name: "--main-bg-color", value: "#ffffff", fullLine: "--main-bg-color: #ffffff;" },
      { name: "--main-text-color", value: "#333333", fullLine: "--main-text-color: #333333; /* Semi-colons(;) don't go in CSS values */" },
      { name: "--main-border-radius", value: "5px", fullLine: "--main-border-radius: 5px;  /* Colons(:) don't go in CSS values */" },
      { name: "--header-height", value: "60px", fullLine: "--header-height: 60px; /* Header height */" },
    ]);
  });
});

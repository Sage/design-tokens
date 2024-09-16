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
    --main-border-radius: 5px; /* Colons(:) don't go in CSS values */
    --header-height: 60px; /* Header height */
}`;

    const result: CssProperty[] = cssParser.parseRootVariables(cssContent);
    expect(result).deep.equal([
      { name: "--main-bg-color", value: "#ffffff" },
      { name: "--main-text-color", value: "#333333", comment: "/* Semi-colons(;) don't go in CSS values */" },
      { name: "--main-border-radius", value: "5px", comment: "/* Colons(:) don't go in CSS values */" },
      { name: "--header-height", value: "60px", comment: "/* Header height */" },
    ]);
  });

  it("should error when root selector not found", () => {
    const cssContent = `
body {
    --main-bg-color: #ffffff;
    --main-text-color: #333333; /* Semi-colons(;) don't go in CSS values */
    /* Random comment in middle indicating an unexpected input */
    --header-height: 60px; /* Header height */
}`;

    expect(() => cssParser.parseRootVariables(cssContent)).to.throw("Root selector not found");
  });

  it("should error when not outputting expected number of items", () => {
    const cssContent = `
:root {
    --main-bg-color: #ffffff;
    --main-text-color: #333333; /* Semi-colons(;) don't go in CSS values */
    /* Random comment in middle indicating an unexpected input */
    --header-height: 60px; /* Header height */
}`;

    expect(() => cssParser.parseRootVariables(cssContent)).to.throw("Expected 4 items, but got 3");
  });
});

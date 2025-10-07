import { expect } from "chai";
import { CssParser } from "./css-parser.js";
import { CssProperty } from "./css-parser.types.js";

describe("CssParser", () => {
  const cssParser = new CssParser();

  it("should parse provided CSS contents", () => {
    const cssContent = `
:root {
    --main-bg-color: #ffffff;
    --main-text-color: #333333;
    --main-border-radius: 5px;
    --header-height: 60px;
}`;

    const result: CssProperty[] = cssParser.parseRootVariables(cssContent);
    expect(result).deep.equal([
      { name: "--main-bg-color", value: "#ffffff" },
      {
        name: "--main-text-color",
        value: "#333333",
      },
      {
        name: "--main-border-radius",
        value: "5px",
      },
      {
        name: "--header-height",
        value: "60px",
      },
    ]);
  });

  it("should error when root selector not found", () => {
    const cssContent = `
body {
    --main-bg-color: #ffffff;
    --main-text-color: #333333;
    /* Random comment in middle indicating an unexpected input */
    --header-height: 60px;
}`;

    expect(() => cssParser.parseRootVariables(cssContent)).to.throw(
      "Root selector not found"
    );
  });

  it("should error when not outputting expected number of items", () => {
    const cssContent = `
:root {
    --main-bg-color: #ffffff;
    --main-text-color: #333333;
    /* Random comment in middle indicating an unexpected input */
    --header-height: 60px;
}`;

    expect(() => cssParser.parseRootVariables(cssContent)).to.throw(
      "Expected 4 items, but got 3"
    );
  });

  it("should error when duplicate tokens are provided", () => {
    const cssContent = `
:root {
    --main-bg-color: #ffffff;
    --main-text-color: #333333;
    --main-text-color: #333333;
    --main-bg-color: #000000;
    --header-height: 60px;
}`;

    expect(() => cssParser.parseRootVariables(cssContent)).to.throw(
      "Duplicate tokens found: --main-text-color, --main-bg-color"
    );
  });
});

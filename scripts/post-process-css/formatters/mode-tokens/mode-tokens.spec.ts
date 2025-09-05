import { expect } from "chai";
import { ModeTokens } from "./mode-tokens.js";

describe("ModeTokens", () => {
  it("should return an instance from properties provided", () => {
    const globalTokens = [
      { name: "--global-color", value: "#ffffff" },
      { name: "--global-bg", value: "#000000" },
    ];
    const lightTokens = [
      { name: "--light-color", value: "#111111" },
    ];
    const darkTokens = [
      { name: "--dark-color", value: "#222222" },
    ];
    const componentTokens = {
      foo: [
        { name: "--foo-bg", value: "#ff0000" },
      ],
      bar: [
        { name: "--bar-border", value: "1px solid #cccccc" },
      ],
    };

    const modeTokens = new ModeTokens(
      globalTokens,
      lightTokens,
      darkTokens,
      componentTokens
    );

    expect(modeTokens.global).to.deep.equal(globalTokens);
    expect(modeTokens.light).to.deep.equal(lightTokens);
    expect(modeTokens.dark).to.deep.equal(darkTokens);
    expect(modeTokens.components).to.deep.equal(componentTokens);
  });


  it("should correctly identify if it has tokens", () => {
    const emptyModeTokens = new ModeTokens([], [], [], {});
  
    expect(emptyModeTokens.hasTokens).to.be.false;
  });

  it("should correctly identify if it has tokens", () => {
    const nonEmptyModeTokens = new ModeTokens(
      [{ name: "--some-token", value: "value" }],
      [],
      [],
      {}
    );
    expect(nonEmptyModeTokens.hasTokens).to.be.true;
  });

  it("should convert to string correctly when token set passed", () => {
    const modeTokens = new ModeTokens(
      [
        { name: "--global-color", value: "#ffffff" },
        { name: "--global-bg", value: "#000000" },
      ],
      [{ name: "--light-color", value: "#111111" }],
      [{ name: "--dark-color", value: "#222222" }],
      {
        foo: [{ name: "--foo-bg", value: "#ff0000" }],
        bar: [{ name: "--bar-border", value: "1px solid #cccccc" }],
      }
    );

    const result = modeTokens.toString();
    const expected = `:root {
  --global-color: #ffffff;
  --global-bg: #000000;
  --light-color: #111111;
  --foo-bg: #ff0000;
  --bar-border: 1px solid #cccccc;
}

@media (prefers-color-scheme: dark) {
  :root {
    --dark-color: #222222;
  }
}`;

    expect(result).to.equal(expected);
  });

  it("should convert to string correctly when no tokens provided", () => {
    const modeTokens = new ModeTokens([], [], [], {});

    const result = modeTokens.toString();
    const expected = "";

    expect(result).to.equal(expected);
  });
});
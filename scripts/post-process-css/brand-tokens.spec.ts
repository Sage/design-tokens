import { expect } from "chai";
import { BrandTokens } from "./brand-tokens";
import { ScreenSizeTokens } from "./screen-size-tokens";

describe("BrandTokens", () => {
  describe("toString", () => {
    const sizeTokens = new ScreenSizeTokens(
      [
        {
          name: "--global-prop1",
          value: "value1",
        },
        {
          name: "--global-prop2",
          value: "value2",
          comment: "/* Some comment */",
        },
      ],
      [
        {
          name: "--prop1-light",
          value: "value1",
          comment: "/* Some comment */",
        },
        {
          name: "--prop2-light",
          value: "value2",
        },
      ],
      [
        {
          name: "--prop1-dark",
          value: "value1",
        },
        {
          name: "--prop2-dark",
          value: "value2",
        },
      ],
      {
        badge: [
          {
            name: "--badge-prop1",
            value: "badge-value1",
          },
          {
            name: "--badge-prop2",
            value: "badge-value2",
          },
        ],
        button: [
          {
            name: "--button-prop1",
            value: "button-value1",
          },
          {
            name: "--button-prop2",
            value: "button-value2",
            comment: "/* Some comment */",
          },
        ],
      }
    );

    const expectedSingleSizeTokenResult = `:root {
  /* Global tokens */
  --global-prop1: value1;
  --global-prop2: value2; /* Some comment */

  /* Light mode tokens */
  --prop1-light: value1; /* Some comment */
  --prop2-light: value2;

  /* Dark mode tokens */
  --prop1-dark: value1;
  --prop2-dark: value2;

  /* badge component tokens */
  --badge-prop1: badge-value1;
  --badge-prop2: badge-value2;

  /* button component tokens */
  --button-prop1: button-value1;
  --button-prop2: button-value2; /* Some comment */
}
`;

    it("should return expected string when provided no tokens", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], [], [], {}),
        new ScreenSizeTokens([], [], [], {})
      );

      const result = tokens.toString();
      expect(result).to.be.empty;
    });

    it("should return expected string when only provided small tokens", () => {
      const tokens = new BrandTokens(
        sizeTokens,
        new ScreenSizeTokens([], [], [], {})
      );

      const result = tokens.toString();
      expect(result).to.equal(expectedSingleSizeTokenResult);
    });

    it("should return expected string when only provided large tokens", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], [], [], {}),
        sizeTokens
      );

      const result = tokens.toString();
      expect(result).to.equal(expectedSingleSizeTokenResult);
    });

    it("should return expected string when provided fully populated object", () => {
      const tokens = new BrandTokens(sizeTokens, sizeTokens);

      const result = tokens.toString();
      expect(result).to.equal(
        `${expectedSingleSizeTokenResult}
@media (width > 1024px) {
  :root {
    /* Global tokens */
    --global-prop1: value1;
    --global-prop2: value2; /* Some comment */

    /* Light mode tokens */
    --prop1-light: value1; /* Some comment */
    --prop2-light: value2;

    /* Dark mode tokens */
    --prop1-dark: value1;
    --prop2-dark: value2;

    /* badge component tokens */
    --badge-prop1: badge-value1;
    --badge-prop2: badge-value2;

    /* button component tokens */
    --button-prop1: button-value1;
    --button-prop2: button-value2; /* Some comment */
  }
}
`
      );
    });

    it("should return expected string with only light tokens", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens(
          [],
          [
            {
              name: "--prop1-light",
              value: "value1",
            },
            {
              name: "--prop2-light",
              value: "value2",
            },
          ],
          [],
          {}
        ),
        new ScreenSizeTokens([], [], [], {})
      );

      const result = tokens.toString();
      expect(result).to.equal(
        `:root {
  /* Light mode tokens */
  --prop1-light: value1;
  --prop2-light: value2;
}
`
      );
    });

    it("should return expected string with only one component", () => {
      const tokens = new BrandTokens(
        new ScreenSizeTokens([], [], [], {}),
        new ScreenSizeTokens([], [], [], {
          accordion: [],
          badge: [
            {
              name: "--prop1",
              value: "value1",
            },
          ],
          button: [],
        })
      );

      const result = tokens.toString();
      expect(result).to.equal(
        `:root {
  /* badge component tokens */
  --prop1: value1;
}
`
      );
    });
  });
});
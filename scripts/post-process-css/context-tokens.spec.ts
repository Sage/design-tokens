import { expect } from "chai";
import { ContextTokens } from "./context-tokens.js";
import { ScreenSizeTokens } from "./screen-size-tokens.js";

describe("ContextTokens", () => {
  describe("constructor", () => {
    it("should throw an error when provided a non-supported context name", () => {
      expect(
        () =>
          new ContextTokens("NOT_SUPPORTED", [
            new ScreenSizeTokens([], [], [], {}),
          ])
      ).to.throw("NOT_SUPPORTED is not an expected context name");
    });

    it("should not throw an error when zero min-width screen size is available", () => {
      expect(
        () =>
          new ContextTokens("product", [
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "0" }],
              [],
              [],
              {}
            ),
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "1024px" }],
              [],
              [],
              {}
            ),
          ])
      ).to.not.throw();
    });

    it("should not throw an error when undefined screen size size is available", () => {
      expect(
        () =>
          new ContextTokens("product", [
            new ScreenSizeTokens(
              [{ name: "--title-color", value: "#FFFFFF" }],
              [],
              [],
              {}
            ),
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "1024px" }],
              [],
              [],
              {}
            ),
          ])
      ).to.not.throw();
    });

    it("should throw an error when no screen sizes provided with zero min-width or undefined breakpoint", () => {
      expect(
        () =>
          new ContextTokens("product", [
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "1024px" }],
              [],
              [],
              {}
            ),
          ])
      ).to.throw(
        "Context tokens must have at least one set of screen size tokens with zero min-width breakpoint"
      );
    });

    it("should throw an error when duplicate min-width screen size breakpoints are provided", () => {
      expect(
        () =>
          new ContextTokens("product", [
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "1024px" }],
              [],
              [],
              {}
            ),
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "728px" }],
              [],
              [],
              {}
            ),
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "1024px" }],
              [],
              [],
              {}
            ),
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "728px" }],
              [],
              [],
              {}
            ),
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "" }],
              [],
              [],
              {}
            ),
            new ScreenSizeTokens(
              [{ name: "--global-size-breakpoint-min-width", value: "980px" }],
              [],
              [],
              {}
            ),
          ])
      ).to.throw("Duplicate min-width breakpoints found: 1024, 728");
    });
  });

  describe("toString", () => {
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
      const tokens = new ContextTokens("product", []);

      const result = tokens.toString();
      expect(result).to.be.empty;
    });

    it("should return expected string when provided no useful tokens", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens(
          [
            {
              name: "--global-size-breakpoint-min-width",
              value: `0`,
            },
          ],
          [],
          [],
          {}
        ),
        new ScreenSizeTokens(
          [
            {
              name: "--global-size-breakpoint-min-width",
              value: `1024px`,
            },
          ],
          [],
          [],
          {}
        ),
      ]);

      const result = tokens.toString();
      expect(result).to.be.empty;
    });

    it("should return expected string when only provided small tokens", () => {
      const tokens = new ContextTokens("product", [generateScreenSizeTokens()]);

      const result = tokens.toString();
      expect(result).to.equal(expectedSingleSizeTokenResult);
    });

    it("should return expected string when only provided large tokens", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens([], [], [], {}),
        generateScreenSizeTokens(1024),
      ]);

      const result = tokens.toString();
      expect(result).to.equal(expectedSingleSizeTokenResult);
    });

    it("should return expected string when provided fully populated object", () => {
      const tokens = new ContextTokens("product", [
        generateScreenSizeTokens(1024),
        generateScreenSizeTokens(0),
      ]);

      const result = tokens.toString();
      expect(result).to.equal(
        `${expectedSingleSizeTokenResult}
@media (width >= 1024px) {
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
      const tokens = new ContextTokens("product", [
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
      ]);

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

    it("should return expected string with only one screen size", () => {
      const tokens = new ContextTokens("product", [
        new ScreenSizeTokens([], [], [], {
          accordion: [],
          badge: [
            {
              name: "--prop1",
              value: "value1",
            },
          ],
          button: [],
        }),
      ]);

      const result = tokens.toString();
      expect(result).to.equal(
        `:root {
  /* badge component tokens */
  --prop1: value1;
}
`
      );
    });

    function generateScreenSizeTokens(
      minWidthBreakpoint: number = 0
    ): ScreenSizeTokens {
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
          {
            name: "--global-size-breakpoint-min-width",
            value: `${minWidthBreakpoint}px`,
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

      return sizeTokens;
    }
  });
});

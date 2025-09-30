import { expect } from "chai";
import { ModeTokens } from "../../formatters/index.js";
import { AllDefinedValidator } from "./all-defined-validator.js";

describe("AllDefinedValidator", () => {
  let validator: AllDefinedValidator;

  beforeEach(() => {
    validator = new AllDefinedValidator();
  });

  describe("validate", () => {
    it("should not error when all tokens are defined", () => {
      const tokens = new ModeTokens(
        [
          { name: "--color-white", value: "#ffffff" },
          { name: "--color-black", value: "#000000" },
        ],
        [{ name: "--color-primary", value: "var(--color-black)" }],
        [{ name: "--color-primary", value: "var(--color-white)" }],
        { link: [{ name: "--link-color", value: "var(--color-primary)" }] }
      );
      expect(() => validator.validate(tokens)).not.to.throw();
    });

    it("should not error when tokens are defined in earlier components", () => {
      const tokens = new ModeTokens([], [], [], {
        container: [
          { name: "--container-size-fluid-items-xs", value: "128px" },
        ],
        popover: [
          {
            name: "--popover-size-menu-minwidth-m",
            value: "var(--container-size-fluid-items-xs)",
          },
        ],
      });
      expect(() => validator.validate(tokens)).not.to.throw();
    });

    it("should error when tokens are defined in later components", () => {
      const tokens = new ModeTokens([], [], [], {
        container: [{ name: "--container-size-fluid-items-m", value: "128px" }],
        datavis: [
          {
            name: "--datavis-size",
            value: "var(--container-size-fluid-items-xs)",
          },
        ],
      });
      expect(() => validator.validate(tokens)).to.throw(
        "--container-size-fluid-items-xs not set anywhere in the CSS output"
      );
    });

    it("should error when a dark token value is missing", () => {
      const tokens = new ModeTokens(
        [{ name: "--color-white", value: "#ffffff" }],
        [{ name: "--color-primary", value: "var(--color-black)" }],
        [{ name: "--color-primary", value: "var(--color-white)" }],
        { link: [{ name: "--link-color", value: "var(--color-primary)" }] }
      );
      expect(() => validator.validate(tokens)).to.throw(
        "--color-black not set anywhere in the CSS output"
      );
    });

    it("should error when a component value is missing", () => {
      const tokens = new ModeTokens([], [], [], {
        link: [{ name: "--link-color", value: "var(--color-primary)" }],
      });
      expect(() => validator.validate(tokens)).to.throw(
        "--color-primary not set anywhere in the CSS output"
      );
    });
  });
});

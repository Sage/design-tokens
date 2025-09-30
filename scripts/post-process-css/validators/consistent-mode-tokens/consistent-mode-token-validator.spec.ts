import { expect } from "chai";
import { ModeTokens } from "../../formatters/index.js";
import { ConsistentModeTokenValidator } from "./consistent-mode-token-validator.js";

describe("ConsistentModeTokenValidator", () => {
  let validator: ConsistentModeTokenValidator;

  beforeEach(() => {
    validator = new ConsistentModeTokenValidator();
  });

  describe("validate", () => {
    it("should not error when empty", () => {
      const tokens = new ModeTokens([], [], [], {});
      expect(() => validator.validate(tokens)).not.to.throw();
    });

    it("should error when light mode is missing a token", () => {
      const tokens = new ModeTokens(
        [],
        [],
        [{ name: "--color-primary", value: "var(--color-white)" }],
        {}
      );
      expect(() => validator.validate(tokens)).to.throw('The following tokens are not defined in both light and dark modes: --color-primary');
    });

    it("should error when dark mode is missing a token", () => {
      const tokens = new ModeTokens(
        [],
        [{ name: "--color-primary", value: "var(--color-black)" }],
        [],
        {}
      );
      expect(() => validator.validate(tokens)).to.throw('The following tokens are not defined in both light and dark modes: --color-primary');
    });
  });
});

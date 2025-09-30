import { ModeTokens } from "../formatters/index.js";

export interface Component {
  validate(contents: ModeTokens): ModeTokens;
}

export class Decorator implements Component {
  constructor(protected component?: Component) {
    this.component = component;
  }

  /**
   *
   * @param tokens The tokens being validated.
   * @returns Validated tokens.
   */
  public validate(tokens: ModeTokens): ModeTokens {
    if (this.component === undefined) {
      return tokens;
    }

    return this.component.validate(tokens);
  }
}
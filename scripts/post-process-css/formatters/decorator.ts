import { ModeTokens } from "./mode-tokens/mode-tokens.js";

export interface Component {
  formatTokens(contents: ModeTokens): ModeTokens;
}

export class Decorator implements Component {
  constructor(protected component?: Component) {
    this.component = component;
  }

  /**
   *
   * @param tokens The tokens being modified.
   * @returns Formatted tokens.
   */
  public formatTokens(tokens: ModeTokens): ModeTokens {
    if (this.component === undefined) {
      return tokens;
    }

    return this.component.formatTokens(tokens);
  }
}

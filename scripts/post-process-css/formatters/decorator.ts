import { ContextTokens } from "../context-tokens";

export interface Component {
  formatTokens(contents: ContextTokens): ContextTokens;
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
  public formatTokens(tokens: ContextTokens): ContextTokens {
    if (this.component === undefined) {
      return tokens;
    }

    return this.component.formatTokens(tokens);
  }
}

import { BrandTokens } from "../brand-tokens";

export interface Component {
  formatTokens(contents: BrandTokens): BrandTokens;
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
  public formatTokens(tokens: BrandTokens): BrandTokens {
    if (this.component === undefined) {
      return tokens;
    }

    return this.component.formatTokens(tokens);
  }
}

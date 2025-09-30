import { ModeTokens } from "../../formatters/index.js";
import { getSymetricalDifference } from "../../helpers.js";
import { Decorator } from "../decorator.js";

export class ConsistentModeTokenValidator extends Decorator {
  public override validate(tokens: ModeTokens): ModeTokens {
    const difference = getSymetricalDifference(
      tokens.light.map((x) => x.name),
      tokens.dark.map((x) => x.name)
    );

    if (difference.length > 0)
      throw (
        "The following tokens are not defined in both light and dark modes: " +
        difference.join(", ")
      );

    return super.validate(tokens);
  }
}

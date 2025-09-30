import { ModeTokens } from "../../formatters/index.js";
import { Decorator } from "../decorator.js";

export class AllDefinedValidator extends Decorator {
  public override validate(tokens: ModeTokens): ModeTokens {
    const cssOutput = tokens.toString();

    const allReferencedVariables = new Set(
      this.extractTokenReferences(cssOutput)
    );

    allReferencedVariables.forEach((variableName) => {
      const variableUsed = `var(${variableName})`;
      const propertyInit = `${variableName}:`;

      const propertyInitIndex = cssOutput.indexOf(propertyInit);
      if (propertyInitIndex === -1)
        throw `${variableName} not set anywhere in the CSS output`;

      // Find all occurrences of variable used in the CSS output
      const variableUsedIndexes: number[] = [];
      let startIndex = 0;
      while (true) {
        const index = cssOutput.indexOf(variableUsed, startIndex);
        if (index === -1) break;
        variableUsedIndexes.push(index);
        startIndex = index + variableUsed.length;
      }

      const allPropertiesUsedAfterInit = variableUsedIndexes.every(
        (idx) => idx > propertyInitIndex
      );

      if (!allPropertiesUsedAfterInit)
        throw new Error(
          `${variableName} used before being set in the CSS output.`
        );
    });

    return super.validate(tokens);
  }

  private extractTokenReferences(tokenValue: string): string[] {
    const tokenReferences = Array.from(
      tokenValue.matchAll(/var\(\s*(--[\w-]+)\s*\)/g),
      (m) => m[1]
    ).filter((value): value is string => !!value);

    return tokenReferences;
  }
}

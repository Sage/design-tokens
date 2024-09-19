import { type CssProperty } from "./css-parser.types";

export class CssParser {
  public parseRootVariables(cssContent: string): CssProperty[] {
    const cssProperties: CssProperty[] = [];

    // Match the :root block
    const rootMatch = cssContent.match(/:root\s*{([^}]+)}/);

    if (!rootMatch || !rootMatch[1]) {
      throw new Error("Root selector not found");
    }

    // Extract individual property lines including comments
    const lines = rootMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    for (const fullLine of lines) {
      const colonSplit = fullLine.split(":");
      const name = colonSplit[0];

      if (!name) continue;

      if (!colonSplit[1]) continue;

      const semiColonSplit = colonSplit.slice(1).join(":").split(";");
      const value = semiColonSplit[0]?.trim();

      if (!value) continue;

      const comment = semiColonSplit.slice(1).join(";").trim();

      // Sanity check
      const expectedLine = `${name}: ${value};${comment ? ` ${comment}` : ""}`;
      if (fullLine !== expectedLine) {
        throw new Error(
          `Expected concatenation to equal "${fullLine}", but found: "${expectedLine}"`
        );
      }

      const cssProp: CssProperty = {
        name,
        value,
      };

      if (comment) {
        cssProp.comment = comment;
      }

      cssProperties.push(cssProp);
    }

    // Sanity check
    if (cssProperties.length !== lines.length) {
      throw new Error(
        `Expected ${lines.length} items, but got ${cssProperties.length}`
      );
    }

    const duplicateTokens = this.findDuplicates(
      cssProperties.map((p) => p.name)
    );
    if (duplicateTokens.length > 0) {
      throw new Error(`Duplicate tokens found: ${duplicateTokens.join(", ")}`);
    }

    return cssProperties;
  }

  private findDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const item of arr) {
      if (seen.has(item)) {
        duplicates.push(item);
      } else {
        seen.add(item);
      }
    }

    return duplicates;
  }
}

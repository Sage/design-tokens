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

      const value = colonSplit[1]?.split(";")[0]?.trim();

      if (!value) continue;

      cssProperties.push({
        name,
        value,
        fullLine,
      });
    }

    // Sanity check
    if (cssProperties.length !== lines.length) {
      throw new Error(
        `Expected ${lines.length} items, but got ${cssProperties.length}`
      );
    }

    return cssProperties;
  }
}

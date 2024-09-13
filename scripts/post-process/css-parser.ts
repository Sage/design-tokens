import { type CssProperty } from "./css-parser.types";

export class CssParser {
  public parseRootVariables(cssContent: string): CssProperty[] {
    const cssProperties: CssProperty[] = [];

    // Match the :root block
    const rootMatch = cssContent.match(/:root\s*{([^}]+)}/);

    if (rootMatch && rootMatch[1]) {
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

      //   lines.forEach((fullLine) => {
      //     // Remove comments for name and value extraction
      //     const lineWithoutComments = fullLine
      //       .split("//")[0]
      //       .trim() // Remove line comments (single-line comments)
      //       .replace(/\/\*.*?\*\//g, "")
      //       .trim(); // Remove block comments

      //     const [name, value] = lineWithoutComments
      //       .split(":")
      //       .map((part) => part.trim());

      //     if (name && value) {
      //       cssProperties.push({
      //         name,
      //         value,
      //         fullLine,
      //       });
      //     }
      //   });
    }

    return cssProperties;
  }
}

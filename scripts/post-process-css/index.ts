import * as fs from "fs";
import * as path from "path";

import { CssProperty } from "./css-parser/css-parser.types";
import { CssParser } from "./css-parser/css-parser";

interface Tokens {
  large: ScreenSizeTokens;
  small: ScreenSizeTokens;
}

interface ScreenSizeTokens {
  global: CssProperty[];
  dark: CssProperty[];
  light: CssProperty[];
  components: Record<string, CssProperty[]>;
}

const cssParser = new CssParser();

// Loop through token contexts
const cssDistPath = path.join(__dirname, "../../dist/css");
fs.readdirSync(cssDistPath).forEach((file) => {
  const largeTokens = getScreenSizeTokens(
    path.join(cssDistPath, file),
    "large"
  );
  const smallTokens = getScreenSizeTokens(
    path.join(cssDistPath, file),
    "small"
  );

  writeCombinedCssFile(file, smallTokens, largeTokens);
});

function writeCombinedCssFile(
  file: string,
  smallTokens: ScreenSizeTokens,
  largeTokens: ScreenSizeTokens
) {
  const lines: string[] = [];
  lines.push(...getTokenLines(smallTokens));

  lines.push("");
  lines.push("@media (width > 1024px) {"); // Perhaps this value should be a token to allow control from XD team?
  lines.push(...getTokenLines(largeTokens, 2));
  lines.push("}");

  fs.writeFileSync(path.join(cssDistPath, file, "all.css"), lines.join("\n"));
}

function getTokenLines(smallTokens: ScreenSizeTokens, level: number = 1) {
  const space = "  ";
  const tokenSpace = space.repeat(level);

  const lines: string[] = [];
  lines.push(`${space.repeat(level - 1)}:root {`);
  lines.push(`${tokenSpace}/* Global tokens */`);
  lines.push(
    smallTokens.global
      .map((p) => `${tokenSpace}${p.name}: ${p.value};`)
      .join("\n")
  );

  lines.push("");
  lines.push(`${tokenSpace}/* Light mode tokens */`);
  lines.push(
    smallTokens.light
      .map((p) => `${tokenSpace}${p.name}: ${p.value};`)
      .join("\n")
  );

  lines.push("");
  lines.push(`${tokenSpace}/* Dark mode tokens */`);
  lines.push(
    smallTokens.dark
      .map((p) => `${tokenSpace}${p.name}: ${p.value};`)
      .join("\n")
  );

  Object.keys(smallTokens.components).forEach((component) => {
    if (smallTokens.components[component]) {
      lines.push("");
      lines.push(`${tokenSpace}/* ${component} component tokens */`);
      lines.push(
        smallTokens.components[component]
          .map((p) => `${tokenSpace}${p.name}: ${p.value};`)
          .join("\n")
      );
    }
  });
  lines.push("}");

  return lines;
}

function getScreenSizeTokens(
  basePath: string,
  screenSize: "large" | "small"
): ScreenSizeTokens {
  const getFileContents = (file: string) =>
    fs.readFileSync(path.join(basePath, screenSize, file), "utf8");

  const globalContents = getFileContents("global.css");
  const darkContents = getFileContents("dark.css");
  const lightContents = getFileContents("light.css");

  const components: Record<string, CssProperty[]> = {};
  fs.readdirSync(path.join(basePath, screenSize, "components")).forEach(
    (file) => {
      const fileName = path.basename(file, path.extname(file));
      const componentContents = getFileContents(`components/${file}`);
      components[fileName] = cssParser.parseRootVariables(componentContents);
    }
  );

  return {
    global: cssParser.parseRootVariables(globalContents),
    dark: cssParser.parseRootVariables(darkContents),
    light: cssParser.parseRootVariables(lightContents),
    components: components,
  };
}

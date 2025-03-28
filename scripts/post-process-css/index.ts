import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

import { CssProperty } from "./css-parser/css-parser.types.js";
import { CssParser } from "./css-parser/css-parser.js";
import { ScreenSizeTokens } from "./screen-size-tokens.js";
import { ContextTokens } from "./context-tokens.js";
import {
  ConsolidateScreenSizes,
  FilterTypographyTokens,
  LightDarkModeFormatter,
  MathsCalc
} from "./formatters/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssParser = new CssParser();

// Loop through token contexts
const cssDistPath = path.join(__dirname, "../../dist/css");

fs.readdirSync(cssDistPath, { recursive: true, withFileTypes: true }).filter((file) => {
  return /^(?!all\.css$)[\w,\s-]+\.css$/.test(file.name)
}).forEach((file) => {
  const space = "  ";
  const maths = new MathsCalc()

  const contents = fs.readFileSync(path.join(file.path, file.name), "utf8")
  const tokens = maths.formatTokens(cssParser.parseRootVariables(contents))

  const lines: string[] = [];
  lines.push(`:root {`);

  if (tokens.length > 0) {
    lines.push(
      tokens
        .map(
          (p) =>
            `${space}${p.name}: ${p.value};${
              p.comment ? ` ${p.comment}` : ""
            }`
        )
        .join("\n")
    );
  }

  lines.push(`}`);
  lines.push("");

  fs.writeFileSync(path.join(file.path, file.name), lines.join("\n"));
})


fs.readdirSync(cssDistPath).forEach((contextName) => {
  const screenSizeTokens: ScreenSizeTokens[] = [];

  fs.readdirSync(path.join(cssDistPath, contextName)).forEach((screenSize) => {
    if (
      !fs
        .statSync(path.join(cssDistPath, contextName, screenSize))
        .isDirectory()
    )
      return;

    screenSizeTokens.push(
      getScreenSizeTokens(path.join(cssDistPath, contextName), screenSize)
    );
  });

  const tokens = new ContextTokens(contextName, screenSizeTokens);

  const consolidateScreenSizes = new ConsolidateScreenSizes();
  const lightDarkModeFormatter = new LightDarkModeFormatter(
    consolidateScreenSizes
  );
  const filterAdaptiveTypography = new FilterTypographyTokens(
    lightDarkModeFormatter
  );
  const formattedTokens = filterAdaptiveTypography.formatTokens(tokens);

  writeCombinedCssFile(contextName, formattedTokens);

  fs.copyFileSync(
    path.join(__dirname, "../../docs/usage/index.html"),
    path.join(cssDistPath, contextName, "index.html")
  );
});

function writeCombinedCssFile(file: string, tokens: ContextTokens) {
  fs.writeFileSync(path.join(cssDistPath, file, "all.css"), tokens.toString());
}

function getScreenSizeTokens(
  basePath: string,
  screenSize: string
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

  return new ScreenSizeTokens(
    cssParser.parseRootVariables(globalContents),
    cssParser.parseRootVariables(lightContents),
    cssParser.parseRootVariables(darkContents),
    components
  );
}

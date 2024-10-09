import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

import { CssProperty } from "./css-parser/css-parser.types.js";
import { CssParser } from "./css-parser/css-parser.js";
import { ScreenSizeTokens } from "./screen-size-tokens.js";
import { BrandTokens } from "./brand-tokens.js";
import { ConsolidateScreenSizes } from "./formatters/consolidate-screen-sizes/consolidate-screen-sizes.js";
import { LightDarkModeFormatter } from "./formatters/light-dark-mode/light-dark-mode-formatter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssParser = new CssParser();

// Loop through token contexts
const cssDistPath = path.join(__dirname, "../../dist/css");
fs.readdirSync(cssDistPath).forEach((file) => {
  const screenSizeTokens: ScreenSizeTokens[] = [];

  fs.readdirSync(path.join(cssDistPath, file)).forEach((screenSize) => {
    if (!fs.statSync(path.join(cssDistPath, file, screenSize)).isDirectory())
      return;

    screenSizeTokens.push(
      getScreenSizeTokens(path.join(cssDistPath, file), screenSize)
    );
  });

  const tokens = new BrandTokens(screenSizeTokens);

  const consolidateScreenSizes = new ConsolidateScreenSizes();
  const lightDarkModeFormatter = new LightDarkModeFormatter(
    consolidateScreenSizes
  );
  const formattedTokens = lightDarkModeFormatter.formatTokens(tokens);

  writeCombinedCssFile(file, formattedTokens);

  fs.copyFileSync(
    path.join(__dirname, "../../docs/usage/index.html"),
    path.join(cssDistPath, file, "index.html")
  );
});

function writeCombinedCssFile(file: string, tokens: BrandTokens) {
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

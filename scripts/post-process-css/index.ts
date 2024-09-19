import * as fs from "fs";
import * as path from "path";

import { CssProperty } from "./css-parser/css-parser.types";
import { CssParser } from "./css-parser/css-parser";
import { ScreenSizeTokens } from "./screen-size-tokens";
import { BrandTokens } from "./brand-tokens";
import { ConsolidateScreenSizes } from "./formatters/consolidate-screen-sizes/consolidate-screen-sizes";
import { LightDarkModeFormatter } from "./formatters/light-dark-mode/light-dark-mode-formatter";

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

import * as fs from "fs";
import * as path from "path";

import { CssProperty } from "./css-parser/css-parser.types";
import { CssParser } from "./css-parser/css-parser";
import { ScreenSizeTokens } from "./screen-size-tokens";
import { BrandTokens } from "./brand-tokens";
import { ConsolidateScreenSizes } from "./formatters/consolidate-screen-sizes/consolidate-screen-sizes";

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

  const tokens = new BrandTokens(smallTokens, largeTokens);
  
  const consolidateScreenSizes = new ConsolidateScreenSizes();
  const formattedTokens = consolidateScreenSizes.formatTokens(tokens);

  writeCombinedCssFile(file, formattedTokens);
});

function writeCombinedCssFile(file: string, tokens: BrandTokens) {
  fs.writeFileSync(path.join(cssDistPath, file, "all.css"), tokens.toString());
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

  return new ScreenSizeTokens(
    cssParser.parseRootVariables(globalContents),
    cssParser.parseRootVariables(lightContents),
    cssParser.parseRootVariables(darkContents),
    components
  );
}

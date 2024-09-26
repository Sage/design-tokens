import * as fs from "fs";
import * as path from "path";

import { CssProperty } from "./css-parser/css-parser.types";
import { CssParser } from "./css-parser/css-parser";
import { ScreenSizeTokens } from "./screen-size-tokens";
import { BrandTokens } from "./brand-tokens";
import {
  ConsolidateScreenSizes,
  FilterAdaptiveTypography,
  LightDarkModeFormatter,
} from "./formatters/";

const VALID_BRAND_NAMES = ["frozenproduct", "marketing", "product"] as const;
type BrandName = (typeof VALID_BRAND_NAMES)[number];
const cssParser = new CssParser();

// Loop through token contexts
const cssDistPath = path.join(__dirname, "../../dist/css");
fs.readdirSync(cssDistPath).forEach((brandName) => {
  if (!isValidBrandName(brandName))
    throw new Error(`${brandName} is not an expected brand name`);

  const screenSizeTokens: ScreenSizeTokens[] = [];

  fs.readdirSync(path.join(cssDistPath, brandName)).forEach((screenSize) => {
    if (
      !fs.statSync(path.join(cssDistPath, brandName, screenSize)).isDirectory()
    )
      return;

    screenSizeTokens.push(
      getScreenSizeTokens(path.join(cssDistPath, brandName), screenSize)
    );
  });

  const tokens = new BrandTokens(screenSizeTokens);

  const consolidateScreenSizes = new ConsolidateScreenSizes();
  const lightDarkModeFormatter = new LightDarkModeFormatter(
    consolidateScreenSizes
  );

  const filterAdaptiveTypography = new FilterAdaptiveTypography(
    lightDarkModeFormatter
  );

  // For "frozenproduct" we won't remove the adaptive typography for backward compatibility purposes
  const formattedTokens =
    brandName === "frozenproduct"
      ? lightDarkModeFormatter.formatTokens(tokens)
      : filterAdaptiveTypography.formatTokens(tokens);

  writeCombinedCssFile(brandName, formattedTokens);

  fs.copyFileSync(
    path.join(__dirname, "../../docs/usage/index.html"),
    path.join(cssDistPath, brandName, "index.html")
  );
});

function isValidBrandName(value: string): value is BrandName {
  return (VALID_BRAND_NAMES as readonly string[]).includes(value);
}

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

import * as fs from "fs";
import * as path from "path";

import { CssProperty } from "./css-parser/css-parser.types";
import { CssParser } from "./css-parser/css-parser";
import { ScreenSizeTokens } from "./screen-size-tokens";
import { ContextTokens } from "./context-tokens";
import {
  ConsolidateScreenSizes,
  FilterAdaptiveTypography,
  LightDarkModeFormatter,
} from "./formatters/";

const VALID_CONTEXT_NAMES = ["frozenproduct", "marketing", "product"] as const;
type ContextName = (typeof VALID_CONTEXT_NAMES)[number];
const cssParser = new CssParser();

// Loop through token contexts
const cssDistPath = path.join(__dirname, "../../dist/css");
fs.readdirSync(cssDistPath).forEach((contextName) => {
  if (!isValidContextName(contextName))
    throw new Error(`${contextName} is not an expected context name`);

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

  const tokens = new ContextTokens(screenSizeTokens);

  const consolidateScreenSizes = new ConsolidateScreenSizes();
  const lightDarkModeFormatter = new LightDarkModeFormatter(
    consolidateScreenSizes
  );

  const filterAdaptiveTypography = new FilterAdaptiveTypography(
    lightDarkModeFormatter
  );

  // For "frozenproduct" we won't remove the adaptive typography for backward compatibility purposes
  const formattedTokens =
    contextName === "frozenproduct"
      ? lightDarkModeFormatter.formatTokens(tokens)
      : filterAdaptiveTypography.formatTokens(tokens);

  writeCombinedCssFile(contextName, formattedTokens);

  fs.copyFileSync(
    path.join(__dirname, "../../docs/usage/index.html"),
    path.join(cssDistPath, contextName, "index.html")
  );
});

function isValidContextName(value: string): value is ContextName {
  return (VALID_CONTEXT_NAMES as readonly string[]).includes(value);
}

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

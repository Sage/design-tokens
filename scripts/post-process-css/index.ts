import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import { CssProperty } from "./css-parser/css-parser.types.js";
import { CssParser } from "./css-parser/css-parser.js";
import { ModeTokens, MathsCalc } from "./formatters/index.js";
import { AllDefinedValidator } from "./validators/all-defined/all-defined-validator.js";
import { ConsistentModeTokenValidator } from "./validators/consistent-mode-tokens/consistent-mode-token-validator.js";

type TokenOutput = {
  global: CssProperty[];
  light: CssProperty[];
  dark: CssProperty[];
  components: Record<string, CssProperty[]>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssParser = new CssParser();

const cssDistPath = path.join(__dirname, "../../dist/css");

fs.readdirSync(cssDistPath, { recursive: true, withFileTypes: true })
  .filter((file) => {
    return /^(?!all\.css$)[\w,\s-]+\.css$/.test(file.name);
  })
  .forEach((file) => {
    const space = "  ";
    const maths = new MathsCalc();
    const filePath = ["global.css", "light.css", "dark.css"].includes(file.name)
      ? cssDistPath
      : `${cssDistPath}/components`;
    const contents = fs.readFileSync(path.join(filePath, file.name), "utf8");
    const tokens = maths.formatTokens(cssParser.parseRootVariables(contents));

    const lines: string[] = [];
    lines.push(`:root {`);

    if (tokens.length) {
      lines.push(
        tokens
          .map(({ name, value }: CssProperty) => `${space}${name}: ${value};`)
          .join("\n")
      );
    }

    lines.push(`}`);
    lines.push("");

    fs.writeFileSync(path.join(filePath, file.name), lines.join("\n"));
  });

const rawTokens = getCssTokens(cssDistPath);

const tokens = new ModeTokens(
  rawTokens.global,
  rawTokens.light,
  rawTokens.dark,
  rawTokens.components
);

const validator = new AllDefinedValidator(new ConsistentModeTokenValidator());
validator.validate(tokens);

writeCombinedCssFile(cssDistPath, tokens);

// Copy usage documentation
fs.copyFileSync(
  path.join(__dirname, "../../docs/usage/index.html"),
  path.join(cssDistPath, "index.html")
);

/**
 * Writes a combined CSS file containing all formatted tokens
 */
function writeCombinedCssFile(outputPath: string, tokens: ModeTokens) {
  fs.writeFileSync(path.join(outputPath, "all.css"), tokens.toString());
}

/**
 * Extracts and parses CSS tokens from the directory structure
 */
function getCssTokens(basePath: string): TokenOutput {
  const getFileContents = (file: string) => {
    const filePath = path.join(basePath, file);
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      console.warn(`Warning: Could not read ${file}, skipping...`);
      return "";
    }
  };

  const globalContents = getFileContents("global.css");
  const darkContents = getFileContents("dark.css");
  const lightContents = getFileContents("light.css");

  const components: Record<string, CssProperty[]> = {};
  const componentsPath = path.join(basePath, "components");

  if (fs.existsSync(componentsPath)) {
    fs.readdirSync(componentsPath).forEach((file) => {
      if (path.extname(file) === ".css") {
        const fileName = path.basename(file, path.extname(file));
        const componentContents = getFileContents(`components/${file}`);

        if (componentContents) {
          components[fileName] =
            cssParser.parseRootVariables(componentContents);
        }
      }
    });
  }

  return {
    global: cssParser.parseRootVariables(globalContents),
    light: cssParser.parseRootVariables(lightContents),
    dark: cssParser.parseRootVariables(darkContents),
    components,
  };
}

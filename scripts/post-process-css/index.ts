import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

import { CssProperty } from "./css-parser/css-parser.types.js";
import { CssParser } from "./css-parser/css-parser.js";
import { ScreenSizeTokens } from "./screen-size-tokens.js";
import { ContextTokens } from "./context-tokens.js";
import {
  ConsolidateScreenSizes,
  LightDarkModeFormatter,
  MathsCalc
} from "./formatters/";

type TokenOutput = {
  global: CssProperty[];
  light: CssProperty[];
  dark: CssProperty[];
  components: Record<string, CssProperty[]>;
}

// Get current file directory paths (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize CSS parser instance
const cssParser = new CssParser();

// Define the path to the CSS distribution directory
const cssDistPath = path.join(__dirname, "../../dist/css");

// FIRST PROCESSING LOOP: Process individual CSS files
// Loop through all CSS files in the distribution directory (excluding 'all.css')
fs.readdirSync(cssDistPath, { recursive: true, withFileTypes: true }).filter((file) => {
  // Filter to include only CSS files, but exclude 'all.css' 
  return /^(?!all\.css$)[\w,\s-]+\.css$/.test(file.name)
}).forEach((file) => {
  // Set up formatting variables
  const space = "  ";  // Indentation for CSS properties
  const maths = new MathsCalc()  // Math calculation formatter

  // Read the CSS file content
  const contents = fs.readFileSync(path.join(file.path, file.name), "utf8")
  
  // Parse CSS root variables and apply mathematical calculations
  const tokens = maths.formatTokens(cssParser.parseRootVariables(contents))

  // Build new CSS content with formatted tokens
  const lines: string[] = [];
  lines.push(`:root {`);  // Start CSS root block

  // Add formatted CSS properties if any tokens exist
  if (tokens.length > 0) {
    lines.push(
      tokens
        .map(
          (p) =>
            // Format each property: name, value, and optional comment
            `${space}${p.name}: ${p.value};${
              p.comment ? ` ${p.comment}` : ""
            }`
        )
        .join("\n")
    );
  }

  lines.push(`}`);  // Close CSS root block
  lines.push("");   // Add empty line at end

  // Write the formatted CSS back to the file
  fs.writeFileSync(path.join(file.path, file.name), lines.join("\n"));
})

// MAIN PROCESSING: Process the flattened CSS structure
const rawTokens = getFlattenedTokens(cssDistPath);

// Convert raw tokens to ScreenSizeTokens object
const screenSizeTokens = new ScreenSizeTokens(
  rawTokens.global,
  rawTokens.light,
  rawTokens.dark,
  rawTokens.components
);

// Create ContextTokens object with the flattened structure
// Using "product" as a valid context name
const contextTokens = new ContextTokens("product", [screenSizeTokens]);

// Apply formatting pipeline: handle light/dark modes
const consolidateScreenSizes = new ConsolidateScreenSizes();
const lightDarkModeFormatter = new LightDarkModeFormatter(consolidateScreenSizes);

// Run tokens through the formatting pipeline
const formattedTokens = lightDarkModeFormatter.formatTokens(contextTokens);

// Write the combined CSS file to the root of the distribution directory
writeCombinedCssFile(cssDistPath, formattedTokens);

// Copy usage documentation to the distribution directory
fs.copyFileSync(
  path.join(__dirname, "../../docs/usage/index.html"),
  path.join(cssDistPath, "index.html")
);

/**
 * Writes a combined CSS file containing all formatted tokens
 * @param outputPath - The directory path where the combined CSS file should be written
 * @param tokens - The formatted context tokens to write
 */
function writeCombinedCssFile(outputPath: string, tokens: ContextTokens) {
  fs.writeFileSync(path.join(outputPath, "all.css"), tokens.toString());
}

/**
 * Extracts and parses CSS tokens from the directory structure
 * @param basePath - Base path to the CSS distribution directory
 * @returns TokenOutput object containing all parsed CSS properties
 */
function getFlattenedTokens(basePath: string): TokenOutput {
  // Helper function to read file contents, with error handling for missing files
  const getFileContents = (file: string) => {
    const filePath = path.join(basePath, file);
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      console.warn(`Warning: Could not read ${file}, skipping...`);
      return "";
    }
  };

  // Read the main CSS files (global styles and theme variants)
  const globalContents = getFileContents("global.css");
  const darkContents = getFileContents("dark.css");
  const lightContents = getFileContents("light.css");

  // Process component-specific CSS files
  const components: Record<string, CssProperty[]> = {};
  const componentsPath = path.join(basePath, "components");
  
  // Check if components directory exists
  if (fs.existsSync(componentsPath)) {
    fs.readdirSync(componentsPath).forEach((file) => {
      // Only process CSS files
      if (path.extname(file) === ".css") {
        // Extract filename without extension to use as component key
        const fileName = path.basename(file, path.extname(file));
        const componentContents = getFileContents(`components/${file}`);
        
        // Parse CSS variables from component file (only if content exists)
        if (componentContents) {
          components[fileName] = cssParser.parseRootVariables(componentContents);
        }
      }
    });
  }

  // Return structured token output
  return {
    global: cssParser.parseRootVariables(globalContents),
    light: cssParser.parseRootVariables(lightContents),
    dark: cssParser.parseRootVariables(darkContents),
    components
  };
}

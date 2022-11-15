/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const { omod, figmaTokensToStyleDictionary } = require("omod");
const { resolve } = require("path");
const { removeSync, readJsonSync, outputJsonSync } = require("fs-extra");

const filterPublic = require("./utils/filter-public");

const distFolder = resolve(__dirname, "../dist");
const inputFile = resolve(__dirname, "../data/tokens.json");
const outputFile = resolve(__dirname, "../temp/tokens.json");

(() => {
  console.log("Clearing /dist folder...");
  removeSync(distFolder);
  console.log("Done.\r\n");

  console.log(`Transforming ${inputFile}`);

  const tokens = readJsonSync(inputFile);
  const filteredTokens = filterPublic(tokens);
  const outputTokens = omod(filteredTokens, figmaTokensToStyleDictionary);

  // Below temporary /temp/tokens.json file is created.
  // It contains all pre-transformed data.
  outputJsonSync(outputFile, outputTokens, { spaces: 2 });

  console.log(`  - Writing output to ${outputFile}`);
  console.log("Done.\r\n");
})();

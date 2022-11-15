/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const path = require("path");
const fs = require("fs-extra");
const kebabCase = require("lodash/kebabCase");

const normalize = require("./utils/normalize");
const filterPublic = require("./utils/filter-public");

const tokensJSON = JSON.parse(process.argv[2]);
const tokens = tokensJSON?.record.values;

function wipeData() {
  const dataFolder = path.resolve(__dirname, "../data");
  fs.removeSync(dataFolder);
  fs.ensureDirSync(dataFolder);
}

function writeDataToFile(filename, data) {
  const filePath = path.resolve(__dirname, `../data/${filename}.json`);
  fs.writeJsonSync(filePath, normalize(data), { spaces: 2 });
}

function main() {
  const publicTokens = filterPublic(tokens);
  wipeData();
  writeDataToFile("all", publicTokens);
  Object.entries(publicTokens).forEach(([setName, tokenSet]) => {
    const setFilename = kebabCase(setName);
    writeDataToFile(setFilename, tokenSet);
  });
}

main();

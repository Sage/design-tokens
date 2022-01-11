/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const { omod, figmaTokensToStyleDictionary } = require('omod')
const { resolve } = require('path')
const {
  removeSync,
  readJsonSync,
  outputJsonSync
} = require('fs-extra')

const distFolder = resolve(__dirname, '../dist')
const inputFile = resolve(__dirname, '../data/tokens.json')
const outputFile = resolve(__dirname, '../temp/tokens.json')

console.log('Clearing /dist folder')
removeSync(distFolder)

console.log(`Transforming ${inputFile}`)

const tokens = readJsonSync(inputFile)
const outputTokens = omod(tokens, figmaTokensToStyleDictionary)

// Below temporary /temp/tokens.json file is created.
// It contains all pre-transformed data.
// Eventually, whole /temp folder is removed during post-build.
outputJsonSync(outputFile, outputTokens, { spaces: 2 })

console.log(`Writing output to ${outputFile}`)

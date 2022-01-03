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
const inputFile = resolve(__dirname, '../data/all.json')
const outputFile = resolve(__dirname, '../temp/tokens.json')

console.log('Clearing /dist folder')
removeSync(distFolder)

console.log(`Transforming ${inputFile}`)

const tokens = readJsonSync(inputFile)
const outputTokens = omod(tokens, figmaTokensToStyleDictionary)

outputJsonSync(outputFile, outputTokens, { spaces: 2 })

console.log(`Writing output to ${outputFile}`)

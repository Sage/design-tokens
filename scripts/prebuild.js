/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const { resolve } = require('path')
const {
  removeSync,
  readJsonSync,
  outputJsonSync
} = require('fs-extra')
const { transformTokens } = require('token-transformer')

const filterPublic = require('./utils/filter-public')

const distFolder = resolve(__dirname, '../dist')
const inputFile = resolve(__dirname, '../data/tokens.json')
const outputFile = resolve(__dirname, '../temp/tokens.json')

;(() => {
  console.log('Clearing /dist folder...')
  removeSync(distFolder)
  console.log('Done.\r\n')

  console.log(`Transforming ${inputFile}`)

  const tokens = readJsonSync(inputFile)
  const filteredTokens = filterPublic(tokens)

  const themes = tokens.$themes
  const outputTokens = {}
  for (const theme of themes) {
    const tokenSets = Object.keys(theme.selectedTokenSets)
    // Each theme has 0 or more "source" sets, and 1 (or more?) "enabled" set.
    // The enabled set is what we're building for, the source sets are where we can pull variables from
    const targetSet = tokenSets.find(tokenSet => theme.selectedTokenSets[tokenSet] === 'enabled')
    if (!targetSet) {
      throw new Error('No target set found')
    }
    // We'll need to instruct `transformTokens` to exclude any `sourceSet` in the output,
    // and only keep our single `enabled` set
    const excludeInOutput = tokenSets.filter(set => set !== targetSet)
    outputTokens[targetSet] = transformTokens(filteredTokens, tokenSets, excludeInOutput)
  }

  // Below temporary /temp/tokens.json file is created.
  // It contains all pre-transformed data.
  outputJsonSync(outputFile, outputTokens, { spaces: 2 })

  console.log(`  - Writing output to ${outputFile}`)
  console.log('Done.\r\n')
})()

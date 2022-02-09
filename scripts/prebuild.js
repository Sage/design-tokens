/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
require('dotenv').config()

const {
  omod,
  figmaTokensToStyleDictionary
} = require('omod')
const { resolve } = require('path')
const {
  removeSync,
  readJsonSync,
  outputJsonSync
} = require('fs-extra')
const icons = require('./icons')

if (!process.env.FIGMA_ACCESS_TOKEN) {
  console.error('Please provide FIGMA_ACCESS_TOKEN env variable.')
  process.exit()
}

const distFolder = resolve(__dirname, '../dist')
const inputFile = resolve(__dirname, '../data/tokens.json')
const outputFile = resolve(__dirname, '../temp/tokens.json')
const personalAccessToken = process.env.FIGMA_ACCESS_TOKEN;

(async () => {
  console.log('Clearing /dist folder...')
  removeSync(distFolder)
  console.log('Done.\r\n')

  await icons({
    personalAccessToken,
    // fileId: '4nx13cdk71Cdu3zBva1qQn', // This line shall be commented until final Figma file with icons will be provided.
    distDir: distFolder,
    svgDir: `${distFolder}/assets/icons/svg`,
    fontsDir: `${distFolder}/assets/icons/fonts`,
    dataDir: `${distFolder}/assets/icons/data`,
    fontName: 'sage-icons',
    formats: ['svg', 'woff', 'woff2', 'ttf', 'eot'],
    meta: {
      description: 'Sage Icon Font',
      url: 'http://sage.com',
      copyright: 'Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved.',
      version: '1.0'
    }
  }).then()

  console.log(`Transforming ${inputFile}`)

  const tokens = readJsonSync(inputFile)
  const outputTokens = omod(tokens, figmaTokensToStyleDictionary)

  // Below temporary /temp/tokens.json file is created.
  // It contains all pre-transformed data.
  // Eventually, whole /temp folder is removed during post-build.
  outputJsonSync(outputFile, outputTokens, { spaces: 2 })

  console.log(`  - Writing output to ${outputFile}`)
  console.log('Done.\r\n')
})()

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

const distFolder = resolve(__dirname, '../dist')
const inputFile = resolve(__dirname, '../data/tokens.json')
const outputFile = resolve(__dirname, '../temp/tokens.json')
const personalAccessToken = process.env.FIGMA_ACCESS_TOKEN
const fileId = process.env.FIGMA_FILE_ID;

(async () => {
  console.log('Clearing /dist folder...')
  removeSync(distFolder)
  console.log('Done.\r\n')

  if (personalAccessToken && fileId) {
    await icons({
      personalAccessToken,
      fileId,
      distDir: distFolder,
      svgDir: `${distFolder}/assets/icons/svg`,
      fontsDir: `${distFolder}/assets/icons/fonts`,
      dataDir: `${distFolder}/assets/icons/data`,
      fontName: 'sage-icons',
      formats: ['svg', 'woff', 'woff2', 'ttf', 'eot'],
      docsTemplate: resolve(__dirname, '../templates/icons/icons.docs.hbs'),
      docsFile: `${distFolder}/assets/icons/docs/index.html`,
      meta: {
        description: 'Sage Icon Font',
        url: 'http://sage.com',
        copyright: 'Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved.',
        version: '1.0'
      }
    }).then()
  } else {
    console.error('Icons will not be generated, since token and figma file id were not found.')
    console.error('Please provide FIGMA_ACCESS_TOKEN and FIGMA_FILE_ID env variables or in .env file.\r\n')
  }

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

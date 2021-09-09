/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const themeConfigBuilder = require('./utils/build-theme-config')

const tokens = require('../data/tokens.json')
const outputThemes = ['base', 'no-theme', 'references']

const filteredTokens = Object.fromEntries(Object.entries(tokens).filter(([setName, tokens]) => outputThemes.includes(setName)))

const buildThemeConfig = themeConfigBuilder(filteredTokens)

const transforms = [
  require('./transforms/custom-attribute-default.transform'),
  require('./transforms/custom-name-camel.transform')
]

outputThemes.forEach((theme) => {
  const StyleDictionary = require('style-dictionary').extend(buildThemeConfig(theme))

  StyleDictionary.registerFormat(require('./formats/es6-module-flat.format'))
  transforms.forEach(transform => StyleDictionary.registerTransform(transform))
  StyleDictionary.registerTransformGroup(require('./transforms/web.group'))

  console.log('\r\n-------------------------------------------------------------')
  console.log(`Theme: ${theme}`)

  StyleDictionary.buildAllPlatforms()
})

// Documentation
const DocumentationStyleDictionary = require('style-dictionary').extend({
  tokens: filteredTokens,
  platforms: {
    'html-documentation': {
      buildPath: 'dist/docs/',
      transformGroup: 'web',
      files: [
        {
          destination: 'index.html',
          format: 'docs'
        }
      ]
    }
  }
})

DocumentationStyleDictionary.registerFormat(require('./formats/docs.format'))

DocumentationStyleDictionary.buildAllPlatforms()

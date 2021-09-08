/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const registerCustomTransforms = require('./extensions/transforms')
const registerCustomFormats = require('./extensions/formats')
const themeConfigBuilder = require('./utils/build-theme-config')

const tokens = require('../data/tokens.json')
const themes = ['base', 'no-theme', 'references']

const filteredTokens = Object.fromEntries(Object.entries(tokens).filter(([setName, tokens]) => themes.includes(setName)))

const buildThemeConfig = themeConfigBuilder(filteredTokens)

themes.forEach((theme) => {
  const StyleDictionary = require('style-dictionary').extend(buildThemeConfig(theme))

  registerCustomTransforms(StyleDictionary)
  registerCustomFormats(StyleDictionary)

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

registerCustomTransforms(DocumentationStyleDictionary)
registerCustomFormats(DocumentationStyleDictionary)

DocumentationStyleDictionary.buildAllPlatforms()

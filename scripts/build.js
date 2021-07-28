/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const registerCustomTransforms = require('./extensions/transforms')
const registerCustomFormats = require('./extensions/formats')
const themeConfigBuilder = require('./utils/build-theme-config')

const tokens = require('../data/tokens.json')
const themes = Object.keys(tokens)

const buildThemeConfig = themeConfigBuilder(tokens)

themes.forEach((theme) => {
  const StyleDictionary = require('style-dictionary').extend(buildThemeConfig(theme))

  registerCustomTransforms(StyleDictionary)
  registerCustomFormats(StyleDictionary)

  console.log('\r\n-------------------------------------------------------------')
  console.log(`Theme: ${theme}`)

  StyleDictionary.buildAllPlatforms()
})

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const { readJsonSync } = require('fs-extra')
const styleDictionary = require('style-dictionary')

const filterPublic = require('./utils/filter-public')
const filterTheme = require('./utils/filter-theme')

const groups = require('./transforms/transforms').groups
const transforms = require('./transforms/transforms').transforms
const formats = require('./formats/formats')

Object.values(transforms).forEach(transform => styleDictionary.registerTransform(transform))
Object.values(formats).forEach(format => styleDictionary.registerFormat(format))

const tokens = readJsonSync('temp/tokens.json')
const publicTokens = filterPublic(tokens)
const themes = Object.keys(publicTokens)

console.log(`Found ${themes.length} public themes: ${themes.join(', ')}.`)

themes.forEach((theme) => {
  console.log(`\r\n\r\nBuilding all platforms for ${theme} theme:`)

  styleDictionary.extend({
    tokens,
    platforms: {
      javascript: {
        buildPath: 'dist/js/',
        transforms: groups.web,
        files: [
          {
            filter: filterTheme(theme),
            destination: `${theme}/common.js`,
            format: 'javascript/module-flat'
          },
          {
            filter: filterTheme(theme),
            destination: `${theme}/es6.js`,
            format: 'custom/js/es6-module-flat'
          }
        ]
      },
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          {
            filter: filterTheme(theme),
            destination: `${theme}.css`,
            format: 'css/variables'
          }
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.css,
        files: [
          {
            filter: filterTheme(theme),
            destination: `${theme}.scss`,
            format: 'scss/variables'
          }
        ]
      }
    }
  }).buildAllPlatforms()

  console.log('Done.')
})

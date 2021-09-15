/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const styleDictionary = require('./style-dictionary')
const globSync = require('glob').sync
const tokenFiles = globSync('./data/!(all)*.json')
const configFactory = require('./utils/build-theme-config')

tokenFiles.forEach((fileName) => {
  const Themes = styleDictionary.extend(configFactory(fileName))
  Themes.buildAllPlatforms()
})

const DocumentationStyleDictionary = styleDictionary.extend({
  tokens: {},
  include: tokenFiles,
  platforms: {
    docs: {
      buildPath: 'dist/docs/',
      transformGroup: 'group/web',
      files: [
        {
          destination: 'index.html',
          format: 'docs'
        }
      ]
    }
  }
})

DocumentationStyleDictionary.buildAllPlatforms()

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const styleDictionary = require('./style-dictionary')
const globSync = require('glob').sync
const configFactory = require('./utils/build-theme-config')
const groups = require('./transforms/transforms').groups
const tokenFiles = globSync('./data/!(all)*.json')

tokenFiles.forEach((fileName) => {
  const Themes = { ...styleDictionary }.extend(configFactory(fileName))
  Themes.buildAllPlatforms()
})

const DocumentationStyleDictionary = { ...styleDictionary }.extend({
  tokens: {},
  include: tokenFiles,
  platforms: {
    docs: {
      buildPath: 'dist/docs/',
      transforms: groups.web,
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

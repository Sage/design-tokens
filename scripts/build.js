/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const configFactory = require('./utils/build-theme-config')

const tokens = require('../data/all.json')

Object.entries(tokens).forEach(([setName, tokenSet]) => {
  const StyleDictionary = require('style-dictionary').extend(configFactory(setName, tokenSet))

  StyleDictionary.registerFormat(require('./formats/es6-module-flat.format'))

  console.log('\r\n-------------------------------------------------------------')
  console.log(`Theme: ${setName}`)

  StyleDictionary.buildAllPlatforms()
})

const DocumentationStyleDictionary = require('style-dictionary').extend({
  tokens: {},
  include: [
    './data/!(all)*.json'
  ],
  platforms: {
    'html-documentation': {
      buildPath: 'dist/docs/',
      transforms: ['custom/attributes/default', 'name/cti/camel'],
      files: [
        {
          destination: 'index.html',
          format: 'docs'
        }
      ]
    }
  }
})

DocumentationStyleDictionary.registerTransform(require('./transforms/custom-attributes-default.transform'))
DocumentationStyleDictionary.registerFormat(require('./formats/docs.format'))

DocumentationStyleDictionary.buildAllPlatforms()

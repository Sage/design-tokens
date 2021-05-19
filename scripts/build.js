/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const registerCustomTransforms = require('./extensions/transforms')
const registerCustomFormats = require('./extensions/formats')
const path = require('path')

const StyleDictionary = require('style-dictionary').extend({
  source: [path.resolve(__dirname, '../data/**/*.json')],
  platforms: {
    js: {
      buildPath: 'dist/js/',
      transforms: [
        'custom/attributes/generic',
        'custom/attributes/colors',
        'custom/attributes/fix-references',
        'custom/name/constant-object',
        'custom/attributes/fix-typography-references'
      ],
      files: [
        {
          destination: 'variables.js',
          format: 'custom/js/constant'
        }
      ]
    }
  }
})

registerCustomTransforms(StyleDictionary)
registerCustomFormats(StyleDictionary)

StyleDictionary.buildAllPlatforms()

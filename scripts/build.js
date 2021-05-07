/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const path = require('path')
const {
  registerTransforms
} = require('./_utils/customTransforms')

// const isMediumThemeValue = (token) =>
//   token.type === 'color' && token.path[1] === 'small'
// const isSmallThemeValue = (token) =>
//   token.type === 'color' && token.path[1] === 'medium'

const StyleDictionary = require('style-dictionary').extend({
  source: [path.resolve(__dirname, '../data/**/*.json')],
  platforms: {
    js: {
      buildPath: 'dist/js/',
      transforms: [
        'attribute/cti',
        'name/cti/constant',
        'color/hex',
        'number/units',
        'custom/name/flattenReference'
      ],
      files: [
        {
          destination: 'variables.js',
          format: 'javascript/es6',
          filter: (token) => {
            return token.attributes.type === 'accent'
          },
          options: {
            showFileHeader: false,
            outputReference: false
          }
        }
      ]
    }
  }
})

StyleDictionary.registerTransform({
  name: 'custom/name/flattenReference',
  type: 'value',
  matcher: function (prop) {
    return prop.value.toString().startsWith('{')
  },
  transformer: function (prop) {
    return prop
  }
})

StyleDictionary.registerTransform({
  name: 'number/units',
  type: 'value',
  matcher: function (prop) {
    return prop.type === 'number' && typeof prop.value === 'number'
  },
  transformer: function (prop) {
    if (prop.original.value === 0) {
      return prop.original.value
    }
    let suffix = ''
    switch (prop.unit) {
      case 'pixel': {
        suffix = 'px'
        break
      }
      case 'percent': {
        suffix = '%'
        break
      }
    }
    return prop.original.value + suffix
  }
})

// Registers the custom style dictionary filters from ./_utils/customTransforms
registerTransforms(StyleDictionary)

StyleDictionary.buildAllPlatforms()

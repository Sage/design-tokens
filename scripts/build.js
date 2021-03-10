/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const path = require('path')
const {
  STRING_SPACES,
  NAME_CONSTANT,
  registerTransforms
} = require('./_utils/customTransforms')

const isMediumThemeValue = (token) =>
  token.type === 'color' && token.path[1] === 'small'
const isSmallThemeValue = (token) =>
  token.type === 'color' && token.path[1] === 'medium'

const StyleDictionary = require('style-dictionary').extend({
  source: [path.resolve(__dirname, '../data/**/*.json')],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      transforms: [
        'attribute/cti',
        'name/cti/kebab',
        'color/hex',
        'number/units',
        STRING_SPACES
      ],
      files: [
        {
          destination: '_variables.css',
          format: 'css/variables',
          filter: (token) => token.category === 'theme',
          options: {
            showFileHeader: false
          }
        }
      ]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      transforms: [
        'attribute/cti',
        'name/ti/constant',
        'color/hex',
        'number/units'
      ],
      files: [
        {
          destination: 'colors.js',
          format: 'javascript/es6',
          filter: (token) => token.type === 'color',
          options: {
            showFileHeader: false
          }
        },
        {
          destination: 'spacing.js',
          format: 'javascript/es6',
          filter: (token) => token.type === 'spacing',
          options: {
            showFileHeader: false
          }
        },
        {
          destination: 'sizes.js',
          format: 'javascript/es6',
          filter: (token) => token.category === 'size',
          options: {
            showFileHeader: false
          }
        },
        {
          destination: 'text.js',
          format: 'javascript/es6',
          filter: (token) => token.attributes.category === 'text',
          options: {
            showFileHeader: false
          }
        }
      ]
    },
    jsThemes: {
      transformGroup: 'js',
      buildPath: 'dist/js/themes/',
      transforms: [
        'attribute/cti',
        NAME_CONSTANT,
        'color/hex',
        'number/units'
      ],
      files: [
        {
          destination: 'small.js',
          format: 'javascript/es6',
          filter: isSmallThemeValue,
          options: {
            showFileHeader: false
          }
        },
        {
          destination: 'medium.js',
          format: 'javascript/es6',
          filter: isMediumThemeValue,
          options: {
            showFileHeader: false
          }
        }
      ]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/scss/',
      transforms: [
        'attribute/cti',
        'name/cti/kebab',
        'color/hex',
        'number/units',
        STRING_SPACES
      ],
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/variables',
          options: {
            showFileHeader: false
          }
        }
      ]
    },
    less: {
      transformGroup: 'less',
      buildPath: 'dist/less/',
      transforms: [
        'attribute/cti',
        'name/cti/kebab',
        'color/hex',
        'number/units',
        STRING_SPACES
      ],
      files: [
        {
          destination: '_variables.less',
          format: 'less/variables',
          options: {
            showFileHeader: false
          }
        }
      ]
    }
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

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const path = require('path')

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
        'string/spaces'
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
        'name/constant',
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
        'string/spaces'
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
        'string/spaces'
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
    // Note the use of prop.original.value,
    // before any transforms are performed, the build system
    // clones the original property to the 'original' attribute.
    return prop.original.value + suffix
  }
})

StyleDictionary.registerTransform({
  name: 'string/spaces',
  type: 'value',
  matcher: function (prop) {
    return prop.type === 'string' && /\s/.test(prop.value)
  },
  transformer: function (prop) {
    return `'${prop.original.value}'`
  }
})

StyleDictionary.registerTransform({
  name: 'name/constant',
  type: 'name',
  transformer: function (prop) {
    // Makes text uppercase then replaced non alpha-numeric characters with underscores
    return prop.name.toUpperCase().replace(/[^A-Z\d_]/g, '_')
  }
})

StyleDictionary.buildAllPlatforms()

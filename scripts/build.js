/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const path = require('path')

const StyleDictionary = require('style-dictionary').extend({
  source: [path.resolve(__dirname, '../data/**/*.json')],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      //   transforms: ["custom/number", "custom/string", "custom/name"],
      transforms: ['attribute/cti', 'name/cti/kebab', 'color/hex', 'number/units', 'string/spaces'],
      files: [
        {
          destination: '_variables.css',
          format: 'css/variables',
          options: {
            showFileHeader: false
          }
        }
      ]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'index.js',
          format: 'javascript/es6',
          options: {
            showFileHeader: false
          }
        }
      ]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/scss/',
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

StyleDictionary.buildAllPlatforms()

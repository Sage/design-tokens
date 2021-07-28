/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const registerCustomTransforms = require('./extensions/transforms')
const registerCustomFormats = require('./extensions/formats')
const path = require('path')

const StyleDictionary = require('style-dictionary').extend({
  source: [path.resolve(__dirname, '../data/**/*.json')],
  platforms: {
    javascript: {
      buildPath: 'dist/js/',
      transformGroup: 'web',
      files: [
        {
          filter: (token) => token.attributes.theme === 'base',
          destination: 'base/common.js',
          format: 'javascript/module-flat'
        },
        {
          filter: (token) => token.attributes.theme === 'base',
          destination: 'base/es6.js',
          format: 'custom/js/es6-module-flat'
        },

        {
          filter: (token) => token.attributes.theme === 's-biz',
          destination: 's-biz/common.js',
          format: 'javascript/module-flat'
        },
        {
          filter: (token) => token.attributes.theme === 's-biz',
          destination: 's-biz/es6.js',
          format: 'custom/js/es6-module-flat'
        },

        {
          filter: (token) => token.attributes.theme === 's-serv',
          destination: 'm-serv/common.js',
          format: 'javascript/module-flat'
        },
        {
          filter: (token) => token.attributes.theme === 's-serv',
          destination: 'm-serv/es6.js',
          format: 'custom/js/es6-module-flat'
        },

        {
          filter: (token) => token.attributes.theme === 'references',
          destination: 'references/common.js',
          format: 'javascript/module-flat'
        },
        {
          filter: (token) => token.attributes.theme === 'references',
          destination: 'references/es6.js',
          format: 'custom/js/es6-module-flat'
        }
      ]
    },
    css: {
      buildPath: 'dist/css/',
      transformGroup: 'web',
      files: [
        {
          filter: (token) => token.attributes.theme === 'base',
          destination: 'base.css',
          format: 'css/variables'
        },

        {
          filter: (token) => token.attributes.theme === 's-biz',
          destination: 's-biz.css',
          format: 'css/variables'
        },

        {
          filter: (token) => token.attributes.theme === 's-serv',
          destination: 'm-serv.css',
          format: 'css/variables'
        },

        {
          filter: (token) => token.attributes.theme === 'references',
          destination: 'references.css',
          format: 'css/variables'
        }
      ]
    },
    scss: {
      buildPath: 'dist/scss/',
      transformGroup: 'web',
      files: [
        {
          filter: (token) => token.attributes.theme === 'base',
          destination: 'base.scss',
          format: 'scss/variables'
        },

        {
          filter: (token) => token.attributes.theme === 's-biz',
          destination: 's-biz.scss',
          format: 'scss/variables'
        },

        {
          filter: (token) => token.attributes.theme === 's-serv',
          destination: 'm-serv.scss',
          format: 'scss/variables'
        },

        {
          filter: (token) => token.attributes.theme === 'references',
          destination: 'references.scss',
          format: 'scss/variables'
        }
      ]
    }
  }
})

registerCustomTransforms(StyleDictionary)
registerCustomFormats(StyleDictionary)

StyleDictionary.buildAllPlatforms()

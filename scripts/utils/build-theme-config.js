/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const kebabCase = require('lodash/kebabCase')
const omit = require('lodash/omit')

/**
 * Factory for function that generates theme config object.
 *
 * @param {object} tokens - tokens
 *
 * @returns {function} function that generates config for theme.
 */

module.exports = function (setName, tokenSet) {
  const dirName = kebabCase(setName)
  const tokens = omit(tokenSet, ['meta'])

  return {
    tokens,
    platforms: {
      javascript: {
        buildPath: 'dist/js/',
        transforms: ['name/cti/camel'],
        files: [
          {
            destination: `${dirName}/common.js`,
            format: 'javascript/module-flat'
          },
          {
            destination: `${dirName}/es6.js`,
            format: 'custom/js/es6-module-flat'
          }
        ]
      },
      css: {
        buildPath: 'dist/css/',
        transforms: ['name/cti/camel'],
        files: [
          {
            destination: `${dirName}.css`,
            format: 'css/variables'
          }
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: ['name/cti/camel'],
        files: [
          {
            destination: `${dirName}.scss`,
            format: 'scss/variables'
          }
        ]
      }
    }
  }
}

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const filename = require('../utils/filename')

/**
 * Factory for function that generates theme config object.
 *
 * @param {object} tokens - tokens
 *
 * @returns {function} function that generates config for theme.
 */

module.exports = function (fileName) {
  const dirName = filename(fileName)

  return {
    tokens: {},
    include: [fileName],
    platforms: {
      javascript: {
        buildPath: 'dist/js/',
        transformGroup: 'group/web',
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
        transformGroup: 'group/web',
        files: [
          {
            destination: `${dirName}.css`,
            format: 'css/variables'
          }
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transformGroup: 'group/web',
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

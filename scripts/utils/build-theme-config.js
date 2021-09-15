/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const filename = require('../utils/filename')
const groups = require('../transforms/transforms').groups

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
        transforms: groups.web,
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
        transforms: groups.css,
        files: [
          {
            destination: `${dirName}.css`,
            format: 'css/variables'
          }
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.css,
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

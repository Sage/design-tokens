/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const kebabCase = require('lodash/kebabCase')

/**
 * Factory for function that generates theme config object.
 *
 * @param {object} tokens - tokens
 *
 * @returns {function} function that generates config for theme.
 */

module.exports = (tokens) =>
  (theme) => ({
    tokens,
    platforms: {
      javascript: {
        buildPath: 'dist/js/',
        transformGroup: 'web',
        files: [
          {
            filter: (token) => token.attributes.theme === theme,
            destination: `${kebabCase(theme)}/common.js`,
            format: 'javascript/module-flat'
          },
          {
            filter: (token) => token.attributes.theme === theme,
            destination: `${kebabCase(theme)}/es6.js`,
            format: 'custom/js/es6-module-flat'
          }
        ]
      },
      css: {
        buildPath: 'dist/css/',
        transformGroup: 'web',
        files: [
          {
            filter: (token) => token.attributes.theme === theme,
            destination: `${kebabCase(theme)}.css`,
            format: 'css/variables'
          }
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transformGroup: 'web',
        files: [
          {
            filter: (token) => token.attributes.theme === theme,
            destination: `${kebabCase(theme)}.scss`,
            format: 'scss/variables'
          }
        ]
      }
    }
  })

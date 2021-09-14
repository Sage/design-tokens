/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const glob = require('glob')

/**
 * Async wrapper for glob method
 *
 * @param {String} pattern - The pattern to use for finding files
 * @param {Object[]} options - Options to pass to glob
 *
 * @returns {Object}
 */

module.exports = function (pattern, options = {}) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, function (er, files) {
      if (er) {
        reject(er)
      }
      resolve(files)
    })
  })
}

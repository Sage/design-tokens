/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Gets the filename for a file
 *
 * @param {string} path - the path to the file
 *
 * @returns {string}
 */
const path = require('path')

module.exports = (filePath) => {
  try {
    const extension = path.extname(filePath)
    return path.basename(filePath, extension)
  } catch (err) {
    throw Error(err)
  }
}

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
function filename (path) {
  try {
    return path.split('/').pop().split('.')[0]
  } catch (err) {
    throw Error(err)
  }
}

module.exports = filename

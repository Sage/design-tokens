/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const hasPresenter = require('./has-presenter')

/**
 * Gets the filename for a file
 *
 * @param {string} filename - the name of the file
 * @param {string} filePath - the path to the file
 *
 * @returns {string}
 */

module.exports = (filename, filePath) => {
  return `/**
 * Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * @tokens ${filePath}
 ${hasPresenter(filename)}
 */`
}

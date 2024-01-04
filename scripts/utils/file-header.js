/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Gets the filename for a file
 *
 * @returns {string}
 */

module.exports = (filename, filePath) => {
  const year = new Date().getFullYear()
  return `/**
 * Copyright © ${year} The Sage Group plc or its licensors. All Rights reserved
 */`
}

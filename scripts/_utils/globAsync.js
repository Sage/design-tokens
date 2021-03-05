/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const glob = require('glob')

module.exports = async function (pattern, options = {}) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, function (er, files) {
      if (er) {
        reject(er)
      }
      resolve(files)
    })
  })
}

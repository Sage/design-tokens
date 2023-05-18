/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Callback function for collect util.
 * @callback CollectCallback
 * @param {Object} node - node to check
 * @return {boolean}
 */

/**
 * Recursively selects nodes of object. It preserves node if callback returns true and rejects if callback returns false.
 * @param {object} object - Object with children prop for children nodes.
 * @param {CollectCallback} callback - Callback function
 * @returns {*|*[]}
 */
module.exports = (object, callback = () => true) => {
  const output = []

  const walk = (walkObject) => {
    if (callback(walkObject)) {
      output.push(walkObject)
      return
    }

    if (walkObject instanceof Object) {
      Object.values(walkObject).forEach((childObj) => walk(childObj))
      return
    }

    if (Array.isArray(walkObject)) {
      walkObject.forEach(childObj => walk(childObj))
    }
  }

  walk(object)
  return output
}

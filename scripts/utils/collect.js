/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Callback function for collect util.
 * @callback CollectCallback
 * @param {*} node - node to check
 * @return {boolean}
 */

/**
 * Recursively selects nodes of object. It preserves node if callback returns true and rejects if callback returns false.
 * @param {object} object - Object with children prop for children nodes.
 * @param {CollectCallback} callback - Callback function
 * @returns {*|*[]}
 */
module.exports = (object, callback = () => true) => {
  const out = []

  const walk = (node) => {
    if (callback(node)) {
      out.push(node)
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(childNode => walk(childNode))
    }
  }

  walk(object)
  return out
}

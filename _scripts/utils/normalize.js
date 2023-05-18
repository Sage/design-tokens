/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * normalizes output of JSON. Makes sure, that every record has `value`
 * property with proper value.
 *
 * @param {Object} tokensData - JSON data to normalize
 *
 * @returns {Object}
 */

module.exports = function (tokensData) {
  const walk = (item) => {
    switch (typeof item) {
      case 'string':
      case 'number':
        return { value: item }
      case 'object': {
        if ('value' in item) {
          return item
        }

        const output = Object
          .keys(item)
          .map((key) => [key, walk(item[key])])

        return Object.fromEntries(output)
      }
    }
  }

  return walk(tokensData)
}

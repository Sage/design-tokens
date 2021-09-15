/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const isObject = require('lodash/isObject')
const isString = require('lodash/isString')
const isArray = require('lodash/isArray')

/**
 * Converts dollar references to braces references
 */

module.exports = {
  name: 'custom/value/references',
  type: 'value',
  transitive: true,
  transformer (token) {
    const fixReference = (value) => {
      if (isString(value) && value.startsWith('$')) {
        return `{${value.slice(1)}.value}`
      }

      return value
    }

    const walk = (value) => {
      if (isObject(value) && !('value' in value)) {
        const valueEntries = Object.entries(value).map(([key, value]) => [key, walk(value)])

        return Object.fromEntries(valueEntries)
      }

      if (isArray(value)) {
        value.forEach(value => walk(value))
      }

      return fixReference(value)
    }

    return walk(token.value)
  }
}

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
        return `{${token.attributes.theme}.${value.slice(1)}.value}`
      }

      if (value.includes('$')) {
        const tokenRegex = /(?<=\$)(.*?)(?=,|\))/gm
        const opacityRegex = /(?<=,\s)(.*?)(?=\))/gm

        const name = value.match(tokenRegex)[0].trim()
        const opacity = value.match(opacityRegex)[0]

        const tokensValue = `{${token.attributes.theme}.${name}.value}`
        const convertedOpacity = Math.round(opacity * 255).toString(16)

        if (name.includes('yin') || name.includes('transparent')) {
          return tokensValue
        }

        return `${tokensValue}${convertedOpacity.length > 1 ? convertedOpacity : `0${convertedOpacity}`}`
      }

      return value
    }

    const walk = (value) => {
      if (isObject(value) && !isArray(value) && !('value' in value)) {
        const valueEntries = Object.entries(value).map(([key, value]) => [key, walk(value)])

        return Object.fromEntries(valueEntries)
      }

      if (isArray(value)) {
        return value.map(value => walk(value))
      }

      return fixReference(value)
    }

    return walk(token.value)
  }
}

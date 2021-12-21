/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Handles boxShadow tokens
 */

const isArray = require('lodash/isArray')

module.exports = {
  name: 'custom/value/css-box-shadow',
  type: 'value',
  matcher: token => token.attributes.category === 'boxShadow',
  transformer (token) {
    const value = token.value

    if (value.color === 'none') {
      return 'none'
    }

    if (isArray(value)) {
      return value.map(val => `${val.x}px ${val.y}px ${val.blur}px ${val.spread}px ${val.color}`)
    }

    return `${value.x} ${value.y} ${value.blur} ${value.spread} ${value.color}`
  }
}

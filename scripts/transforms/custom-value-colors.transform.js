/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Sets color attributes for token.
 */

const Color = require('tinycolor2')

module.exports = {
  name: 'custom/value/colors',
  type: 'value',
  matcher: token => token.attributes.category === 'colors',
  transformer (token) {
    const value = token.value
    const color = Color(value)

    if (color.getAlpha() === 1) {
      return color.isValid() ? color.toHexString() : value
    }

    return color.isValid() ? color.toHex8String() : value
  }
}

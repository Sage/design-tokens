/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Handles boxShadow tokens
 */

module.exports = {
  name: 'custom/value/css-box-shadow',
  type: 'value',
  matcher: token => token.attributes.category === 'boxShadow',
  transformer (token) {
    const value = token.value

    if (value.color === 'none') {
      return 'none'
    }

    return `${value.x} ${value.y} ${value.blur} ${value.spread} ${value.color}`
  }
}

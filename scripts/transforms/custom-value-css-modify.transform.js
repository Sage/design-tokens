/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const Color = require('colorjs.io').default

/**
 * Handles token color modifiers
 */

module.exports = {
  name: 'custom/value/css-modify',
  type: 'value',
  transitive: true,
  matcher: token => token.type === 'color',
  transformer: token => {
    const { 'studio.tokens': { modify } } = token.$extensions ?? { 'studio.tokens': { modify: { type: 'none' } } }

    const color = new Color(token.value)

    switch (modify.type) {
      case 'alpha':
        return color.alpha(modify.value)
      case 'darken':
        return color.darken(modify.value)
      case 'lighten':
        return color.lighten(modify.value)
      case 'none':
        return token.value
      default:
        return token.value
    }
  }
}

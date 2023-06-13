/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Handles typography tokens
 */

module.exports = {
  name: 'custom/value/css-typography',
  type: 'value',
  transitive: true,
  matcher: token => token.type === 'typography',
  transformer: token => {
    const { fontFamily, fontWeight, lineHeight, fontSize } = token.value

    if (fontFamily && fontSize) {
      return `${fontWeight} ${eval(fontSize)}/${lineHeight} ${fontFamily}`
    }

    return '0 none'
  }
}

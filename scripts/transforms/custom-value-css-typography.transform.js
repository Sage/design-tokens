/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Handles typography tokens
 */

module.exports = {
  name: 'custom/value/css-typography',
  type: 'value',
  matcher: token => token.attributes.category === 'typography',
  transformer: token => {
    const { fontFamily, fontWeight, lineHeight, fontSize } = token.value

    if (fontFamily && fontSize) {
      return `${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`
    }

    return '0 none'
  }
}

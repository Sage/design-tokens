/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Handles typography tokens
 */

module.exports = {
  name: 'custom/value/typography',
  type: 'value',
  matcher: (token) => token.attributes.category === 'typography',
  transformer (token) {
    return token.value
  }
}

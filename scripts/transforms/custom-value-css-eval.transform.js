/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Handles typography tokens
 */

module.exports = {
  name: 'custom/value/css-eval',
  type: 'value',
  transitive: true,
  matcher: token => token.type === 'dimension' || token.type === 'fontSizes' || token.type === 'sizing' || token.type === 'spacing',
  transformer: token => String(eval(token.value))
}

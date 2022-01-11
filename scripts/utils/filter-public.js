/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Filter only publicly available themes
 *
 * @param {Object} tokens - Tokens object with all themes
 *
 * @returns {Object}
 */
module.exports = function (tokens) {
  const tokensEntries = Object.entries(tokens)
  const filteredTokens = tokensEntries.filter(([, tokenSet]) => tokenSet?.meta?.public?.value === 'true')
  return Object.fromEntries(filteredTokens)
}

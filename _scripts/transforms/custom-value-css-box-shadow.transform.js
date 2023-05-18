/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const ensureArray = require('../utils/ensure-array')
const ensurePxUnits = require('../utils/ensure-px-units')

/**
 * Handles boxShadow tokens
 */

module.exports = {
  name: 'custom/value/css-box-shadow',
  type: 'value',
  matcher: token => token.attributes.category === 'boxShadow',
  transformer (token) {
    const shadowDefinitions = ensureArray(token.value)

    return shadowDefinitions.map((definition) => {
      if (definition.color === 'none') {
        return undefined
      }

      const boxShadow = `${ensurePxUnits(definition.x)} ${ensurePxUnits(definition.y)} ${ensurePxUnits(definition.blur)} ${ensurePxUnits(definition.spread)} ${definition.color}`

      if (definition.type === 'innerShadow') {
        return `inset ${boxShadow}`
      }

      return boxShadow
    }).join(', ')
  }
}

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Transforms name to camelCase categoryNameVariant format
 */

const camelCase = require('lodash/camelCase')

module.exports = {
  name: 'custom/name/camel',
  type: 'name',
  transformer (token) {
    return camelCase(Object.values(token.attributes).slice(1).join(' '))
  }
}

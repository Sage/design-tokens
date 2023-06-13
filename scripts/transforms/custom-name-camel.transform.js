/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const camelCase = require('lodash/camelCase')

/**
 * Generates token name in camelCase
 */

module.exports = {
  name: 'custom/name/camel',
  type: 'name',
  transformer (token) {
    return camelCase(Object.values(token.path))
  }
}

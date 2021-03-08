/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const STRING_SPACES = 'string/spaces'
const NAME_CONSTANT = 'name/constant'

/**
 * Registers the custom transforms
 *
 * @param {StyleDictionary} dictionary - Dictionary instance to register the transdforms to
 */
function registerTransforms (dictionary) {
  dictionary.registerTransform({
    name: STRING_SPACES,
    type: 'value',
    matcher: function (prop) {
      return prop.type === 'string' && /\s/.test(prop.value)
    },
    transformer: function (prop) {
      return `'${prop.original.value}'`
    }
  })

  dictionary.registerTransform({
    name: NAME_CONSTANT,
    type: 'name',
    transformer: function (prop) {
      // Makes text uppercase then replaced non alpha-numeric characters with underscores
      return prop.name.toUpperCase().replace(/[^A-Z\d_]/g, '_')
    }
  })
}

module.exports = {
  STRING_SPACES,
  NAME_CONSTANT,
  registerTransforms
}

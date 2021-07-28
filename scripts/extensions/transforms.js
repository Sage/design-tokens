/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const camelCase = require('lodash/camelCase')

module.exports = function (styleDictionary) {
  /**
     * Sets namespace, category, name and variant attributes for token.
     */
  styleDictionary.registerTransform({
    name: 'custom/attributes/colors',
    type: 'attribute',
    transformer (token) {
      if (token.path.length === 3) {
        const [theme, category, variant] = token.path
        return { theme, category, variant }
      }

      if (token.path.length === 4) {
        const [theme, category, name, variant] = token.path
        return { theme, category, name, variant }
      }

      if (token.path.length === 5) {
        const [theme, category, name, subname, variant] = token.path
        return { theme, category, name, subname, variant }
      }

      return { }
    }
  })

  /**
     * Transforms name to camelCase categoryNameVariant format
     */
  styleDictionary.registerTransform({
    name: 'custom/name/camel',
    type: 'name',
    transformer (token) {
      return camelCase(Object.values(token.attributes).slice(1).join(' '))
    }
  })

  styleDictionary.registerTransformGroup({
    name: 'web',
    transforms: [
      'custom/attributes/colors',
      'custom/name/camel'
    ]
  })
}

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

module.exports = function (styleDictionary) {
  /**
   * Sets namespace, category and variant for generic tokens
   */
  styleDictionary.registerTransform({
    name: 'custom/attributes/generic',
    type: 'attribute',
    matcher: (token) => token.path.length === 3,
    transformer (token) {
      return {
        namespace: token.path[0],
        category: token.path[1],
        variant: token.path[2]
      }
    }
  })

  /**
   * Sets namespace, category, name and variant attributes for token.
   */
  styleDictionary.registerTransform({
    name: 'custom/attributes/colors',
    type: 'attribute',
    matcher: (token) => token.path.length === 5,
    transformer (token) {
      return {
        namespace: token.path[0],
        category: token.path[1],
        name: token.path[3],
        variant: token.path[4]
      }
    }
  })

  /**
   * Transforms name to NAMESPACE_CATEGORY_<PARTS>_NAME_VARIANT
   */
  styleDictionary.registerTransform({
    name: 'custom/name/generic',
    type: 'name',
    transformer (token) {
      return Object.values(token.attributes).map(part => part.toUpperCase()).join('_')
    }
  })

  /**
   * Transforms name to NAMESPACE_CATEGORY.path.to.value
   */
  styleDictionary.registerTransform({
    name: 'custom/name/constant-object',
    type: 'name',
    transformer (token) {
      const [namespace, category, ...parts] = token.path
      const output = `${namespace.toUpperCase()}_${category.toUpperCase()}.${parts.join('.')}`

      return output
    }
  })

  /**
   * Transforms value with spaces to quoted strings
   */
  styleDictionary.registerTransform({
    name: 'custom/value/string-spaces',
    type: 'value',
    matcher: function (prop) {
      return prop.type === 'string' && /\s/.test(prop.value)
    },
    transformer: function (prop) {
      return `'${prop.original.value}'`
    }
  })

  /**
   * Transforms name to uppercase then replaced non alpha-numeric characters with underscores
   */
  styleDictionary.registerTransform({
    name: 'custom/name/generic',
    type: 'name',
    transformer: function (prop) {
      return prop.name.toUpperCase().replace(/[^A-Z\d_]/g, '_')
    }
  })

  styleDictionary.registerTransform({
    name: 'custom/attributes/fix-references',
    type: 'attribute',
    matcher (token) {
      return String(token.value).startsWith('{') || String(token.value).startsWith('$')
    },
    transformer (token) {
      const referencePath = token.value.startsWith('$')
        ? token.value.substring(1)
        : /^{(.*)}$/.exec(token.value)[1]

      const referencePathParts = referencePath.split('.')

      if (referencePathParts[referencePathParts - 1] !== 'value') {
        referencePathParts.push('value')
      }

      if (referencePathParts[0] === token.attributes.category) { // no namespace, please add
        referencePathParts.unshift(token.attributes.namespace)
      }

      token.value = `{${referencePathParts.join('.')}}`

      return {}
    }
  })
}

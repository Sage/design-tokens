/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Fixes references to other values by adding namespace and value sections.
 *
 * @param value - reference value in dollar or brackets style.
 * @param attributes - token attributes (category, namespace etc.)
 * @returns {string} - reference with namespace and value sections added, formatted to bracket style.
 */
module.exports = function (value, attributes) {
  const referencePath = value.startsWith('$')
    ? value.substring(1)
    : /^{(.*)}$/.exec(value)[1]

  let referencePathParts = referencePath.split('.')

  if (referencePathParts[referencePathParts.length - 1] !== 'value') {
    referencePathParts = [...referencePathParts, 'value']
  }

  if (referencePathParts[0] === attributes.category || attributes.category === 'typography') {
    referencePathParts = [attributes.namespace, ...referencePathParts]
  }

  return `{${referencePathParts.join('.')}}`
}

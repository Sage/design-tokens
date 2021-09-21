/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Sets namespace, category, name and variant attributes for token.
 */

module.exports = {
  name: 'custom/attributes/default',
  type: 'attribute',
  transformer (token) {
    const elements = [...token.path]

    if (elements.length === 3) {
      const [theme, category, variant] = elements
      return { theme, category, variant }
    }

    if (elements.length === 4) {
      const [theme, category, name, variant] = elements
      return { theme, category, name, variant }
    }

    if (elements.length === 5) {
      const [theme, category, group, name, variant] = elements
      return { theme, category, group, name, variant }
    }

    return { }
  }
}

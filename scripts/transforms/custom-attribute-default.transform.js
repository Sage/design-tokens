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
}

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const fs = require('fs-extra')
const path = require('path')
const groupBy = require('lodash/groupBy')
const omit = require('lodash/omit')

module.exports = {
  name: 'docs',
  formatter: function ({ dictionary }) {
    const templateContents = fs.readFileSync(path.resolve('.', 'templates/docs.hbs'), 'utf8')
    const Handlebars = require('handlebars')

    const flatTokens = [...dictionary.allTokens]
      .filter((token) => token.attributes.category !== 'meta')
      .map((token) => omit(token, ['filePath', 'isSource']))

    const tokensByTheme = groupBy(flatTokens, 'attributes.theme')

    const contextEntries = Object.entries(tokensByTheme)
      .map(([themeName, themeTokens]) => {
        const tokensByCategory = groupBy(themeTokens, 'attributes.category')
        const categories = Object.entries(tokensByCategory)
          .map(([categoryName, tokens]) => {
            return {
              categoryName,
              tokens
            }
          })

        return {
          themeName,
          categories: categories
        }
      })

    const templateContext = {
      themes: contextEntries
    }

    Handlebars.registerHelper('debug', object => JSON.stringify(object, null, 2))

    const compile = Handlebars.compile(templateContents, { preventIndent: true })

    return compile(templateContext)
  }
}

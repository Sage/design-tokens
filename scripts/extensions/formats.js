/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const fs = require('fs')
const path = require('path')

const groupBy = require('lodash/groupBy')

module.exports = function (styleDictionary) {
  styleDictionary.registerFormat({
    name: 'custom/js/es6-module-flat',
    formatter: function ({ dictionary }) {
      const tokens = Object.fromEntries(dictionary.allTokens.map((token) => [token.name, token.value]))
      const output = JSON.stringify(tokens, null, 2)
      return `export default ${output}`
    }
  })

  styleDictionary.registerFormat({
    name: 'docs',
    formatter: function ({ dictionary }) {
      const templateContents = fs.readFileSync(path.resolve('.', 'templates/docs.hbs'), 'utf8')

      const Handlebars = require('handlebars')

      Handlebars.registerHelper('themes', function (options) {
        const context = options.data.root
        return Object.entries(context)
          .map(([themeName, theme]) => ({ themeName, theme }))
          .map(themeDefinition => options.fn(themeDefinition))
          .join('')
      })

      Handlebars.registerHelper('sections', function (theme, options) {
        return Object.entries(theme)
          .map(([sectionName, tokens]) => ({ sectionName, tokens }))
          .map(themeDefinition => options.fn(themeDefinition))
          .join('')
      })

      const compile = Handlebars.compile(templateContents)
      const templateContext = Object.fromEntries(
        Object.entries(
          groupBy(dictionary.allTokens, 'attributes.theme')
        ).map(([name, tokens]) => [name, groupBy(tokens, 'attributes.category')])
      )

      return compile(templateContext)
    }
  })
}

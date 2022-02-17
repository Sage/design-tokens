/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const { resolve } = require('path')

const Handlebars = require('handlebars')
const groupBy = require('lodash/groupBy')
const kebabCase = require('lodash/kebabCase')
const mapValues = require('lodash/mapValues')
const isArray = require('lodash/isArray')
const isObject = require('lodash/isObject')

const { readJsonSync, readFileSync, outputFileSync } = require('fs-extra')

const {
  dictionary,
  groups
} = require('./style-dictionary')
const collect = require('./utils/collect')

const glob = require('glob').sync

const registerPartials = (pattern) => {
  glob(pattern)
    .map(path => {
      const name = path.replace('./templates/partials/', '').replace('.partial.hbs', '').replace('/', '-')
      const contents = readFileSync(resolve(path), 'utf-8')
      Handlebars.registerPartial(name, contents)

      return { name, contents }
    })
}

Handlebars.registerHelper('debug', value => {
  if (isObject(value) || isArray(value)) {
    return JSON.stringify(value, null, 2)
  }

  return value
})

const transformTokens = (tokens) => {
  return dictionary.extend({
    tokens,
    platforms: {
      docs: { transforms: groups.web }
    }
  }).exportPlatform('docs')
}

const groupTokens = (flattenedTokens) => {
  const tokensByTheme = groupBy(flattenedTokens, 'attributes.theme')
  return mapValues(tokensByTheme, app => groupBy(app, 'attributes.category'))
}

function buildDocsFile (template, context, outputDir = []) {
  const compile = Handlebars.compile(template, { preventIndent: true })
  const generatedContents = compile(context)
  const outputFilePath = resolve(process.cwd(), ...outputDir, 'index.html')
  outputFileSync(outputFilePath, generatedContents)
  console.log(`  - Written file ${outputFilePath}`)
  return outputFilePath
}

async function createTokensDocumentation (config) {
  console.log('Building Documentation for design tokens...')

  registerPartials('./templates/partials/**/*.partial.hbs')
  const mainTemplateContents = readFileSync(resolve(__dirname, '../templates/docs.hbs'), 'utf8')
  const tokens = readJsonSync('temp/tokens.json')
  const transformedTokens = transformTokens(tokens)
  const flattenedTokens = collect(transformedTokens, (node) => node.value && node.original)
  const groupedTokens = groupTokens(flattenedTokens)

  buildDocsFile(mainTemplateContents, groupedTokens, [config.docsDir])

  Object.entries(groupedTokens).forEach(([theme, categories]) => {
    buildDocsFile(mainTemplateContents, { theme, categories }, [config.docsDir, kebabCase(theme)])

    Object.entries(categories).forEach(([category, tokens]) => {
      buildDocsFile(mainTemplateContents, { theme, category, tokens }, [config.docsDir, kebabCase(theme), kebabCase(category)])
    })
  })

  console.log('Done.\r\n')
}

module.exports = createTokensDocumentation

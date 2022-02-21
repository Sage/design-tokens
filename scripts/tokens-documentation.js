/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const { resolve } = require('path')
const omod = require('omod').omod

const Handlebars = require('handlebars')
const groupBy = require('lodash/groupBy')
const kebabCase = require('lodash/kebabCase')
const mapValues = require('lodash/mapValues')
const isArray = require('lodash/isArray')
const isObject = require('lodash/isObject')

const {
  readJsonSync,
  readFileSync,
  outputFileSync
} = require('fs-extra')

const {
  dictionary,
  groups
} = require('./style-dictionary')
const collect = require('./utils/collect')
const glob = require('glob').sync

Handlebars.registerHelper('debug', value => {
  if (isObject(value) || isArray(value)) {
    return JSON.stringify(value, null, 2)
  }

  return value
})

Handlebars.registerHelper('kebabCase', string => kebabCase(string))

Handlebars.registerHelper('urlPrefix', (context) => {
  const prefixes = {
    general: '',
    theme: '../',
    category: '../../'
  }
  return prefixes[context.data.root.bodyType]
})

Handlebars.registerHelper('prefixedPartial', function (context, prop, prefix, options) {
  const partialName = kebabCase(prefix ? `${prefix}-${context[prop]}` : context[prop])
  const partial = Handlebars.partials[partialName]

  if (!partial) {
    return `Partial ${partialName} is missing. (${Object.keys(Handlebars.partials)})`
  }
  const template = Handlebars.compile(partial, options)

  return new Handlebars.SafeString(template(context))
})

const registerPartials = (pattern) => {
  const [prefix, suffix] = pattern.split('**/*')

  return glob(pattern)
    .map(path => {
      const name = path.replace(prefix, '')
        .replace(suffix, '')
        .replace('/', '-')
      const contents = readFileSync(resolve(path), 'utf-8')

      Handlebars.registerPartial(name, contents)

      return {
        name,
        contents
      }
    })
}

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

((config) => {
  console.log('Building Documentation for design tokens...')

  registerPartials(config.partials)

  const mainTemplateContents = readFileSync(resolve(process.cwd(), config.mainTemplate), 'utf8')

  const tokens = readJsonSync('temp/tokens.json')

  const transformedTokens = transformTokens(tokens)
  const flattenedTokens = collect(transformedTokens, (node) => node.value && node.original)
  const filteredTokens = flattenedTokens.filter((token) => token.attributes.category !== 'meta')
  const groupedTokens = groupTokens(filteredTokens)

  const navigation = omod(groupedTokens, undefined, node => node?.name ? undefined : node)

  buildDocsFile(mainTemplateContents, {
    title: '',
    bodyType: 'general',
    themes: groupedTokens,
    navigation
  }, [config.docsDir])

  Object.entries(groupedTokens).forEach(([theme, categories]) => {
    buildDocsFile(mainTemplateContents, {
      title: theme,
      bodyType: 'theme',
      themeName: theme,
      categories,
      navigation
    }, [config.docsDir, kebabCase(theme)])

    Object.entries(categories).forEach(([category, tokens]) => {
      buildDocsFile(mainTemplateContents, {
        title: `${theme} / ${category}`,
        bodyType: 'category',
        themeName: theme,
        categoryName: category,
        tokens,
        navigation
      }, [config.docsDir, kebabCase(theme), kebabCase(category)])
    })
  })

  console.log('Done.\r\n')
})({
  mainTemplate: 'templates/layout.hbs',
  partials: 'templates/partials/**/*.hbs',
  docsDir: 'dist/docs/tokens'
})

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const { resolve } = require('path')
const Handlebars = require('handlebars')
const isArray = require('lodash/isArray')
const isObject = require('lodash/isObject')
const kebabCase = require('lodash/kebabCase')
const { readFileSync, outputFileSync } = require('fs-extra')

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

Handlebars.registerHelper('json', (context) => {
  return JSON.stringify(context)
})

function buildFile (template, context, outputFile = []) {
  const compile = Handlebars.compile(template, { preventIndent: true })
  const generatedContents = compile(context)
  const outputFilePath = resolve(process.cwd(), ...outputFile)
  outputFileSync(outputFilePath, generatedContents)
  console.log(`  - Written file ${outputFilePath}`)
  return outputFilePath
}

module.exports = (pattern) => {
  const [prefix, suffix] = pattern.split('**/*')

  glob(pattern)
    .forEach(path => {
      const name = path.replace(prefix, '')
        .replace(suffix, '')
        .replace('/', '-')
      const contents = readFileSync(resolve(path), 'utf-8')

      Handlebars.registerPartial(name, contents)
    })

  return buildFile
}

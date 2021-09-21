/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const styleDictionary = require('style-dictionary')
const filename = require('./utils/filename')
const transforms = require('./transforms/transforms').transforms

const formats = [
  require('./formats/es6-module-flat.format'),
  require('./formats/docs.format')
]

Object.values(transforms).forEach(transform => styleDictionary.registerTransform(transform))
formats.forEach(format => styleDictionary.registerFormat(format))

styleDictionary.registerParser({
  pattern: /\.json$/,
  parse: ({ filePath, contents }) => {
    const themeName = filename(filePath)

    if (themeName === 'all') {
      return JSON.parse(contents)
    }

    return { [themeName]: JSON.parse(contents) }
  }
})

module.exports = styleDictionary

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const styleDictionary = require('style-dictionary')
const transforms = require('./transforms/transforms').transforms

const formats = [
  require('./formats/es6-module-flat.format'),
  require('./formats/docs.format')
]

Object.values(transforms).forEach(transform => styleDictionary.registerTransform(transform))
formats.forEach(format => styleDictionary.registerFormat(format))

module.exports = styleDictionary

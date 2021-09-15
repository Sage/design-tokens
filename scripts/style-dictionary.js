/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const styleDictionary = require('style-dictionary')

const transforms = [
  require('./transforms/custom-attributes-default.transform'),
  require('./transforms/custom-name-camel.transform'),
  require('./transforms/custom-value-references.transform'),
  require('./transforms/custom-value-typography.transform')
]

const formats = [
  require('./formats/es6-module-flat.format'),
  require('./formats/docs.format')
]

const groups = [
  require('./transforms/web.group')
]

transforms.forEach(transform => styleDictionary.registerTransform(transform))
formats.forEach(format => styleDictionary.registerFormat(format))
groups.forEach(group => styleDictionary.registerTransformGroup(group))

module.exports = styleDictionary

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const styleDictionary = require('style-dictionary')
const { registerTransforms } = require('@tokens-studio/sd-transforms')
const { resolve } = require('path')
const glob = require('glob').sync

const transforms = glob('./scripts/transforms/*.transform.js').map(path => require(resolve(path)))
const formats = glob('./scripts/formats/*.format.js').map(path => require(resolve(path)))
const groups = {
  web: [
    // // 'custom/attributes/default',
    // 'custom/name/camel',
    // 'custom/value/css-eval',
    // // 'ts/color/css/hexrgba',
    // 'ts/descriptionToComment',
    // 'ts/color/modifiers',
    // 'custom/value/css-box-shadow',
    // 'custom/value/css-typography',
    // 'custom/value/css-font-weight'
    'name/cti/camel',
    'ts/descriptionToComment',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/typography/css/shorthand',
    'ts/border/css/shorthand',
    'ts/shadow/css/shorthand',
    'ts/color/modifiers'
  ],
  name: [
    // 'custom/attributes/default',
    'custom/name/camel'
  ],
  mobile: [
    // 'custom/attributes/default',
    'custom/name/camel',
    'custom/value/css-box-shadow',
    'custom/value/css-typography'
  ]
}

registerTransforms(styleDictionary, {
  'ts/color/modifiers': {
    format: 'hex'
  }
})
transforms.forEach(transform => styleDictionary.registerTransform(transform))
formats.forEach(format => styleDictionary.registerFormat(format))

module.exports = {
  dictionary: styleDictionary,
  transforms,
  formats,
  groups
}

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Transform group for web
 */

const transforms = {
  customValueBoxShadow: require('./custom-value-css-box-shadow.transform'),
  customAttributesDefault: require('./custom-attributes-default.transform'),
  customNameCamel: require('./custom-name-camel.transform')
}

const base = [
  transforms.customAttributesDefault.name
]

const groups = {
  web: [
    ...base,
    transforms.customNameCamel.name
  ],
  css: [
    ...base,
    transforms.customValueBoxShadow.name,
    transforms.customNameCamel.name
  ]
}

module.exports = {
  transforms,
  groups
}

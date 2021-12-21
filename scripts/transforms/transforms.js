/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Transform group for web
 */

const transforms = {
  customValueTypography: require('./custom-value-css-typography.transform'),
  customValueBoxShadow: require('./custom-value-css-box-shadow.transform'),
  customAttributesDefault: require('./custom-attributes-default.transform'),
  customValueColors: require('./custom-value-colors.transform'),
  customValueReferences: require('./custom-value-references.transform'),
  customNameCamel: require('./custom-name-camel.transform')
}

const base = [
  transforms.customAttributesDefault.name,
  transforms.customValueReferences.name,
  transforms.customValueColors.name
]

const groups = {
  web: [
    ...base,
    transforms.customNameCamel.name
  ],
  css: [
    ...base,
    transforms.customValueTypography.name,
    transforms.customValueBoxShadow.name,
    transforms.customNameCamel.name
  ]
}

module.exports = {
  transforms,
  groups
}

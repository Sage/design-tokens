/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Transform group for web
 */

const transforms = {
  customValueBoxShadow: require('./custom-value-css-box-shadow.transform'),
  customValueTypography: require('./custom-value-css-typography.transform'),
  customAttributesDefault: require('./custom-attributes-default.transform'),
  customNameCamel: require('./custom-name-camel.transform')
}

const groups = {
  web: [
    transforms.customAttributesDefault.name,
    transforms.customValueBoxShadow.name,
    transforms.customValueTypography.name,
    transforms.customNameCamel.name
  ],
  css: [
    transforms.customAttributesDefault.name,
    transforms.customValueBoxShadow.name,
    transforms.customValueTypography.name,
    transforms.customNameCamel.name
  ]
}

module.exports = {
  transforms,
  groups
}

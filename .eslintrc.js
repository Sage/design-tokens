/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
module.exports = {
  env: {
    es2021: true,
    node: true
  },
  plugins: [
    'header'
  ],
  extends: ['standard', 'plugin:storybook/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'header/header': [
      2,
      'block',
      '\nCopyright © 2021 The Sage Group plc or its licensors. All Rights reserved\n '
    ]
  }
}

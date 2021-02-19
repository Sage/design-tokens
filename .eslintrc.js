/*
Copyright 2021
The Sage Group plc.
 */
module.exports = {
  env: {
    es2021: true,
    node: true
  },
  plugins: [
    'header'
  ],
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'header/header': [
      2,
      'block',
      '\nCopyright 2021\nThe Sage Group plc.\n '
    ]
  }
}

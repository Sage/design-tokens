/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const setWith = require('lodash/setWith')
const fileHeader = require('../_utils/fileHeader.js')
const fetchReferenceValue = require('../_utils/fetchReferenceValue')

module.exports = function (styleDictionary) {
  styleDictionary.registerFormat({
    name: 'custom/js/constant',
    formatter: function (dictionary) {
      const outputObject = {}

      dictionary.allProperties.forEach((token) => {
        const tokenValue = fetchReferenceValue(token)
        setWith(outputObject, token.name, tokenValue, Object)
      })

      const output = Object.entries(outputObject).map(([constName, constValues]) => {
        return `export const ${constName} = ${JSON.stringify(constValues, null, 2)}`
      })

      return fileHeader + '\r\n\r\n' + output.join('\r\n\r\n')
    }
  })
}

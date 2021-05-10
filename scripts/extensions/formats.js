/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const setWith = require('lodash/setWith')
const fileHeader = require('../_utils/fileHeader.js')

function fetchReferenceValue (token) {
  if (String(token.original?.value).startsWith('{') && typeof token.value === 'object') {
    return token.value?.value
  }

  return token.value
}

module.exports = function (styleDictionary) {
  styleDictionary.registerFormat({
    name: 'custom/js/constant',
    formatter: function (dictionary) {
      const outputObject = {}
      const output = []

      dictionary.allProperties.forEach((token) => {
        const tokenValue = fetchReferenceValue(token)
        setWith(outputObject, token.name, tokenValue, Object)
      })

      Object.entries(outputObject).forEach(([constName, constValues]) => {
        const outputConst = `export const ${constName} = ${JSON.stringify(constValues, null, 2)}`
        output.push(outputConst)
      })

      return fileHeader + '\r\n\r\n' + output.join('\r\n\r\n')
    }
  })
}

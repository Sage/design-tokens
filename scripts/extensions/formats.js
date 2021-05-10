/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const setWith = require('lodash/setWith')
const fileHeader = require('../_utils/fileHeader.js')

module.exports = function (styleDictionary) {
  styleDictionary.registerFormat({
    name: 'custom/js/constant',
    formatter: function (dictionary) {
      const outputObject = {}

      dictionary.allProperties.forEach((token) => {
        setWith(outputObject, token.name, token.value, Object)
      })

      const output = Object.entries(outputObject).map(([constName, constValues]) => {
        return `export const ${constName} = ${JSON.stringify(constValues, null, 2)}`
      })

      return fileHeader + '\r\n\r\n' + output.join('\r\n\r\n')
    }
  })
}

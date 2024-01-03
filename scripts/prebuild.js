/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */
const { resolve } = require('path')
const {
  removeSync
} = require('fs-extra')

const distFolder = resolve(__dirname, '../dist')

;(() => {
  console.log('Clearing /dist folder...')
  removeSync(distFolder)
  console.log('Done.\r\n')
})()

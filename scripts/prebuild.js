/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const path = require('path')
const fs = require('fs-extra')

// Delete the contents of dist
const distFolder = path.resolve(__dirname, '../dist')
console.log('Clearing /dist folder')
fs.remove(distFolder)

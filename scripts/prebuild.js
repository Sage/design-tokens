/*
Copyright 2021
The Sage Group plc.
 */
const path = require('path')
const fs = require('fs-extra')

// Delete the contents of dist
const distFolder = path.resolve(__dirname, '../dist')
fs.remove(distFolder)

/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const path = require('path')
const fs = require('fs-extra')

const tokensJSON = process.argv[2]
const tokens = JSON.parse(tokensJSON)

// Delete the existing data folder
async function deleteExistingData () {
  const dataFolder = path.resolve(__dirname, '../data')
  await fs.remove(dataFolder)
  await fs.ensureDir(dataFolder)
}

function addUnits (obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      addUnits(obj)
    }
    if (obj.value && obj?.unit === 'pixel') {
      obj.value += 'px'
    }
  })
}

// Splits the tokens into seperate files
async function writeNewData () {
  // Add units to the data correctly
  addUnits(tokens)
  // Split the incoming data into seperate files based on top level category
  const writeFiles = Object.keys(tokens).map((key) => {
    const output = {
      [key]: tokens[key]
    }
    return fs.writeJson(
      path.resolve(__dirname, `../data/${key}.json`),
      output,
      {
        spaces: 4
      }
    )
  })
  await Promise.all(writeFiles)
}

async function main () {
  await deleteExistingData()
  await writeNewData()
  // Any cleanup actions can be added here
}

main()

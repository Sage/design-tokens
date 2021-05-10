/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const path = require('path')
const fs = require('fs-extra')

const tokensJSON = process.argv[2]
const tokens = JSON.parse(tokensJSON)

const tokenValues = tokens?.record.values

// Delete the existing data folder
async function deleteExistingData () {
  const dataFolder = path.resolve(__dirname, '../data')
  await fs.remove(dataFolder)
  await fs.ensureDir(dataFolder)
}

// Splits the tokens into seperate files
async function writeNewData (data) {
  const filePath = path.resolve(__dirname, '../data/tokens.json')
  return fs.writeJson(
    filePath,
    data,
    {
      spaces: 4
    }
  )
}

async function main () {
  await deleteExistingData()
  await writeNewData(tokenValues)
  // Any cleanup actions can be added here
}

main()

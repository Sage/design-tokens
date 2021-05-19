/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const path = require('path')
const fs = require('fs-extra')

const tokensJSON = process.argv[2]
const tokens = JSON.parse(tokensJSON)

const tokenValues = tokens?.record.values

function parseOutput (tokensData) {
  const walk = (item) => {
    switch (typeof item) {
      case 'string':
      case 'number':
        return { value: item }
      case 'object': {
        if ('value' in item) {
          return item
        }

        const output = Object
          .keys(item)
          .map((key) => [key, walk(item[key])])

        return Object.fromEntries(output)
      }
    }
  }

  // We need namespace information for the tokens
  return walk(tokensData)
}

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
    parseOutput(data),
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

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

// Parses tokens data object to format compatible with style-dictionary.
function parseOutput (namespace, category, tokensData) {
  const walk = (item) => {
    switch (typeof item) {
      case 'string':
      case 'number':
        return { value: item }
      case 'object': {
        if (item.value) {
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
  return {
    [namespace]: {
      [category]: walk(tokensData)
    }
  }
}

// Splits the tokens into seperate files
async function writeNewData () {
  // Split the incoming data into seperate files and directories based on top level category
  const writeFiles = Object.keys(tokenValues).map((namespace) => {
    const directory = path.resolve(__dirname, `../data/${namespace}`)
    fs.ensureDirSync(directory)

    return Object.keys(tokenValues[namespace]).map((category) => {
      const output = parseOutput(namespace, category, tokenValues[namespace][category])
      const filePath = path.resolve(directory, `${category}.json`)

      console.log('Creating file', filePath)

      return fs.writeJson(
        filePath,
        output,
        {
          spaces: 4
        }
      )
    })
  })

  await Promise.all(writeFiles.flat())
}

async function main () {
  await deleteExistingData()
  await writeNewData()
  // Any cleanup actions can be added here
}

main()

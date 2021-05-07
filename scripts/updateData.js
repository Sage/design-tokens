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

function parseOutput (category, tokensData) {
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

  return {
    [category]: walk(tokensData)
  }
}

async function writeNewData () {
  // Split the incoming data into seperate files based on top level category

  const writeFiles = Object.keys(tokenValues).map((namespace) => {
    const directory = path.resolve(__dirname, `../data/${namespace}`)
    fs.ensureDirSync(directory)

    return Object.keys(tokenValues[namespace]).map((category) => {
      // const output = tokenValues[namespace][category]
      // const output = {
      //   [namespace]: {
      //     [category]: tokenValues[namespace][category]
      //   }
      // }
      const output = parseOutput(category, tokenValues[namespace][category])

      return fs.writeJson(
        path.resolve(directory, `${category}.json`),
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

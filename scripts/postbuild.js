/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const { resolve } = require('path')
const {
  readJsonSync,
  outputJsonSync,
  copySync,
  outputFileSync,
  readFileSync,
  removeSync
} = require('fs-extra')
const pick = require('lodash/pick')
const camelCase = require('lodash/camelCase')
const glob = require('glob').sync
const tsc = require('node-typescript-compiler')

const filename = require('./utils/filename')
const headerContents = require('./utils/file-header')
const createTokensDocumentation = require('./tokens-documentation')

function copyPackageJSON () {
  try {
    const packageDef = readJsonSync(resolve(__dirname, '../package.json'))
    const filteredPackageDef = pick(
      packageDef,
      ['name', 'dependencies', 'repository', 'description', 'author', 'version', 'peerDependencies', 'license', 'tags']
    )

    filteredPackageDef.private = false

    // Writes to package.json in dist
    outputJsonSync(
      resolve(__dirname, '../dist/package.json'),
      filteredPackageDef,
      {
        spaces: 4
      }
    )
  } catch (err) {
    console.log('Error copying package.json')
    console.log(err)
  }
}

function copyReadme () {
  try {
    copySync(
      resolve(__dirname, '../README.md'),
      resolve(__dirname, '../dist/README.md')
    )
  } catch (err) {
    console.log('Error copying readme to dist')
    console.log(err)
  }
}

function copyData () {
  try {
    copySync(
      resolve(__dirname, '../temp/tokens.json'),
      resolve(__dirname, '../dist/data/tokens.json')
    )
  } catch (err) {
    console.log('Error copying data to dist')
    console.log(err)
  }
}

async function generateTSDefinitions () {
  if (process.platform === 'win32') {
    console.log('Typescript compiler was not executed, since current platform is win32.')
    return
  }

  try {
    await tsc.compile({
      project: resolve(__dirname, '../tsconfig.json')
    })
  } catch (err) {
    console.log('Error compiling typescript')
    console.log(err)
  }
}

function addEntryFile () {
  const jsFilePaths = glob('./dist/js/**/*.js')
  const entryFilePath = resolve(__dirname, '../dist/index.js')

  const fileExports = jsFilePaths
    .map((filePath) => {
      const [theme, fullName] = filePath.split('/').slice(-2)
      const name = filename(fullName)
      return {
        theme,
        name
      }
    })
    .map((file) => {
      const exportName = camelCase(`${file.theme} ${file.name}`)
      return `export * as ${exportName} from './js/${file.theme}/${file.name}'`
    }).join('\n')
  outputFileSync(entryFilePath, '\n' + fileExports + '\n')
}

function addFileHeader () {
  const files = glob('dist/**/*.@(js|css|ts|d.ts|scss|less)')
  files.forEach((file) => {
    try {
      const filePath = resolve(__dirname, '../', file)
      const outputData = headerContents + '\r\n\r\n' + readFileSync(filePath)

      outputFileSync(filePath, outputData)
    } catch (er) {
      console.error(`Error adding header to ${file}`, er)
    }
  })
}

function clearTempDir () {
  const tempFolder = resolve(__dirname, '../temp')
  console.log('Clearing /temp folder')
  removeSync(tempFolder)
}

async function main () {
  copyPackageJSON()
  copyReadme()
  copyData()
  addEntryFile()
  addFileHeader()
  await generateTSDefinitions()
  await createTokensDocumentation({
    docsDir: 'dist/docs/tokens'
  })
  clearTempDir()
}

main()

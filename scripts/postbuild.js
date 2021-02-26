/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const path = require('path')
const fs = require('fs-extra')
const pick = require('./_utils/pick')
const tsc = require('node-typescript-compiler')

async function copyAssets () {
  try {
    await fs.copy(
      path.resolve(__dirname, '../assets'),
      path.resolve(__dirname, '../dist/assets')
    )
  } catch (err) {
    console.log('Error copying assets to dist')
    console.log(err)
  };
}

async function copyCommon () {
  try {
    await fs.copy(
      path.resolve(__dirname, '../common'),
      path.resolve(__dirname, '../dist/common')
    )
  } catch (err) {
    console.log('Error copying common to dist')
    console.log(err)
  }
}

async function copyPackageJSON () {
  try {
    const packageDef = await fs.readJson(path.resolve(__dirname, '../package.json'))
    const filteredPackageDef = pick(
      packageDef,
      ['name', 'dependencies', 'repository', 'private', 'description', 'author', 'version', 'peerDependencies']
    )
    await fs.writeJson(
      path.resolve(__dirname, '../dist/package.json'),
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

async function generateTSDefinitions () {
  await tsc.compile({
    project: path.resolve(__dirname, '../tsconfig.json')
  })
}

async function main () {
  copyAssets()
  copyCommon()
  copyPackageJSON()
  generateTSDefinitions()
}

main()

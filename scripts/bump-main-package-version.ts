/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'

const { readJsonSync, outputJsonSync } = fs
const currentFile = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFile)

console.log('Bumping version in main package.json file...')
try {
  const mainPackageJsonFilePath = resolve(currentDir, '../package.json')
  const distPackageJsonFilePath = resolve(currentDir, '../dist/package.json')

  const version = readJsonSync(distPackageJsonFilePath).version
  const mainPackageJson = readJsonSync(mainPackageJsonFilePath)
  const outputPackageJson = { ...mainPackageJson, version }

  outputJsonSync('./package.json', outputPackageJson, { spaces: 2 })

  console.log('Done.\r\n')
} catch (err) {
  console.log('Error!\r\n')
  console.log(err)
}

/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */
import { resolve } from 'path'
import { readJsonSync, outputJsonSync } from 'fs-extra'

console.log('Bumping version in main package.json file...')
try {
  const mainPackageJsonFilePath = resolve(__dirname, '../package.json')
  const distPackageJsonFilePath = resolve(__dirname, '../dist/package.json')

  const version = readJsonSync(distPackageJsonFilePath).version
  const mainPackageJson = readJsonSync(mainPackageJsonFilePath)
  const outputPackageJson = { ...mainPackageJson, version }

  outputJsonSync('./package.json', outputPackageJson, { spaces: 2 })

  console.log('Done.\r\n')
} catch (err) {
  console.log('Error!\r\n')
  console.log(err)
}

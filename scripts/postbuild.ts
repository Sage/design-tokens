/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import camelCase from 'lodash/camelCase.js'
import pick from 'lodash/pick.js'
import { FontAssetType } from 'fantasticon'
import { sync } from 'glob'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { FileName } from './utils/filename.js'
import { HeaderContents } from './utils/file-header.js'

import { Icons } from './icons.js'

dotenv.config()

function copyPackageJSON () {
  try {
    const packageDef = fs.readJsonSync(resolve(__dirname, '../package.json'))
    const filteredPackageDef = pick(
      packageDef,
      ['name', 'dependencies', 'repository', 'description', 'author', 'version', 'peerDependencies', 'license', 'tags']
    )

    //filteredPackageDef.private = false

    // Writes to package.json in dist
    fs.outputJsonSync(
      resolve(__dirname, '../dist/package.json'),
      filteredPackageDef,
      {
        spaces: 2
      }
    )
  } catch (err) {
    console.log('Error copying package.json')
    console.log(err)
  }
}

function copyReadme () {
  try {
    fs.copySync(
      resolve(__dirname, '../README.md'),
      resolve(__dirname, '../dist/README.md')
    )
  } catch (err) {
    console.log('Error copying readme to dist')
    console.log(err)
  }
}

function addEntryFile () {
  const jsFilePaths = sync('./dist/js/*/*/{large.small}/*.js')
  const jsComponentPaths = sync('./dist/js/*/*/components/*/*.js')
  const entryFilePath = resolve(__dirname, '../dist/index.js')

  const fileExports = jsFilePaths
    .map((filePath: string): {mode?: string, name?: string, theme?: string, type?: string} | {} => {
      const [mode, theme, type, fullName] = filePath.split('/').slice(-4)
      const name = FileName(fullName)
      return {
        mode,
        theme,
        type,
        name
      }
    })
    .map((file: {mode?: string, name?: string, theme?: string, type?: string}) => {
      const exportName = camelCase(`${file.mode} ${file.theme} ${file.type} ${file.name}`)
      return `export * as ${exportName} from './js/${file.mode}/${file.theme}/${file.type}/${file.name}'`
    }).join('\n')
  const componentExports = jsComponentPaths
    .map((filePath: string): {component?: string, components?: string, mode?: string, name?: string, theme?: string} | {} => {
      const [mode, theme, components, component, fullName] = filePath.split('/').slice(-5)
      const name = FileName(fullName)
      return {
        mode,
        theme,
        components,
        component,
        name
      }
    })
    .map((file: {component?: string, components?: string, mode?: string, name?: string, theme?: string}) => {
      const exportName = camelCase(`${file.mode} ${file.theme} ${file.component} ${file.name}`)
      return `export * as ${exportName} from './js/${file.mode}/${file.theme}/${file.component}/${file.name}'`
    }).join('\n')
  fs.outputFileSync(entryFilePath, '\n' + fileExports + '\r\n\r\n' + componentExports + '\n')
}

function addFileHeader () {
  const files = sync('dist/**/*.@(css|js|ts|d.ts|scss|less)')
  files.forEach((file: string) => {
    try {
      const filePath = resolve(__dirname, '../', file)
      const outputData = HeaderContents() + '\r\n\r\n' + fs.readFileSync(filePath)

      fs.outputFileSync(filePath, outputData)
    } catch (er) {
      console.error(`Error adding header to ${file}`, er)
    }
  })
}

function copyAssets () {
  try {
    fs.copySync(
      resolve(__dirname, '../assets'),
      resolve(__dirname, '../dist/assets/')
    )
  } catch (err) {
    console.log('Error copying assets to dist')
    console.log(err)
  }
}

(async () => {
  copyPackageJSON()
  copyReadme()
  copyAssets()
  addEntryFile()
  addFileHeader()
  await Icons({
    personalAccessToken: process.env['FIGMA_ACCESS_TOKEN'],
    fileId: process.env['FIGMA_FILE_ID'],
    pages: ['Icons'],
    multipleSets: false,
    distDir: './dist',
    svgDir: './dist/assets/icons/svg',
    fontsDir: './dist/assets/icons/fonts',
    dataDir: './dist/assets/icons/data',
    fontName: 'sage-icons',
    formats: [FontAssetType.SVG, FontAssetType.WOFF, FontAssetType.WOFF2, FontAssetType.TTF, FontAssetType.EOT],
    mainTemplate: './templates/layout.hbs',
    docsDir: './dist/docs/icons/',
    docsPartials: './templates/partials/**/*.hbs',
    meta: {
      description: 'Sage Icon Font',
      url: 'http://sage.com',
      copyright: 'Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved.',
      version: '1.0'
    }
  })
})()

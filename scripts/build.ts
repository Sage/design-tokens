/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import * as fs from "fs"
import { StyleDictionary, groups } from './style-dictionary.js'
import { DesignToken, File } from 'style-dictionary/types'
import { FilterComponent } from './utils/filter-component.js'
import { Config } from "style-dictionary"

const components = fs.readdirSync('./data/tokens/components/')
const modes = fs.readdirSync('./data/tokens/modes/')

interface IMode {
  modeName?: string
  format: string
  suffix: string
}

interface IFiles extends IMode {
  componentName: string
  outputRefs?: boolean
}

const getMode = ({modeName = '', format, suffix}: IMode): File[] => {
  const mode = format.includes('variables') ? '' : modeName

  const componentArray: File[] = []

  components.forEach((component) => {
    const componentName = component.split('.json')[0]

    if (!componentName) {
      throw new Error(
        `Component name not found for ${component}`)
    }

    componentArray.push(...getFiles({componentName, modeName: mode, format, suffix, outputRefs: true}))
  })
  
  return [
    ...getFiles({componentName: 'modes', modeName, format, suffix}),
    ...componentArray
  ]
}

const getFiles = ({componentName, modeName = '', format, suffix, outputRefs = false}: IFiles): File[] => {

  const getPath = (componentName: string) => {
    let path = ""

    switch(componentName) {
      case 'modes':
        path = modeName;
        break
      case 'global':
        path = 'global';
        break
      default:
        path = `components/${componentName}`;
    }

    return path
  }

  const path = getPath(componentName).trim()

  return [
    {
      destination: `${path}.${suffix}`,
      filter: (token: DesignToken) => FilterComponent(token, componentName, format.includes('json')),
      format,
      options: {
        outputReferences: outputRefs
      }
    }
  ]
}

const getGlobalConfig = (): Config => {
  return {
    source: [
      './data/tokens/core.json',
      './data/tokens/global/*.json'
    ],
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getFiles({componentName: 'global', format: 'css/variables', suffix: 'css'})
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getFiles({componentName: 'global', format: 'scss/variables', suffix: 'scss'})
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getFiles({componentName: 'global', format: 'javascript/module', suffix: 'js'}),
          ...getFiles({componentName: 'global', format: 'typescript/module-declarations', suffix: 'd.ts'}),
          ...getFiles({componentName: 'global', format: 'javascript/es6', suffix: 'js'}),
          ...getFiles({componentName: 'global', format: 'typescript/es6-declarations', suffix: 'd.ts'}),
          ...getFiles({componentName: 'global', format: 'javascript/umd', suffix: 'js'})
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getFiles({componentName: 'global', format: 'json/flat', suffix: 'json'})
        ]
      },
      // todo: debug android build
      // android: {
      //   buildPath: 'dist/android/',
      //   transforms: groups.mobile,
      //   files: [
      //     ...getFiles({componentName: 'global', format: 'android/resources', suffix: 'xml'})
      //   ]
      // },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getFiles({componentName: 'global', format: 'ios/macros', suffix: 'h'})
        ]
      }
    },
    log: {
      warnings: "warn" as const,
      verbosity: "verbose" as const,
      errors: {
        brokenReferences: "throw" as const,
      },
    },
  }
}

const getModeConfig = (modeName: string): Config => {
  return {
    source: [
      './data/tokens/core.json',
      './data/tokens/global/*.json',
      `./data/tokens/modes/${modeName}.json`,
      './data/tokens/components/*.json'
    ],
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getMode({modeName, format: 'css/variables', suffix: 'css'})
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getMode({modeName, format: 'scss/variables', suffix: 'scss'})
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getMode({modeName, format: 'javascript/module', suffix: 'js'}),
          ...getMode({modeName, format: 'typescript/module-declarations', suffix: 'd.ts'}),
          ...getMode({modeName, format: 'javascript/es6', suffix: 'js'}),
          ...getMode({modeName, format: 'typescript/es6-declarations', suffix: 'd.ts'}),
          ...getMode({modeName, format: 'javascript/umd', suffix: 'js'})
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getMode({modeName, format: 'json/flat', suffix: 'json'})
        ]
      },
      // todo: debug android build
      // android: {
      //   buildPath: 'dist/android/',
      //   transforms: groups.mobile,
      //   files: [
      //     ...getMode({modeName, format: 'android/resources', suffix: 'xml'})
      //   ]
      // },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getMode({modeName, format: 'ios/macros', suffix: 'h'})
        ]
      }
    },
    log: {
      warnings: "warn" as const,
      verbosity: "verbose" as const,
      errors: {
        brokenReferences: "throw" as const,
      },
    },
  }
}

// Build global tokens
const globalStyleDictionary = new StyleDictionary(getGlobalConfig())

await globalStyleDictionary.buildPlatform('css')
await globalStyleDictionary.buildPlatform('scss')
await globalStyleDictionary.buildPlatform('js')
await globalStyleDictionary.buildPlatform('json')
await globalStyleDictionary.buildPlatform('ios')
// await globalStyleDictionary.buildPlatform('android')

// Build mode-specific tokens
modes.forEach(async (mode) => {
  const modeName = mode.split('.json')[0]

  if (!modeName) {
    throw new Error(
      `Mode name not found for ${mode}`)
  }

  const modeStyleDictionary = new StyleDictionary(getModeConfig(modeName))

  await modeStyleDictionary.buildPlatform('css')
  await modeStyleDictionary.buildPlatform('scss')
  await modeStyleDictionary.buildPlatform('js')
  await modeStyleDictionary.buildPlatform('json')
  await modeStyleDictionary.buildPlatform('ios')
  // await modeStyleDictionary.buildPlatform('android')
})

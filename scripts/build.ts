/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import * as fs from "fs"
import { StyleDictionary, groups } from './style-dictionary.js'
import { DesignToken, File } from 'style-dictionary/types'
import { FilterComponent } from './utils/filter-component.js'

const components = fs.readdirSync('./data/tokens/components/')
const context = fs.readdirSync('./data/tokens/context/')
const modes = fs.readdirSync('./data/tokens/modes/')
const screensize = fs.readdirSync('./data/tokens/screensize/')

interface IMode {
  modeName?: string
  format: string
  subType: string
  suffix: string
}

interface IFiles extends IMode {
  componentName: string
  outputRefs?: boolean
}

interface IConfig {
  contextName: string
  modeName: string
  sizeName: string
}

const getMode = ({modeName = '', format, subType, suffix}: IMode): File[] => {
  const mode = format.includes('variables') ? '' : modeName

  const componentArray: File[] = []

  components.forEach((component) => {
    const componentName = component.split('.json')[0]

    if (!componentName) {
      throw new Error(
        `Component name not found for ${component}`)
    }

    componentArray.push(...getFiles({componentName, modeName: mode, format, subType, suffix, outputRefs: true}))
  })
  
  return [
    ...getFiles({componentName: 'modes', modeName, format, subType, suffix}),
    ...componentArray
  ]
}

const getFiles = ({componentName, modeName = '', format, subType, suffix, outputRefs = false}: IFiles): File[] => {
  const hasRefs = suffix === 'css' || suffix === 'scss'

  const getPath = (componentName: string) => {
    let path = ""

    switch(componentName) {
      case 'modes':
        path = hasRefs ? modeName : `${modeName}/mode`;
        break
      case 'global':
        path = 'global';
        break
      default:
        path = hasRefs ? `components/${componentName}` : `${modeName}/components/${componentName}`;
    }

    return path
  }

  const path = getPath(componentName).trim()

  return [
    {
      destination: `${subType}/${path}.${suffix}`,
      filter: (token: DesignToken) => FilterComponent(token, componentName),
      format,
      options: {
        outputRefs
      }
    }
  ]
}

const getGlobalConfig = ({contextName, sizeName}: IConfig) => {
  const subType = `${contextName}/${sizeName}`

  return {
    source: [
      './data/tokens/primitives.json',
      './data/tokens/global/*.json',
      `./data/tokens/screensize/${contextName}.json`,
      `./data/tokens/screensize/${sizeName}.json`
    ],
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getFiles({componentName: 'global', format: 'css/variables', subType, suffix: 'css'})
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getFiles({componentName: 'global', format: 'scss/variables', subType, suffix: 'scss'})
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getFiles({componentName: 'global', format: 'javascript/module', subType: `common/${subType}`, suffix: 'js'}),
          ...getFiles({componentName: 'global', format: 'typescript/module-declarations', subType: `common/${subType}`, suffix: 'd.ts'}),
          ...getFiles({componentName: 'global', format: 'javascript/es6', subType: `es6/${subType}`, suffix: 'js'}),
          ...getFiles({componentName: 'global', format: 'typescript/es6-declarations', subType: `es6/${subType}`, suffix: 'd.ts'}),
          ...getFiles({componentName: 'global', format: 'javascript/umd', subType: `umd/${subType}`, suffix: 'js'})
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getFiles({componentName: 'global', format: 'json/nested', subType: `nested/${subType}`, suffix: 'json'}),
          ...getFiles({componentName: 'global', format: 'json/flat', subType: `flat/${subType}`, suffix: 'json'})
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getFiles({componentName: 'global', format: 'android/resources', subType, suffix: 'xml'})
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getFiles({componentName: 'global', format: 'ios/macros', subType, suffix: 'h'})
        ]
      }
    }
  }
}

const getModeConfig = ({contextName, modeName, sizeName}: IConfig) => {
  const subType = `${contextName}/${sizeName}`

  return {
    source: [
      './data/tokens/primitives.json',
      './data/tokens/global/*.json',
      `./data/tokens/screensize/${contextName}.json`,
      `./data/tokens/modes/${modeName}.json`,
      './data/tokens/components/*.json'
    ],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getMode({modeName, format: 'css/variables', subType, suffix: 'css'})
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getMode({modeName, format: 'scss/variables', subType, suffix: 'scss'})
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getMode({modeName, format: 'javascript/module', subType: `common/${subType}`, suffix: 'js'}),
          ...getMode({modeName, format: 'typescript/module-declarations', subType: `common/${subType}`, suffix: 'd.ts'}),
          ...getMode({modeName, format: 'javascript/es6', subType: `es6/${subType}`, suffix: 'js'}),
          ...getMode({modeName, format: 'typescript/es6-declarations', subType: `es6/${subType}`, suffix: 'd.ts'}),
          ...getMode({modeName, format: 'javascript/umd', subType: `umd/${subType}`, suffix: 'js'})
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getMode({modeName, format: 'json/nested', subType: `nested/${subType}`, suffix: 'json'}),
          ...getMode({modeName, format: 'json/flat', subType: `flat/${subType}`, suffix: 'json'})
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getMode({modeName, format: 'android/resources', subType, suffix: 'xml'})
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getMode({modeName, format: 'ios/macros', subType, suffix: 'h'})
        ]
      }
    }
  }
}

context.forEach(async (context) => {
  const contextName = context.split('.json')[0]

  if (!contextName) {
    throw new Error(
      `Context name not found for ${context}`)
  }

  screensize.forEach(async (size) => {
    const sizeName = size.split('.json')[0]

    if (!sizeName) {
      throw new Error(
        `Size name not found for ${size}`)
    }

    const styleDictionary = new StyleDictionary(getGlobalConfig({contextName, modeName: '', sizeName}))

    await styleDictionary.buildPlatform('css')
    await styleDictionary.buildPlatform('scss')
    await styleDictionary.buildPlatform('js')
    await styleDictionary.buildPlatform('json')
    await styleDictionary.buildPlatform('ios')
    await styleDictionary.buildPlatform('android')

    modes.forEach(async (mode) => {
      const modeName = mode.split('.json')[0]

      if (!modeName) {
        throw new Error(
          `Mode name not found for ${mode}`)
      }

      const styleDictionary = new StyleDictionary(getModeConfig({contextName, modeName, sizeName}))

      await styleDictionary.buildPlatform('css')
      await styleDictionary.buildPlatform('scss')
      await styleDictionary.buildPlatform('js')
      await styleDictionary.buildPlatform('json')
      await styleDictionary.buildPlatform('ios')
      await styleDictionary.buildPlatform('android')
    })
  })
})

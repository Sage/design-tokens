/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

const { readdirSync } = require('fs-extra')
const { dictionary, groups } = require('./style-dictionary')
const filterComponent = require('./utils/filter-component')

const components = readdirSync('./data/tokens/components/')
const context = readdirSync('./data/tokens/context/')
const modes = readdirSync('./data/tokens/modes/')
const screensize = readdirSync('./data/tokens/screensize/')

const getFiles = (contextName, modeName, format, subType, suffix) => {
  const mode = format.includes('variables') ? '' : modeName
  return [
    ...getSplit(contextName, 'modes', modeName, format, subType, suffix, false),
    ...getComponents(contextName, mode, format, subType, suffix)
  ]
}

const getComponents = (contextName, modeName, format, subType, suffix) => {
  const componentArray = []

  components.forEach((component) => {
    componentArray.push(...getSplit(contextName, component.split('.')[0], modeName, format, subType, suffix, true))
  })

  return componentArray
}

const getSplit = (contextName, componentName, modeName, format, subType, suffix, outputReferences) => {
  const hasRefs = suffix === 'css' || suffix === 'scss'

  const getPath = (componentName) => {
    const path = {
      modes: hasRefs ? modeName : `${modeName}/mode`,
      global: '/global'
    }
    return path[componentName] || (hasRefs ? `/components/${componentName}` : `${modeName}/components/${componentName}`)
  }

  const path = getPath(componentName).trim()

  const selector = outputReferences ? `.sds-context-${contextName}[class^="sds-mode-"]` : modeName ? `.sds-context-${contextName}.sds-mode-${modeName}` : `.sds-context-${contextName}`

  return [
    {
      destination: `${subType}/${path}.${suffix}`,
      filter: (token) => filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    }
  ]
}

const getGlobalConfig = (contextName, sizeName) => {
  return {
    source: [
      './data/tokens/primitives.json',
      './data/tokens/global/*.json',
      `./data/tokens/screensize/${contextName}.json`,
      `./data/tokens/screensize/${sizeName}.json`
    ],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getSplit(contextName, 'global', '', sizeName, `${contextName}/${sizeName}`, 'css', false)
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getSplit(contextName, 'global', '', 'scss/variables', `${contextName}/${sizeName}`, 'scss', false)
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getSplit(contextName, 'global', '', 'javascript/module', `common/${contextName}/${sizeName}`, 'js', false),
          ...getSplit(contextName, 'global', '', 'typescript/module-declarations', `common/${contextName}/${sizeName}`, 'd.ts', false),
          ...getSplit(contextName, 'global', '', 'javascript/es6', `es6/${contextName}/${sizeName}`, 'js', false),
          ...getSplit(contextName, 'global', '', 'typescript/es6-declarations', `es6/${contextName}/${sizeName}`, 'd.ts', false),
          ...getSplit(contextName, 'global', '', 'javascript/umd', `umd/${contextName}/${sizeName}`, 'js', false)
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getSplit(contextName, 'global', '', 'json/nested', `nested/${contextName}/${sizeName}`, 'json', false),
          ...getSplit(contextName, 'global', '', 'json/flat', `flat/${contextName}/${sizeName}`, 'json', false)
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getSplit(contextName, 'global', '', 'android/resources', `${contextName}/${sizeName}`, 'xml', false)
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getSplit(contextName, 'global', '', 'ios/macros', `${contextName}/${sizeName}`, 'h', false)
        ]
      }
    }
  }
}

const getModeConfig = (contextName, modeName, sizeName) => {
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
          ...getFiles(contextName, modeName, sizeName, `${contextName}/${sizeName}`, 'css')
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getFiles(contextName, modeName, 'scss/variables', `${contextName}/${sizeName}`, 'scss')
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getFiles(contextName, modeName, 'javascript/module', `common/${contextName}/${sizeName}`, 'js'),
          ...getFiles(contextName, modeName, 'typescript/module-declarations', `common/${contextName}/${sizeName}`, 'd.ts'),
          ...getFiles(contextName, modeName, 'javascript/es6', `es6/${contextName}/${sizeName}`, 'js'),
          ...getFiles(contextName, modeName, 'typescript/es6-declarations', `es6/${contextName}/${sizeName}`, 'd.ts'),
          ...getFiles(contextName, modeName, 'javascript/umd', `umd/${contextName}/${sizeName}`, 'js')
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getFiles(contextName, modeName, 'json/nested', `nested/${contextName}/${sizeName}`, 'json'),
          ...getFiles(contextName, modeName, 'json/flat', `flat/${contextName}/${sizeName}`, 'json')
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getFiles(contextName, modeName, 'android/resources', `${contextName}/${sizeName}`, 'xml')
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getFiles(contextName, modeName, 'ios/macros', `${contextName}/${sizeName}`, 'h')
        ]
      }
    }
  }
}

context.forEach((context) => {
  const contextName = context.split('.json')[0]

  console.log(`\r\nStart building context: ${contextName}\r\n`)

  screensize.forEach((size) => {
    const sizeName = size.split('.json')[0]

    console.log(`\r\nStart building size: ${sizeName}\r\n`)

    const StyleDictionary = dictionary.extend(getGlobalConfig(contextName, sizeName))

    StyleDictionary.buildPlatform('css')
    StyleDictionary.buildPlatform('scss')
    StyleDictionary.buildPlatform('js')
    StyleDictionary.buildPlatform('json')
    StyleDictionary.buildPlatform('ios')
    StyleDictionary.buildPlatform('android')

    modes.forEach((mode) => {
      const modeName = mode.split('.json')[0]

      console.log(`\r\nStart building mode: ${modeName}\r\n`)

      const StyleDictionary = dictionary.extend(getModeConfig(contextName, modeName, sizeName))

      StyleDictionary.buildPlatform('css')
      StyleDictionary.buildPlatform('scss')
      StyleDictionary.buildPlatform('js')
      StyleDictionary.buildPlatform('json')
      StyleDictionary.buildPlatform('ios')
      StyleDictionary.buildPlatform('android')

      console.log(`\r\nDone building mode: ${modeName}\r\n`)
    })

    console.log(`\r\nDone building size: ${sizeName}\r\n`)
  })

  console.log(`\r\nDone building context: ${contextName}\r\n`)
})

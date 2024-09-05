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

const getFiles = (modeName, format, subType, suffix) => {
  const mode = format.includes('variables') ? '' : modeName
  return [
    ...getSplit('modes', modeName, format, subType, suffix, false),
    ...getComponents(mode, format, subType, suffix)
  ]
}

const getComponents = (modeName, format, subType, suffix) => {
  const componentArray = []

  components.forEach((component) => {
    componentArray.push(...getSplit(component.split('.')[0], modeName, format, subType, suffix, true))
  })

  return componentArray
}

const getSplit = (componentName, modeName, format, subType, suffix, outputReferences) => {
  const getPath = (componentName) => {
    const path = {
      modes: '/mode',
      global: '/global'
    }
    return path[componentName] || '/components/' + componentName
  }

  const path = getPath(componentName).trim()

  const selector = outputReferences ? '[class^="sds-mode-"]' : modeName ? `.sds-mode-${modeName}` : `:root`

  return [
    {
      destination: `${subType}/${modeName}${path}.${suffix}`,
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
      './data/tokens/origin.json',
      './data/tokens/global/*.json',
      `./data/tokens/screensize/${contextName}.json`,
      `./data/tokens/screensize/${sizeName}.json`
    ],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getSplit('global', '', sizeName, `${contextName}/${sizeName}`, 'css', false)
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getSplit('global', '', 'scss/variables', `${contextName}/${sizeName}`, 'scss', false)
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getSplit('global', '', 'javascript/module', `common/${contextName}/${sizeName}`, 'js', false),
          ...getSplit('global', '', 'typescript/module-declarations', `common/${contextName}/${sizeName}`, 'd.ts', false),
          ...getSplit('global', '', 'javascript/es6', `es6/${contextName}/${sizeName}`, 'js', false),
          ...getSplit('global', '', 'typescript/es6-declarations', `es6/${contextName}/${sizeName}`, 'd.ts', false),
          ...getSplit('global', '', 'javascript/umd', `umd/${contextName}/${sizeName}`, 'js', false)
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getSplit('global', '', 'json/nested', `nested/${contextName}/${sizeName}`, 'json', false),
          ...getSplit('global', '', 'json/flat', `flat/${contextName}/${sizeName}`, 'json', false)
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getSplit('global', '', 'android/resources', `${contextName}/${sizeName}`, 'xml', false)
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getSplit('global', '', 'ios/macros', `${contextName}/${sizeName}`, 'h', false)
        ]
      }
    }
  }
}

const getModeConfig = (contextName, modeName, sizeName) => {

  return {
    source: [
      './data/tokens/origin.json',
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
          ...getFiles(modeName, sizeName, `${contextName}/${sizeName}`, 'css')
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getFiles(modeName, 'scss/variables', `${contextName}/${sizeName}`, 'scss')
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getFiles(modeName, 'javascript/module', `common/${contextName}/${sizeName}`, 'js'),
          ...getFiles(modeName, 'typescript/module-declarations', `common/${contextName}/${sizeName}`, 'd.ts'),
          ...getFiles(modeName, 'javascript/es6', `es6/${contextName}/${sizeName}`, 'js'),
          ...getFiles(modeName, 'typescript/es6-declarations', `es6/${contextName}/${sizeName}`, 'd.ts'),
          ...getFiles(modeName, 'javascript/umd', `umd/${contextName}/${sizeName}`, 'js'),
        ]
      },
      json: {
        buildPath: 'dist/json/',
        transforms: groups.json,
        files: [
          ...getFiles(modeName, 'json/nested', `nested/${contextName}/${sizeName}`, 'json'),
          ...getFiles(modeName, 'json/flat', `flat/${contextName}/${sizeName}`, 'json')
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getFiles(modeName, 'android/resources', `${contextName}/${sizeName}`, 'xml')
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getFiles(modeName, 'ios/macros', `${contextName}/${sizeName}`, 'h')
        ]
      }
    }
  }
}

// platforms.forEach((platform) => {
//   const platformName = platform.split('.json')[0]

//   console.log(`\r\nStart building platform: ${platformName}\r\n`)

//   console.log('\r\nStart building global\r\n')

//   const StyleDictionary = dictionary.extend(getGlobalConfig(platform))

//   StyleDictionary.buildPlatform('css')
//   StyleDictionary.buildPlatform('scss')
//   StyleDictionary.buildPlatform('js')
//   StyleDictionary.buildPlatform('ios')
//   StyleDictionary.buildPlatform('android')

//   console.log('\r\nDone building global\r\n')

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

  

//   console.log(`\r\nDone building platform: ${platformName}\r\n`)
// })

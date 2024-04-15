/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

const { readdirSync } = require('fs-extra')
const { dictionary, groups } = require('./style-dictionary')
const filterComponent = require('./utils/filter-component')

const platforms = readdirSync('./data/tokens/platforms/')
const components = readdirSync('./data/tokens/components/')
const modes = readdirSync('./data/tokens/modes/')

const getFiles = (platformName, modeName, format, subType, suffix) => {
  const platform = format.includes('variables') ? '' : platformName
  const mode = format.includes('variables') ? '' : modeName
  return [
    ...getSplit('base', platformName, modeName, format, subType, suffix, false),
    ...getComponents(platform, mode, format, subType, suffix)
  ]
}

const getComponents = (platformName, modeName, format, subType, suffix) => {
  const componentArray = []

  components.forEach((component) => {
    componentArray.push(...getSplit(component.split('.')[0], platformName, modeName, format, subType, suffix, true))
  })

  return componentArray
}

const getSplit = (componentName, platformName, modeName, format, subType, suffix, outputReferences) => {
  const getPath = (componentName) => {
    const path = {
      base: suffix === 'css' || suffix === 'scss' ? ' ' : '/base',
      global: '/global'
    }
    return path[componentName] || '/components/' + componentName
  }

  const path = getPath(componentName).trim()

  const selector = outputReferences ? '[class^="sds-mode-"]' : modeName ? `.sds-mode-${modeName}` : undefined

  return [
    {
      destination: `${subType}${platformName}/${modeName}${path}/all.${suffix}`,
      filter: (token) => filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    },
    {
      destination: `${subType}${platformName}/${modeName}${path}/color.${suffix}`,
      filter: (token) => token.type === 'color' && filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    },
    {
      destination: `${subType}${platformName}/${modeName}${path}/borderRadius.${suffix}`,
      filter: (token) => token.type === 'borderRadius' && filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    },
    {
      destination: `${subType}${platformName}/${modeName}${path}/borderWidth.${suffix}`,
      filter: (token) => token.type === 'borderWidth' && filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    },
    {
      destination: `${subType}${platformName}/${modeName}${path}/shadow.${suffix}`,
      filter: (token) => token.type === 'boxShadow' && filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    },
    {
      destination: `${subType}${platformName}/${modeName}${path}/sizing.${suffix}`,
      filter: (token) => token.type === 'sizing' && filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    },
    {
      destination: `${subType}${platformName}/${modeName}${path}/spacing.${suffix}`,
      filter: (token) => token.type === 'spacing' && filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    },
    {
      destination: `${subType}${platformName}/${modeName}${path}/typography.${suffix}`,
      filter: (token) => token.type === 'typography' && filterComponent(token, componentName),
      format,
      options: {
        outputReferences,
        selector
      }
    }
  ]
}

const getGlobalConfig = (platform) => {
  const platformName = platform.split('.json')[0]

  return {
    source: [
      './data/tokens/origin.json',
      './data/tokens/global/*.json',
      `./data/tokens/platforms/${platform}`
    ],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getSplit('global', platformName, '', 'css/variables', '', 'css', false)
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getSplit('global', platformName, '', 'scss/variables', '', 'scss', false)
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getSplit('global', platformName, '', 'javascript/module', 'common/', 'js', false),
          ...getSplit('global', platformName, '', 'typescript/module-declarations', 'common/', 'd.ts', false),
          ...getSplit('global', platformName, '', 'javascript/es6', 'es6/', 'js', false),
          ...getSplit('global', platformName, '', 'typescript/es6-declarations', 'es6/', 'd.ts', false),
          ...getSplit('global', platformName, '', 'javascript/umd', 'umd/', 'js', false),
          ...getSplit('global', platformName, '', 'json', 'json/', 'json', false)
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getSplit('global', platformName, '', 'android/resources', '', 'xml', false)
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getSplit('global', platformName, '', 'ios/macros', '', 'h', false)
        ]
      }
    }
  }
}

const getModeConfig = (platform, mode) => {
  const platformName = platform.split('.json')[0]
  const modeName = `modes/${mode.split('.json')[0]}`

  return {
    source: [
      './data/tokens/origin.json',
      './data/tokens/global/*.json',
      `./data/tokens/platforms/${platform}`,
      `./data/tokens/modes/${mode}`,
      './data/tokens/components/*.json'
    ],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getFiles(platformName, modeName, 'css/variables', '', 'css')
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getFiles(platformName, modeName, 'scss/variables', '', 'scss')
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getFiles(platformName, modeName, 'javascript/module', 'common/', 'js'),
          ...getFiles(platformName, modeName, 'typescript/module-declarations', 'common/', 'd.ts'),
          ...getFiles(platformName, modeName, 'javascript/es6', 'es6/', 'js'),
          ...getFiles(platformName, modeName, 'typescript/es6-declarations', 'es6/', 'd.ts'),
          ...getFiles(platformName, modeName, 'javascript/umd', 'umd/', 'js'),
          ...getFiles(platformName, modeName, 'json', 'json/', 'json')
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getFiles(platformName, modeName, 'android/resources', '', 'xml')
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getFiles(platformName, modeName, 'ios/macros', '', 'h')
        ]
      }
    }
  }
}

platforms.forEach((platform) => {
  const platformName = platform.split('.json')[0]

  console.log(`\r\nStart building platform: ${platformName}\r\n`)

  console.log('\r\nStart building global\r\n')

  const StyleDictionary = dictionary.extend(getGlobalConfig(platform))

  StyleDictionary.buildPlatform('css')
  StyleDictionary.buildPlatform('scss')
  StyleDictionary.buildPlatform('js')
  StyleDictionary.buildPlatform('ios')
  StyleDictionary.buildPlatform('android')

  console.log('\r\nDone building global\r\n')

  modes.forEach((mode) => {
    const modeName = mode.split('.json')[0]

    console.log(`\r\nStart building mode: ${modeName}\r\n`)

    const StyleDictionary = dictionary.extend(getModeConfig(platform, mode))

    StyleDictionary.buildPlatform('css')
    StyleDictionary.buildPlatform('scss')
    StyleDictionary.buildPlatform('js')
    StyleDictionary.buildPlatform('ios')
    StyleDictionary.buildPlatform('android')

    console.log(`\r\nDone building mode: ${modeName}\r\n`)
  })

  console.log(`\r\nDone building platform: ${platformName}\r\n`)
})

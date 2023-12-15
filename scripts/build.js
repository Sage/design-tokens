/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const { readdirSync } = require('fs-extra')
const { dictionary, groups } = require('./style-dictionary')

// const platforms = readdirSync('./data/tokens/Platforms/')
const components = readdirSync('./data/tokens/Components/')
const modes = readdirSync('./data/tokens/Modes/')

const getFiles = (modeName, format, subType, suffix) => {
  return [
    ...getSplit(undefined, modeName, format, subType, suffix),
    ...getComponents(modeName, format, subType, suffix)
  ]
}

const getComponents = (modeName, format, subType, suffix) => {
  const componentArray = []

  components.forEach((component) => {
    componentArray.push(...getSplit(component.split('.')[0], modeName, format, subType, suffix))
  })

  return componentArray
}

const getSplit = (componentName, modeName, format, subType, suffix) => {
  const path = componentName ? '/components/' + componentName : ''

  return [
    {
      destination: `${subType}${modeName}${path}/all.${suffix}`,
      filter: (token) => componentName ? token.path[0] === componentName : true,
      format: format
    },
    {
      destination: `${subType}${modeName}${path}/color.${suffix}`,
      filter: (token) => token.type === 'color' && token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true),
      format: format
    },
    {
      destination: `${subType}${modeName}${path}/borderRadius.${suffix}`,
      filter: (token) => token.type === 'borderRadius' && token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true),
      format: format
    },
    {
      destination: `${subType}${modeName}${path}/borderWidth.${suffix}`,
      filter: (token) => token.type === 'borderWidth' && token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true),
      format: format
    },
    {
      destination: `${subType}${modeName}${path}/shadow.${suffix}`,
      filter: (token) => token.type === 'boxShadow' && token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true),
      format: format
    },
    {
      destination: `${subType}${modeName}${path}/sizing.${suffix}`,
      filter: (token) => token.type === 'sizing' && token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true),
      format: format
    },
    {
      destination: `${subType}${modeName}${path}/spacing.${suffix}`,
      filter: (token) => token.type === 'spacing' && token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true),
      format: format
    },
    {
      destination: `${subType}${modeName}${path}/typography.${suffix}`,
      filter: (token) => token.type === 'typography' && token.path.indexOf('origin') === -1 && (componentName ? token.path[0] === componentName : true),
      format: format
    }
  ]
}

// const getSplit = (modeName, format, subType, suffix) => {
//   return [
//     {
//       destination: `${subType}${modeName}/all.${suffix}`,
//       format: format
//     },
//     {
//       destination: `${subType}${modeName}/color.${suffix}`,
//       filter: (token) => token.type === 'color' && token.path.indexOf('origin') === -1,
//       format: format
//     },
//     {
//       destination: `${subType}${modeName}/borderRadius.${suffix}`,
//       filter: (token) => token.type === 'borderRadius' && token.path.indexOf('origin') === -1,
//       format: format
//     },
//     {
//       destination: `${subType}${modeName}/borderWidth.${suffix}`,
//       filter: (token) => token.type === 'borderWidth' && token.path.indexOf('origin') === -1,
//       format: format
//     },
//     {
//       destination: `${subType}${modeName}/shadow.${suffix}`,
//       filter: (token) => token.type === 'boxShadow' && token.path.indexOf('origin') === -1,
//       format: format
//     },
//     {
//       destination: `${subType}${modeName}/sizing.${suffix}`,
//       filter: (token) => token.type === 'sizing' && token.path.indexOf('origin') === -1,
//       format: format
//     },
//     {
//       destination: `${subType}${modeName}/spacing.${suffix}`,
//       filter: (token) => token.type === 'spacing' && token.path.indexOf('origin') === -1,
//       format: format
//     },
//     {
//       destination: `${subType}${modeName}/typography.${suffix}`,
//       filter: (token) => token.type === 'typography' && token.path.indexOf('origin') === -1,
//       format: format
//     }
//   ]
// }

const getConfig = (mode) => {
  const modeName = mode.split('.json')[0]

  return {
    source: [
      './data/tokens/origin.json',
      './data/tokens/global.json',
      `./data/tokens/Modes/${mode}`,
      './data/tokens/Components/*.json'
      // `./data/tokens/Platforms/${platform}/*.json`
    ],
    platforms: {
      css: {
        buildPath: 'dist/css/',
        transforms: groups.css,
        files: [
          ...getFiles(modeName, 'css/variables', '', 'css')
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.scss,
        files: [
          ...getFiles(modeName, 'scss/variables', '', 'scss')
        ]
      },
      js: {
        buildPath: 'dist/js/',
        transforms: groups.js,
        files: [
          ...getFiles(modeName, 'javascript/module', 'common/', 'js'),
          ...getFiles(modeName, 'javascript/es6', 'es6/', 'js'),
          ...getFiles(modeName, 'javascript/umd', 'umd/', 'js'),
          ...getFiles(modeName, 'json', 'json/', 'json')
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          ...getFiles(modeName, 'android/resources', '', 'xml')
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          ...getFiles(modeName, 'ios/macros', '', 'h')
        ]
      }
    }
  }
}

modes.forEach((mode) => {
  console.log(`\r\n\r\nBuilding mode: ${mode}`)

  const StyleDictionary = dictionary.extend(getConfig(mode))

  StyleDictionary.buildPlatform('css')
  StyleDictionary.buildPlatform('scss')
  StyleDictionary.buildPlatform('js')
  StyleDictionary.buildPlatform('ios')
  StyleDictionary.buildPlatform('android')

  console.log('\r\nDone.\r\n')
})

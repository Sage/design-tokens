/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const { readdirSync } = require('fs-extra')
const { dictionary, groups } = require('./style-dictionary')

const platforms = readdirSync('./data/tokens/Platforms/')
const modes = readdirSync('./data/tokens/Modes/')

const getConfig = (platform, mode) => {
  const modeName = mode.split('.json')[0]

  return {
    source: [
      './data/tokens/origin.json',
      './data/tokens/Global/*.json',
      `./data/tokens/Modes/${mode}`,
      './data/tokens/Components/*.json',
      `./data/tokens/Platforms/${platform}/*.json`
    ],
    platforms: {
      web: {
        buildPath: 'dist/web/',
        transforms: groups.web,
        files: [
          {
            destination: `js/common/${modeName}/all.js`,
            format: 'javascript/module-flat'
          },
          {
            destination: `js/es6/${modeName}/all.js`,
            format: 'custom/js/es6-module-flat'
          },
          // {
          //   destination: `css/${modeName}/all.css`,
          //   format: 'css/variables'
          // },
          // {
          //   destination: `css/${modeName}/color.css`,
          //   filter: (token) => token.type === 'color' && token.path.indexOf('origin') === -1,
          //   format: 'css/variables'
          // },
          {
            destination: 'css/borders.css',
            filter: (token) => (token.type === 'borderRadius' || token.type === 'borderWidth') && token.path.indexOf('origin') === -1,
            format: 'css/variables'
          },
          {
            destination: 'css/shadows.css',
            filter: (token) => token.type === 'boxShadow' && token.path.indexOf('origin') === -1,
            format: 'css/variables'
          },
          {
            destination: 'css/sizing.css',
            filter: { type: 'sizing' },
            format: 'css/variables'
          },
          {
            destination: 'css/spacing.css',
            filter: { type: 'spacing' },
            format: 'css/variables'
          },
          {
            destination: 'css/typography.css',
            filter: { type: 'typography' },
            format: 'css/variables'
          },
          {
            destination: `scss/${modeName}/all.scss`,
            format: 'scss/variables'
          }
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          {
            destination: `${modeName}/all.xml`,
            format: 'android/resources'
          }
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          {
            destination: `${modeName}/all.h`,
            format: 'ios/macros'
          }
        ]
      }
    }
  }
}

const getColorConfig = (platform, mode) => {
  const modeName = mode.split('.json')[0]

  return {
    source: [
      './data/tokens/origin.json',
      './data/tokens/Global/*.json',
      `./data/tokens/Modes/${mode}`,
      './data/tokens/Components/*.json',
      `./data/tokens/Platforms/${platform}/*.json`
    ],
    platforms: {
      web: {
        buildPath: 'dist/web/',
        transforms: groups.web,
        files: [
          {
            destination: `css/color/${modeName}.css`,
            filter: (token) => token.type === 'color' && token.path.indexOf('origin') === -1,
            format: 'css/variables'
          }
        ]
      },
      android: {
        buildPath: 'dist/android/',
        transforms: groups.mobile,
        files: [
          {
            destination: `${modeName}/all.xml`,
            format: 'android/resources'
          }
        ]
      },
      ios: {
        buildPath: 'dist/ios/',
        transforms: groups.mobile,
        files: [
          {
            destination: `${modeName}/all.h`,
            format: 'ios/macros'
          }
        ]
      }
    }
  }
}

platforms.forEach((platform) => {
  modes.forEach((mode) => {
    console.log(`\r\nBuilding platform: ${platform} \r\nBuilding mode: ${mode}`)

    const StyleDictionary = dictionary.extend(getConfig(platform, mode))

    if (platform === 'small-viewports') {
      StyleDictionary.buildPlatform('web')
    } else if (platform === 'IOS') {
      StyleDictionary.buildPlatform('ios')
    } else if (platform === 'android') {
      StyleDictionary.buildPlatform('android')
    }

    console.log('\r\nDone.\r\n')
  })
})

platforms.forEach((platform) => {
  modes.forEach((mode) => {
    console.log(`\r\nBuilding platform: ${platform} \r\nBuilding mode: ${mode}`)

    const StyleDictionary = dictionary.extend(getColorConfig(platform, mode))

    if (platform === 'small-viewports') {
      StyleDictionary.buildPlatform('web')
    } else if (platform === 'IOS') {
      // StyleDictionary.buildPlatform('ios')
    } else if (platform === 'android') {
      // StyleDictionary.buildPlatform('android')
    }

    console.log('\r\nDone.\r\n')
  })
})

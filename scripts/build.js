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
      './data/tokens/Component Specific/*.json',
      `./data/tokens/Platforms/${platform}/*.json`
    ],
    platforms: {
      javascript: {
        buildPath: 'dist/js/',
        transforms: groups.web,
        files: [
          {
            destination: `${platform}/common/${modeName}/all.js`,
            format: 'javascript/module-flat'
          },
          {
            destination: `${platform}/es6/${modeName}/all.js`,
            format: 'custom/js/es6-module-flat'
          }
        ]
      },
      css: {
        buildPath: 'dist/css/',
        transforms: groups.web,
        files: [
          {
            destination: `${platform}/${modeName}/all.css`,
            format: 'css/variables'
          },
          {
            destination: `${platform}/${modeName}/color.css`, // this can be extended for each type
            filter: { type: 'color' },
            format: 'css/variables'
          },
          {
            destination: `${platform}/${modeName}/spacing.css`, // this can be extended for each type
            filter: { type: 'spacing' },
            format: 'css/variables'
          }
        ]
      },
      scss: {
        buildPath: 'dist/scss/',
        transforms: groups.web,
        files: [
          {
            destination: `${platform}/${modeName}/all.scss`,
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

platforms.forEach((platform) => {
  modes.forEach((mode) => {
    console.log(`\r\nBuilding platform: ${platform} \r\nBuilding mode: ${mode}`)

    const StyleDictionary = dictionary.extend(getConfig(platform, mode))

    if (platform === 'small-viewports') {
      StyleDictionary.buildPlatform('javascript')
      StyleDictionary.buildPlatform('css')
      StyleDictionary.buildPlatform('scss')
    } else if (platform === 'IOS') {
      StyleDictionary.buildPlatform('ios')
    } else if (platform === 'android') {
      StyleDictionary.buildPlatform('android')
    }

    console.log('\r\nDone.\r\n')
  })
})

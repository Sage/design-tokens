/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const StyleDictionaryPackage = require('style-dictionary').extend(
  getStyleDictionaryConfig()
)

console.log('Build has started...')

function processPlatform (platform) {
  console.log('\n====================')
  // eslint-disable-next-line no-template-curly-in-string
  console.log('Processiong: [${platform}]')
  StyleDictionaryPackage.buildPlatform(platform)
  console.log('\nEnd processing')
}

function processAllPlatforms () {
  const platforms = Object.keys(StyleDictionaryPackage.platforms)
  platforms.forEach(platform => {
    processPlatform(platform)
  })
}

processAllPlatforms()

function getStyleDictionaryConfig () {
  return {
    source: ['data/tokens/**/*.json'],
    platforms: {
      web: {
        buildPath: 'build/web/',
        files: [
          {
            destination: 'data/tokens.json',
            format: 'javascript/module'
          }
        ]
      },
      ios: {
        buildPath: 'build/ios/',
        files: [
          {
            destination: 'data/tokens.json',
            format: 'ios/plist'
          }
        ]
      }
    //   android: {
    //     buildPath: 'build/android/',
    //     files: [
    //       {
    //         destination: 'tokens.xml',
    //         format: 'android/xml'
    //       }
    //     ]
    //   }
    }
  }
}

console.log('Build started...')

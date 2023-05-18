/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

// path to the design tokens JSON from Figma Studio Plugin

const tokensFilePath = 'data/tokens.json'

// platforms configuration

const platforms = [
  {
    name: 'web',
    outputDir: 'src/styles',
    fileFormat: 'js',
    template: 'styled-components'
  },
  {
    name: 'ios',
    outputDir: 'MyApp/SupportingFiles',
    fileFormat: 'swift',
    template: 'swift'
  },
  {
    name: 'android',
    outputDir: '/src/main/res/values/android',
    fileFormat: 'xml',
    template: 'android-xml'
  }
]

// Function to build a specific platform

function buildPlatform (platformName) {
  const platform = platforms.find((platform) => platform.name === platformName)

  if (!platform) {
    console.error(`Platform '${platformName}' not found`)
    return
  }

  console.log(`Building Platform: '${platformName}`)
  console.log(`Output Directory: '${platform.outputDir}'`)
  console.log(`File Format: '${platform.fileFormat}'`)
  console.log(`Template: '${platform.template}'`)
}

// Function to clear a specific platform

function clearPlatform (platformName) {
  const platform = platforms.find((platform) => platform.name === platformName)

  if (!platform) {
    console.error(`Platform '${platformName}' not found`)
    return
  }

  console.log(`Clearing platform: '${platformName}'`)
  console.log(`Template: '${platform.outputDir}'`)
}

export default {
  tokensFilePath,
  platforms,
  buildPlatform,
  clearPlatform
}

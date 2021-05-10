/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

const registerCustomTransforms = require('./extensions/transforms')
const registerCustomFormats = require('./extensions/formats')

/**
 *
 * Thoughts:
 * 1. Having access to namespace information would be quite important, since
 *    we want to generate prefixes for the tokens.
 *    Therefore, we should contain theme information in each file by adding
 *    namespace at the top level.
 *
 * 2. Actually there is no need to split tokens to the file, since style
 *    dictionary performs deep merge of all of the files.
 *    Since editing this will happen ocasionally, I don't see the obstacles
 *    to keep all those informations as a single JSON file.
 *
 * 3. I moved _utils/customTransforms into extensions/transforms, to simplify
 *    build.js file. It will be quite complex in the end, after all platforms,
 *    transforms and formats will be configured.
 *
 * 4. I added lodash, because i needed setWith method. It was faster for me
 *    to install lodash than write custom util, however it can be replaced
 *    later on, to minify pacakge and save time during yarn install.
 *
 * 5. Thing, that I forgot about is that in figma plugin, reference only works
 *    in scope of category, and can not go to another set (namespace).
 *    It may be necessary to contribute to plugin's repository and add such
 *    functionality.
 *
 */
const path = require('path')

const StyleDictionary = require('style-dictionary').extend({
  source: [path.resolve(__dirname, '../data/**/*.json')],
  platforms: {
    js: {
      buildPath: 'dist/js/',
      transforms: [
        'custom/attributes/generic',
        'custom/attributes/colors',
        'custom/name/constant-object',
        'transforms.js'
      ],
      files: [
        {
          destination: 'variables.js',
          format: 'custom/js/constant'
        }
      ]
    }
  }
})

registerCustomTransforms(StyleDictionary)
registerCustomFormats(StyleDictionary)

StyleDictionary.buildAllPlatforms()

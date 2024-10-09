/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import StyleDictionary from 'style-dictionary'
import { register } from '@tokens-studio/sd-transforms'

const groups = {
  css: [
    'border/css/shorthand',
    'shadow/css/shorthand',
    'transition/css/shorthand',
    'typography/css/shorthand',
    'name/kebab',
    'ts/descriptionToComment',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  scss: [
    'name/kebab',
    'ts/descriptionToComment',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  js: [
    'name/camel',
    'ts/descriptionToComment',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  json: [
    'name/camel',
    'ts/descriptionToComment',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  mobile: [
    'name/camel',
    'ts/descriptionToComment',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ]
}

register(StyleDictionary, {
  'ts/color/modifiers': {
    format: 'hex'
  }
})

export {
  StyleDictionary,
  groups
}

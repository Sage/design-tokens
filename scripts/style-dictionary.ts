/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */

import StyleDictionary from 'style-dictionary'
import { register } from '@tokens-studio/sd-transforms'
import { mapDescriptionToComment } from './transforms/mapDescriptionToComment.js'

StyleDictionary.registerTransform({
  name: 'custom/descriptionToComment',
  type: 'attribute',
  filter: token => token['description'],
  transform: token => mapDescriptionToComment(token),
});

const groups = {
  css: [
    'border/css/shorthand',
    'shadow/css/shorthand',
    'transition/css/shorthand',
    'typography/css/shorthand',
    'name/kebab',
    'custom/descriptionToComment',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  scss: [
    'custom/descriptionToComment',
    'name/kebab',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  js: [
    'custom/descriptionToComment',
    'name/camel',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  json: [
    'custom/descriptionToComment',
    'name/camel',
    'ts/size/px',
    'ts/opacity',
    'ts/size/lineheight',
    'ts/typography/fontWeight',
    'ts/resolveMath',
    'ts/size/css/letterspacing',
    'ts/color/modifiers'
  ],
  mobile: [
    'custom/descriptionToComment',
    'name/camel',
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


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

StyleDictionary.registerFormat({
  name: 'json/flat-with-refs',
  format: function({dictionary, options = {}}) {
    const { outputReferences = true } = options;
    
    return JSON.stringify(
      dictionary.allTokens.reduce((acc: Record<string, any>, token) => {
        // Check if the original token value is a reference
        const originalValue = token.original.value || token.original.$value;
        
        if (outputReferences && typeof originalValue === 'string' && originalValue.startsWith('{') && originalValue.endsWith('}')) {
          // Convert the reference to CSS variable format by removing brackets and wrapping in var()
          const refPath = originalValue.slice(1, -1);
          const cssVarName = 'var(--' + refPath.replace(/\./g, '-') + ')';
          acc[token.name] = cssVarName;
        } else {
          acc[token.name] = token.value;
        }
        return acc;
      }, {}),
      null,
      2
    );
  }
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


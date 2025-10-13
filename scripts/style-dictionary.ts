/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

import StyleDictionary from "style-dictionary"
import { register } from "@tokens-studio/sd-transforms"
import { removeComments } from "./transforms/removeComments.js";
import { outputJSONWithRefs } from "./formats/outputJSONWithRefs.js";
import { outputES6WithRefs } from "./formats/outputES6WithRefs.js";
import { outputCommonJSWithRefs } from "./formats/commonJSWithRefs.js";
import { formatCommonJSExports } from "./formats/commonJSExports.js";

StyleDictionary.registerFormat({
  name: "custom/json-with-refs",
  format: outputJSONWithRefs
});

StyleDictionary.registerFormat({
  name: "custom/es6-with-refs",
  format: outputES6WithRefs
});

StyleDictionary.registerFormat({
  name: "custom/commonjs-with-refs",
  format: outputCommonJSWithRefs
});

StyleDictionary.registerFormat({
  name: "custom/commonjs-exports",
  format: formatCommonJSExports
});

StyleDictionary.registerTransform({
  name: "custom/remove-comments",
  type: "attribute",
  filter: () => true,
  transform: removeComments
});

const groups = {
  css: [
    "custom/remove-comments",
    "border/css/shorthand",
    "shadow/css/shorthand",
    "transition/css/shorthand",
    "typography/css/shorthand",
    "name/kebab",
    "ts/size/px",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "ts/size/css/letterspacing",
    "ts/color/modifiers"
  ],
  scss: [
    "custom/remove-comments",
    "border/css/shorthand",
    "shadow/css/shorthand",
    "transition/css/shorthand", 
    "typography/css/shorthand",
    "name/kebab",
    "ts/size/px",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "ts/size/css/letterspacing",
    "ts/color/modifiers"
  ],
  js: [
    "name/camel",
    "ts/size/px",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "ts/size/css/letterspacing",
    "ts/color/modifiers"
  ],
  json: [
    "name/camel",
    "ts/size/px",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "ts/size/css/letterspacing",
    "ts/color/modifiers",
  ]
}

register(StyleDictionary, {
  "ts/color/modifiers": {
    format: "hex"
  }
})

export {
  StyleDictionary,
  groups
}

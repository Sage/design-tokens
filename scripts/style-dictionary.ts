/*
Copyright © 2025 The Sage Group plc or its licensors. All Rights reserved
 */

import StyleDictionary from "style-dictionary"
import { register } from "@tokens-studio/sd-transforms"

import { removeComments } from "./transforms/removeComments.js";
import { handleFontFamiliesReferencesCSS, handleFontFamiliesReferencesScss } from "./transforms/handleFontFamilyReferences.js";
import { handleRadiusScaleCSS, handleRadiusScaleScss, radiusScaleFilter } from "./transforms/handleRadiusScale.js";

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

StyleDictionary.registerTransform({
  name: "custom/typography-global-family",
  type: "value",
  transitive: true,
  filter: (token) => (token.$type ?? token.type) === "typography",
  transform: handleFontFamiliesReferencesCSS,
});

StyleDictionary.registerTransform({
  name: "custom/typography-global-family-scss",
  type: "value",
  transitive: true,
  filter: (token) => (token.$type ?? token.type) === "typography",
  transform: handleFontFamiliesReferencesScss,
});

StyleDictionary.registerTransform({
  name: "custom/radius-scale",
  type: "value",
  transitive: true,
  filter: radiusScaleFilter,
  transform: handleRadiusScaleCSS,
});

StyleDictionary.registerTransform({
  name: "custom/radius-scale-scss",
  type: "value",
  transitive: true,
  filter: radiusScaleFilter,
  transform: handleRadiusScaleScss,
});

StyleDictionary.registerTransform({
  name: "custom/unitless-radius-scale",
  type: "value",
  transitive: true,
  filter: (token) => (token.path ?? []).join(".") === "global.radius.scale",
  transform: (token) => String(token.$value ?? token.value).replace(/px$/, ""),
});

const groups = {
  css: [
    "custom/remove-comments",
    "ts/shadow/innerShadow",
    "border/css/shorthand",
    "shadow/css/shorthand",
    "transition/css/shorthand",
    "name/kebab",
    "ts/size/px",
    "custom/unitless-radius-scale",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "custom/radius-scale",
    "custom/typography-global-family",
    "ts/size/css/letterspacing",
    "ts/color/modifiers"
  ],
  scss: [
    "custom/remove-comments",
    "ts/shadow/innerShadow",
    "border/css/shorthand",
    "shadow/css/shorthand",
    "transition/css/shorthand", 
    "name/kebab",
    "ts/size/px",
    "custom/unitless-radius-scale",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "custom/radius-scale-scss",
    "custom/typography-global-family-scss",
    "ts/size/css/letterspacing",
    "ts/color/modifiers"
  ],
  js: [
    "name/camel",
    "ts/size/px",
    "custom/unitless-radius-scale",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "custom/radius-scale",
    "ts/size/css/letterspacing",
    "ts/color/modifiers"
  ],
  json: [
    "name/camel",
    "ts/size/px",
    "custom/unitless-radius-scale",
    "ts/opacity",
    "ts/size/lineheight",
    "ts/typography/fontWeight",
    "ts/resolveMath",
    "custom/radius-scale",
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

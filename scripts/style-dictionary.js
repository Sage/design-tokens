/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const styleDictionary = require("style-dictionary");
const { resolve } = require("path");
const glob = require("glob").sync;

const transforms = glob("./scripts/transforms/*.transform.js").map((path) =>
  require(resolve(path))
);
const formats = glob("./scripts/formats/*.format.js").map((path) =>
  require(resolve(path))
);
const groups = {
  web: [
    "custom/attributes/default",
    "custom/name/camel",
    "custom/value/css-box-shadow",
    "custom/value/css-typography",
    "custom/value/css-font-weight",
  ],
  name: ["custom/attributes/default", "custom/name/camel"],
  mobile: [
    "custom/attributes/default",
    "custom/name/camel",
    "custom/value/css-box-shadow",
    "custom/value/css-typography",
  ],
};

transforms.forEach((transform) => styleDictionary.registerTransform(transform));
formats.forEach((format) => styleDictionary.registerFormat(format));

module.exports = {
  dictionary: styleDictionary,
  transforms,
  formats,
  groups,
};

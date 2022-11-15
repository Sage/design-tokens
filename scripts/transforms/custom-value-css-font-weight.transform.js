/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

/**
 * Handles typography and fontWeights tokens
 */

module.exports = {
  name: "custom/value/css-font-weight",
  type: "value",
  matcher: (token) =>
    token.attributes.category === "typography" ||
    token.attributes.category === "fontWeights",
  transformer: (token) => {
    return token.value
      .replace("Regular", "400")
      .replace("Medium", "500")
      .replace("Bold", "700");
  },
};

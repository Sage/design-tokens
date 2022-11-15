/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */

module.exports = {
  name: "custom/js/es6-module-flat",
  formatter: function ({ dictionary }) {
    const tokens = Object.fromEntries(
      dictionary.allTokens.map((token) => [token.name, token.value])
    );
    const output = JSON.stringify(tokens, null, 2);
    return `export default ${output}`;
  },
};

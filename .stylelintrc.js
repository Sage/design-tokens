/** @type {import('stylelint').Config} */
module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-standard-scss"],

  /*
    These rules are intended to be configured to:
    - Avoid errors (no invalid selectors etc)
    - Enforce conventions for how consumers use the tokens (eg CSS variables to be kebab cased)

    Fixing how values are formatted is much less important and a nice to have. Anything which we
    choose not to fix should be disabled in this file.
  */
  rules: {
    "color-hex-length": null,
    "scss/operator-no-unspaced": null, // This is likely easily fixable: https://github.com/stylelint-scss/stylelint-scss/blob/master/src/rules/operator-no-unspaced/README.md
    "length-zero-no-unit": null,
    "alpha-value-notation": null,
    "color-function-notation": null, // Although this is presumably easily fixable: https://stylelint.io/user-guide/rules/color-function-notation/
    "scss/comment-no-empty": null, // This is likely easily fixable: https://stylelint.io/user-guide/rules/comment-no-empty/
    "comment-whitespace-inside": null, // Probably fixable if we wanted to?
  }
};

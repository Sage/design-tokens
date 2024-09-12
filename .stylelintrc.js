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
    "scss/comment-no-empty": null, // Ignoring as this is managed by `ts/descriptionToComment` transform and has no end user impact
    "scss/operator-no-unspaced": null, // Has no end user impact
  },
};

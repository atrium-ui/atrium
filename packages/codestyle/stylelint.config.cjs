module.exports = {
  extends: ["stylelint-config-standard-scss", "stylelint-config-prettier"],
  rules: {
    "at-rule-no-unknown": null,
    "block-closing-brace-newline-after": "always-single-line",
    "block-closing-brace-empty-line-before": "never",
    "block-opening-brace-newline-after": "always-multi-line",
    "block-no-empty": null,
    "comment-empty-line-before": "never",
    "declaration-block-semicolon-newline-after": "always-multi-line",
    "declaration-block-trailing-semicolon": "always",
    "no-descending-specificity": null,
    "no-empty-source": null,
    "no-eol-whitespace": true,
    "no-extra-semicolons": true,
    "no-missing-end-of-source-newline": true,
    "scss/at-rule-no-unknown": true,
    "scss/double-slash-comment-empty-line-before": null,
    "selector-class-pattern": null,
    "selector-id-pattern": null,
    "selector-pseudo-element-no-unknown": [true, { ignorePseudoElements: ["v-deep"] }],
  },
};

module.exports = {
  extends: ["@commitlint/config-conventional"],

  /*
   * Any rules defined here will override rules from @commitlint/config-conventional
   */
  rules: {
    "scope-empty": [2, "never"],
    "scope-case": [0, "always", ["upper-case", "lower-case"]],
    "scope-enum": [2, "always", ["frontend", "cms", "integration", "global"]],
    "subject-case": [2, "never"],
  },
};

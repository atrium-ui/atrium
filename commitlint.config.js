module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "ci", "docs", "fix", "test", "int"]],
    // "scope-empty": [2, "never"],
  },
};

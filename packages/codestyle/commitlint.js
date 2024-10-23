import { RuleConfigSeverity } from "@commitlint/types";

// biome-ignore lint/style/noDefaultExport:
export default {
  parserPreset: "conventional-changelog-conventionalcommits",
  rules: {
    "body-leading-blank": [RuleConfigSeverity.Warning, "always"],
    "body-max-line-length": [RuleConfigSeverity.Error, "always", 100],
    "footer-leading-blank": [RuleConfigSeverity.Warning, "always"],
    "footer-max-line-length": [RuleConfigSeverity.Error, "always", 100],
    "header-max-length": [RuleConfigSeverity.Error, "always", 100],
    "header-trim": [RuleConfigSeverity.Error, "always"],
    "subject-case": [RuleConfigSeverity.Error, "always", ["sentence-case"]],
    "subject-empty": [RuleConfigSeverity.Warning, "never"],
    "subject-full-stop": [RuleConfigSeverity.Error, "never", "."],
    "subject-max-length": [RuleConfigSeverity.Error, "always", 50],
    "type-case": [RuleConfigSeverity.Error, "always", "lower-case"],
    "type-empty": [RuleConfigSeverity.Error, "never"],
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      ["build", "chore", "ci", "docs", "feat", "fix", "refactor", "revert", "test"],
    ],
    "scope-empty": [RuleConfigSeverity.Warning, "never"],
    "scope-case": [RuleConfigSeverity.Disabled, "always", ["upper-case", "lower-case"]],
  },
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: {
          feat: {
            description: "A new feature",
            title: "Features",
          },
          fix: {
            description: "A bug fix",
            title: "Bug Fixes",
          },
          docs: {
            description: "Documentation only changes",
            title: "Documentation",
          },
          refactor: {
            description: "A code change that neither fixes a bug nor adds a feature",
            title: "Code Refactoring",
          },
          test: {
            description: "Adding missing tests or correcting existing tests",
            title: "Tests",
          },
          ci: {
            description:
              "Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)",
            title: "Continuous Integrations",
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: "Chores",
          },
        },
      },
      scope: {
        description: "What is the scope of this change (e.g. component or file name)",
      },
      subject: {
        description: "Write a short, imperative tense description of the change",
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};

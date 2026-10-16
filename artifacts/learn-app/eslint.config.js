const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  { ignores: ["dist/*", "node_modules/*", ".expo/*", "playwright-report/*"] },
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "Literal[value=/^\\/\\(tabs\\)/]", message: "Use lib/routes.ts helpers" },
      ],
    },
  },
  {
    // Temporary until Task 4.4 removes app/(tabs); raw "/(tabs)/..." hrefs exist there.
    files: ["app/(tabs)/**"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // playwright is not installed as a dependency yet; e2e is rewritten in Task 6.3.
    files: ["e2e/**"],
    rules: { "import/no-unresolved": "off" },
  },
];

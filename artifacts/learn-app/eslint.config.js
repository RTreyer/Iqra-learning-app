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
    // The service worker runs in the browser's worker scope; build-sw.mjs fills in __FILES__.
    files: ["scripts/sw.template.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        Request: "readonly",
        Response: "readonly",
        URL: "readonly",
        __FILES__: "readonly",
      },
    },
  },
  {
    files: ["jest.config.js", "jest.setup.ts", "__tests__/**"],
    languageOptions: {
      globals: {
        jest: "readonly",
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
  },
];

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  // scripts/*.test.mjs run on the Node test runner (test:data); Jest 30 would pick up .mjs too.
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/dist/", "/scripts/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|expo-.*|@expo(nent)?/.*|react-navigation|@react-navigation/.*|expo-router|react-native-svg|react-native-gesture-handler)/)",
  ],
};

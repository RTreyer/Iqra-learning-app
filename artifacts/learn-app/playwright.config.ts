import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.spec.{mjs,ts}",
  timeout: 120_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8787",
    viewport: { width: 420, height: 860 },
    locale: "ar",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "node e2e/serve.mjs dist 8787",
    port: 8787,
    reuseExistingServer: true,
  },
});

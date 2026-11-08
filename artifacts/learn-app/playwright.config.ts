import { defineConfig } from "@playwright/test";

// E2E_PORT lets two runs (or a run beside another server) use different ports.
const port = Number(process.env.E2E_PORT || 8787);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.spec.{mjs,ts}",
  timeout: 120_000,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    viewport: { width: 420, height: 860 },
    locale: "ar",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: `node e2e/serve.mjs dist ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});

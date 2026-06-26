import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Smarter retries: CI retries transient timing failures up to 2x; local 1x.
  retries: process.env.CI ? 2 : 1,
  // Generous expect timeout so react-helmet-async head mutations have time to land.
  expect: { timeout: 15_000 },
  timeout: 45_000,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    // JSON reporter feeds scripts/seo-report.mjs so failure artifacts surface in the SEO dashboard.
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run preview -- --port=4173 --strictPort",
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Firefox & WebKit only run the navbar hover-gap regression — the SEO suite
    // is chromium-only to keep CI fast. This catches the Firefox/Safari-specific
    // mouseleave behavior that originally broke the All Tools mega menu.
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /navbar-hover\.spec\.ts/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: /navbar-hover\.spec\.ts/,
    },
  ],
});


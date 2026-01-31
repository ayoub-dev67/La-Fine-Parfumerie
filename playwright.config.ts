import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration Playwright pour les tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Repertoire des tests
  testDir: "./e2e",

  // Timeout global par test
  timeout: 30 * 1000,

  // Configuration des retries
  retries: process.env.CI ? 2 : 0,

  // Nombre de workers en parallele
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],

  // Options partagees
  use: {
    // URL de base pour les tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    // Collecter les traces en cas d'echec
    trace: "on-first-retry",

    // Screenshots en cas d'echec
    screenshot: "only-on-failure",

    // Video en cas d'echec
    video: "on-first-retry",

    // Timeout pour les actions
    actionTimeout: 10 * 1000,

    // Timeout pour les navigations
    navigationTimeout: 30 * 1000,
  },

  // Configuration des projets (navigateurs)
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Tests mobile
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Serveur de developpement
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Dossier de sortie
  outputDir: "test-results/",
});

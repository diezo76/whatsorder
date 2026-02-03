import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E de l'API
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.API_URL || 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

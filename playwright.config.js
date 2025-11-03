// playwright.config.js
// Playwright Test Configuration

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  
  use: {
    baseURL: process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\/api\/.*\.spec\.js/,
    },
    {
      name: 'integration-tests',
      testMatch: /.*\/integration\/.*\.spec\.js/,
    },
  ],
});

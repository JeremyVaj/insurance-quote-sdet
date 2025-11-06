// playwright.config.js
// Playwright Test Configuration
// 
// USAGE:
// - Run all tests: npm test
// - Run API only: npm run test:api
// - Run integration only: npm run test:integration
// - Run with Spanish: LOCALE=es npm test
// - Run against local file: npm test (uses index.html by default)
// - Run against remote: FRONTEND_URL=https://example.com npm test

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
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\/api\/.*\.spec\.js/,
      use: {
        // API tests use environment variable or default endpoint
        // Set API_BASE_URL to override: API_BASE_URL=http://localhost:4000/rate npm run test:api
      },
    },
    {
      name: 'integration-tests',
      testMatch: /.*\/integration\/.*\.spec\.js/,
      use: {
        // Integration tests use environment variable or local file
        // FRONTEND_URL defaults to file://[project]/index.html in test file
        // Override with: FRONTEND_URL=https://example.com npm run test:integration
        // Locale: LOCALE=es npm run test:integration
      },
    },
  ],
});

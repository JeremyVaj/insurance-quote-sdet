// playwright.config.js
// Playwright Test Configuration

import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Timeout for each test
  timeout: 30000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  
  // Global test settings
  use: {
    // Base URL for API tests
    baseURL: process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev',
    
    // Collect trace on failure
    trace: 'retain-on-failure',
    
    // API request settings
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },

  // Project configurations
  projects: [
    {
      name: 'api-tests',
      testMatch: /.*api.*\.spec\.js/,
    },
  ],
});

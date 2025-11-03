// tests/api/fixtures/apiFixtures.js
// Playwright fixtures for dependency injection and test setup

import { test as base } from '@playwright/test';
import { RatingEngineAPI } from '../helpers/RatingEngineAPI.js';

// Extend base test with custom fixtures
export const test = base.extend({
  // RatingEngineAPI fixture - automatically creates API client for each test
  ratingAPI: async ({ request }, use) => {
    const baseURL = process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev';
    const api = new RatingEngineAPI(request, baseURL);
    await use(api);
  },
});

export { expect } from '@playwright/test';

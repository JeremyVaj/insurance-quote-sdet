// tests/api/apiFixtures.js
// Playwright fixtures for API tests

import { test as base } from '@playwright/test';
import { RatingEngineAPI } from './helpers/RatingEngineAPI.js';

export const test = base.extend({
  ratingAPI: async ({ request }, use) => {
    const baseURL = process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev/';
    const api = new RatingEngineAPI(request, baseURL);
    await use(api);
  },
});

export { expect } from '@playwright/test';

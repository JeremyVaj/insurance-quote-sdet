// tests/api/rating-engine.spec.js
// API Tests - Backend Contract Validation
// Tests edge cases and validation that the UI cannot reach

import { test, expect } from './apiFixtures.js';
import { INVALID_REQUESTS } from './testData.js';

// ============================================
// VALIDATION TESTS (10 tests)
// These test scenarios that HTML5 validation blocks
// ============================================

test.describe('API Validation - Edge Cases UI Cannot Reach', () => {
  
  test('should reject negative revenue', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.negativeRevenue);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Invalid revenue', 400);
  });

  test('should reject string revenue', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.stringRevenue);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Invalid revenue', 400);
  });

  test('should reject null revenue', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.nullRevenue);
    
    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/Invalid revenue|Missing required fields/);
  });

  test('should reject missing revenue field', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.missingRevenue);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Missing required fields', 400);
  });

  test('should reject missing state field', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.missingState);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Missing required fields', 400);
  });

  test('should reject missing business field', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.missingBusiness);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Missing required fields', 400);
  });

  test('should reject empty request body', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.emptyBody);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Missing required fields', 400);
  });

  test('should reject invalid state code', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.invalidState);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Invalid state', 400);
  });

  test('should reject invalid business type', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote(INVALID_REQUESTS.invalidBusiness);
    
    expect(result.status).toBe(400);
    ratingAPI.verifyErrorResponse(result, 'Invalid business type', 400);
  });

  test('should reject GET request (wrong HTTP method)', async ({ request }) => {
    const baseURL = process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev/';
    
    const response = await request.get(baseURL, {
      failOnStatusCode: false,
    });
    
    expect(response.status()).toBe(405);
  });
});

// ============================================
// RESPONSE STRUCTURE TESTS (3 tests)
// Verify the API contract is correct
// ============================================

test.describe('API Response Structure', () => {
  
  test('success response should have all required fields', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote({
      revenue: 50000,
      state: 'CA',
      business: 'retail',
    });
    
    expect(result.status).toBe(200);
    ratingAPI.verifySuccessResponse(result);
    
    expect(result.body).toHaveProperty('premium');
    expect(result.body).toHaveProperty('quoteId');
    expect(result.body).toHaveProperty('calculatedAt');
  });

  test('premium should be a number', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote({
      revenue: 50000,
      state: 'CA',
      business: 'retail',
    });
    
    expect(result.status).toBe(200);
    expect(typeof result.body.premium).toBe('number');
    expect(result.body.premium).toBeGreaterThanOrEqual(0);
  });

  test('quoteId should match format Q-timestamp-random', async ({ ratingAPI }) => {
    const result = await ratingAPI.getQuote({
      revenue: 50000,
      state: 'CA',
      business: 'retail',
    });
    
    expect(result.status).toBe(200);
    expect(result.body.quoteId).toMatch(/^Q-\d+-[A-Z0-9]+$/);
  });
});

// ============================================
// BUSINESS LOGIC TESTS (2 tests)
// Core calculation and behavior tests
// ============================================

test.describe('API Business Logic', () => {
  
  test('quote IDs should be unique across requests', async ({ ratingAPI }) => {
    const quoteIds = new Set();
    
    for (let i = 0; i < 3; i++) {
      const result = await ratingAPI.getQuote({
        revenue: 50000,
        state: 'CA',
        business: 'retail',
      });
      
      expect(result.status).toBe(200);
      expect(quoteIds.has(result.body.quoteId)).toBe(false);
      quoteIds.add(result.body.quoteId);
    }
    
    expect(quoteIds.size).toBe(3);
  });

  test('same inputs should produce consistent premium', async ({ ratingAPI }) => {
    const result1 = await ratingAPI.getQuote({
      revenue: 50000,
      state: 'CA',
      business: 'retail',
    });
    
    const result2 = await ratingAPI.getQuote({
      revenue: 50000,
      state: 'CA',
      business: 'retail',
    });
    
    expect(result1.status).toBe(200);
    expect(result2.status).toBe(200);
    expect(result1.body.premium).toBe(result2.body.premium);
  });
});

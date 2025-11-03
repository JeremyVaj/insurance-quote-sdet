// tests/api/rating-engine-valid.spec.js
// Test Suite: Valid Rating Engine API Requests
// Tests happy path scenarios with valid inputs

import { test, expect } from './fixtures/apiFixtures.js';
import { VALID_TEST_CASES, EDGE_CASES } from './data/testData.js';

test.describe('Rating Engine API - Valid Requests', () => {
  
  test.describe('Standard Valid Scenarios', () => {
    // Data-driven tests using test data
    for (const testCase of VALID_TEST_CASES) {
      test(`should calculate premium for ${testCase.name}`, async ({ ratingAPI }) => {
        const response = await ratingAPI.getQuote(testCase.input);
        
        const quote = ratingAPI.verifySuccessfulQuote(response, testCase.expectedPremiumRange);
        
        // Additional verification
        console.log(`Quote ID: ${quote.quoteId}, Premium: $${quote.premium}`);
      });
    }
  });

  test.describe('Edge Cases', () => {
    for (const testCase of EDGE_CASES) {
      test(`should handle ${testCase.name}`, async ({ ratingAPI }) => {
        const response = await ratingAPI.getQuote(testCase.input);
        
        if (testCase.expectedPremium !== undefined) {
          ratingAPI.verifySuccessfulQuote(response);
          expect(response.body.premium).toBe(testCase.expectedPremium);
        } else {
          ratingAPI.verifySuccessfulQuote(response, testCase.expectedPremiumRange);
        }
      });
    }
  });

  test.describe('Response Structure Validation', () => {
    test('should return all required fields in response', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: 50000,
        state: 'CA',
        business: 'retail',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('premium');
      expect(response.body).toHaveProperty('quoteId');
      expect(response.body).toHaveProperty('calculatedAt');
    });

    test('should return premium as a number', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: 50000,
        state: 'CA',
        business: 'retail',
      });

      expect(typeof response.body.premium).toBe('number');
      expect(response.body.premium).toBeGreaterThanOrEqual(0);
    });

    test('should return quoteId in correct format', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: 50000,
        state: 'CA',
        business: 'retail',
      });

      // QuoteId should match pattern: Q-timestamp-randomString
      expect(response.body.quoteId).toMatch(/^Q-\d+-[A-Z0-9]+$/);
      expect(response.body.quoteId.startsWith('Q-')).toBe(true);
    });

    test('should return calculatedAt as valid ISO timestamp', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: 50000,
        state: 'CA',
        business: 'retail',
      });

      const date = new Date(response.body.calculatedAt);
      expect(date.toString()).not.toBe('Invalid Date');
      expect(date.getTime()).toBeGreaterThan(0);
    });
  });

  test.describe('Business Logic Validation', () => {
    test('should generate unique quote IDs for multiple requests', async ({ ratingAPI }) => {
      const verified = await ratingAPI.verifyUniqueQuoteIds({
        revenue: 50000,
        state: 'CA',
        business: 'retail',
      }, 3);

      expect(verified).toBe(true);
    });

    test('should return consistent pricing for same inputs', async ({ ratingAPI }) => {
      const premium = await ratingAPI.verifyConsistentPricing({
        revenue: 50000,
        state: 'CA',
        business: 'retail',
      });

      expect(premium).toBeGreaterThan(0);
    });

    test('should calculate higher premiums for higher risk states', async ({ ratingAPI }) => {
      // NY has higher multiplier than OH
      const nyResponse = await ratingAPI.getQuote({
        revenue: 100000,
        state: 'NY',
        business: 'retail',
      });

      const ohResponse = await ratingAPI.getQuote({
        revenue: 100000,
        state: 'OH',
        business: 'retail',
      });

      expect(nyResponse.body.premium).toBeGreaterThan(ohResponse.body.premium);
    });

    test('should calculate higher premiums for higher risk business types', async ({ ratingAPI }) => {
      // Manufacturing (1.5x) should be higher than professional (0.8x)
      const manufacturingResponse = await ratingAPI.getQuote({
        revenue: 100000,
        state: 'TX',
        business: 'manufacturing',
      });

      const professionalResponse = await ratingAPI.getQuote({
        revenue: 100000,
        state: 'TX',
        business: 'professional',
      });

      expect(manufacturingResponse.body.premium).toBeGreaterThan(professionalResponse.body.premium);
    });
  });
});

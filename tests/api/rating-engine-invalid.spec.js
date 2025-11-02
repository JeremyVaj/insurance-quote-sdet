// tests/api/rating-engine-invalid.spec.js
// Test Suite: Invalid Rating Engine API Requests
// Tests error handling and validation for invalid inputs

import { test, expect } from './fixtures/apiFixtures.js';
import {
  INVALID_REVENUE_CASES,
  MISSING_FIELD_CASES,
  INVALID_STATE_CASES,
  INVALID_BUSINESS_CASES,
} from './data/testData.js';

test.describe('Rating Engine API - Invalid Requests', () => {
  
  test.describe('Invalid Revenue', () => {
    for (const testCase of INVALID_REVENUE_CASES) {
      test(`should reject ${testCase.name}`, async ({ ratingAPI }) => {
        const response = await ratingAPI.getQuote(testCase.input);
        
        ratingAPI.verifyErrorQuote(response, testCase.expectedError, 400);
      });
    }

    test('should reject null revenue', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: null,
        state: 'CA',
        business: 'retail',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Invalid revenue|Missing required fields/);
    });
  });

  test.describe('Missing Required Fields', () => {
    for (const testCase of MISSING_FIELD_CASES) {
      test(`should reject request with ${testCase.name}`, async ({ ratingAPI }) => {
        const response = await ratingAPI.getQuote(testCase.input);
        
        ratingAPI.verifyErrorQuote(response, testCase.expectedError, 400);
      });
    }
  });

  test.describe('Invalid State', () => {
    for (const testCase of INVALID_STATE_CASES) {
      if (testCase.shouldSucceed) {
        test(`should accept ${testCase.name}`, async ({ ratingAPI }) => {
          const response = await ratingAPI.getQuote(testCase.input);
          
          expect(response.status).toBe(200);
          ratingAPI.verifySuccessfulQuote(response);
        });
      } else {
        test(`should reject ${testCase.name}`, async ({ ratingAPI }) => {
          const response = await ratingAPI.getQuote(testCase.input);
          
          ratingAPI.verifyErrorQuote(response, testCase.expectedError, 400);
        });
      }
    }

    test('should reject null state', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: 50000,
        state: null,
        business: 'retail',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Invalid state|Missing required fields/);
    });

    test('should reject numeric state', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: 50000,
        state: 123,
        business: 'retail',
      });

      expect(response.status).toBe(400);
    });
  });

  test.describe('Invalid Business Type', () => {
    for (const testCase of INVALID_BUSINESS_CASES) {
      if (testCase.shouldSucceed) {
        test(`should accept ${testCase.name}`, async ({ ratingAPI }) => {
          const response = await ratingAPI.getQuote(testCase.input);
          
          expect(response.status).toBe(200);
          ratingAPI.verifySuccessfulQuote(response);
        });
      } else {
        test(`should reject ${testCase.name}`, async ({ ratingAPI }) => {
          const response = await ratingAPI.getQuote(testCase.input);
          
          ratingAPI.verifyErrorQuote(response, testCase.expectedError, 400);
        });
      }
    }

    test('should reject null business type', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: 50000,
        state: 'CA',
        business: null,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Invalid business|Missing required fields/);
    });
  });

  test.describe('Malformed Requests', () => {
    test('should reject request with invalid JSON', async ({ request }) => {
      const baseURL = process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev';
      
      const response = await request.post(`${baseURL}/`, {
        data: 'this is not valid JSON',
        headers: {
          'Content-Type': 'application/json',
        },
        failOnStatusCode: false,
      });

      expect(response.status()).toBe(400);
    });

    test('should reject GET request (wrong HTTP method)', async ({ request }) => {
      const baseURL = process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev';
      
      const response = await request.get(`${baseURL}/`, {
        failOnStatusCode: false,
      });

      expect(response.status()).toBe(405);
    });

    test('should reject PUT request (wrong HTTP method)', async ({ request }) => {
      const baseURL = process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev';
      
      const response = await request.put(`${baseURL}/`, {
        data: { revenue: 50000, state: 'CA', business: 'retail' },
        failOnStatusCode: false,
      });

      expect(response.status()).toBe(405);
    });
  });

  test.describe('Error Response Structure', () => {
    test('should return consistent error structure for all errors', async ({ ratingAPI }) => {
      const response = await ratingAPI.getQuote({
        revenue: -1000,
        state: 'CA',
        business: 'retail',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.error).toBe('string');
      expect(typeof response.body.message).toBe('string');
      expect(response.body.error.length).toBeGreaterThan(0);
      expect(response.body.message.length).toBeGreaterThan(0);
    });
  });
});

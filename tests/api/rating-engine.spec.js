// tests/api/rating-engine.spec.js
// API Tests - Backend Contract Validation
// Tests edge cases and validation that the UI cannot reach

import { test, expect } from '@playwright/test';

const API_URL = process.env.API_BASE_URL || 'https://rating-api.jeremy-vajko.workers.dev/';

// ============================================
// VALIDATION TESTS (10 tests)
// These test scenarios that HTML5 validation blocks
// ============================================

test.describe('API Validation - Edge Cases UI Cannot Reach', () => {
  
  test('should reject negative revenue', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: -5000, state: 'CA', business: 'retail' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Invalid revenue/i);
  });

  test('should reject string revenue', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 'fifty thousand', state: 'CA', business: 'retail' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Invalid revenue/i);
  });

  test('should reject null revenue', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: null, state: 'CA', business: 'retail' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Invalid revenue|Missing required fields/i);
  });

  test('should reject missing revenue field', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { state: 'CA', business: 'retail' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Missing required fields/i);
  });

  test('should reject missing state field', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 50000, business: 'retail' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Missing required fields/i);
  });

  test('should reject missing business field', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 50000, state: 'CA' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Missing required fields/i);
  });

  test('should reject empty request body', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Missing required fields/i);
  });

  test('should reject invalid state code', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 50000, state: 'ZZ', business: 'retail' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Invalid state/i);
  });

  test('should reject invalid business type', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 50000, state: 'CA', business: 'technology' }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Invalid business type/i);
  });

  test('should reject GET request (wrong HTTP method)', async ({ request }) => {
    const response = await request.get(API_URL);
    expect(response.status()).toBe(405);
  });
});

// ============================================
// RESPONSE STRUCTURE TESTS (3 tests)
// Verify the API contract is correct
// ============================================

test.describe('API Response Structure', () => {
  
  test('success response should have all required fields', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 50000, state: 'CA', business: 'retail' }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('premium');
    expect(body).toHaveProperty('quoteId');
    expect(body).toHaveProperty('calculatedAt');
  });

  test('premium should be a number', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 50000, state: 'CA', business: 'retail' }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(typeof body.premium).toBe('number');
    expect(body.premium).toBeGreaterThanOrEqual(0);
  });

  test('quoteId should match format Q-timestamp-random', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { revenue: 50000, state: 'CA', business: 'retail' }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.quoteId).toMatch(/^Q-\d+-[A-Z0-9]+$/);
  });
});

// ============================================
// BUSINESS LOGIC TESTS (2 tests)
// Core calculation and behavior tests
// ============================================

test.describe('API Business Logic', () => {
  
  test('quote IDs should be unique across requests', async ({ request }) => {
    const quoteIds = new Set();
    
    for (let i = 0; i < 3; i++) {
      const response = await request.post(API_URL, {
        data: { revenue: 50000, state: 'CA', business: 'retail' }
      });
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      
      expect(quoteIds.has(body.quoteId)).toBe(false);
      quoteIds.add(body.quoteId);
    }
    
    expect(quoteIds.size).toBe(3);
  });

  test('same inputs should produce consistent premium', async ({ request }) => {
    const response1 = await request.post(API_URL, {
      data: { revenue: 50000, state: 'CA', business: 'retail' }
    });
    
    const response2 = await request.post(API_URL, {
      data: { revenue: 50000, state: 'CA', business: 'retail' }
    });
    
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    
    const body1 = await response1.json();
    const body2 = await response2.json();
    
    expect(body1.premium).toBe(body2.premium);
  });
});

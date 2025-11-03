// tests/api/helpers/RatingEngineAPI.js
// Domain-specific API helper for Rating Engine endpoints

import { expect } from '@playwright/test';
import { ApiClient } from './ApiClient.js';
import { RESPONSE_SCHEMA } from '../data/testData.js';

export class RatingEngineAPI extends ApiClient {
  constructor(request, baseURL) {
    super(request, baseURL);
  }

  /**
   * Get a quote from the rating engine
   * @param {object} quoteData - Quote request data {revenue, state, business}
   * @returns {Promise<object>} API response
   */
  async getQuote(quoteData) {
    return await this.post('/', quoteData);
  }

  /**
   * Verify successful quote response
   */
  verifySuccessfulQuote(response, expectedRange = null) {
    // Verify status code
    expect(response.status).toBe(200);
    
    // Verify response schema
    this.verifySchema(response.body, RESPONSE_SCHEMA.SUCCESS);
    
    // Verify premium is a positive number
    expect(response.body.premium).toBeGreaterThanOrEqual(0);
    
    // Verify quoteId format (Q-timestamp-random)
    expect(response.body.quoteId).toMatch(/^Q-\d+-[A-Z0-9]+$/);
    
    // Verify calculatedAt is a valid ISO date
    expect(() => new Date(response.body.calculatedAt)).not.toThrow();
    expect(new Date(response.body.calculatedAt).toString()).not.toBe('Invalid Date');
    
    // If expected range provided, verify premium is within range
    if (expectedRange) {
      expect(response.body.premium).toBeGreaterThanOrEqual(expectedRange.min);
      expect(response.body.premium).toBeLessThanOrEqual(expectedRange.max);
    }
    
    return response.body;
  }

  /**
   * Verify error response
   */
  verifyErrorQuote(response, expectedError = null, expectedStatus = 400) {
    // Verify status code
    expect(response.status).toBe(expectedStatus);
    
    // Verify error response schema
    this.verifyErrorResponse(response.body, expectedError);
    
    return response.body;
  }

  /**
   * Verify premium calculation is consistent
   * Make same request twice and verify we get same premium
   */
  async verifyConsistentPricing(quoteData) {
    const response1 = await this.getQuote(quoteData);
    const response2 = await this.getQuote(quoteData);
    
    expect(response1.body.premium).toBe(response2.body.premium);
    
    return response1.body.premium;
  }

  /**
   * Verify quote IDs are unique
   */
  async verifyUniqueQuoteIds(quoteData, iterations = 5) {
    const quoteIds = new Set();
    
    for (let i = 0; i < iterations; i++) {
      const response = await this.getQuote(quoteData);
      expect(response.status).toBe(200);
      
      // Verify this quoteId hasn't been seen before
      expect(quoteIds.has(response.body.quoteId)).toBe(false);
      quoteIds.add(response.body.quoteId);
    }
    
    return quoteIds.size === iterations;
  }
}

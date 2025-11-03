// tests/api/helpers/ApiClient.js
// Base API Client - Reusable helper for making API requests

import { expect } from '@playwright/test';

export class ApiClient {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;
  }

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint path
   * @param {object} data - Request body
   * @param {object} options - Additional request options
   * @returns {Promise<object>} Response object with status, body, and headers
   */
  async post(endpoint, data, options = {}) {
    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const body = await this.parseResponse(response);

    return {
      status: response.status(),
      statusText: response.statusText(),
      body: body,
      headers: response.headers(),
      response: response,
    };
  }

  /**
   * Parse response body as JSON, handle errors gracefully
   */
  async parseResponse(response) {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify response matches expected schema
   */
  verifySchema(body, schema) {
    for (const [key, type] of Object.entries(schema)) {
      expect(body).toHaveProperty(key);
      expect(typeof body[key]).toBe(type);
    }
  }

  /**
   * Verify error response structure
   */
  verifyErrorResponse(body, expectedError = null) {
    expect(body).toHaveProperty('error');
    expect(body).toHaveProperty('message');
    expect(typeof body.error).toBe('string');
    expect(typeof body.message).toBe('string');
    
    if (expectedError) {
      expect(body.error).toBe(expectedError);
    }
  }
}

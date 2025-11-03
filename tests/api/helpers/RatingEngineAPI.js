// tests/api/helpers/RatingEngineAPI.js
// Minimal API Helper - Just wraps HTTP calls, not a full Page Object Model

export class RatingEngineAPI {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;
  }

  /**
   * Get a quote from the rating engine
   */
  async getQuote(quoteData) {
    const response = await this.request.post(this.baseURL, {
      data: quoteData,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let body;
    try {
      body = await response.json();
    } catch (e) {
      body = null;
    }

    return {
      status: response.status(),
      body: body,
      response: response,
    };
  }

  /**
   * Verify successful quote response
   */
  verifySuccessResponse(result, expectedMessage = null) {
    const { status, body } = result;
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}. Body: ${JSON.stringify(body)}`);
    }

    if (!body || typeof body !== 'object') {
      throw new Error('Response body should be an object');
    }

    // Check required fields
    if (!body.hasOwnProperty('premium')) {
      throw new Error('Response missing "premium" field');
    }
    if (!body.hasOwnProperty('quoteId')) {
      throw new Error('Response missing "quoteId" field');
    }
    if (!body.hasOwnProperty('calculatedAt')) {
      throw new Error('Response missing "calculatedAt" field');
    }

    // Verify types
    if (typeof body.premium !== 'number') {
      throw new Error('Premium should be a number');
    }
    if (typeof body.quoteId !== 'string') {
      throw new Error('QuoteId should be a string');
    }
    
    return true;
  }

  /**
   * Verify error response
   */
  verifyErrorResponse(result, expectedError = null, expectedStatus = 400) {
    const { status, body } = result;
    
    if (status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${status}`);
    }

    if (!body || typeof body !== 'object') {
      throw new Error('Error response body should be an object');
    }

    if (!body.hasOwnProperty('error')) {
      throw new Error('Error response missing "error" field');
    }

    if (expectedError && body.error !== expectedError) {
      throw new Error(`Expected error "${expectedError}", got "${body.error}"`);
    }

    return true;
  }
}

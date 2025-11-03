// tests/api/testData.js
// Test data for API tests

export const INVALID_REQUESTS = {
  negativeRevenue: {
    revenue: -5000,
    state: 'CA',
    business: 'retail',
    expectedError: 'Invalid revenue',
  },
  stringRevenue: {
    revenue: 'fifty thousand',
    state: 'CA',
    business: 'retail',
    expectedError: 'Invalid revenue',
  },
  nullRevenue: {
    revenue: null,
    state: 'CA',
    business: 'retail',
    expectedError: 'Invalid revenue',
  },
  missingRevenue: {
    state: 'CA',
    business: 'retail',
    expectedError: 'Missing required fields',
  },
  missingState: {
    revenue: 50000,
    business: 'retail',
    expectedError: 'Missing required fields',
  },
  missingBusiness: {
    revenue: 50000,
    state: 'CA',
    expectedError: 'Missing required fields',
  },
  emptyBody: {
    expectedError: 'Missing required fields',
  },
  invalidState: {
    revenue: 50000,
    state: 'ZZ',
    business: 'retail',
    expectedError: 'Invalid state',
  },
  invalidBusiness: {
    revenue: 50000,
    state: 'CA',
    business: 'technology',
    expectedError: 'Invalid business type',
  },
};

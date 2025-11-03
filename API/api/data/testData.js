// tests/api/data/testData.js
// Centralized test data management for all test scenarios

export const VALID_TEST_CASES = [
  {
    name: 'CA retail business with 50K revenue',
    input: {
      revenue: 50000,
      state: 'CA',
      business: 'retail',
    },
    expectedPremiumRange: { min: 1400, max: 1600 }, // ~1500 expected
  },
  {
    name: 'TX restaurant with 100K revenue',
    input: {
      revenue: 100000,
      state: 'TX',
      business: 'restaurant',
    },
    expectedPremiumRange: { min: 3100, max: 3400 }, // ~3250 expected
  },
  {
    name: 'NY professional services with 200K revenue',
    input: {
      revenue: 200000,
      state: 'NY',
      business: 'professional',
    },
    expectedPremiumRange: { min: 5100, max: 5300 }, // ~5200 expected
  },
  {
    name: 'WI manufacturing with 75K revenue',
    input: {
      revenue: 75000,
      state: 'WI',
      business: 'manufacturing',
    },
    expectedPremiumRange: { min: 2500, max: 2600 }, // ~2531 expected
  },
];

export const EDGE_CASES = [
  {
    name: 'Zero revenue',
    input: {
      revenue: 0,
      state: 'CA',
      business: 'retail',
    },
    expectedPremium: 0,
  },
  {
    name: 'Very high revenue (1 million)',
    input: {
      revenue: 1000000,
      state: 'TX',
      business: 'professional',
    },
    expectedPremiumRange: { min: 19000, max: 21000 },
  },
  {
    name: 'Low revenue (100)',
    input: {
      revenue: 100,
      state: 'OH',
      business: 'retail',
    },
    expectedPremiumRange: { min: 2, max: 3 },
  },
];

export const INVALID_REVENUE_CASES = [
  {
    name: 'Negative revenue',
    input: {
      revenue: -5000,
      state: 'CA',
      business: 'retail',
    },
    expectedError: 'Invalid revenue',
  },
  {
    name: 'String revenue',
    input: {
      revenue: 'fifty thousand',
      state: 'TX',
      business: 'restaurant',
    },
    expectedError: 'Invalid revenue',
  },
];

export const MISSING_FIELD_CASES = [
  {
    name: 'Missing revenue',
    input: {
      state: 'CA',
      business: 'retail',
    },
    expectedError: 'Missing required fields',
  },
  {
    name: 'Missing state',
    input: {
      revenue: 50000,
      business: 'retail',
    },
    expectedError: 'Missing required fields',
  },
  {
    name: 'Missing business',
    input: {
      revenue: 50000,
      state: 'CA',
    },
    expectedError: 'Missing required fields',
  },
  {
    name: 'Empty request body',
    input: {},
    expectedError: 'Missing required fields',
  },
];

export const INVALID_STATE_CASES = [
  {
    name: 'Invalid state code (ZZ)',
    input: {
      revenue: 50000,
      state: 'ZZ',
      business: 'retail',
    },
    expectedError: 'Invalid state',
  },
  {
    name: 'Lowercase state code',
    input: {
      revenue: 50000,
      state: 'ca',
      business: 'retail',
    },
    // Should work - API accepts lowercase and converts
    shouldSucceed: true,
  },
  {
    name: 'Full state name instead of code',
    input: {
      revenue: 50000,
      state: 'California',
      business: 'retail',
    },
    expectedError: 'Invalid state',
  },
];

export const INVALID_BUSINESS_CASES = [
  {
    name: 'Invalid business type',
    input: {
      revenue: 50000,
      state: 'CA',
      business: 'technology',
    },
    expectedError: 'Invalid business type',
  },
  {
    name: 'Uppercase business type',
    input: {
      revenue: 50000,
      state: 'CA',
      business: 'RETAIL',
    },
    // Should work - API accepts uppercase and converts
    shouldSucceed: true,
  },
  {
    name: 'Empty business type',
    input: {
      revenue: 50000,
      state: 'CA',
      business: '',
    },
    expectedError: 'Missing required fields',
  },
];

export const VALID_STATES = ['CA', 'TX', 'NY', 'WI', 'OH', 'IL', 'NV'];

export const VALID_BUSINESS_TYPES = ['retail', 'restaurant', 'professional', 'manufacturing'];

export const RESPONSE_SCHEMA = {
  SUCCESS: {
    premium: 'number',
    quoteId: 'string',
    calculatedAt: 'string',
  },
  ERROR: {
    error: 'string',
    message: 'string',
  },
};

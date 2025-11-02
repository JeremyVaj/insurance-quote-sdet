# Coterie Insurance - SDET Take-Home Project

**Author:** Jeremy Vajko  
**Date:** November 2025

## Project Overview

This project contains automated tests for two user stories:
1. **Story 1:** Rating Engine API - Quote and Rate functionality
2. **Story 2:** Consumer Frontend Application - Coverage Options Display

## Project Structure

```
coterie-sdet-project/
├── tests/
│   ├── api/                          # API Test Suite (Story 1)
│   │   ├── helpers/                  # Reusable helper classes
│   │   │   ├── ApiClient.js         # Base API client with common methods
│   │   │   └── RatingEngineAPI.js   # Domain-specific API helper
│   │   ├── fixtures/                 # Playwright fixtures
│   │   │   └── apiFixtures.js       # Custom fixtures for dependency injection
│   │   ├── data/                     # Test data management
│   │   │   └── testData.js          # Centralized test data
│   │   ├── rating-engine-valid.spec.js    # Valid request tests
│   │   └── rating-engine-invalid.spec.js  # Error handling tests
│   └── e2e/                          # E2E Test Suite (Story 2 - To be implemented)
├── index.html                        # Frontend application (Story 2)
├── rating-api-worker.js              # Cloudflare Worker mock API
├── playwright.config.js              # Playwright configuration
├── package.json                      # NPM dependencies and scripts
└── README.md                         # This file
```

## Test Framework Architecture

### Design Patterns Used

#### 1. **Page Object Model (POM) Pattern**
- Separates test logic from implementation details
- `ApiClient.js` serves as base class
- `RatingEngineAPI.js` extends base with domain-specific methods

#### 2. **Fixture Pattern**
- Uses Playwright's fixture system for dependency injection
- Automatic setup/teardown of test dependencies
- See `apiFixtures.js`

#### 3. **Data-Driven Testing**
- Centralized test data in `testData.js`
- Easy to add new test scenarios
- Separates test data from test logic

### Helper Classes

#### `ApiClient.js` (Base Class)
Provides common API functionality:
- HTTP request methods (POST, GET, etc.)
- Response parsing
- Schema validation
- Error verification

#### `RatingEngineAPI.js` (Domain-Specific)
Extends ApiClient with Rating Engine specific methods:
- `getQuote()` - Get insurance quote
- `verifySuccessfulQuote()` - Validate successful responses
- `verifyErrorQuote()` - Validate error responses
- `verifyConsistentPricing()` - Test business logic consistency
- `verifyUniqueQuoteIds()` - Ensure quote ID uniqueness

### Test Data Management

All test data is centralized in `tests/api/data/testData.js`:

- **VALID_TEST_CASES** - Happy path scenarios
- **EDGE_CASES** - Boundary conditions (zero revenue, high revenue, etc.)
- **INVALID_REVENUE_CASES** - Negative and invalid revenue tests
- **MISSING_FIELD_CASES** - Required field validation
- **INVALID_STATE_CASES** - State validation tests
- **INVALID_BUSINESS_CASES** - Business type validation
- **RESPONSE_SCHEMA** - Expected response structures

This approach makes it easy to:
- Add new test scenarios without modifying test code
- Maintain expected values in one place
- Reuse test data across multiple tests

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Install Dependencies

```bash
npm install
```

### Environment Variables

The API base URL can be configured via environment variable:

```bash
export API_BASE_URL=https://rating-api.jeremy-vajko.workers.dev
```

If not set, it defaults to the Cloudflare Worker URL.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Only API Tests
```bash
npm run test:api
```

### Run in Headed Mode (with browser)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### View Test Report
```bash
npm run report
```

## Test Coverage

### Story 1: Rating Engine API Tests

#### Valid Request Tests (`rating-engine-valid.spec.js`)
- ✅ Standard valid scenarios with different states and business types
- ✅ Edge cases (zero revenue, very high revenue, low revenue)
- ✅ Response structure validation (all required fields present)
- ✅ Data type validation (premium is number, quoteId is string, etc.)
- ✅ Quote ID format validation (matches pattern Q-timestamp-random)
- ✅ Timestamp validation (valid ISO 8601 format)
- ✅ Unique quote ID generation
- ✅ Consistent pricing for same inputs
- ✅ Business logic validation (state and business type multipliers)

#### Invalid Request Tests (`rating-engine-invalid.spec.js`)
- ✅ Invalid revenue (negative, string, null)
- ✅ Missing required fields (revenue, state, business, empty body)
- ✅ Invalid state codes
- ✅ Invalid business types
- ✅ Malformed JSON requests
- ✅ Wrong HTTP methods (GET, PUT instead of POST)
- ✅ Error response structure validation

### Test Metrics
- **Total API Tests:** 40+
- **Test Categories:** Valid requests, invalid inputs, edge cases, schema validation
- **Coverage:** Request validation, response validation, business logic, error handling

## Test Prioritization Strategy

### P0 (Critical - Must Pass)
1. Valid request with all required fields returns 200
2. Response contains premium, quoteId, calculatedAt
3. Invalid requests return 400 with error message
4. Missing required fields are rejected

### P1 (High Priority)
1. Premium calculation is correct for different scenarios
2. Edge cases handle correctly (zero revenue, high revenue)
3. Quote IDs are unique
4. Pricing is consistent for same inputs

### P2 (Medium Priority)
1. Response schema validation
2. Timestamp format validation
3. Case insensitivity for state/business type
4. Wrong HTTP methods rejected

### P3 (Nice to Have)
1. Performance tests
2. Load tests
3. Security tests

## CI/CD Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test
  env:
    API_BASE_URL: https://rating-api.jeremy-vajko.workers.dev
```

Tests include:
- Retry logic for flaky tests (2 retries in CI)
- HTML and JSON reports for test results
- Trace collection on failures
- Parallel execution support

## Future Enhancements

### Short Term
- [ ] Add E2E tests for Story 2 (Frontend coverage selector)
- [ ] Add performance/load testing
- [ ] Add contract testing

### Long Term
- [ ] Integration with test management tool (TestRail, Xray)
- [ ] Visual regression testing
- [ ] API security testing (OWASP)
- [ ] Continuous test execution monitoring

## Mock API Details

The Rating Engine API is implemented as a Cloudflare Worker:

**Endpoint:** `https://rating-api.jeremy-vajko.workers.dev/`

**Features:**
- POST endpoint for quote requests
- Validation for all input fields
- Premium calculation based on revenue, state, and business type
- Unique quote ID generation
- CORS enabled for frontend integration

## Key Decisions & Trade-offs

### Why Playwright?
- Excellent API testing support (not just browser automation)
- Built-in fixtures system for dependency injection
- Native TypeScript/JavaScript support
- Great reporting and debugging tools
- Company is using Playwright per requirements

### Why This Structure?
- **Scalability:** Easy to add new tests without modifying existing code
- **Maintainability:** Clear separation of concerns (helpers, fixtures, data, tests)
- **Reusability:** Base classes can be extended for other APIs
- **Readability:** Test code is clean and focused on "what" not "how"

### Test Data Approach
- Centralized in `testData.js` for easy maintenance
- Data-driven tests reduce code duplication
- Easy to add new scenarios
- Expected values documented with test data

## Contact

For questions or clarifications:
- **Email:** [Your email]
- **GitHub:** github.com/jeremyvajko
- **Demo:** https://jeremyvajko.com/InsuranceDemo

---

*This project demonstrates professional SDET skills including test automation, framework design, API testing, and quality engineering best practices.*

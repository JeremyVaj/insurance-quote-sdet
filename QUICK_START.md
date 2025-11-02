# Quick Start Guide - API Tests

## Setup (One-time)

```bash
# 1. Clone/download the project
cd coterie-sdet-project

# 2. Install dependencies
npm install

# 3. (Optional) Set API URL if different
export API_BASE_URL=https://rating-api.jeremy-vajko.workers.dev
```

## Running Tests

### Basic Commands

```bash
# Run all API tests
npm run test:api

# Run all tests (both API and E2E)
npm test

# Run in debug mode
npm run test:debug

# Run with UI (headed mode)
npm run test:headed
```

### Expected Output

When tests run successfully, you'll see output like:

```
Running 35 tests using 4 workers

  ✓  [api-tests] › rating-engine-valid.spec.js:13 › should calculate premium for CA retail (150ms)
  ✓  [api-tests] › rating-engine-valid.spec.js:13 › should calculate premium for TX restaurant (145ms)
  ✓  [api-tests] › rating-engine-valid.spec.js:26 › should handle Zero revenue (132ms)
  ✓  [api-tests] › rating-engine-valid.spec.js:40 › should return all required fields (128ms)
  ✓  [api-tests] › rating-engine-invalid.spec.js:17 › should reject Negative revenue (98ms)
  ✓  [api-tests] › rating-engine-invalid.spec.js:38 › should reject Missing revenue (95ms)
  ... (29 more tests)

  35 passed (5s)
```

## Viewing Test Reports

```bash
# Generate and open HTML report
npm run report
```

This opens a detailed HTML report showing:
- Pass/fail status for each test
- Test execution time
- Error details with stack traces
- Network requests made
- Screenshots (for E2E tests)

## Test Structure

### Test Files
- `rating-engine-valid.spec.js` - Happy path scenarios (17 tests)
- `rating-engine-invalid.spec.js` - Error handling (18 tests)

### Helper Classes
- `ApiClient.js` - Base API client
- `RatingEngineAPI.js` - Rating Engine specific methods
- `apiFixtures.js` - Playwright fixtures for dependency injection

### Test Data
- `testData.js` - All test scenarios and expected values

## Common Issues & Solutions

### Issue: Tests timing out
```
Error: Test timeout of 30000ms exceeded
```

**Solution:** Check that the API URL is correct and accessible:
```bash
curl -X POST https://rating-api.jeremy-vajko.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"revenue": 50000, "state": "CA", "business": "retail"}'
```

### Issue: Network errors
```
Error: getaddrinfo EAI_AGAIN rating-api.jeremy-vajko.workers.dev
```

**Solution:** 
1. Check internet connection
2. Verify API URL is correct
3. Check if API is deployed and running

### Issue: All tests failing with 400 errors
```
Expected status: 200, Received: 400
```

**Solution:** The API validation has changed. Check:
1. Required fields in test data
2. Valid state codes
3. Valid business types

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:api
        env:
          API_BASE_URL: ${{ secrets.API_URL }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Adding New Tests

### Example: Add a new valid scenario

1. Add test data to `tests/api/data/testData.js`:

```javascript
export const VALID_TEST_CASES = [
  // ... existing cases
  {
    name: 'IL retail with 250K revenue',
    input: {
      revenue: 250000,
      state: 'IL',
      business: 'retail',
    },
    expectedPremiumRange: { min: 6800, max: 7000 },
  },
];
```

2. Run tests - it will automatically be included!

```bash
npm run test:api
```

The framework is data-driven, so adding new test scenarios is as simple as adding data!

## Next Steps

1. ✅ API tests complete (Story 1)
2. ⏳ Add E2E tests for frontend (Story 2)
3. ⏳ Create planning document (Part 1)
4. ⏳ Add to GitHub and submit

---

For questions or issues, refer to the main README.md or API_FRAMEWORK_SUMMARY.md

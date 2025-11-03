# Insurance Quote Calculator - Test Automation Project

**Author:** Jeremy Vajko  
**Date:** November 2025

## Project Overview

Automated test suite for an insurance quote calculator, demonstrating two complementary testing approaches:

1. **API Tests** - Backend contract validation (15 tests)
2. **Integration Tests** - User flow validation through accessibility tags (30 tests)

**Total: 45 comprehensive tests**

---

## 🎯 Testing Strategy

### **Why Two Test Suites?**

#### API Tests (Isolated)
- Tests edge cases the UI blocks (negative revenue, missing fields, malformed JSON)
- Fast execution (no browser required)
- Validates backend contract
- **Run on every commit**

#### Integration Tests (User Flow Based)
- Tests real user scenarios through tagged UI
- Verifies frontend + backend work together
- Uses `data-testid` accessibility attributes
- **Run before deployment**

---

## 📁 Project Structure

```
insurance-quote-sdet/
├── tests/
│   ├── api/                           # API Tests (15 tests)
│   │   ├── helpers/
│   │   │   └── RatingEngineAPI.js    # Minimal API helper (~90 lines)
│   │   ├── apiFixtures.js            # Playwright fixtures
│   │   ├── testData.js               # Test data
│   │   └── rating-engine.spec.js     # All API tests
│   │
│   └── integration/                   # Integration Tests (30 tests)
│       └── user-flows.spec.js        # All user flow tests
│
├── index.html                         # Frontend with accessibility tags
├── playwright.config.js               # Test configuration
├── package.json                       # Dependencies
└── README.md                          # This file
```

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Run Tests

```bash
# Run all tests (API + Integration)
npm test

# Run only API tests (fast, ~5 seconds)
npm run test:api

# Run only integration tests (slower, ~30 seconds)
npm run test:integration

# Run with browser visible
npm run test:headed

# View test report
npm run report
```

---

## 📋 Test Coverage

### API Tests (15 tests)

#### Validation Tests (10 tests) - UI Cannot Reach
- ✅ Negative revenue → 400 error
- ✅ String revenue → 400 error
- ✅ Null revenue → 400 error
- ✅ Missing revenue field → 400 error
- ✅ Missing state field → 400 error
- ✅ Missing business field → 400 error
- ✅ Empty request body → 400 error
- ✅ Invalid state code (ZZ) → 400 error
- ✅ Invalid business type → 400 error
- ✅ Wrong HTTP method (GET) → 405 error

#### Response Structure (3 tests)
- ✅ All required fields present
- ✅ Premium is a number
- ✅ QuoteId matches format

#### Business Logic (2 tests)
- ✅ Quote IDs are unique
- ✅ Consistent pricing for same inputs

### Integration Tests (30 tests)

#### Form Behavior (4 tests)
- ✅ Button disabled on load
- ✅ Button disabled with partial form
- ✅ Button enabled when complete
- ✅ Form prevents empty submission

#### Happy Path Scenarios (12 tests)
- ✅ 7 different state combinations
- ✅ 4 different business type combinations
- ✅ Zero revenue edge case
- ✅ High revenue (1M) edge case
- ✅ Low revenue (100) edge case
- ✅ All states test (loop through 7 states)
- ✅ All business types test (loop through 4 types)

#### UI Behavior (6 tests)
- ✅ Loading indicator appears/disappears
- ✅ Previous quote replaced
- ✅ Error handling
- ✅ Multiple submissions

#### Business Logic (4 tests)
- ✅ State multipliers (NY > OH)
- ✅ Business multipliers (mfg > professional)
- ✅ Unique quote IDs
- ✅ Consistent premiums

#### Response Display (4 tests)
- ✅ Premium formatting ($X,XXX.XX)
- ✅ Quote ID display
- ✅ Timestamp display
- ✅ All fields visible

---

## 🎨 Key Design Decisions

### 1. Minimal API Helper (Not Full POM)

```javascript
// Just 90 lines - wraps HTTP calls only
class RatingEngineAPI {
  async getQuote(data)
  verifySuccessResponse(result)
  verifyErrorResponse(result)
}
```

**Why:** Simple, focused, easy to maintain

### 2. Accessibility-Based Selectors (No Page Objects for UI)

```javascript
// Tests use aria-label attributes directly
await page.selectOption('[aria-label="state.select"]', 'WI');
await page.selectOption('[aria-label="business.select"]', 'retail');
await page.fill('[aria-label="revenue.input"]', '50000');
await page.click('[aria-label="coverage.none"]'); // V2 states require coverage
await page.click('[aria-label="submit.get-quote"]');
```

**Why:** 
- Each test is 5-10 lines
- No Page Object boilerplate
- Selectors use semantic aria-labels
- Accessible to screen readers

### 3. One File Per Test Suite

```
rating-engine.spec.js      → All 15 API tests
user-flows.spec.js         → All 30 integration tests
```

**Why:** Easy to navigate, grouped by purpose

---

## 🎓 What This Demonstrates

✅ **Framework Design** - Minimal helpers, no over-engineering  
✅ **Accessibility Testing** - Using semantic `data-testid` attributes  
✅ **User-Focused Testing** - Real scenarios, not just code coverage  
✅ **Modern Patterns** - Fixtures, async/await, data-driven tests  
✅ **Practical Testing** - Two suites for different purposes  
✅ **Clean Code** - Readable, maintainable, well-organized  

---

## 📝 Notes

- **API URL:** `https://rating-api.jeremy-vajko.workers.dev/`
- **Frontend:** File-based (index.html) with animated bubbles and Space Mono font
- **Test Framework:** Playwright
- **Language:** JavaScript (ES6 modules)
- **V2 States:** WI, OH, IL, NV (require coverage selection to enable submit)
- **V1 States:** TX, NY, CA (no coverage options available)
- **Accessibility:** Uses aria-label attributes for screen reader support

---

*This project demonstrates professional SDET skills including test automation, framework design, accessibility-first testing, and practical quality engineering.*

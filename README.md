# Insurance Quote Calculator - Test Automation Project

**Author:** Jeremy Vajko  
**Date:** November 2025  
**Testing Approach:** Thin App Model with Accessibility-First Selectors

## Project Overview

Automated test suite demonstrating **Thin App Model** testing strategy:

1. **API Tests** - Backend contract validation (15 tests)
2. **Integration Tests** - Flow-based UI tests with generic accessibility selectors (27 tests)

**Total: 42 comprehensive tests**

**Key Innovation:** Tests use natural, screen-reader-friendly `aria-label` attributes as selectors - no test-specific IDs needed.

---

## 🎯 Testing Philosophy: Thin App Model

### What is Thin App Model?

**Core Principle:** Every selector is a generic, stable, accessibility-friendly label that serves both users and tests.

#### Traditional Approach ❌
```html
<button data-testid="submit-quote-btn-v2">Submit</button>
```
```javascript
await page.click('[data-testid="submit-quote-btn-v2"]');
```

#### Thin App Model ✅
```html
<button aria-label="Submit quote">Get Quote</button>
```
```javascript
await page.getByLabel('Submit quote').click();
```

### Benefits

✅ **Accessibility First** - Every selector is screen-reader friendly  
✅ **Stable Selectors** - Generic names don't change with implementation  
✅ **Readable Tests** - Tests read like user stories  
✅ **No Duplication** - One source of truth for labels  
✅ **WCAG Compliant** - Built-in accessibility support  

---

## 📁 Project Structure

```
insurance-quote-sdet/
├── tests/
│   ├── api/                                    # API Tests (15 tests)
│   │   ├── helpers/RatingEngineAPI.js         # Minimal API helper (~90 lines)
│   │   ├── apiFixtures.js                     # Playwright fixtures
│   │   ├── testData.js                        # Test data
│   │   └── rating-engine.spec.js              # All API tests
│   │
│   └── integration/                            # Integration Tests (27 tests)
│       └── user-flows.spec.js                 # Flow-based UI tests
│
├── index.html                                  # Frontend with generic aria-labels
├── playwright.config.js                        # Test configuration
├── package.json                                # Dependencies
├── .gitignore                                  # Git exclusions
├── README.md                                   # This file
└── THIN_APP_MODEL.md                           # Detailed strategy docs
```

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (REQUIRED for integration tests)
npx playwright install
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

Backend contract validation - tests what UI cannot reach

#### Validation Tests (10 tests)
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

### Integration Tests - Thin App Model (27 tests)

Flow-based tests using generic accessibility selectors

#### Form Validation (6 tests)
- ✅ Button disabled on load
- ✅ V1 states can submit without coverage
- ✅ V2 states with all fields can submit
- ✅ V1 notice shows
- ✅ V2 coverage options show
- ✅ Coverage hides when switching states

#### Getting Quotes (8 tests)
- ✅ WI retail with no coverage
- ✅ OH restaurant with silver coverage
- ✅ IL professional with gold coverage
- ✅ NV manufacturing with platinum coverage
- ✅ All 4 V2 states work
- ✅ All 4 business types work
- ✅ All 4 coverage levels work
- ✅ V1 states work without coverage

#### Edge Cases (3 tests)
- ✅ Zero revenue → $0
- ✅ Very high revenue (1M)
- ✅ Very low revenue (100)

#### Quote Details (2 tests)
- ✅ ID and timestamp display
- ✅ Premium formatting

#### UI Behavior (4 tests)
- ✅ Loading indicator shows/hides
- ✅ New quote replaces old
- ✅ Multiple submissions work

#### Business Rules (4 tests)
- ✅ Revenue scaling
- ✅ Business type pricing
- ✅ Unique quote IDs
- ✅ Consistent premiums

---

## 🎨 Key Design Decisions

### 1. Thin App Model (Accessibility-First Testing)

**Pattern:**
```javascript
// Generic, stable accessibility labels
await page.getByLabel('Annual revenue').fill('50000');
await page.getByLabel('Submit quote').click();
const premium = await page.getByLabel('Premium amount').textContent();
```

**Why:**
- One source of truth (accessibility = testing)
- WCAG 2.1 compliant selectors
- Stable - generic names don't change
- Readable - tests are self-documenting
- No test-specific attributes needed

### 2. Minimal API Helper (Not Full POM)

```javascript
// Just 90 lines - wraps HTTP calls only
class RatingEngineAPI {
  async getQuote(data)
  verifySuccessResponse(result)
  verifyErrorResponse(result)
}
```

**Why:** Simple, focused, easy to maintain

### 3. Flow-Based Test Organization

```
user-flows.spec.js → Organized by user journeys
  - User Flow: Form Validation
  - User Flow: Getting a Quote
  - User Flow: Edge Cases
  - Business Rules: Premium Calculations
```

**Why:** Tests describe what users do, not how UI is built

---

## 🎓 What This Demonstrates

✅ **Thin App Model** - Accessibility-first testing without test-specific IDs  
✅ **Flow-Based Tests** - Organized by user journeys, not implementation  
✅ **Generic Selectors** - Stable, screen-reader-friendly labels  
✅ **Minimal Helpers** - No over-engineered Page Objects  
✅ **Modern Patterns** - Playwright's `getByLabel()` and `getByRole()`  
✅ **Dual Approach** - API contract tests + UI flow tests  
✅ **Clean Code** - Readable, maintainable, well-organized  
✅ **WCAG Compliant** - Built-in accessibility support  

**📚 For detailed strategy:** See [THIN_APP_MODEL.md](THIN_APP_MODEL.md)  

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

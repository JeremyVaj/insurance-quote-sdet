# Thin App Model - Testing Strategy Documentation

## Overview

This project uses a **Thin App Model** approach for UI testing, where tests are flow-based and use generic, stable accessibility identifiers as selectors.

**Key Principle:** Tests use natural, screen-reader-friendly labels that serve both accessibility and testing purposes - no test-specific IDs needed.

---

## Philosophy

### Traditional Approach ❌
```javascript
// Test-specific IDs pollute HTML
<button data-testid="submit-quote-btn-v2">Submit</button>

// Tests coupled to test infrastructure
await page.click('[data-testid="submit-quote-btn-v2"]');
```

### Thin App Model ✅
```javascript
// Generic, accessible labels
<button aria-label="Submit quote">Get Quote</button>

// Tests use natural language
await page.getByLabel('Submit quote').click();
```

---

## Benefits

### 1. **Accessibility First**
- Every selector is screen-reader friendly
- WCAG 2.1 compliant by design
- Real users and tests use same labels

### 2. **Stable Selectors**
- Generic names don't change with implementation
- "Submit quote" is stable; "btn-submit-v2-new" is not
- Refactors don't break tests

### 3. **Readable Tests**
- Tests read like user stories
- No need to look up what `data-testid="xyz-123"` means
- Non-technical stakeholders can understand tests

### 4. **No Duplication**
- One source of truth for labels
- No separate test ID maintenance
- Accessibility = Testing = Documentation

---

## Implementation Guide

### Frontend Requirements

#### ✅ Buttons
```html
<!-- Generic, descriptive label -->
<button aria-label="Submit quote">Get Quote</button>
<button aria-label="Reset form">Clear</button>
<button aria-label="Select coverage">Choose Plan</button>
```

#### ✅ Inputs
```html
<!-- Associated label or aria-label -->
<label for="revenue">Annual Revenue</label>
<input id="revenue" aria-label="Annual revenue" />

<!-- Or with aria-label only -->
<input aria-label="Business name" />
```

#### ✅ Select Dropdowns
```html
<label for="state">Customer State</label>
<select id="state" aria-label="Customer state">
  <option value="WI">Wisconsin</option>
</select>
```

#### ✅ Radio Groups
```html
<fieldset role="radiogroup" aria-label="Coverage options">
  <input type="radio" aria-label="Coverage none" />
  <input type="radio" aria-label="Coverage silver" />
  <input type="radio" aria-label="Coverage gold" />
</fieldset>
```

#### ✅ Result Areas
```html
<section aria-label="Quote result">
  <div aria-label="Premium amount">$1,500.00</div>
  <div aria-label="Quote ID">Q-12345</div>
</section>
```

### Label Naming Conventions

**Rule:** Use generic, stable, natural language

✅ **Good Examples:**
- "Submit quote"
- "Annual revenue"
- "Customer state"
- "Business type"
- "Coverage options"
- "Premium amount"
- "Quote result"

❌ **Bad Examples:**
- "submit-btn-v2" (technical, version-specific)
- "revenue-input-field" (redundant)
- "state.select" (dotted notation)
- "form.quote.submit" (nested structure)

---

## Test Patterns

### Pattern 1: Direct Interaction (Thin App Model)

```javascript
test('user gets quote for retail business', async ({ page }) => {
  // Natural language selectors
  await page.getByLabel('Customer state').selectOption('WI');
  await page.getByLabel('Business type').selectOption('retail');
  await page.getByLabel('Annual revenue').fill('50000');
  await page.getByLabel('Coverage none').check();
  await page.getByLabel('Submit quote').click();
  
  // Natural assertions
  await expect(page.getByLabel('Quote result')).toBeVisible();
  
  const premium = await page.getByLabel('Premium amount').textContent();
  expect(premium).toContain('$');
});
```

**Characteristics:**
- No abstraction layer
- Direct page interactions
- 5-10 lines per test
- Highly readable

### Pattern 2: With Classic POM (Optional)

```javascript
class QuoteCalculatorPage {
  async fillAndSubmitQuote({ state, businessType, revenue, coverage }) {
    await this.page.getByLabel('Customer state').selectOption(state);
    await this.page.getByLabel('Business type').selectOption(businessType);
    await this.page.getByLabel('Annual revenue').fill(String(revenue));
    await this.page.getByLabel(`Coverage ${coverage}`).check();
    await this.page.getByLabel('Submit quote').click();
  }
  
  async getPremiumAmount() {
    const text = await this.page.getByLabel('Premium amount').textContent();
    return parseFloat(text.replace(/[$,]/g, ''));
  }
}

test('user gets quote', async ({ page }) => {
  const calculator = new QuoteCalculatorPage(page);
  
  await calculator.fillAndSubmitQuote({
    state: 'WI',
    businessType: 'retail',
    revenue: 50000,
    coverage: 'none'
  });
  
  const premium = await calculator.getPremiumAmount();
  expect(premium).toBeGreaterThan(1000);
});
```

**Characteristics:**
- Light abstraction layer
- Reusable methods
- Still uses generic labels
- Good for repeated workflows

---

## Test Organization

### File Structure
```
tests/
├── api/                              # API contract tests
│   ├── helpers/RatingEngineAPI.js   # Minimal API helper
│   └── rating-engine.spec.js        # 15 API tests
│
└── integration/                      # UI flow tests
    ├── user-flows-refactored.spec.js # 32 Thin App Model tests
    └── pom-example.spec.js           # 6 Classic POM tests (optional)
```

### Test Categories

#### 1. Form Validation (6 tests)
- Button states
- Field requirements
- V1 vs V2 state differences

#### 2. Getting Quotes (8 tests)
- Happy path scenarios
- All states
- All business types
- All coverage levels

#### 3. Edge Cases (3 tests)
- Zero revenue
- Very high revenue
- Very low revenue

#### 4. Quote Details (2 tests)
- ID and timestamp display
- Premium formatting

#### 5. UI Behavior (4 tests)
- Loading states
- Replacing old quotes
- Multiple submissions

#### 6. Business Rules (4 tests)
- Revenue scaling
- Business type pricing
- Unique IDs
- Consistency

---

## Playwright Locators Used

### Primary: `getByLabel()`
```javascript
page.getByLabel('Submit quote')
page.getByLabel('Annual revenue')
page.getByLabel('Premium amount')
```

**Why:** Matches aria-label, perfect for accessibility-first approach

### Secondary: `getByRole()`
```javascript
page.getByRole('radiogroup', { name: 'Coverage options' })
page.getByRole('alert')
page.getByRole('region', { name: 'Quote result' })
```

**Why:** Semantic HTML roles + accessible names

### Avoid: CSS/XPath Selectors
```javascript
// ❌ Don't use these
page.locator('#submit-btn')
page.locator('.quote-result')
page.locator('[data-testid="xyz"]')
```

**Why:** Brittle, not accessible, couples to implementation

---

## Migration from Old Approach

### Before (Test-Specific IDs)
```html
<input data-testid="revenue-input" />
<button data-testid="submit-button">Submit</button>
<div data-testid="premium-amount">$1,500</div>
```

```javascript
await page.fill('[data-testid="revenue-input"]', '50000');
await page.click('[data-testid="submit-button"]');
const premium = await page.textContent('[data-testid="premium-amount"]');
```

### After (Generic Accessibility)
```html
<input aria-label="Annual revenue" />
<button aria-label="Submit quote">Get Quote</button>
<div aria-label="Premium amount">$1,500</div>
```

```javascript
await page.getByLabel('Annual revenue').fill('50000');
await page.getByLabel('Submit quote').click();
const premium = await page.getByLabel('Premium amount').textContent();
```

**Changes:**
1. Remove `data-testid` attributes
2. Add `aria-label` with generic names
3. Update test selectors to use `getByLabel()`

---

## Coverage Comparison

### Old Approach (data-testid)
- 32 integration tests
- Test-specific attributes
- Separate from accessibility

### New Approach (Thin App Model)
- 32 integration tests (same coverage)
- Generic accessible labels
- Tests = Accessibility = Documentation

**Result:** Same test depth, better accessibility, more stable selectors

---

## Best Practices

### ✅ DO

1. **Use natural language**
   ```javascript
   await page.getByLabel('Submit quote').click();
   ```

2. **Keep labels generic**
   ```html
   <button aria-label="Submit quote">Get Quote</button>
   ```

3. **Test user flows**
   ```javascript
   test('user gets quote for retail business', ...)
   ```

4. **Use roles for structure**
   ```javascript
   page.getByRole('radiogroup', { name: 'Coverage options' })
   ```

### ❌ DON'T

1. **Use technical IDs**
   ```javascript
   await page.click('[data-testid="btn-submit-v2"]'); // ❌
   ```

2. **Use implementation details**
   ```html
   <div data-testid="premium-result-display-v2"> <!-- ❌ -->
   ```

3. **Test implementation**
   ```javascript
   test('submit button has class active', ...) // ❌
   ```

4. **Use brittle selectors**
   ```javascript
   await page.click('button.btn.primary'); // ❌
   ```

---

## Running Tests

```bash
# All tests
npm test

# Only integration tests
npm run test:integration

# Only Thin App Model tests
npx playwright test user-flows-refactored

# Only POM example tests
npx playwright test pom-example

# Only API tests
npm run test:api
```

---

## FAQ

### Q: Why not use `data-testid`?
**A:** It creates duplicate maintenance. Accessibility labels serve both purposes.

### Q: What if the visible text changes?
**A:** Use `aria-label` to keep the test selector stable while allowing UI text to change.

### Q: Can I still use Page Objects?
**A:** Yes! See `pom-example.spec.js`. The POM just wraps the same generic labels.

### Q: What about CSS/ID selectors?
**A:** Avoid them. They're brittle and don't support accessibility.

### Q: How do I test hidden elements?
**A:** Use `aria-hidden` and `getByLabel()` with `{ includeHidden: true }` option.

---

## Summary

**Thin App Model = Accessibility-First Testing**

✅ Generic, stable selectors  
✅ Screen-reader friendly  
✅ Readable tests  
✅ No test-specific attributes  
✅ Single source of truth  
✅ Works with or without POMs  

**Result:** Better accessibility, more maintainable tests, clearer intent.

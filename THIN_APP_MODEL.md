# The Thin App Model

A design pattern for building test systems that stay aligned with accessibility and localization.

---

## 1. Purpose

The Thin App Model was created to solve a recurring problem in test automation:

> Tests drift from real user semantics because they rely on hidden selectors that the user never sees.

When accessibility identifiers come first, they can serve as both the testing and screen-reader contract.  
This document explains how the model works, how it scales, and when to use exceptions.

---

## 2. Core Principles

1. **Accessibility as API**  
   Accessible names (`aria-label`, `role`, `name`) are the canonical selectors.  
   Tests and a11y share the same identifiers.

2. **Flows over Pages**  
   Helpers represent *user flows* (e.g., “get a quote”) instead of *screens*.  
   This keeps abstraction minimal and test bodies short.

3. **Single Source of Truth for Labels**  
   A label registry maps semantic keys (e.g., `submit_quote`) to localized text.  
   Tests refer to keys, not literal strings.

4. **Small Surface Area**  
   Only three layers: Label Registry → Flow Helpers → Tests.  
   No POM boilerplate, no deep class hierarchies.

---

## 3. Layers in Detail

### 3.1 Label Registry

**Files:**  
`A11Y_LABELS.md`, `tests/labels/en.js`, `tests/labels/index.js`

Example:

```js
// tests/labels/en.js
export const enLabels = {
  customer_state: 'Customer state',
  business_type: 'Business type',
  annual_revenue: 'Annual revenue ($)',
  submit_quote: 'Submit quote',
  quote_result: 'Quote result',
  premium_amount: 'Premium amount',
};
```

Usage:

```js
import { getLabels } from '../labels/index.js';
const L = getLabels('en');
await page.getByLabel(L.customer_state).selectOption('WI');
```

Adding another language only requires an additional label file (`es.js`) with the same keys.

---

### 3.2 Flow Helpers

**Files:**  
`tests/helpers/flows/quoteFlows.js`

Flows express intent rather than low-level mechanics:

```js
import { expect } from '@playwright/test';
import { getLabels } from '../../labels/index.js';

export async function getQuote(page, { state, business, revenue, coverage, locale }) {
  const L = getLabels(locale);
  await page.getByLabel(L.customer_state).selectOption(state);
  await page.getByLabel(L.business_type).selectOption(business);
  await page.getByLabel(L.annual_revenue).fill(String(revenue));
  await page.getByLabel(L[`coverage_${coverage}`]).check();
  await page.getByLabel(L.submit_quote).click();

  await expect(page.getByLabel(L.quote_result)).toBeVisible();
  const text = await page.getByLabel(L.premium_amount).textContent();
  return { premium: parseFloat(text.replace(/[$,]/g, '')) };
}
```

---

### 3.3 Tests

Tests remain concise and readable:

```js
import { test, expect } from '@playwright/test';
import { getQuote } from '../helpers/flows/quoteFlows.js';

test('basic quote flow', async ({ page }) => {
  await page.goto(process.env.FRONTEND_URL || 'http://localhost:3000');
  const result = await getQuote(page, {
    state: 'WI',
    business: 'retail',
    revenue: 50000,
    coverage: 'none',
  });
  expect(result.premium).toBeGreaterThan(0);
});
```

---

## 4. Scaling the Model

### Adding Features

Each new feature introduces:
- One **flow helper** file (e.g., `authFlows.js`, `paymentFlows.js`)
- New label keys for its UI elements

### Adding Locales

Add another label file (e.g., `es.js`) and supply `LOCALE=es` when running tests.  
No test duplication required.

### Adding Backends

The tests remain unchanged whether hitting a fake or real backend.  
Only `API_BASE_URL` changes.

---

## 5. Escape Hatches and Limitations

The model assumes accessible markup.  
When that’s not possible:

| Situation | Allowed Escape Hatch | Notes |
|------------|----------------------|-------|
| Third-party widget without labels | Temporary `data-testid` | Document it in `A11Y_LABELS.md` |
| Highly visual components (graphs, canvas) | Indexed or coordinate selectors | Keep within helper, not tests |
| Legacy markup with missing roles | Add `aria-label` wrapper or use `role` query | Prefer fixing markup |

These exceptions should be explicit and reviewed, not silent workarounds.

---

## 6. Comparison (Conceptual)

| Aspect | Thin App Model | Conventional POM |
|--------|----------------|------------------|
| Selector source | Accessibility layer | Test-specific IDs |
| Abstraction unit | Domain flow | Page class |
| Lines per test (this repo) | ~8 | ~14–16 |
| Localization effort | Add label map | Duplicate tests or IDs |
| Accessibility coverage | Inherent | Separate concern |

---

## 7. Practical Notes

- **Maintainability:** Changes to labels or flows are localized; the rest of the suite remains stable.  
- **Collaboration:** QA, Dev, and Accessibility teams share the same naming system.  
- **CI Integration:** Tests can run in parallel for multiple locales using Playwright projects (`ui-en`, `ui-es`, etc.).

---

## 8. Future Work

- Add a local fake backend (rating API, users, payments).  
- Implement Login and Payment flows using the same pattern.  
- Introduce ES locale and verify multi-language runs.  
- Explore native (Appium) drivers reusing the same label keys.

---

## 9. Summary

The Thin App Model trades POM boilerplate for semantic discipline:

- **Selectors** are accessible names.  
- **Flows** are reusable user journeys.  
- **Tests** are short and expressive.  
- **Accessibility** becomes part of the testing contract.

It’s not a replacement for every test architecture, but for accessibility-compliant, multi-language front ends, it offers a leaner, more maintainable alternative.

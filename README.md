# Thin App Model – Scalable Accessibility-First Test Architecture

This repository demonstrates an automation design pattern called the **Thin App Model**.  
It uses accessibility semantics (`aria-label`, roles, names) as the shared contract between:

- The **user interface** (web, native, or other front ends)
- The **automated tests** (Playwright)
- And the **accessibility layer** (screen readers, a11y tooling)

---

## Overview

### Why this matters

Most test frameworks couple tightly to the DOM or to custom `data-testid` selectors.  
That approach works, but creates duplicate selector systems that drift from both accessibility and localization.

The Thin App Model removes that drift.  
It treats accessibility identifiers as the *single source of truth* and builds a small, layered system around them:

1. **Label Registry** – a set of semantic keys and localized label maps (EN, ES, etc.)
2. **Flow Helpers** – domain-level functions that express what users do, not how they click
3. **Tests** – short, readable Playwright scripts that use the flows and labels

---

## Current Implementation

This prototype focuses on the **Quote Calculator** feature.

**Implemented:**
- Accessibility label registry (`A11Y_LABELS.md`, `tests/labels/en.js`)
- Quote form flow helpers (`tests/helpers/flows/quoteFlows.js`)
- Integration and API tests (`tests/integration/user-flows.spec.js`, `tests/api/rating-engine.spec.js`)

**Planned extensions:**
- Login, Dashboard, and Payment pages (already defined in the label registry)
- Multi-language label maps (ES, FR, etc.)
- Shared fake backend for deterministic runs

---

## Repository Structure

```
project-root/
│
├── A11Y_LABELS.md              # Semantic keys and accessible names
├── README.md                   # This file
├── THIN_APP_MODEL.md           # Full architecture doc
│
├── tests/
│   ├── labels/
│   │   ├── en.js               # English labels
│   │   └── index.js            # getLabels(locale)
│   ├── helpers/
│   │   └── flows/quoteFlows.js # Flow helper for the quote form
│   ├── api/
│   │   └── rating-engine.spec.js
│   └── integration/
│       └── user-flows.spec.js
│
└── frontend/
    └── index.html              # Accessible quote calculator page
```

---

## How to Run

```bash
# Install dependencies
npm install

# Run integration tests (EN)
npx playwright test tests/integration/user-flows.spec.js

# Run API tests
npx playwright test tests/api/rating-engine.spec.js

# Optionally set locale
LOCALE=es npx playwright test
```

> The locale flag switches the label map used by tests.  
> The UI currently ships with English only, but the architecture supports multiple locales.

---

## Example Flow

```js
import { test, expect } from '@playwright/test';
import { getQuote } from '../helpers/flows/quoteFlows.js';

test('WI retail business can get a quote', async ({ page }) => {
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

## Key Benefits

| Aspect | Thin App Model | Traditional POM / test-id approach |
|--------|----------------|------------------------------------|
| **Selector Source** | Accessibility labels and roles | Custom `data-testid` attributes |
| **Abstraction** | Small domain flows (`quoteFlows`) | Large per-page classes |
| **Localization** | Same tests run in multiple languages | Usually EN-only or duplicated |
| **Accessibility** | Always validated through tests | Separate concern, easy to neglect |
| **Change Cost** | Update 1 helper or 1 label map | Update selectors in many tests |

---

## Escape Hatches

In real applications, not all UI elements expose good accessibility names.
When that happens:

- Add a **temporary `data-testid`** or unique attribute.
- Keep it documented in `A11Y_LABELS.md` under “Exceptions”.
- Treat it as **technical debt** to remove when the component gains proper a11y coverage.

---

## Status

This is a working baseline intended as a **proof of concept at scale**, not a full product.  
The next stages are:

1. Add a fake backend for deterministic testing.  
2. Implement Login and Payment flows using the same model.  
3. Add ES label map and dual-language HTML variants.  
4. Measure test length and change-cost improvements empirically.

---

© 2025 Jeremy Vajko — demonstration of the Thin App Model concept.

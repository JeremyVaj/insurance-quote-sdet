// tests/integration/user-flows.spec.js
// THIN APP MODEL - Flow-Based Tests with Generic Accessibility Identifiers
// 
// Strategy: Use natural, screen-reader-friendly aria-labels as selectors via label registry
// No test-specific IDs - everything is generic and stable
// Tests describe user flows, not implementation details
// Same tests work across all languages by changing LOCALE env var

import { test, expect } from '@playwright/test';
import { getLabels } from '../labels/index.js';
import { fillQuoteForm, submitQuote, getQuoteResult, getQuote } from '../helpers/flows/quoteFlows.js';

// Get labels for current locale (from env or default to English)
const L = getLabels(process.env.LOCALE || 'en');

// Support local file testing or remote URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'file://' + process.cwd() + '/index.html';

// V2 states have coverage options, V1 states don't
const V2_STATES = ['WI', 'OH', 'IL', 'NV'];
const V1_STATES = ['TX', 'NY', 'CA'];

test.beforeEach(async ({ page }) => {
  await page.goto(FRONTEND_URL);
});

// ============================================
// USER FLOW: Form Validation
// ============================================

test.describe('User Flow: Form Validation', () => {
  
  test('new user sees disabled submit button', async ({ page }) => {
    await expect(page.getByLabel(L.submit_quote)).toBeDisabled();
  });

  test('user in V1 state can submit without coverage selection', async ({ page }) => {
    await page.getByLabel(L.customer_state).selectOption('TX');
    await page.getByLabel(L.business_type).selectOption('retail');
    await page.getByLabel(L.annual_revenue).fill('50000');
    
    // TX is V1 - button should be enabled (no coverage needed)
    await expect(page.getByLabel(L.submit_quote)).toBeEnabled();
  });

  test('user in V2 state with all fields can submit', async ({ page }) => {
    await page.getByLabel(L.customer_state).selectOption('WI');
    await page.getByLabel(L.business_type).selectOption('retail');
    await page.getByLabel(L.annual_revenue).fill('50000');
    
    // Coverage "none" is pre-selected, button should enable
    await expect(page.getByLabel(L.submit_quote)).toBeEnabled();
  });

  test('V1 state shows unavailable coverage notice', async ({ page }) => {
    await page.getByLabel(L.customer_state).selectOption('TX');
    
    await expect(page.getByLabel(L.coverage_unavailable_notice)).toBeVisible();
  });

  test('V2 state shows coverage options', async ({ page }) => {
    await page.getByLabel(L.customer_state).selectOption('WI');
    
    await expect(page.getByRole('radiogroup', { name: L.coverage_options })).toBeVisible();
  });

  test('switching from V2 to V1 hides coverage', async ({ page }) => {
    await page.getByLabel(L.customer_state).selectOption('WI');
    await expect(page.getByRole('radiogroup', { name: L.coverage_options })).toBeVisible();
    
    await page.getByLabel(L.customer_state).selectOption('TX');
    await expect(page.getByRole('radiogroup', { name: L.coverage_options })).not.toBeVisible();
  });
});

// ============================================
// USER FLOW: Get Quote - Happy Paths
// ============================================

test.describe('User Flow: Getting a Quote', () => {
  
  test('Wisconsin retail business gets quote with no extra coverage', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'WI',
      business: 'retail',
      revenue: '50000',
      coverage: 'none'
    });
    
    expect(result.premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
    expect(result.premium).toBeGreaterThan(1000);
    expect(result.premium).toBeLessThan(1300);
  });

  test('Ohio restaurant with silver coverage', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'OH',
      business: 'restaurant',
      revenue: '100000',
      coverage: 'silver'
    });
    
    expect(result.premium).toBeGreaterThan(2500);
    expect(result.premium).toBeLessThan(3000);
  });

  test('Illinois professional with gold coverage', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'IL',
      business: 'professional',
      revenue: '200000',
      coverage: 'gold'
    });
    
    expect(result.premium).toBeGreaterThan(4000);
  });

  test('Nevada manufacturing with platinum coverage', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'NV',
      business: 'manufacturing',
      revenue: '75000',
      coverage: 'platinum'
    });
    
    expect(result.premium).toBeGreaterThan(3000);
  });

  test('all V2 states can get quotes', async ({ page }) => {
    for (const state of V2_STATES) {
      await page.getByLabel(L.customer_state).selectOption(state);
      await page.getByLabel(L.business_type).selectOption('retail');
      await page.getByLabel(L.annual_revenue).fill('50000');
      await page.getByLabel(L.coverage_none).check();
      await page.getByLabel(L.submit_quote).click();
      
      await expect(page.getByLabel(L.quote_result)).toBeVisible();
      
      const premium = await page.getByLabel(L.premium_amount).textContent();
      expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('all business types can get quotes', async ({ page }) => {
    const businesses = ['retail', 'restaurant', 'professional', 'manufacturing'];
    
    for (const business of businesses) {
      await page.getByLabel(L.customer_state).selectOption('WI');
      await page.getByLabel(L.business_type).selectOption(business);
      await page.getByLabel(L.annual_revenue).fill('50000');
      await page.getByLabel(L.coverage_none).check();
      await page.getByLabel(L.submit_quote).click();
      
      await expect(page.getByLabel(L.quote_result)).toBeVisible();
      
      const premium = await page.getByLabel(L.premium_amount).textContent();
      const amount = parseFloat(premium.replace(/[$,]/g, ''));
      expect(amount).toBeGreaterThan(0);
    }
  });

  test('all coverage levels work', async ({ page }) => {
    const coverages = [
      { label: L.coverage_none, value: 'none' },
      { label: L.coverage_silver, value: 'silver' },
      { label: L.coverage_gold, value: 'gold' },
      { label: L.coverage_platinum, value: 'platinum' }
    ];
    
    for (const coverage of coverages) {
      await page.getByLabel(L.customer_state).selectOption('WI');
      await page.getByLabel(L.business_type).selectOption('retail');
      await page.getByLabel(L.annual_revenue).fill('50000');
      await page.getByLabel(coverage.label).check();
      await page.getByLabel(L.submit_quote).click();
      
      await expect(page.getByLabel(L.quote_result)).toBeVisible();
      
      const premium = await page.getByLabel(L.premium_amount).textContent();
      expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('V1 states can get quotes without selecting coverage', async ({ page }) => {
    const v1States = ['TX', 'NY', 'CA'];
    
    for (const state of v1States) {
      await page.getByLabel(L.customer_state).selectOption(state);
      await page.getByLabel(L.business_type).selectOption('retail');
      await page.getByLabel(L.annual_revenue).fill('50000');
      await page.getByLabel(L.submit_quote).click();
      
      await expect(page.getByLabel(L.quote_result)).toBeVisible();
      
      const premium = await page.getByLabel(L.premium_amount).textContent();
      expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });
});

// ============================================
// USER FLOW: Edge Cases
// ============================================

test.describe('User Flow: Edge Cases', () => {
  
  test('zero revenue produces valid quote', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'WI',
      business: 'retail',
      revenue: '0',
      coverage: 'none'
    });
    
    expect(result.premiumText).toBe('$0.00');
  });

  test('very high revenue produces valid quote', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'WI',
      business: 'retail',
      revenue: '1000000',
      coverage: 'none'
    });
    
    expect(result.premium).toBeGreaterThan(10000);
  });

  test('very low revenue produces valid quote', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'WI',
      business: 'retail',
      revenue: '100',
      coverage: 'none'
    });
    
    expect(result.premium).toBeGreaterThan(0);
    expect(result.premium).toBeLessThan(10);
  });
});

// ============================================
// USER FLOW: Quote Details
// ============================================

test.describe('User Flow: Quote Details Display', () => {
  
  test('quote shows ID and timestamp', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'WI',
      business: 'retail',
      revenue: '50000',
      coverage: 'none'
    });
    
    expect(result.quoteId).toMatch(/^Q-/);
    expect(result.timestamp).toBeTruthy();
  });

  test('premium displays with dollar sign and decimals', async ({ page }) => {
    const result = await getQuote(page, {
      state: 'WI',
      business: 'retail',
      revenue: '50000',
      coverage: 'none'
    });
    
    expect(result.premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
  });
});

// ============================================
// USER FLOW: UI Behavior
// ============================================

test.describe('User Flow: UI Feedback', () => {
  
  test('loading indicator shows during quote calculation', async ({ page }) => {
    await page.getByLabel(L.customer_state).selectOption('WI');
    await page.getByLabel(L.business_type).selectOption('retail');
    await page.getByLabel(L.annual_revenue).fill('50000');
    await page.getByLabel(L.coverage_none).check();
    await page.getByLabel(L.submit_quote).click();
    
    await expect(page.getByLabel(L.loading)).toBeVisible();
  });

  test('loading hides when quote appears', async ({ page }) => {
    await page.getByLabel(L.customer_state).selectOption('WI');
    await page.getByLabel(L.business_type).selectOption('retail');
    await page.getByLabel(L.annual_revenue).fill('50000');
    await page.getByLabel(L.coverage_none).check();
    await page.getByLabel(L.submit_quote).click();
    
    await expect(page.getByLabel(L.quote_result)).toBeVisible();
    await expect(page.getByLabel(L.loading)).not.toBeVisible();
  });

  test('new quote replaces old quote', async ({ page }) => {
    // First quote
    await page.getByLabel(L.customer_state).selectOption('WI');
    await page.getByLabel(L.business_type).selectOption('retail');
    await page.getByLabel(L.annual_revenue).fill('50000');
    await page.getByLabel(L.coverage_none).check();
    await page.getByLabel(L.submit_quote).click();
    await expect(page.getByLabel(L.quote_result)).toBeVisible();
    
    const firstQuoteId = await page.getByLabel(L.quote_id).textContent();
    
    // Second quote
    await page.getByLabel(L.annual_revenue).fill('75000');
    await page.getByLabel(L.submit_quote).click();
    await expect(page.getByLabel(L.quote_result)).toBeVisible();
    
    const secondQuoteId = await page.getByLabel(L.quote_id).textContent();
    expect(firstQuoteId).not.toBe(secondQuoteId);
  });

  test('user can get multiple quotes in succession', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByLabel(L.customer_state).selectOption('WI');
      await page.getByLabel(L.business_type).selectOption('retail');
      await page.getByLabel(L.annual_revenue).fill('50000');
      await page.getByLabel(L.coverage_none).check();
      await page.getByLabel(L.submit_quote).click();
      await expect(page.getByLabel(L.quote_result)).toBeVisible();
      
      const premium = await page.getByLabel(L.premium_amount).textContent();
      expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });
});

// ============================================
// BUSINESS RULES: Premium Calculations
// ============================================

test.describe('Business Rules: Premium Calculations', () => {
  
  test('higher revenue means higher premium', async ({ page }) => {
    // 50K revenue
    await page.getByLabel(L.customer_state).selectOption('WI');
    await page.getByLabel(L.business_type).selectOption('retail');
    await page.getByLabel(L.annual_revenue).fill('50000');
    await page.getByLabel(L.coverage_none).check();
    await page.getByLabel(L.submit_quote).click();
    await expect(page.getByLabel(L.quote_result)).toBeVisible();
    
    const premium50k = parseFloat((await page.getByLabel(L.premium_amount).textContent()).replace(/[$,]/g, ''));
    
    // 100K revenue
    await page.getByLabel(L.annual_revenue).fill('100000');
    await page.getByLabel(L.submit_quote).click();
    await expect(page.getByLabel(L.quote_result)).toBeVisible();
    
    const premium100k = parseFloat((await page.getByLabel(L.premium_amount).textContent()).replace(/[$,]/g, ''));
    
    expect(premium100k).toBeGreaterThan(premium50k);
  });

  test('manufacturing costs more than professional services', async ({ page }) => {
    // Manufacturing
    await page.getByLabel(L.customer_state).selectOption('WI');
    await page.getByLabel(L.business_type).selectOption('manufacturing');
    await page.getByLabel(L.annual_revenue).fill('100000');
    await page.getByLabel(L.coverage_none).check();
    await page.getByLabel(L.submit_quote).click();
    await expect(page.getByLabel(L.quote_result)).toBeVisible();
    
    const mfgPremium = parseFloat((await page.getByLabel(L.premium_amount).textContent()).replace(/[$,]/g, ''));
    
    // Professional
    await page.getByLabel(L.business_type).selectOption('professional');
    await page.getByLabel(L.submit_quote).click();
    await expect(page.getByLabel(L.quote_result)).toBeVisible();
    
    const profPremium = parseFloat((await page.getByLabel(L.premium_amount).textContent()).replace(/[$,]/g, ''));
    
    expect(mfgPremium).toBeGreaterThan(profPremium);
  });

  test('each quote gets unique ID', async ({ page }) => {
    const quoteIds = [];
    
    for (let i = 0; i < 3; i++) {
      await page.getByLabel(L.customer_state).selectOption('WI');
      await page.getByLabel(L.business_type).selectOption('retail');
      await page.getByLabel(L.annual_revenue).fill('50000');
      await page.getByLabel(L.coverage_none).check();
      await page.getByLabel(L.submit_quote).click();
      await expect(page.getByLabel(L.quote_result)).toBeVisible();
      
      const quoteId = await page.getByLabel(L.quote_id).textContent();
      quoteIds.push(quoteId);
    }
    
    const uniqueIds = new Set(quoteIds);
    expect(uniqueIds.size).toBe(3);
  });

  test('same inputs produce consistent premium', async ({ page }) => {
    const premiums = [];
    
    for (let i = 0; i < 2; i++) {
      await page.getByLabel(L.customer_state).selectOption('WI');
      await page.getByLabel(L.business_type).selectOption('retail');
      await page.getByLabel(L.annual_revenue).fill('50000');
      await page.getByLabel(L.coverage_none).check();
      await page.getByLabel(L.submit_quote).click();
      await expect(page.getByLabel(L.quote_result)).toBeVisible();
      
      const premium = parseFloat((await page.getByLabel(L.premium_amount).textContent()).replace(/[$,]/g, ''));
      premiums.push(premium);
    }
    
    expect(premiums[0]).toBe(premiums[1]);
  });
});

// tests/integration/user-flows.spec.js
// Integration Tests - User Flow Based (Accessibility Tags)
// Tests real user scenarios through aria-labeled UI - NO Page Object Model needed

import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'file://' + process.cwd() + '/index.html';

// V2 states have coverage options, V1 states don't
const V2_STATES = ['WI', 'OH', 'IL', 'NV'];
const V1_STATES = ['TX', 'NY', 'CA'];

test.beforeEach(async ({ page }) => {
  await page.goto(FRONTEND_URL);
});

// ============================================
// FORM BEHAVIOR (6 tests)
// ============================================

test.describe('Form Validation & Button State', () => {
  
  test('button disabled on page load', async ({ page }) => {
    await expect(page.locator('[aria-label="submit.get-quote"]')).toBeDisabled();
  });

  test('button stays disabled for V1 states', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'TX');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    
    // TX is V1 state, button should remain disabled
    await expect(page.locator('[aria-label="submit.get-quote"]')).toBeDisabled();
  });

  test('button stays disabled for V2 state without coverage', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    // No coverage clicked yet
    
    // Should still be disabled (needs coverage selection)
    await expect(page.locator('[aria-label="submit.get-quote"]')).toBeDisabled();
  });

  test('button enables for V2 state with all fields plus coverage', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    
    await expect(page.locator('[aria-label="submit.get-quote"]')).toBeEnabled();
  });

  test('V1 notice shows for V1 states', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'TX');
    await expect(page.locator('[aria-label="message.v1"]')).toBeVisible();
  });

  test('coverage options show for V2 states', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    const coverageGroup = page.locator('[aria-label="coverage.group"]');
    await expect(coverageGroup).toBeVisible();
    await expect(coverageGroup).toHaveAttribute('aria-hidden', 'false');
  });
});

// ============================================
// HAPPY PATH SCENARIOS (12 tests)
// ============================================

test.describe('Successful Quote Generation - V2 States', () => {
  
  test('WI retail 50K none coverage displays quote', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible', timeout: 5000 });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    expect(premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
    
    const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
    expect(premium).toBeGreaterThan(1000);
    expect(premium).toBeLessThan(1300);
  });

  test('OH restaurant 100K silver coverage displays quote', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'OH');
    await page.selectOption('[aria-label="business.select"]', 'restaurant');
    await page.fill('[aria-label="revenue.input"]', '100000');
    await page.click('[aria-label="coverage.silver"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
    expect(premium).toBeGreaterThan(3000);
  });

  test('IL professional 200K gold coverage displays quote', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'IL');
    await page.selectOption('[aria-label="business.select"]', 'professional');
    await page.fill('[aria-label="revenue.input"]', '200000');
    await page.click('[aria-label="coverage.gold"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
    expect(premium).toBeGreaterThan(4000);
  });

  test('NV manufacturing 75K platinum coverage displays quote', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'NV');
    await page.selectOption('[aria-label="business.select"]', 'manufacturing');
    await page.fill('[aria-label="revenue.input"]', '75000');
    await page.click('[aria-label="coverage.platinum"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
    expect(premium).toBeGreaterThan(3000);
  });

  test('all V2 states generate quotes', async ({ page }) => {
    for (const state of V2_STATES) {
      await page.selectOption('[aria-label="state.select"]', state);
      await page.selectOption('[aria-label="business.select"]', 'retail');
      await page.fill('[aria-label="revenue.input"]', '50000');
      await page.click('[aria-label="coverage.none"]');
      await page.click('[aria-label="submit.get-quote"]');
      
      await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
      
      const premiumText = await page.textContent('[aria-label="result.premium"]');
      expect(premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('all business types generate quotes', async ({ page }) => {
    const businesses = ['retail', 'restaurant', 'professional', 'manufacturing'];
    
    for (const business of businesses) {
      await page.selectOption('[aria-label="state.select"]', 'WI');
      await page.selectOption('[aria-label="business.select"]', business);
      await page.fill('[aria-label="revenue.input"]', '50000');
      await page.click('[aria-label="coverage.none"]');
      await page.click('[aria-label="submit.get-quote"]');
      
      await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
      
      const premiumText = await page.textContent('[aria-label="result.premium"]');
      const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
      expect(premium).toBeGreaterThan(0);
    }
  });

  test('all coverage levels work', async ({ page }) => {
    const coverages = ['none', 'silver', 'gold', 'platinum'];
    
    for (const coverage of coverages) {
      await page.selectOption('[aria-label="state.select"]', 'WI');
      await page.selectOption('[aria-label="business.select"]', 'retail');
      await page.fill('[aria-label="revenue.input"]', '50000');
      await page.click(`[aria-label="coverage.${coverage}"]`);
      await page.click('[aria-label="submit.get-quote"]');
      
      await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
      
      const premiumText = await page.textContent('[aria-label="result.premium"]');
      expect(premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('zero revenue shows $0 premium', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '0');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    expect(premiumText).toBe('$0.00');
  });

  test('high revenue 1M calculates large premium', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'OH');
    await page.selectOption('[aria-label="business.select"]', 'professional');
    await page.fill('[aria-label="revenue.input"]', '1000000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
    expect(premium).toBeGreaterThan(15000);
  });

  test('low revenue 100 calculates small premium', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '100');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
    expect(premium).toBeGreaterThan(0);
    expect(premium).toBeLessThan(10);
  });

  test('quote ID is displayed', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const quoteIdText = await page.textContent('[aria-label="result.quoteId"]');
    expect(quoteIdText).toContain('Quote ID:');
    expect(quoteIdText).toContain('Q-');
  });

  test('timestamp is displayed', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const timestampText = await page.textContent('[aria-label="result.timestamp"]');
    expect(timestampText).toContain('Generated:');
  });
});

// ============================================
// UI BEHAVIOR (6 tests)
// ============================================

test.describe('UI State Management', () => {
  
  test('loading shows during API call', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await expect(page.locator('[aria-label="result.loading"]')).toBeVisible();
  });

  test('loading hides after response', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    await expect(page.locator('[aria-label="result.loading"]')).not.toBeVisible();
  });

  test('new quote replaces previous quote', async ({ page }) => {
    // First quote
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const firstQuoteId = await page.textContent('[aria-label="result.quoteId"]');
    
    // Second quote
    await page.fill('[aria-label="revenue.input"]', '75000');
    await page.click('[aria-label="submit.get-quote"]');
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const secondQuoteId = await page.textContent('[aria-label="result.quoteId"]');
    expect(firstQuoteId).not.toBe(secondQuoteId);
  });

  test('error hidden on success', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    await expect(page.locator('[aria-label="result.error"]')).not.toBeVisible();
  });

  test('coverage hides when switching to V1 state', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await expect(page.locator('[aria-label="coverage.group"]')).toBeVisible();
    
    await page.selectOption('[aria-label="state.select"]', 'TX');
    await expect(page.locator('[aria-label="coverage.group"]')).not.toBeVisible();
  });

  test('form can resubmit multiple times', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.selectOption('[aria-label="state.select"]', 'WI');
      await page.selectOption('[aria-label="business.select"]', 'retail');
      await page.fill('[aria-label="revenue.input"]', '50000');
      await page.click('[aria-label="coverage.none"]');
      await page.click('[aria-label="submit.get-quote"]');
      await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
      
      const premiumText = await page.textContent('[aria-label="result.premium"]');
      expect(premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });
});

// ============================================
// BUSINESS LOGIC (4 tests)
// ============================================

test.describe('Business Logic Verification', () => {
  
  test('higher revenue means higher premium', async ({ page }) => {
    // 50K premium
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premium50k = parseFloat((await page.textContent('[aria-label="result.premium"]')).replace(/[$,]/g, ''));
    
    // 100K premium
    await page.fill('[aria-label="revenue.input"]', '100000');
    await page.click('[aria-label="submit.get-quote"]');
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premium100k = parseFloat((await page.textContent('[aria-label="result.premium"]')).replace(/[$,]/g, ''));
    
    expect(premium100k).toBeGreaterThan(premium50k);
  });

  test('manufacturing costs more than professional', async ({ page }) => {
    // Manufacturing
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'manufacturing');
    await page.fill('[aria-label="revenue.input"]', '100000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const mfgPremium = parseFloat((await page.textContent('[aria-label="result.premium"]')).replace(/[$,]/g, ''));
    
    // Professional
    await page.selectOption('[aria-label="business.select"]', 'professional');
    await page.click('[aria-label="submit.get-quote"]');
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const profPremium = parseFloat((await page.textContent('[aria-label="result.premium"]')).replace(/[$,]/g, ''));
    
    expect(mfgPremium).toBeGreaterThan(profPremium);
  });

  test('quote IDs are unique', async ({ page }) => {
    const quoteIds = [];
    
    for (let i = 0; i < 3; i++) {
      await page.selectOption('[aria-label="state.select"]', 'WI');
      await page.selectOption('[aria-label="business.select"]', 'retail');
      await page.fill('[aria-label="revenue.input"]', '50000');
      await page.click('[aria-label="coverage.none"]');
      await page.click('[aria-label="submit.get-quote"]');
      await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
      
      const quoteId = await page.textContent('[aria-label="result.quoteId"]');
      quoteIds.push(quoteId);
    }
    
    const uniqueIds = new Set(quoteIds);
    expect(uniqueIds.size).toBe(3);
  });

  test('same inputs produce consistent premium', async ({ page }) => {
    const premiums = [];
    
    for (let i = 0; i < 2; i++) {
      await page.selectOption('[aria-label="state.select"]', 'WI');
      await page.selectOption('[aria-label="business.select"]', 'retail');
      await page.fill('[aria-label="revenue.input"]', '50000');
      await page.click('[aria-label="coverage.none"]');
      await page.click('[aria-label="submit.get-quote"]');
      await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
      
      const premium = parseFloat((await page.textContent('[aria-label="result.premium"]')).replace(/[$,]/g, ''));
      premiums.push(premium);
    }
    
    expect(premiums[0]).toBe(premiums[1]);
  });
});

// ============================================
// RESPONSE DISPLAY (4 tests)
// ============================================

test.describe('Response Display Verification', () => {
  
  test('premium displays with dollar sign and decimals', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const premiumText = await page.textContent('[aria-label="result.premium"]');
    expect(premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
  });

  test('quote ID displays with prefix', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const quoteIdText = await page.textContent('[aria-label="result.quoteId"]');
    expect(quoteIdText).toContain('Quote ID:');
  });

  test('timestamp displays with prefix', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    const timestampText = await page.textContent('[aria-label="result.timestamp"]');
    expect(timestampText).toContain('Generated:');
  });

  test('all result fields are visible', async ({ page }) => {
    await page.selectOption('[aria-label="state.select"]', 'WI');
    await page.selectOption('[aria-label="business.select"]', 'retail');
    await page.fill('[aria-label="revenue.input"]', '50000');
    await page.click('[aria-label="coverage.none"]');
    await page.click('[aria-label="submit.get-quote"]');
    
    await page.waitForSelector('[aria-label="result.quote"]', { state: 'visible' });
    
    await expect(page.locator('[aria-label="result.premium"]')).toBeVisible();
    await expect(page.locator('[aria-label="result.quoteId"]')).toBeVisible();
    await expect(page.locator('[aria-label="result.timestamp"]')).toBeVisible();
  });
});

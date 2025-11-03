// tests/integration/frontend-integration.spec.js
// Integration Tests - Frontend + API Response Verification
// Tests what users actually see and experience

import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'file://' + process.cwd() + '/quote-calculator-tagged.html';

test.beforeEach(async ({ page }) => {
  await page.goto(FRONTEND_URL);
});

// ============================================
// FORM BEHAVIOR
// ============================================

test.describe('Form Validation & Button State', () => {
  
  test('Submit button should be disabled on page load', async ({ page }) => {
    const button = page.locator('[data-testid="submit-button"]');
    await expect(button).toBeDisabled();
  });

  test('Submit button should remain disabled with only revenue', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    const button = page.locator('[data-testid="submit-button"]');
    await expect(button).toBeDisabled();
  });

  test('Submit button should remain disabled with only 2 fields', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    const button = page.locator('[data-testid="submit-button"]');
    await expect(button).toBeDisabled();
  });

  test('Submit button should enable when all 3 fields filled', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    
    const button = page.locator('[data-testid="submit-button"]');
    await expect(button).toBeEnabled();
  });
});

// ============================================
// SUCCESSFUL QUOTE SCENARIOS
// ============================================

test.describe('Successful Quote Generation', () => {
  
  test('CA retail 50K - should display quote with all fields', async ({ page }) => {
    // Fill form
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    
    // Submit
    await page.click('[data-testid="submit-button"]');
    
    // Wait for loading to disappear and result to show
    await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden', timeout: 5000 });
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    // Verify premium is displayed
    const premiumText = await page.textContent('[data-testid="premium-amount"]');
    expect(premiumText).toMatch(/^\$[\d,]+\.\d{2}$/); // Format: $1,500.00
    
    // Verify premium value is in expected range
    const premiumValue = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    expect(parseFloat(premiumValue)).toBeGreaterThan(1400);
    expect(parseFloat(premiumValue)).toBeLessThan(1600);
    
    // Verify quote ID is displayed
    const quoteIdText = await page.textContent('[data-testid="quote-id-display"]');
    expect(quoteIdText).toContain('Quote ID: Q-');
    
    // Verify quote ID format
    const quoteId = await page.getAttribute('[data-testid="quote-id-display"]', 'data-quote-id');
    expect(quoteId).toMatch(/^Q-\d+-[A-Z0-9]+$/);
    
    // Verify timestamp is displayed
    const timestampText = await page.textContent('[data-testid="quote-timestamp"]');
    expect(timestampText).toContain('Generated:');
    
    // Verify no error is shown
    await expect(page.locator('[data-testid="error-container"]')).not.toBeVisible();
  });

  test('TX restaurant 100K - should calculate higher premium', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '100000');
    await page.selectOption('[data-testid="state-select"]', 'TX');
    await page.selectOption('[data-testid="business-select"]', 'restaurant');
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premiumValue = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    expect(parseFloat(premiumValue)).toBeGreaterThan(3100);
    expect(parseFloat(premiumValue)).toBeLessThan(3400);
  });

  test('NY professional 200K - should calculate premium correctly', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '200000');
    await page.selectOption('[data-testid="state-select"]', 'NY');
    await page.selectOption('[data-testid="business-select"]', 'professional');
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premiumValue = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    expect(parseFloat(premiumValue)).toBeGreaterThan(5100);
    expect(parseFloat(premiumValue)).toBeLessThan(5300);
  });

  test('WI manufacturing 75K - should display quote', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '75000');
    await page.selectOption('[data-testid="state-select"]', 'WI');
    await page.selectOption('[data-testid="business-select"]', 'manufacturing');
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premiumValue = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    expect(parseFloat(premiumValue)).toBeGreaterThan(2500);
    expect(parseFloat(premiumValue)).toBeLessThan(2600);
  });
});

// ============================================
// EDGE CASES
// ============================================

test.describe('Edge Cases', () => {
  
  test('Zero revenue - should show $0.00 premium', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '0');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premiumText = await page.textContent('[data-testid="premium-amount"]');
    expect(premiumText).toBe('$0.00');
  });

  test('Very high revenue (1M) - should handle large numbers', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '1000000');
    await page.selectOption('[data-testid="state-select"]', 'TX');
    await page.selectOption('[data-testid="business-select"]', 'professional');
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premiumValue = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    expect(parseFloat(premiumValue)).toBeGreaterThan(19000);
  });

  test('Small revenue (100) - should calculate small premium', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '100');
    await page.selectOption('[data-testid="state-select"]', 'OH');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premiumValue = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    expect(parseFloat(premiumValue)).toBeGreaterThan(2);
    expect(parseFloat(premiumValue)).toBeLessThan(3);
  });
});

// ============================================
// UI BEHAVIOR & STATE MANAGEMENT
// ============================================

test.describe('UI Behavior', () => {
  
  test('Loading indicator should appear during API call', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    
    // Click submit
    await page.click('[data-testid="submit-button"]');
    
    // Loading should appear
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // Eventually loading should disappear
    await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden' });
  });

  test('Previous quote should be replaced by new quote', async ({ page }) => {
    // First quote
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const firstQuoteId = await page.getAttribute('[data-testid="quote-id-display"]', 'data-quote-id');
    const firstPremium = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    
    // Second quote with different values
    await page.fill('[data-testid="revenue-input"]', '75000');
    await page.selectOption('[data-testid="state-select"]', 'TX');
    await page.selectOption('[data-testid="business-select"]', 'restaurant');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const secondQuoteId = await page.getAttribute('[data-testid="quote-id-display"]', 'data-quote-id');
    const secondPremium = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    
    // Verify they're different
    expect(firstQuoteId).not.toBe(secondQuoteId);
    expect(firstPremium).not.toBe(secondPremium);
  });

  test('Error message should not show on successful quote', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    await expect(page.locator('[data-testid="error-container"]')).not.toBeVisible();
  });
});

// ============================================
// BUSINESS LOGIC VERIFICATION
// ============================================

test.describe('Business Logic', () => {
  
  test('Higher risk state (NY) should have higher premium than lower risk (OH)', async ({ page }) => {
    // Get NY premium
    await page.fill('[data-testid="revenue-input"]', '100000');
    await page.selectOption('[data-testid="state-select"]', 'NY');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const nyPremium = parseFloat(await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value'));
    
    // Get OH premium
    await page.fill('[data-testid="revenue-input"]', '100000');
    await page.selectOption('[data-testid="state-select"]', 'OH');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const ohPremium = parseFloat(await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value'));
    
    expect(nyPremium).toBeGreaterThan(ohPremium);
  });

  test('Higher risk business (manufacturing) should cost more than professional', async ({ page }) => {
    // Get manufacturing premium
    await page.fill('[data-testid="revenue-input"]', '100000');
    await page.selectOption('[data-testid="state-select"]', 'TX');
    await page.selectOption('[data-testid="business-select"]', 'manufacturing');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const mfgPremium = parseFloat(await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value'));
    
    // Get professional premium
    await page.fill('[data-testid="revenue-input"]', '100000');
    await page.selectOption('[data-testid="business-select"]', 'professional');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const profPremium = parseFloat(await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value'));
    
    expect(mfgPremium).toBeGreaterThan(profPremium);
  });

  test('Quote IDs should be unique for each request', async ({ page }) => {
    const quoteIds = [];
    
    // Get 3 quotes
    for (let i = 0; i < 3; i++) {
      await page.fill('[data-testid="revenue-input"]', '50000');
      await page.selectOption('[data-testid="state-select"]', 'CA');
      await page.selectOption('[data-testid="business-select"]', 'retail');
      await page.click('[data-testid="submit-button"]');
      await page.waitForSelector('[data-testid="quote-result-container"].show');
      
      const quoteId = await page.getAttribute('[data-testid="quote-id-display"]', 'data-quote-id');
      quoteIds.push(quoteId);
    }
    
    // Verify all unique
    const uniqueIds = new Set(quoteIds);
    expect(uniqueIds.size).toBe(3);
  });

  test('Same inputs should produce consistent premium', async ({ page }) => {
    const premiums = [];
    
    // Get 2 quotes with same inputs
    for (let i = 0; i < 2; i++) {
      await page.fill('[data-testid="revenue-input"]', '50000');
      await page.selectOption('[data-testid="state-select"]', 'CA');
      await page.selectOption('[data-testid="business-select"]', 'retail');
      await page.click('[data-testid="submit-button"]');
      await page.waitForSelector('[data-testid="quote-result-container"].show');
      
      const premium = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
      premiums.push(parseFloat(premium));
    }
    
    expect(premiums[0]).toBe(premiums[1]);
  });

  test('Premium should scale proportionally with revenue', async ({ page }) => {
    // Get premium for 50K
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premium50k = parseFloat(await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value'));
    
    // Get premium for 100K (should be ~2x)
    await page.fill('[data-testid="revenue-input"]', '100000');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premium100k = parseFloat(await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value'));
    
    const ratio = premium100k / premium50k;
    expect(ratio).toBeGreaterThan(1.9);
    expect(ratio).toBeLessThan(2.1);
  });
});

// ============================================
// API RESPONSE STRUCTURE VALIDATION
// ============================================

test.describe('API Response Structure', () => {
  
  test('Premium should be stored as numeric data attribute', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const premiumValue = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
    expect(parseFloat(premiumValue)).toBeGreaterThan(0);
    expect(isNaN(parseFloat(premiumValue))).toBe(false);
  });

  test('Quote ID should follow Q-timestamp-random format', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const quoteId = await page.getAttribute('[data-testid="quote-id-display"]', 'data-quote-id');
    expect(quoteId).toMatch(/^Q-\d+-[A-Z0-9]+$/);
  });

  test('Timestamp should be valid ISO date', async ({ page }) => {
    await page.fill('[data-testid="revenue-input"]', '50000');
    await page.selectOption('[data-testid="state-select"]', 'CA');
    await page.selectOption('[data-testid="business-select"]', 'retail');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="quote-result-container"].show');
    
    const timestamp = await page.getAttribute('[data-testid="quote-timestamp"]', 'data-timestamp');
    const date = new Date(timestamp);
    expect(date.toString()).not.toBe('Invalid Date');
  });
});

// ============================================
// COVERAGE OF ALL STATES
// ============================================

test.describe('All States Covered', () => {
  
  const states = [
    { code: 'CA', name: 'California' },
    { code: 'TX', name: 'Texas' },
    { code: 'NY', name: 'New York' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'OH', name: 'Ohio' },
    { code: 'IL', name: 'Illinois' },
    { code: 'NV', name: 'Nevada' },
  ];
  
  for (const state of states) {
    test(`${state.name} (${state.code}) should generate valid quote`, async ({ page }) => {
      await page.fill('[data-testid="revenue-input"]', '50000');
      await page.selectOption('[data-testid="state-select"]', state.code);
      await page.selectOption('[data-testid="business-select"]', 'retail');
      await page.click('[data-testid="submit-button"]');
      
      await page.waitForSelector('[data-testid="quote-result-container"].show');
      
      const premium = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
      expect(parseFloat(premium)).toBeGreaterThan(0);
    });
  }
});

// ============================================
// COVERAGE OF ALL BUSINESS TYPES
// ============================================

test.describe('All Business Types Covered', () => {
  
  const businessTypes = [
    'retail',
    'restaurant',
    'professional',
    'manufacturing'
  ];
  
  for (const business of businessTypes) {
    test(`${business} should generate valid quote`, async ({ page }) => {
      await page.fill('[data-testid="revenue-input"]', '50000');
      await page.selectOption('[data-testid="state-select"]', 'CA');
      await page.selectOption('[data-testid="business-select"]', business);
      await page.click('[data-testid="submit-button"]');
      
      await page.waitForSelector('[data-testid="quote-result-container"].show');
      
      const premium = await page.getAttribute('[data-testid="premium-amount"]', 'data-premium-value');
      expect(parseFloat(premium)).toBeGreaterThan(0);
    });
  }
});

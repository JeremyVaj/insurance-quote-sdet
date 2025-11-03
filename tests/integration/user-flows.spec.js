// tests/integration/user-flows.spec.js
// THIN APP MODEL - Flow-Based Tests with Generic Accessibility Identifiers
// 
// Strategy: Use natural, screen-reader-friendly aria-labels as selectors
// No test-specific IDs - everything is generic and stable
// Tests describe user flows, not implementation details

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_URL = 'file://' + path.resolve(__dirname, '../../index.html');

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
    await expect(page.getByLabel('Submit quote')).toBeDisabled();
  });

  test('user in V1 state can submit without coverage selection', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('TX');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    
    // TX is V1 - button should be enabled (no coverage needed)
    await expect(page.getByLabel('Submit quote')).toBeEnabled();
  });

  test('user in V2 state with all fields can submit', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    
    // Coverage "none" is pre-selected, button should enable
    await expect(page.getByLabel('Submit quote')).toBeEnabled();
  });

  test('V1 state shows unavailable coverage notice', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('TX');
    
    const notice = page.getByRole('alert').filter({ hasText: 'not available' });
    await expect(notice).toBeVisible();
  });

  test('V2 state shows coverage options', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    
    await expect(page.getByRole('radiogroup', { name: 'Coverage options' })).toBeVisible();
  });

  test('switching from V2 to V1 hides coverage', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await expect(page.getByRole('radiogroup', { name: 'Coverage options' })).toBeVisible();
    
    await page.getByLabel('Customer state').selectOption('TX');
    await expect(page.getByRole('radiogroup', { name: 'Coverage options' })).not.toBeVisible();
  });
});

// ============================================
// USER FLOW: Get Quote - Happy Paths
// ============================================

test.describe('User Flow: Getting a Quote', () => {
  
  test('Wisconsin retail business gets quote with no extra coverage', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    
    const amount = parseFloat(premium.replace(/[$,]/g, ''));
    expect(amount).toBeGreaterThan(1000);
    expect(amount).toBeLessThan(1300);
  });

  test('Ohio restaurant with silver coverage', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('OH');
    await page.getByLabel('Business type').selectOption('restaurant');
    await page.getByLabel('Annual revenue').fill('100000');
    await page.getByLabel('Coverage silver').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    const amount = parseFloat(premium.replace(/[$,]/g, ''));
    expect(amount).toBeGreaterThan(2500);
    expect(amount).toBeLessThan(3000);
  });

  test('Illinois professional with gold coverage', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('IL');
    await page.getByLabel('Business type').selectOption('professional');
    await page.getByLabel('Annual revenue').fill('200000');
    await page.getByLabel('Coverage gold').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    const amount = parseFloat(premium.replace(/[$,]/g, ''));
    expect(amount).toBeGreaterThan(4000);
  });

  test('Nevada manufacturing with platinum coverage', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('NV');
    await page.getByLabel('Business type').selectOption('manufacturing');
    await page.getByLabel('Annual revenue').fill('75000');
    await page.getByLabel('Coverage platinum').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    const amount = parseFloat(premium.replace(/[$,]/g, ''));
    expect(amount).toBeGreaterThan(3000);
  });

  test('all V2 states can get quotes', async ({ page }) => {
    for (const state of V2_STATES) {
      await page.getByLabel('Customer state').selectOption(state);
      await page.getByLabel('Business type').selectOption('retail');
      await page.getByLabel('Annual revenue').fill('50000');
      await page.getByLabel('Coverage none').check();
      await page.getByLabel('Submit quote').click();
      
      await expect(page.getByLabel('Quote result')).toBeVisible();
      
      const premium = await page.getByLabel('Premium amount').textContent();
      expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('all business types can get quotes', async ({ page }) => {
    const businesses = ['retail', 'restaurant', 'professional', 'manufacturing'];
    
    for (const business of businesses) {
      await page.getByLabel('Customer state').selectOption('WI');
      await page.getByLabel('Business type').selectOption(business);
      await page.getByLabel('Annual revenue').fill('50000');
      await page.getByLabel('Coverage none').check();
      await page.getByLabel('Submit quote').click();
      
      await expect(page.getByLabel('Quote result')).toBeVisible();
      
      const premium = await page.getByLabel('Premium amount').textContent();
      const amount = parseFloat(premium.replace(/[$,]/g, ''));
      expect(amount).toBeGreaterThan(0);
    }
  });

  test('all coverage levels work', async ({ page }) => {
    const coverages = [
      { label: 'Coverage none', value: 'none' },
      { label: 'Coverage silver', value: 'silver' },
      { label: 'Coverage gold', value: 'gold' },
      { label: 'Coverage platinum', value: 'platinum' }
    ];
    
    for (const coverage of coverages) {
      await page.getByLabel('Customer state').selectOption('WI');
      await page.getByLabel('Business type').selectOption('retail');
      await page.getByLabel('Annual revenue').fill('50000');
      await page.getByLabel(coverage.label).check();
      await page.getByLabel('Submit quote').click();
      
      await expect(page.getByLabel('Quote result')).toBeVisible();
      
      const premium = await page.getByLabel('Premium amount').textContent();
      expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('V1 states can get quotes without selecting coverage', async ({ page }) => {
    const v1States = ['TX', 'NY', 'CA'];
    
    for (const state of v1States) {
      await page.getByLabel('Customer state').selectOption(state);
      await page.getByLabel('Business type').selectOption('retail');
      await page.getByLabel('Annual revenue').fill('50000');
      await page.getByLabel('Submit quote').click();
      
      await expect(page.getByLabel('Quote result')).toBeVisible();
      
      const premium = await page.getByLabel('Premium amount').textContent();
      expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });
});

// ============================================
// USER FLOW: Edge Cases
// ============================================

test.describe('User Flow: Edge Cases', () => {
  
  test('zero revenue produces valid quote', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('0');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    expect(premium).toBe('$0.00');
  });

  test('very high revenue produces valid quote', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('1000000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    const amount = parseFloat(premium.replace(/[$,]/g, ''));
    expect(amount).toBeGreaterThan(10000);
  });

  test('very low revenue produces valid quote', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('100');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    const amount = parseFloat(premium.replace(/[$,]/g, ''));
    expect(amount).toBeGreaterThan(0);
    expect(amount).toBeLessThan(10);
  });
});

// ============================================
// USER FLOW: Quote Details
// ============================================

test.describe('User Flow: Quote Details Display', () => {
  
  test('quote shows ID and timestamp', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const quoteId = await page.getByLabel('Quote ID').textContent();
    expect(quoteId).toContain('Quote ID:');
    expect(quoteId).toContain('Q-');
    
    const timestamp = await page.getByLabel('Quote timestamp').textContent();
    expect(timestamp).toContain('Generated:');
  });

  test('premium displays with dollar sign and decimals', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium = await page.getByLabel('Premium amount').textContent();
    expect(premium).toMatch(/^\$[\d,]+\.\d{2}$/);
  });
});

// ============================================
// USER FLOW: UI Behavior
// ============================================

test.describe('User Flow: UI Feedback', () => {
  
  test('loading indicator shows during quote calculation', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Loading')).toBeVisible();
  });

  test('loading hides when quote appears', async ({ page }) => {
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    
    await expect(page.getByLabel('Quote result')).toBeVisible();
    await expect(page.getByLabel('Loading')).not.toBeVisible();
  });

  test('new quote replaces old quote', async ({ page }) => {
    // First quote
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const firstQuoteId = await page.getByLabel('Quote ID').textContent();
    
    // Second quote
    await page.getByLabel('Annual revenue').fill('75000');
    await page.getByLabel('Submit quote').click();
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const secondQuoteId = await page.getByLabel('Quote ID').textContent();
    expect(firstQuoteId).not.toBe(secondQuoteId);
  });

  test('user can get multiple quotes in succession', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Customer state').selectOption('WI');
      await page.getByLabel('Business type').selectOption('retail');
      await page.getByLabel('Annual revenue').fill('50000');
      await page.getByLabel('Coverage none').check();
      await page.getByLabel('Submit quote').click();
      await expect(page.getByLabel('Quote result')).toBeVisible();
      
      const premium = await page.getByLabel('Premium amount').textContent();
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
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('retail');
    await page.getByLabel('Annual revenue').fill('50000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium50k = parseFloat((await page.getByLabel('Premium amount').textContent()).replace(/[$,]/g, ''));
    
    // 100K revenue
    await page.getByLabel('Annual revenue').fill('100000');
    await page.getByLabel('Submit quote').click();
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const premium100k = parseFloat((await page.getByLabel('Premium amount').textContent()).replace(/[$,]/g, ''));
    
    expect(premium100k).toBeGreaterThan(premium50k);
  });

  test('manufacturing costs more than professional services', async ({ page }) => {
    // Manufacturing
    await page.getByLabel('Customer state').selectOption('WI');
    await page.getByLabel('Business type').selectOption('manufacturing');
    await page.getByLabel('Annual revenue').fill('100000');
    await page.getByLabel('Coverage none').check();
    await page.getByLabel('Submit quote').click();
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const mfgPremium = parseFloat((await page.getByLabel('Premium amount').textContent()).replace(/[$,]/g, ''));
    
    // Professional
    await page.getByLabel('Business type').selectOption('professional');
    await page.getByLabel('Submit quote').click();
    await expect(page.getByLabel('Quote result')).toBeVisible();
    
    const profPremium = parseFloat((await page.getByLabel('Premium amount').textContent()).replace(/[$,]/g, ''));
    
    expect(mfgPremium).toBeGreaterThan(profPremium);
  });

  test('each quote gets unique ID', async ({ page }) => {
    const quoteIds = [];
    
    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Customer state').selectOption('WI');
      await page.getByLabel('Business type').selectOption('retail');
      await page.getByLabel('Annual revenue').fill('50000');
      await page.getByLabel('Coverage none').check();
      await page.getByLabel('Submit quote').click();
      await expect(page.getByLabel('Quote result')).toBeVisible();
      
      const quoteId = await page.getByLabel('Quote ID').textContent();
      quoteIds.push(quoteId);
    }
    
    const uniqueIds = new Set(quoteIds);
    expect(uniqueIds.size).toBe(3);
  });

  test('same inputs produce consistent premium', async ({ page }) => {
    const premiums = [];
    
    for (let i = 0; i < 2; i++) {
      await page.getByLabel('Customer state').selectOption('WI');
      await page.getByLabel('Business type').selectOption('retail');
      await page.getByLabel('Annual revenue').fill('50000');
      await page.getByLabel('Coverage none').check();
      await page.getByLabel('Submit quote').click();
      await expect(page.getByLabel('Quote result')).toBeVisible();
      
      const premium = parseFloat((await page.getByLabel('Premium amount').textContent()).replace(/[$,]/g, ''));
      premiums.push(premium);
    }
    
    expect(premiums[0]).toBe(premiums[1]);
  });
});

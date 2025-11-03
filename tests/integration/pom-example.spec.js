// tests/integration/pom-example.spec.js
// CLASSIC PAGE OBJECT MODEL EXAMPLE (Optional)
// 
// This shows how the Thin App Model can coexist with traditional POMs
// The POM uses the same generic accessibility labels, just wrapped in methods

import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'file://' + process.cwd() + '/index.html';

/**
 * Classic Page Object Model using generic accessibility selectors
 * 
 * Note: This is optional - the Thin App Model doesn't require POMs
 * This is shown for teams transitioning from POM or those who prefer the pattern
 */
class QuoteCalculatorPage {
  constructor(page) {
    this.page = page;
  }

  // Navigation
  async goto() {
    await this.page.goto(FRONTEND_URL);
  }

  // Form Actions
  async selectState(state) {
    await this.page.getByLabel('Customer state').selectOption(state);
  }

  async selectBusinessType(businessType) {
    await this.page.getByLabel('Business type').selectOption(businessType);
  }

  async enterRevenue(amount) {
    await this.page.getByLabel('Annual revenue').fill(String(amount));
  }

  async selectCoverage(level) {
    const coverageLabels = {
      none: 'Coverage none',
      silver: 'Coverage silver',
      gold: 'Coverage gold',
      platinum: 'Coverage platinum'
    };
    await this.page.getByLabel(coverageLabels[level]).check();
  }

  async submitQuote() {
    await this.page.getByLabel('Submit quote').click();
  }

  async fillAndSubmitQuote({ state, businessType, revenue, coverage = 'none' }) {
    await this.selectState(state);
    await this.selectBusinessType(businessType);
    await this.enterRevenue(revenue);
    await this.selectCoverage(coverage);
    await this.submitQuote();
  }

  // Assertions
  async expectSubmitButtonDisabled() {
    await expect(this.page.getByLabel('Submit quote')).toBeDisabled();
  }

  async expectSubmitButtonEnabled() {
    await expect(this.page.getByLabel('Submit quote')).toBeEnabled();
  }

  async expectQuoteResult() {
    await expect(this.page.getByLabel('Quote result')).toBeVisible();
  }

  async expectCoverageOptionsVisible() {
    await expect(this.page.getByRole('radiogroup', { name: 'Coverage options' })).toBeVisible();
  }

  async expectCoverageOptionsHidden() {
    await expect(this.page.getByRole('radiogroup', { name: 'Coverage options' })).not.toBeVisible();
  }

  // Getters
  async getPremiumAmount() {
    const text = await this.page.getByLabel('Premium amount').textContent();
    return parseFloat(text.replace(/[$,]/g, ''));
  }

  async getPremiumText() {
    return await this.page.getByLabel('Premium amount').textContent();
  }

  async getQuoteId() {
    return await this.page.getByLabel('Quote ID').textContent();
  }

  async getTimestamp() {
    return await this.page.getByLabel('Quote timestamp').textContent();
  }
}

// ============================================
// TESTS USING CLASSIC POM
// ============================================

test.describe('Classic POM Example', () => {
  let quoteCalculator;

  test.beforeEach(async ({ page }) => {
    quoteCalculator = new QuoteCalculatorPage(page);
    await quoteCalculator.goto();
  });

  test('POM: submit button disabled on load', async () => {
    await quoteCalculator.expectSubmitButtonDisabled();
  });

  test('POM: user can get quote for WI retail business', async () => {
    await quoteCalculator.fillAndSubmitQuote({
      state: 'WI',
      businessType: 'retail',
      revenue: 50000,
      coverage: 'none'
    });

    await quoteCalculator.expectQuoteResult();
    
    const premium = await quoteCalculator.getPremiumAmount();
    expect(premium).toBeGreaterThan(1000);
    expect(premium).toBeLessThan(1300);
  });

  test('POM: coverage options show for V2 states', async () => {
    await quoteCalculator.selectState('WI');
    await quoteCalculator.expectCoverageOptionsVisible();
  });

  test('POM: coverage options hide for V1 states', async () => {
    await quoteCalculator.selectState('TX');
    await quoteCalculator.expectCoverageOptionsHidden();
  });

  test('POM: different coverage levels work', async ({ page }) => {
    const coverages = ['none', 'silver', 'gold', 'platinum'];
    
    for (const coverage of coverages) {
      await quoteCalculator.fillAndSubmitQuote({
        state: 'WI',
        businessType: 'retail',
        revenue: 50000,
        coverage
      });

      await quoteCalculator.expectQuoteResult();
      
      const premiumText = await quoteCalculator.getPremiumText();
      expect(premiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('POM: quote IDs are unique', async () => {
    const quoteIds = [];
    
    for (let i = 0; i < 3; i++) {
      await quoteCalculator.fillAndSubmitQuote({
        state: 'WI',
        businessType: 'retail',
        revenue: 50000
      });

      await quoteCalculator.expectQuoteResult();
      const quoteId = await quoteCalculator.getQuoteId();
      quoteIds.push(quoteId);
    }
    
    const uniqueIds = new Set(quoteIds);
    expect(uniqueIds.size).toBe(3);
  });
});

/**
 * @fileoverview Quote Flow Helpers - Reusable quote form interactions
 * 
 * These helpers encapsulate common quote form workflows using the label registry.
 * They make tests more readable, maintainable, and DRY.
 * 
 * PHILOSOPHY:
 * - Flows describe WHAT users do, not HOW the UI is built
 * - Each flow returns useful data for assertions
 * - Flows accept locale parameter for multi-language support
 * - Helpers use label registry, never hardcoded strings
 * 
 * @example Basic usage
 * import { getQuote } from '../helpers/flows/quoteFlows.js';
 * 
 * const result = await getQuote(page, {
 *   state: 'WI',
 *   business: 'retail',
 *   revenue: '50000',
 *   coverage: 'none',
 *   locale: 'en'
 * });
 * 
 * expect(result.premium).toBeGreaterThan(1000);
 */

import { getLabels } from '../../labels/index.js';

/**
 * Fill out the quote form fields
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Form values
 * @param {string} options.state - State code (e.g., 'WI', 'TX')
 * @param {string} options.business - Business type ('retail', 'restaurant', 'professional', 'manufacturing')
 * @param {string} options.revenue - Annual revenue as string (e.g., '50000')
 * @param {string} [options.coverage] - Coverage level ('none', 'silver', 'gold', 'platinum') - optional for V1 states
 * @param {string} [options.locale='en'] - Locale for labels
 * @returns {Promise<void>}
 * 
 * @example
 * await fillQuoteForm(page, {
 *   state: 'WI',
 *   business: 'retail',
 *   revenue: '50000',
 *   coverage: 'silver',
 *   locale: 'en'
 * });
 */
export async function fillQuoteForm(page, options) {
  const { state, business, revenue, coverage, locale = 'en' } = options;
  const L = getLabels(locale);
  
  // Fill basic form fields
  await page.getByLabel(L.customer_state).selectOption(state);
  await page.getByLabel(L.business_type).selectOption(business);
  await page.getByLabel(L.annual_revenue).fill(revenue);
  
  // Select coverage if provided (V2 states need this)
  if (coverage) {
    const coverageKey = `coverage_${coverage}`; // e.g., 'coverage_silver'
    await page.getByLabel(L[coverageKey]).check();
  }
}

/**
 * Submit the quote form
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} [locale='en'] - Locale for labels
 * @returns {Promise<void>}
 * 
 * @example
 * await submitQuote(page, 'en');
 */
export async function submitQuote(page, locale = 'en') {
  const L = getLabels(locale);
  await page.getByLabel(L.submit_quote).click();
}

/**
 * Get quote result details from the page
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} [locale='en'] - Locale for labels
 * @returns {Promise<Object>} Quote result data
 * @returns {number} .premium - Premium amount as number
 * @returns {string} .premiumText - Premium as formatted string (e.g., '$1,234.56')
 * @returns {string} .quoteId - Quote ID (e.g., 'Q-1234567890-ABC12')
 * @returns {string} .timestamp - Quote timestamp
 * 
 * @example
 * const result = await getQuoteResult(page, 'en');
 * expect(result.premium).toBeGreaterThan(1000);
 * expect(result.quoteId).toMatch(/^Q-/);
 */
export async function getQuoteResult(page, locale = 'en') {
  const L = getLabels(locale);
  
  // Wait for result to appear
  await page.getByLabel(L.quote_result).waitFor({ state: 'visible' });
  
  // Extract premium
  const premiumText = await page.getByLabel(L.premium_amount).textContent();
  const premium = parseFloat(premiumText.replace(/[$,]/g, ''));
  
  // Extract quote ID
  const quoteIdText = await page.getByLabel(L.quote_id).textContent();
  const quoteId = quoteIdText.replace(/^Quote ID:\s*/, '').trim();
  
  // Extract timestamp
  const timestampText = await page.getByLabel(L.quote_timestamp).textContent();
  const timestamp = timestampText.replace(/^Generated:\s*/, '').trim();
  
  return {
    premium,
    premiumText,
    quoteId,
    timestamp,
  };
}

/**
 * Complete end-to-end quote flow (fill + submit + get result)
 * This is the most commonly used helper - combines all steps
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Quote options
 * @param {string} options.state - State code
 * @param {string} options.business - Business type
 * @param {string} options.revenue - Annual revenue
 * @param {string} [options.coverage] - Coverage level (optional for V1 states)
 * @param {string} [options.locale='en'] - Locale
 * @returns {Promise<Object>} Quote result (see getQuoteResult return type)
 * 
 * @example Simple usage
 * const result = await getQuote(page, {
 *   state: 'WI',
 *   business: 'retail',
 *   revenue: '50000',
 *   coverage: 'none'
 * });
 * expect(result.premium).toBeGreaterThan(1000);
 * 
 * @example With Spanish locale
 * const result = await getQuote(page, {
 *   state: 'OH',
 *   business: 'restaurant',
 *   revenue: '100000',
 *   coverage: 'silver',
 *   locale: 'es'
 * });
 * 
 * @example V1 state (no coverage needed)
 * const result = await getQuote(page, {
 *   state: 'TX',
 *   business: 'retail',
 *   revenue: '50000'
 * });
 */
export async function getQuote(page, options) {
  const locale = options.locale || 'en';
  
  // Fill and submit form
  await fillQuoteForm(page, options);
  await submitQuote(page, locale);
  
  // Get and return result
  return await getQuoteResult(page, locale);
}

/**
 * Wait for loading indicator to appear and disappear
 * Useful for verifying loading states in tests
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} [locale='en'] - Locale for labels
 * @returns {Promise<void>}
 * 
 * @example
 * await submitQuote(page);
 * await waitForLoading(page);
 * // Now loading is complete
 */
export async function waitForLoading(page, locale = 'en') {
  const L = getLabels(locale);
  
  // Wait for loading to appear
  await page.getByLabel(L.loading).waitFor({ state: 'visible', timeout: 1000 }).catch(() => {
    // Loading might be too fast to catch
  });
  
  // Wait for loading to disappear
  await page.getByLabel(L.loading).waitFor({ state: 'hidden', timeout: 5000 });
}

/**
 * Verify error message is displayed
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} [locale='en'] - Locale for labels
 * @returns {Promise<string>} Error message text
 * 
 * @example
 * const errorText = await getErrorMessage(page);
 * expect(errorText).toContain('Invalid');
 */
export async function getErrorMessage(page, locale = 'en') {
  const L = getLabels(locale);
  
  await page.getByLabel(L.error_message).waitFor({ state: 'visible' });
  return await page.getByLabel(L.error_message).textContent();
}

/**
 * @fileoverview Label Registry - Central accessor for all locale labels
 * 
 * THE THIN APP MODEL APPROACH:
 * Instead of test-specific IDs (data-testid), we use generic accessibility labels
 * that serve THREE purposes:
 * 1. Screen readers announce them correctly (WCAG compliance)
 * 2. Tests use them as stable selectors
 * 3. They document the UI purpose
 * 
 * HOW IT WORKS:
 * - HTML uses aria-label attributes: <button aria-label="Submit quote">
 * - Tests import this registry: const L = getLabels('en')
 * - Tests use semantic keys: page.getByLabel(L.submit_quote)
 * - Same tests work across all languages by changing locale
 * 
 * ADDING NEW LABELS:
 * 1. Choose a semantic key (lowercase_snake_case): new_feature
 * 2. Add to en.js with JSDoc: new_feature: 'New feature'
 * 3. Add to all other locale files (es.js, etc.)
 * 4. Use in HTML: <element aria-label="New feature">
 * 5. Use in tests: page.getByLabel(L.new_feature)
 * 
 * @example Basic usage
 * import { getLabels } from '../labels/index.js';
 * const L = getLabels('en');
 * await page.getByLabel(L.customer_state).selectOption('WI');
 * await page.getByLabel(L.submit_quote).click();
 * 
 * @example Environment-based locale
 * const L = getLabels(process.env.LOCALE || 'en');
 * // Run with: LOCALE=es npm test
 * 
 * @example Multi-language test
 * test.describe.parallel('Quote flow - all languages', () => {
 *   for (const locale of ['en', 'es']) {
 *     test(`works in ${locale}`, async ({ page }) => {
 *       const L = getLabels(locale);
 *       await page.getByLabel(L.submit_quote).click();
 *     });
 *   }
 * });
 */

import { enLabels } from './en.js';
import { esLabels } from './es.js';

/**
 * Get accessibility labels for the specified locale
 * 
 * @param {string} [locale='en'] - Language code ('en', 'es', etc.)
 * @returns {Object} Label mappings for the locale
 * 
 * @example
 * const L = getLabels('en');
 * await page.getByLabel(L.submit_quote).click();
 */
export function getLabels(locale = 'en') {
  switch (locale.toLowerCase()) {
    case 'en':
      return enLabels;
    
    case 'es':
      return esLabels;
    
    default:
      console.warn(`Unknown locale "${locale}", falling back to English`);
      return enLabels;
  }
}

/**
 * Get list of supported locales
 * 
 * @returns {string[]} Array of supported locale codes
 * 
 * @example
 * const locales = getSupportedLocales(); // ['en', 'es']
 * for (const locale of locales) {
 *   test(`works in ${locale}`, async ({ page }) => {
 *     const L = getLabels(locale);
 *     // ... test code
 *   });
 * }
 */
export function getSupportedLocales() {
  return ['en', 'es'];
}

/**
 * Validate that all required label keys exist in a locale
 * Ensures translations are complete - useful in CI/CD
 * 
 * @param {string} locale - Locale to validate
 * @returns {{ valid: boolean, missing: string[] }} Validation result
 * 
 * @example
 * const validation = validateLocale('es');
 * if (!validation.valid) {
 *   console.error('Missing Spanish labels:', validation.missing);
 * }
 */
export function validateLocale(locale) {
  const labels = getLabels(locale);
  const requiredKeys = Object.keys(enLabels); // EN is the source of truth
  const missing = requiredKeys.filter(key => !labels[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

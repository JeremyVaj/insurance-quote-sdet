/**
 * @fileoverview English accessibility labels - Source of truth for EN locale
 * 
 * PHILOSOPHY:
 * - Labels should be generic: "Submit quote" not "submit-btn-v2"
 * - Labels should be natural: What a screen reader should announce
 * - Labels should be stable: Won't change with UI refactoring
 * - Labels should be semantic: Describes purpose, not implementation
 * 
 * USAGE IN HTML:
 * <button aria-label="Submit quote">Get Quote</button>
 * 
 * USAGE IN TESTS:
 * import { getLabels } from '../labels/index.js';
 * const L = getLabels('en');
 * await page.getByLabel(L.submit_quote).click();
 */

export const enLabels = {
  // ============================================
  // FORM FIELDS
  // ============================================
  
  /**
   * State/province selector dropdown
   * @type {string}
   * @screenreader Announces: "Customer state, combo box, Wisconsin" (when selected)
   * @html <select aria-label="Customer state">
   */
  customer_state: 'Customer state',

  /**
   * Business category selector dropdown
   * @type {string}
   * @screenreader Announces: "Business type, combo box, Retail" (when selected)
   * @html <select aria-label="Business type">
   */
  business_type: 'Business type',

  /**
   * Annual revenue input field
   * @type {string}
   * @screenreader Announces: "Annual revenue, edit, 50000" (when filled)
   * @html <input aria-label="Annual revenue">
   */
  annual_revenue: 'Annual revenue',

  // ============================================
  // COVERAGE OPTIONS
  // ============================================

  /**
   * Alert shown in V1 states (TX, NY, CA) - coverage not available
   * @type {string}
   * @screenreader Announces: "Coverage unavailable notice, alert"
   * @html <div role="alert" aria-label="Coverage unavailable notice">
   */
  coverage_unavailable_notice: 'Coverage unavailable notice',

  /**
   * Alert shown in V2 states (WI, OH, IL, NV) - coverage available
   * @type {string}
   * @screenreader Announces: "Coverage available notice, alert"
   * @html <div role="alert" aria-label="Coverage available notice">
   */
  coverage_available_notice: 'Coverage available notice',

  /**
   * Coverage selection radio group container
   * @type {string}
   * @screenreader Announces: "Coverage options, radio group"
   * @html <fieldset role="radiogroup" aria-label="Coverage options">
   */
  coverage_options: 'Coverage options',

  /**
   * No coverage option (default selection)
   * @type {string}
   * @screenreader Announces: "Coverage none, radio button, checked"
   * @html <input type="radio" aria-label="Coverage none">
   */
  coverage_none: 'Coverage none',

  /**
   * Silver tier coverage option
   * @type {string}
   * @screenreader Announces: "Coverage silver, radio button"
   * @html <input type="radio" aria-label="Coverage silver">
   */
  coverage_silver: 'Coverage silver',

  /**
   * Gold tier coverage option
   * @type {string}
   * @screenreader Announces: "Coverage gold, radio button"
   * @html <input type="radio" aria-label="Coverage gold">
   */
  coverage_gold: 'Coverage gold',

  /**
   * Platinum tier coverage option
   * @type {string}
   * @screenreader Announces: "Coverage platinum, radio button"
   * @html <input type="radio" aria-label="Coverage platinum">
   */
  coverage_platinum: 'Coverage platinum',

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Main form submission button
   * @type {string}
   * @screenreader Announces: "Submit quote, button, disabled" (initially)
   * @html <button aria-label="Submit quote">
   */
  submit_quote: 'Submit quote',

  // ============================================
  // FEEDBACK / STATUS
  // ============================================

  /**
   * Loading indicator shown during API call
   * @type {string}
   * @screenreader Announces: "Loading, status"
   * @html <div role="status" aria-label="Loading">
   */
  loading: 'Loading',

  /**
   * Error message alert region
   * @type {string}
   * @screenreader Announces: "Error message, alert" followed by error text
   * @html <div role="alert" aria-label="Error message">
   */
  error_message: 'Error message',

  // ============================================
  // RESULT REGION
  // ============================================

  /**
   * Successful quote result container
   * @type {string}
   * @screenreader Announces: "Quote result, region" followed by premium details
   * @html <section role="region" aria-label="Quote result">
   */
  quote_result: 'Quote result',

  /**
   * Premium dollar amount display
   * @type {string}
   * @screenreader Announces: "Premium amount, $1,500.00"
   * @html <div aria-label="Premium amount">$1,500.00</div>
   */
  premium_amount: 'Premium amount',

  /**
   * Unique quote identifier display
   * @type {string}
   * @screenreader Announces: "Quote ID, Q-1234567890-ABC12"
   * @html <div aria-label="Quote ID">Q-1234567890-ABC12</div>
   */
  quote_id: 'Quote ID',

  /**
   * Quote generation timestamp display
   * @type {string}
   * @screenreader Announces: "Quote timestamp, 11/5/2025, 3:30 PM"
   * @html <div aria-label="Quote timestamp">11/5/2025, 3:30 PM</div>
   */
  quote_timestamp: 'Quote timestamp',
};

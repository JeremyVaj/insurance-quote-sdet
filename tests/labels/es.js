/**
 * @fileoverview Spanish accessibility labels - For future multi-language support
 * 
 * TRANSLATION GUIDELINES:
 * - Maintain semantic meaning from English version
 * - Use natural phrasing for Spanish speakers
 * - Keep technical terms consistent (e.g., "Premium" → "Prima")
 * - Don't translate technical IDs (quote IDs stay as "Q-12345...")
 * - Don't add or remove information
 * 
 * USAGE IN HTML:
 * <button aria-label="Enviar cotización">Obtener Cotización</button>
 * 
 * USAGE IN TESTS:
 * import { getLabels } from '../labels/index.js';
 * const L = getLabels('es');
 * await page.getByLabel(L.submit_quote).click(); // Uses Spanish label
 */

export const esLabels = {
  // ============================================
  // FORM FIELDS
  // ============================================
  
  /**
   * State/province selector dropdown (Spanish)
   * @type {string}
   */
  customer_state: 'Estado del cliente',

  /**
   * Business category selector dropdown (Spanish)
   * @type {string}
   */
  business_type: 'Tipo de negocio',

  /**
   * Annual revenue input field (Spanish)
   * @type {string}
   */
  annual_revenue: 'Ingresos anuales',

  // ============================================
  // COVERAGE OPTIONS
  // ============================================

  /**
   * Alert shown in V1 states - coverage not available (Spanish)
   * @type {string}
   */
  coverage_unavailable_notice: 'Aviso de cobertura no disponible',

  /**
   * Alert shown in V2 states - coverage available (Spanish)
   * @type {string}
   */
  coverage_available_notice: 'Aviso de cobertura disponible',

  /**
   * Coverage selection radio group container (Spanish)
   * @type {string}
   */
  coverage_options: 'Opciones de cobertura',

  /**
   * No coverage option (Spanish)
   * @type {string}
   */
  coverage_none: 'Sin cobertura',

  /**
   * Silver tier coverage option (Spanish)
   * @type {string}
   */
  coverage_silver: 'Cobertura plata',

  /**
   * Gold tier coverage option (Spanish)
   * @type {string}
   */
  coverage_gold: 'Cobertura oro',

  /**
   * Platinum tier coverage option (Spanish)
   * @type {string}
   */
  coverage_platinum: 'Cobertura platino',

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Main form submission button (Spanish)
   * @type {string}
   */
  submit_quote: 'Enviar cotización',

  // ============================================
  // FEEDBACK / STATUS
  // ============================================

  /**
   * Loading indicator shown during API call (Spanish)
   * @type {string}
   */
  loading: 'Cargando',

  /**
   * Error message alert region (Spanish)
   * @type {string}
   */
  error_message: 'Mensaje de error',

  // ============================================
  // RESULT REGION
  // ============================================

  /**
   * Successful quote result container (Spanish)
   * @type {string}
   */
  quote_result: 'Resultado de cotización',

  /**
   * Premium dollar amount display (Spanish)
   * @type {string}
   */
  premium_amount: 'Monto de prima',

  /**
   * Unique quote identifier display (Spanish)
   * @type {string}
   */
  quote_id: 'ID de cotización',

  /**
   * Quote generation timestamp display (Spanish)
   * @type {string}
   */
  quote_timestamp: 'Marca de tiempo de cotización',
};

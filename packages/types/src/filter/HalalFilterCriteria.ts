/**
 * Halal dietary compliance filter criteria.
 *
 * Supports Ali's strict halal requirements with configurable levels of restriction.
 * Integrates with existing halalAnalysis data structure for consistent filtering.
 *
 * @example
 * ```typescript
 * const aliHalalCriteria: HalalFilterCriteria = {
 *   strict: true,                    // Ali requires confirmed halal
 *   excludeAlcohol: true,           // No alcohol content
 *   excludeGelatine: true,          // No animal gelatine
 *   additiveWhitelist: ['E300', 'E330'] // Allow natural additives only
 * };
 * ```
 */

export interface HalalFilterCriteria {
  /**
   * Require confirmed halal status vs allowing 'questionable' products.
   * Defaults to true for Ali's strict requirements.
   */
  strict: boolean;

  /**
   * Exclude products with alcohol content.
   * Important for strict halal compliance.
   */
  excludeAlcohol?: boolean;

  /**
   * Exclude products with animal gelatine.
   * Helps avoid non-halal animal-derived ingredients.
   */
  excludeGelatine?: boolean;

  /**
   * Allowed E-numbers for less strict filtering.
   * Must be valid E-number format (E followed by digits).
   * Example: ['E300', 'E330', 'E270'] for natural additives.
   */
  additiveWhitelist?: string[];
}

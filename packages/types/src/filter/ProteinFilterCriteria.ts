/**
 * Protein optimization filter criteria for Ali's CrossFit training requirements.
 *
 * Targets Ali's daily 170g protein goal with efficiency optimization and preferred source filtering.
 * Integrates with existing proteinOptimization scoring for consistent filtering.
 *
 * @example
 * ```typescript
 * const aliProteinCriteria: ProteinFilterCriteria = {
 *   minProteinPer100g: 20,           // High protein foods only
 *   targetDailyAmount: 170,          // Ali's daily target
 *   minEfficiencyScore: 50,          // Focus on efficient sources
 *   preferredSources: ['zuivel', 'vlees', 'vis'] // Dutch categories
 * };
 * ```
 */

export interface ProteinFilterCriteria {
  /**
   * Minimum protein content per 100g.
   * Must be > 0 and < 100g for realistic food products.
   * Typical range: 3-50g for meaningful protein sources.
   */
  minProteinPer100g: number;

  /**
   * Ali's daily protein target in grams.
   * Default: 170g for CrossFit athlete requirements.
   * Must be > 0 for valid nutrition planning.
   */
  targetDailyAmount: number;

  /**
   * Minimum protein efficiency score from proteinOptimization.
   * Range: 0-100, where higher scores indicate better protein density.
   * Optional field - when undefined, no efficiency filtering applied.
   */
  minEfficiencyScore?: number;

  /**
   * Preferred protein source categories for filtering.
   * Dutch category names (e.g., 'zuivel', 'vlees', 'vis', 'peulvruchten').
   * When specified, only products from these categories are included.
   */
  preferredSources?: string[];
}

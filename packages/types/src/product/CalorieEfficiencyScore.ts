/**
 * Multi-dimensional nutritional efficiency scoring.
 *
 * Extends beyond basic calorie-to-nutrient ratios by incorporating
 * thermic effects, micronutrient density, and processing penalties.
 */

export interface CalorieEfficiencyScore {
  /** Overall nutritional efficiency score (0-100 scale) */
  efficiencyScore: number;

  /** Protein density per calorie optimization (0-100 scale) */
  proteinEfficiency: number;

  /** Satiation per calorie optimization (0-100 scale) */
  satietyEfficiency: number;

  /** Estimated micronutrient richness (0-100 scale) */
  micronutrientDensity: number;

  /** Metabolic cost bonus from thermic effect (0-20 range) */
  thermicEffect: number;

  /** NOVA-based ultra-processing penalty (0-30 range) */
  processingPenalty: number;

  /** Data quality and completeness indicator */
  confidence: 'high' | 'medium' | 'low';

  macroBalance: number;
}

/**
 * Contract: Satiety Intelligence Analysis
 *
 * Function signature and behavior contract for computeSatietyAnalysis
 * Based on Holt et al. (1995) Satiety Index research
 */

import type { SatietyIntelligence, Nutrition, AdditiveInfo } from '../src/data/transform/types';

/**
 * Compute satiety intelligence metrics using evidence-based Satiety Index
 *
 * @param nutrition - Nutrition data per 100g including protein, fiber, calories
 * @param additiveInfo - Additive analysis for processing level estimation
 * @param ingredientCount - Total number of ingredients (processing complexity)
 * @returns SatietyIntelligence object or undefined if insufficient data
 *
 * @example
 * ```typescript
 * const result = computeSatietyAnalysis(
 *   { protein: 8, fiber: 3, kcal: 150, unit: 'per 100g' },
 *   { totalAdditives: 2, naturalAdditives: ['E300'] },
 *   4
 * );
 * // Returns: {
 * //   satietyScore: 72.5,
 * //   satietyFactors: { proteinFactor: 65, fiberFactor: 45, ... },
 * //   expectedSatietyDuration: 180,
 * //   caloriePerSatietyRatio: 2.1
 * // }
 * ```
 */
export declare function computeSatietyAnalysis(
  nutrition: Nutrition,
  additiveInfo?: AdditiveInfo,
  ingredientCount?: number,
): SatietyIntelligence | undefined;

/**
 * Contract Test Requirements:
 *
 * MUST return undefined when:
 * - nutrition is null/undefined
 * - nutrition.kcal is null/undefined/zero
 * - nutrition lacks both protein and fiber data
 *
 * MUST calculate satietyFactors based on research:
 *
 * proteinFactor (0-100):
 * - Based on protein content correlation with satiety (r=0.37 from Holt et al.)
 * - Formula: min(100, (protein_g / 25) × 100)
 * - 25g protein = 100 points (excellent satiety contribution)
 *
 * fiberFactor (0-100):
 * - Based on fiber content correlation with satiety
 * - Formula: min(100, (fiber_g / 10) × 100)
 * - 10g fiber = 100 points (excellent satiety contribution)
 *
 * volumeFactor (0-100):
 * - Estimated from food category and water content
 * - Beverages: high volume factor (80-100)
 * - Fruits/Vegetables: high volume factor (70-90)
 * - Nuts/Dense foods: low volume factor (20-40)
 * - Default estimation based on calorie density
 *
 * processingPenalty (0-100, higher = less processed):
 * - Based on NOVA-like classification from ingredients
 * - Minimal processing (0-2 additives): 90-100 points
 * - Moderate processing (3-5 additives): 70-89 points
 * - High processing (6+ additives): 50-69 points
 * - Ultra-processed (many synthetic additives): 20-49 points
 *
 * MUST calculate satietyScore (0-100) as:
 * - Weighted combination: (proteinFactor × 0.3) + (fiberFactor × 0.25) + (volumeFactor × 0.25) + (processingPenalty × 0.2)
 * - Higher scores indicate more satiating per calorie
 *
 * MUST calculate expectedSatietyDuration (minutes per 100kcal):
 * - Based on satietyScore mapping to research data
 * - High satiety (80-100): 240-300 minutes
 * - Good satiety (60-79): 180-239 minutes
 * - Average satiety (40-59): 120-179 minutes
 * - Low satiety (20-39): 90-119 minutes
 * - Poor satiety (0-19): 60-89 minutes
 *
 * MUST calculate caloriePerSatietyRatio:
 * - Formula: kcal / (satietyScore / 10)
 * - Lower values indicate more efficient satiety per calorie
 * - Used for optimization comparisons
 *
 * Validation Rules:
 * - All factor scores: 0.0-100.0, max 1 decimal place
 * - satietyScore: 0.0-100.0, max 1 decimal place
 * - expectedSatietyDuration: positive integer, realistic range (60-300 minutes)
 * - caloriePerSatietyRatio: positive number, reasonable range (0.5-20.0)
 *
 * Edge Cases:
 * - Missing fiber data: use 0, rely on protein and processing factors
 * - Missing additive info: assume minimal processing (high processingPenalty)
 * - Very high protein (>25g): cap proteinFactor at 100
 * - Very high fiber (>10g): cap fiberFactor at 100
 * - Zero additives: maximum processingPenalty (100 points)
 */

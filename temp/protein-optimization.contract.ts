/**
 * Contract: Protein Density Optimization
 *
 * Function signature and behavior contract for computeProteinOptimization
 * Optimizes for Ali's 170g daily protein target
 */

import type { ProteinScoring, Nutrition, UnitInfo } from '../src/data/transform/types';

/**
 * Compute protein optimization metrics for Ali's 170g daily target
 *
 * @param nutrition - Nutrition data per 100g including protein content
 * @param unit - Unit information for serving size estimation (optional)
 * @param category - Product category for serving size defaults (optional)
 * @returns ProteinScoring object or undefined if insufficient data
 *
 * @example
 * ```typescript
 * const result = computeProteinOptimization(
 *   { protein: 25, kcal: 150, unit: 'per 100g' },
 *   { raw: '200g', amount: 200, amountUnit: 'g' },
 *   'Zuivel'
 * );
 * // Returns: {
 * //   proteinDensityScore: 85.2,
 * //   proteinContribution: 25,
 * //   targetContribution: 29.4
 * // }
 * ```
 */
export declare function computeProteinOptimization(
  nutrition: Nutrition,
  unit?: UnitInfo,
  category?: string,
): ProteinScoring | undefined;

/**
 * Contract Test Requirements:
 *
 * MUST return undefined when:
 * - nutrition is null/undefined
 * - nutrition.protein is null/undefined/zero
 * - nutrition.kcal is null/undefined/zero
 *
 * MUST calculate proteinDensityScore (0-100) based on:
 * - protein per calorie ratio: (protein_g / kcal) × scaling_factor
 * - higher protein per calorie = higher score
 * - score of 100 represents optimal protein density in dataset
 *
 * MUST set proteinContribution equal to:
 * - nutrition.protein value (grams per 100g)
 * - direct passthrough of existing nutritional data
 *
 * MUST calculate targetContribution (0-100) as:
 * - (estimated_serving_protein / 170g) × 100
 * - based on realistic serving sizes for product category
 * - accounts for unit information when available
 *
 * Serving Size Estimation Rules:
 * - Use unit.amount when present and reasonable (10g-1000g range)
 * - Fall back to category defaults:
 *   - Dairy (yogurt, milk): 150-200g
 *   - Meat/Fish: 100-150g
 *   - Nuts/Seeds: 20-30g
 *   - Protein powder: 25-35g
 *   - Bread/Grains: 50-80g
 *   - Default: 100g
 *
 * Score Validation:
 * - proteinDensityScore: 0.0-100.0, max 1 decimal place
 * - proteinContribution: positive number, matches nutrition
 * - targetContribution: 0.0-100.0, realistic serving assumptions
 *
 * Edge Cases:
 * - Extremely high protein (>50g/100g): cap density score at 100
 * - Very low calories (<10 kcal/100g): handle division carefully
 * - Missing unit info: use category defaults
 * - Unknown category: use 100g default serving
 */

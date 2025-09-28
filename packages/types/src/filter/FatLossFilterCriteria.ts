/**
 * Fat loss optimization filter criteria for Ali's cutting phase requirements.
 *
 * Targets low calorie density foods with high satiety for effective fat loss while maintaining muscle mass.
 * Integrates with existing fatLossCompatibility scoring for consistent filtering.
 *
 * @example
 * ```typescript
 * const aliFatLossCriteria: FatLossFilterCriteria = {
 *   maxCaloriesPer100g: 125,         // Low calorie density for volume eating
 *   minSatietyScore: 60,             // High satiety foods for hunger control
 *   preferHighVolume: true,          // Volume advantage for satiation
 *   targetDeficit: 500               // 500 kcal daily deficit for 1lb/week loss
 * };
 * ```
 */

export interface FatLossFilterCriteria {
  /**
   * Maximum calorie density per 100g for fat loss compatibility.
   * Range: 50-200 kcal typical, default: 125 kcal for effective cutting.
   * Lower values promote volume eating and satiety.
   */
  maxCaloriesPer100g: number;

  /**
   * Minimum satiety score threshold for hunger control.
   * Range: 0-100, where higher scores indicate better satiation per calorie.
   * Optional field - when undefined, no satiety filtering applied.
   */
  minSatietyScore?: number;

  /**
   * Prefer foods with high volume advantage for satiation.
   * True prioritizes foods that provide fullness with fewer calories.
   * Integrates with volume calculations from fatLossCompatibility.
   */
  preferHighVolume: boolean;

  /**
   * Target daily calorie deficit for portion size calculations.
   * Typical range: 250-750 kcal deficit (0.5-1.5 lbs/week fat loss).
   * Optional field for advanced portion planning.
   */
  targetDeficit?: number;
}

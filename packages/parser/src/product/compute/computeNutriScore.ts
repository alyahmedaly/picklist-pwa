import type { Nutrition, AdditiveInfo } from '@picklist/types';

/**
 * Calculate EU Nutri-Score using FSA (Food Standards Agency) nutrient profiling model
 * Enhanced with processing penalties from additive analysis
 *
 * The Nutri-Score algorithm assigns negative points for nutrients to limit
 * (energy, saturated fat, sugars, sodium) and positive points for beneficial
 * components (fiber, protein, fruits/vegetables).
 *
 * @param nutrition - Nutrition data per 100g
 * @param category - Product category for threshold adjustments ('general', 'beverages', 'cheese', 'fats')
 * @param additiveInfo - Additive analysis for processing penalties (optional)
 * @returns Nutri-Score (-15 to +40) or undefined if insufficient data
 *
 * @example
 * ```typescript
 * const nutrition = { kcal: 150, satFat: 2, sugars: 10, salt: 0.5, fiber: 3, protein: 8 };
 * const score = computeNutriScore(nutrition, 'general'); // Returns integer score
 * ```
 */
export function computeNutriScore(
  nutrition: Nutrition,
  category: string = 'general',
  additiveInfo?: AdditiveInfo,
): number | undefined {
  // Validate required fields
  if (
    !nutrition ||
    typeof nutrition.kcal !== 'number' ||
    typeof nutrition.satFat !== 'number' ||
    typeof nutrition.sugars !== 'number' ||
    typeof nutrition.salt !== 'number'
  ) {
    return undefined;
  }

  // Validate non-negative values
  if (nutrition.kcal < 0 || nutrition.satFat < 0 || nutrition.sugars < 0 || nutrition.salt < 0) {
    return undefined;
  }

  // Convert kcal to kJ (1 kcal = 4.184 kJ)
  const energyKJ = nutrition.kcal * 4.184;

  // Convert salt to sodium (sodium = salt * 400 mg/g)
  const sodiumMg = nutrition.salt * 400;

  // Calculate negative points (nutrients to limit)
  let negativePoints = 0;

  // Energy points - category-specific thresholds
  negativePoints += calculateEnergyPoints(energyKJ, category);

  // Saturated fat points - same for all categories
  negativePoints += calculateSaturatedFatPoints(nutrition.satFat);

  // Sugar points - same for all categories
  negativePoints += calculateSugarPoints(nutrition.sugars);

  // Sodium points - same for all categories
  negativePoints += calculateSodiumPoints(sodiumMg);

  // Calculate positive points (beneficial nutrients)
  let positivePoints = 0;

  // Fiber points
  if (typeof nutrition.fiber === 'number' && nutrition.fiber >= 0) {
    positivePoints += calculateFiberPoints(nutrition.fiber);
  }

  // Protein points - category-specific rules
  if (typeof nutrition.protein === 'number' && nutrition.protein >= 0) {
    positivePoints += calculateProteinPoints(nutrition.protein, category, negativePoints);
  }

  // Final Nutri-Score = negative points - positive points
  let nutriScore = negativePoints - positivePoints;

  // Apply processing penalties from additive analysis
  if (additiveInfo) {
    nutriScore += calculateProcessingPenalty(additiveInfo);
  }

  // Ensure integer result (FSA algorithm uses integer arithmetic)
  return Math.floor(nutriScore);
}

/**
 * Calculate processing penalty based on additive analysis
 * Higher processing level = higher penalty (worse Nutri-Score)
 */
function calculateProcessingPenalty(additiveInfo: AdditiveInfo): number {
  let penalty = 0;

  // Base penalty for having any additives
  if (additiveInfo.totalAdditives > 0) {
    penalty += 1;
  }

  // Additional penalty for each additive beyond the first
  penalty += Math.min(additiveInfo.totalAdditives - 1, 3); // Cap at 3 extra points

  // Specific penalties for concerning additives
  if (additiveInfo.preservatives.length > 0) {
    penalty += 1; // Preservatives indicate higher processing
  }

  if (additiveInfo.colors.length > 0) {
    penalty += 1; // Artificial colors indicate ultra-processing
  }

  if (additiveInfo.flavorEnhancers.length > 0) {
    penalty += 2; // Flavor enhancers (MSG) indicate high processing
  }

  // Ultra-processed food penalty (multiple additive types)
  const additiveTypes = [
    additiveInfo.preservatives.length > 0,
    additiveInfo.colors.length > 0,
    additiveInfo.antioxidants.length > 0,
    additiveInfo.stabilizers.length > 0,
    additiveInfo.sweeteners.length > 0,
    additiveInfo.flavorEnhancers.length > 0,
  ].filter(Boolean).length;

  if (additiveTypes >= 3) {
    penalty += 2; // Ultra-processed penalty
  }

  // Cap total processing penalty at 8 points
  return Math.min(penalty, 8);
}

/**
 * Calculate energy points based on kJ and category
 */
function calculateEnergyPoints(energyKJ: number, category: string): number {
  if (category === 'beverages') {
    // Beverage energy thresholds (kJ): 0, 30, 60, 90, 120, 150, 180, 210, 240, 270
    const thresholds = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270];
    return calculatePointsFromThresholds(energyKJ, thresholds);
  } else {
    // General energy thresholds (kJ): 335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350
    const thresholds = [0, 335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
    return calculatePointsFromThresholds(energyKJ, thresholds);
  }
}

/**
 * Calculate saturated fat points
 */
function calculateSaturatedFatPoints(satFatG: number): number {
  // Saturated fat thresholds (g): 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  const thresholds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return calculatePointsFromThresholds(satFatG, thresholds);
}

/**
 * Calculate sugar points
 */
function calculateSugarPoints(sugarsG: number): number {
  // Sugar thresholds (g): 4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45
  const thresholds = [0, 4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45];
  return calculatePointsFromThresholds(sugarsG, thresholds);
}

/**
 * Calculate sodium points
 */
function calculateSodiumPoints(sodiumMg: number): number {
  // Sodium thresholds (mg): 90, 180, 270, 360, 450, 540, 630, 720, 810, 900
  const thresholds = [0, 90, 180, 270, 360, 450, 540, 630, 720, 810, 900];
  return calculatePointsFromThresholds(sodiumMg, thresholds);
}

/**
 * Calculate fiber points (positive)
 */
function calculateFiberPoints(fiberG: number): number {
  // Fiber thresholds (g): 0.9, 1.9, 2.8, 3.7, 4.7
  const thresholds = [0, 0.9, 1.9, 2.8, 3.7, 4.7];
  return calculatePointsFromThresholds(fiberG, thresholds);
}

/**
 * Calculate protein points (positive) - category-specific rules
 */
function calculateProteinPoints(
  proteinG: number,
  category: string,
  negativePoints: number,
): number {
  // For cheese: protein points only count if negative points ≤ 11
  if (category === 'cheese' && negativePoints > 11) {
    return 0;
  }

  // Protein thresholds (g): 1.6, 3.2, 4.8, 6.4, 8.0
  const thresholds = [0, 1.6, 3.2, 4.8, 6.4, 8.0];
  return calculatePointsFromThresholds(proteinG, thresholds);
}

/**
 * Generic function to calculate points from threshold array
 * Returns the number of thresholds exceeded
 */
function calculatePointsFromThresholds(value: number, thresholds: number[]): number {
  let points = 0;

  // Count how many thresholds the value exceeds
  for (let i = 1; i < thresholds.length; i++) {
    const threshold = thresholds[i];
    if (threshold !== undefined && value >= threshold) {
      points++;
    } else {
      break;
    }
  }

  return points;
}

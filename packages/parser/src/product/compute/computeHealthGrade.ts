import type { HealthGrade, Nutrition, AdditiveInfo } from '@picklist/types';

/**
 * Food category classification for calibrated scoring
 */
export type FoodCategoryTier =
  | 'premium'
  | 'whole_grains'
  | 'staple_carbs'
  | 'processed'
  | 'ultra_processed';

export interface FoodCategoryInfo {
  tier: FoodCategoryTier;
  maxGrade: HealthGrade;
  maxScore: number;
  description: string;
}

/**
 * Classify food into health tier based on categories, ingredients, and processing level
 */
export function classifyFoodCategory(
  categories: string[],
  nutrition?: Nutrition,
  additiveInfo?: AdditiveInfo,
): FoodCategoryInfo {
  const categoryText = categories.join(' ').toLowerCase();

  // Ultra-processed foods (high additives, emulsifiers, preservatives)
  if (additiveInfo?.totalAdditives && additiveInfo.totalAdditives >= 3) {
    return {
      tier: 'ultra_processed',
      maxGrade: 'C',
      maxScore: 60,
      description: 'Ultra-processed food with multiple additives',
    };
  }

  // Processed foods (some additives, moderate processing)
  if (additiveInfo?.totalAdditives && additiveInfo.totalAdditives >= 1) {
    return {
      tier: 'processed',
      maxGrade: 'B',
      maxScore: 75,
      description: 'Processed food with additives',
    };
  }

  // Staple carbohydrates (rice, pasta, bread - high calorie, low protein)
  if (isStapleCarb(categoryText, nutrition)) {
    return {
      tier: 'staple_carbs',
      maxGrade: 'B',
      maxScore: 85,
      description: 'Staple carbohydrate - energy source',
    };
  }

  // Whole grains (higher fiber, better nutrition)
  if (isWholeGrain(categoryText, nutrition)) {
    return {
      tier: 'whole_grains',
      maxGrade: 'A',
      maxScore: 90,
      description: 'Whole grain food',
    };
  }

  // Premium foods (vegetables, lean proteins, minimally processed)
  if (isPremiumFood(categoryText, nutrition)) {
    return {
      tier: 'premium',
      maxGrade: 'A',
      maxScore: 100,
      description: 'Premium whole food',
    };
  }

  // Default for unclassified foods
  return {
    tier: 'staple_carbs',
    maxGrade: 'B',
    maxScore: 80,
    description: 'Unclassified food',
  };
}

/**
 * Check if food is a staple carbohydrate
 */
function isStapleCarb(categoryText: string, nutrition?: Nutrition): boolean {
  // High calorie density (>300 kcal/100g) + low protein (<10g/100g)
  const isHighCalorieLowProtein =
    nutrition &&
    typeof nutrition.kcal === 'number' &&
    typeof nutrition.protein === 'number' &&
    nutrition.kcal > 300 &&
    nutrition.protein < 10;

  // Category-based detection
  const stapleCarbs = [
    'rijst',
    'rice',
    'pasta',
    'noedels',
    'noodles',
    'brood',
    'bread',
    'graan',
    'granen',
    'cereals',
    'aardappel',
    'potato',
    'knolgewassen',
  ];

  const hasStapleCategory = stapleCarbs.some((term) => categoryText.includes(term));

  return hasStapleCategory || !!isHighCalorieLowProtein;
}

/**
 * Check if food is whole grain
 */
function isWholeGrain(categoryText: string, nutrition?: Nutrition): boolean {
  const wholeGrainTerms = [
    'volkoren',
    'whole grain',
    'whole wheat',
    'wholegrain',
    'quinoa',
    'haver',
    'oats',
    'gerst',
    'barley',
  ];

  const hasWholeGrainCategory = wholeGrainTerms.some((term) => categoryText.includes(term));

  // High fiber content (>5g/100g) suggests whole grain
  const isHighFiber = nutrition && typeof nutrition.fiber === 'number' && nutrition.fiber > 5;

  return hasWholeGrainCategory || !!isHighFiber;
}

/**
 * Check if food is premium (vegetables, proteins, minimally processed)
 */
function isPremiumFood(categoryText: string, nutrition?: Nutrition): boolean {
  const premiumCategories = [
    'groente',
    'groenten',
    'vegetables',
    'produce',
    'fruit',
    'fruits',
    'vlees',
    'meat',
    'vis',
    'fish',
    'gevogelte',
    'poultry',
    'noten',
    'nuts',
    'zaden',
    'seeds',
    'peulvruchten',
    'legumes',
    'linzen',
    'lentils',
  ];

  const hasPremiumCategory = premiumCategories.some((term) => categoryText.includes(term));

  // High protein (>15g/100g) + low calorie density (<200 kcal/100g)
  const isLeanProtein =
    nutrition &&
    typeof nutrition.protein === 'number' &&
    typeof nutrition.kcal === 'number' &&
    nutrition.protein > 15 &&
    nutrition.kcal < 200;

  return hasPremiumCategory || !!isLeanProtein;
}

/**
 * Apply category-based grade capping to prevent grade inflation
 */
export function applyCategoryCap(
  basePercentile: number,
  categories: string[],
  nutrition?: Nutrition,
  additiveInfo?: AdditiveInfo,
): { cappedPercentile: number; appliedCap: FoodCategoryInfo } {
  const categoryInfo = classifyFoodCategory(categories, nutrition, additiveInfo);

  // Convert max score to equivalent percentile
  const maxPercentile = categoryInfo.maxScore / 100;

  // Apply the cap
  const cappedPercentile = Math.min(basePercentile, maxPercentile);

  return {
    cappedPercentile,
    appliedCap: categoryInfo,
  };
}

/**
 * Convert percentile rank to health grade using equal 20% distribution
 *
 * The health grade system uses five equal buckets (A-E) where each grade
 * represents 20% of the population for balanced user experience.
 *
 * Grade Distribution:
 * - A: 80th-100th percentile (top 20%)
 * - B: 60th-80th percentile (next 20%)
 * - C: 40th-60th percentile (middle 20%)
 * - D: 20th-40th percentile (next 20%)
 * - E: 0th-20th percentile (bottom 20%)
 *
 * @param percentile - Percentile rank (0-1 scale)
 * @returns Health grade ('A' | 'B' | 'C' | 'D' | 'E')
 *
 * @example
 * ```typescript
 * computeHealthGrade(0.85); // Returns 'A' (top 20%)
 * computeHealthGrade(0.5);  // Returns 'C' (middle 20%)
 * computeHealthGrade(0.1);  // Returns 'E' (bottom 20%)
 * ```
 */
export function computeHealthGrade(percentile: number): HealthGrade {
  // Input validation
  if (typeof percentile !== 'number' || isNaN(percentile)) {
    throw new Error('Invalid percentile: must be a valid number');
  }

  if (percentile < 0 || percentile > 1) {
    throw new Error(`Invalid percentile: ${percentile} is outside valid range [0, 1]`);
  }

  if (!isFinite(percentile)) {
    throw new Error('Invalid percentile: must be a finite number');
  }

  // Equal 20% buckets with exact boundary handling
  // Using >= for boundaries ensures boundary values get the higher grade
  if (percentile >= 0.8) {
    return 'A'; // 80th-100th percentile (top 20%)
  } else if (percentile >= 0.6) {
    return 'B'; // 60th-80th percentile (next 20%)
  } else if (percentile >= 0.4) {
    return 'C'; // 40th-60th percentile (middle 20%)
  } else if (percentile >= 0.2) {
    return 'D'; // 20th-40th percentile (next 20%)
  } else {
    return 'E'; // 0th-20th percentile (bottom 20%)
  }
}

/**
 * Convert percentile rank to health score (0-100 scale)
 *
 * Transforms the 0-1 percentile scale to a more user-friendly 0-100 scale
 * with 1 decimal precision maximum for UI display.
 *
 * @param percentile - Percentile rank (0-1 scale)
 * @returns Health score (0-100 scale) with 1 decimal precision
 *
 * @example
 * ```typescript
 * computeHealthScore(0.857); // Returns 85.7
 * computeHealthScore(0.5);   // Returns 50.0
 * ```
 */
export function computeHealthScore(percentile: number): number {
  // Input validation (same as computeHealthGrade)
  if (typeof percentile !== 'number' || isNaN(percentile)) {
    throw new Error('Invalid percentile: must be a valid number');
  }

  if (percentile < 0 || percentile > 1) {
    throw new Error(`Invalid percentile: ${percentile} is outside valid range [0, 1]`);
  }

  if (!isFinite(percentile)) {
    throw new Error('Invalid percentile: must be a finite number');
  }

  // Convert to 0-100 scale with 1 decimal precision
  const healthScore = percentile * 100;
  return Math.round(healthScore * 10) / 10;
}

/**
 * Get grade distribution statistics for a set of percentiles
 *
 * Used for validation and debugging to ensure proper grade distribution.
 *
 * @param percentiles - Array of percentile ranks (0-1 scale)
 * @returns Grade distribution with counts and percentages
 */
export function getGradeDistribution(percentiles: number[]): {
  gradeCount: { A: number; B: number; C: number; D: number; E: number };
  total: number;
  distribution: { A: number; B: number; C: number; D: number; E: number };
} {
  if (!Array.isArray(percentiles) || percentiles.length === 0) {
    return {
      gradeCount: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      total: 0,
      distribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    };
  }

  // Count grades
  const gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  percentiles.forEach((percentile) => {
    try {
      const grade = computeHealthGrade(percentile);
      gradeCount[grade]++;
    } catch (error) {
      // Skip invalid percentiles
      console.warn(`Skipping invalid percentile: ${percentile}`, error);
    }
  });

  const total = percentiles.length;

  // Calculate distribution percentages
  const distribution = {
    A: total > 0 ? Math.round((gradeCount.A / total) * 1000) / 10 : 0,
    B: total > 0 ? Math.round((gradeCount.B / total) * 1000) / 10 : 0,
    C: total > 0 ? Math.round((gradeCount.C / total) * 1000) / 10 : 0,
    D: total > 0 ? Math.round((gradeCount.D / total) * 1000) / 10 : 0,
    E: total > 0 ? Math.round((gradeCount.E / total) * 1000) / 10 : 0,
  };

  return { gradeCount, total, distribution };
}

/**
 * Validate that grade distribution is approximately balanced (20% each)
 *
 * @param percentiles - Array of percentile ranks to validate
 * @param tolerance - Acceptable deviation from 20% (default: 2%)
 * @returns Validation result with details
 */
export function validateGradeDistribution(
  percentiles: number[],
  tolerance: number = 2,
): {
  isBalanced: boolean;
  distribution: { A: number; B: number; C: number; D: number; E: number };
  deviations: { A: number; B: number; C: number; D: number; E: number };
  maxDeviation: number;
} {
  const { distribution } = getGradeDistribution(percentiles);

  // Calculate deviations from expected 20%
  const deviations = {
    A: Math.abs(distribution.A - 20),
    B: Math.abs(distribution.B - 20),
    C: Math.abs(distribution.C - 20),
    D: Math.abs(distribution.D - 20),
    E: Math.abs(distribution.E - 20),
  };

  const maxDeviation = Math.max(...Object.values(deviations));
  const isBalanced = maxDeviation <= tolerance;

  return {
    isBalanced,
    distribution,
    deviations,
    maxDeviation,
  };
}

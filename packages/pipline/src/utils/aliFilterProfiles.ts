/**
 * Ali Filter Profiles - Predefined filtering combinations for specific scenarios
 *
 * Provides ready-to-use filter profiles optimized for Ali's nutritional goals:
 * - Daily protein hunting (halal + high protein)
 * - Post-CrossFit recovery (halal + carb:protein ratios)
 * - Cutting phase (halal + fat loss compatibility)
 * - Budget optimization (protein per euro)
 * - Training vs rest day contexts
 */

import type { FilterCriteria } from '@picklist/types';
import { createAliDefaults } from '@picklist/filter';

/**
 * Ali's profile configuration for context-aware filtering.
 */
export interface AliProfile {
  /** Current body composition phase */
  phase: 'cutting' | 'maintenance' | 'bulking' | 'recomposition';
  /** Training status */
  trainingDay: boolean;
  /** Current weight (kg) */
  currentWeight: number;
  /** Target weight (kg) */
  targetWeight: number;
  /** Height (cm) */
  height: number;
  /** Weekly training frequency */
  trainingFrequency: number;
}

/**
 * Default Ali profile based on current goals (165cm, 83kg → 72kg, CrossFit 4-5x/week).
 */
export const DEFAULT_ALI_PROFILE: AliProfile = {
  phase: 'cutting', // Currently targeting fat loss from 83kg to 72kg
  trainingDay: true, // Assume training day by default
  currentWeight: 83,
  targetWeight: 72,
  height: 165,
  trainingFrequency: 4.5, // 4-5 times per week
};

/**
 * Creates Ali's daily protein hunting filter profile.
 * Optimized for finding halal, high-protein foods to meet 170g daily target.
 *
 * @param customProfile - Optional profile customization
 * @returns FilterCriteria for daily protein optimization
 *
 * @example
 * ```typescript
 * const dailyProteinFilter = createAliDailyProteinProfile();
 * const products = createFilter(allProducts, dailyProteinFilter);
 * // Returns halal products with ≥20g protein per 100g
 * ```
 */
export function createAliDailyProteinProfile(customProfile?: Partial<AliProfile>): FilterCriteria {
  const profile = { ...DEFAULT_ALI_PROFILE, ...customProfile };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  return {
    halal: {
      strict: true, // Ali requires confirmed halal status
      excludeAlcohol: true,
      excludeGelatine: true,
    },
    protein: {
      minProteinPer100g: 20, // Minimum 20g protein per 100g for efficiency
      targetDailyAmount: 170, // Ali's daily protein target
      minEfficiencyScore: 40, // Focus on protein-dense foods
    },
    // Add context for training vs rest day adjustments
    context: {
      isTrainingDay: profile.trainingDay,
      targetCalories: profile.trainingDay ? 2000 : 1750,
      targetCarbs: profile.trainingDay ? 220 : 120,
      mealTiming: 'general',
      avoidCombinations: ['tuna+rice', 'honey'], // Ali's documented preferences
    },
  };
}

/**
 * Creates Ali's post-CrossFit recovery filter profile.
 * Optimized for immediate post-workout nutrition with optimal carb:protein ratios.
 *
 * @param customProfile - Optional profile customization
 * @returns FilterCriteria for post-workout recovery
 *
 * @example
 * ```typescript
 * const postWorkoutFilter = createAliPostWorkoutProfile();
 * const recoveryFoods = createFilter(allProducts, postWorkoutFilter);
 * // Returns halal foods with 2.0-4.0 carb:protein ratio, high GI preferred
 * ```
 */
export function createAliPostWorkoutProfile(customProfile?: Partial<AliProfile>): FilterCriteria {
  const profile = { ...DEFAULT_ALI_PROFILE, ...customProfile };

  return {
    halal: {
      strict: true,
      excludeAlcohol: true,
      excludeGelatine: true,
    },
    protein: {
      minProteinPer100g: 15, // Slightly lower for post-workout carb focus
      targetDailyAmount: 170,
    },
    postWorkout: {
      minCarbProteinRatio: 2.0, // Minimum 2:1 carb:protein for recovery
      maxCarbProteinRatio: 4.0, // Maximum 4:1 to maintain protein intake
      preferHighGI: true, // Fast carbs for glycogen replenishment
      recoveryWindow: 'immediate', // Ali trains high-intensity CrossFit
    },
    context: {
      isTrainingDay: true, // Post-workout implies training day
      targetCalories: 2000,
      targetCarbs: 220,
      mealTiming: 'post_workout',
      avoidCombinations: ['tuna+rice'], // Prefer tuna+potato for post-workout
    },
  };
}

/**
 * Creates Ali's cutting phase filter profile.
 * Optimized for fat loss with high satiety and low calorie density.
 *
 * @param customProfile - Optional profile customization
 * @returns FilterCriteria for cutting phase nutrition
 *
 * @example
 * ```typescript
 * const cuttingFilter = createAliCuttingProfile();
 * const fatLossFoods = createFilter(allProducts, cuttingFilter);
 * // Returns halal, high-protein, low-calorie, high-satiety foods
 * ```
 */
export function createAliCuttingProfile(customProfile?: Partial<AliProfile>): FilterCriteria {
  const profile = { ...DEFAULT_ALI_PROFILE, ...customProfile };

  return {
    halal: {
      strict: true,
      excludeAlcohol: true,
      excludeGelatine: true,
    },
    protein: {
      minProteinPer100g: 20, // High protein for muscle preservation during cut
      targetDailyAmount: 170,
      minEfficiencyScore: 50, // Focus on lean protein sources
    },
    fatLoss: {
      maxCaloriesPer100g: 125, // Low calorie density for volume eating
      minSatietyScore: 60, // High satiety to manage hunger
      preferHighVolume: true, // Vegetables, lean proteins, low-energy-dense foods
    },
    context: {
      isTrainingDay: profile.trainingDay,
      targetCalories: profile.trainingDay ? 2000 : 1750, // Adjusted for cutting
      targetCarbs: profile.trainingDay ? 180 : 100, // Reduced carbs for fat loss
      mealTiming: 'general',
      avoidCombinations: ['honey'], // Avoid high-calorie additions during cut
    },
  };
}

/**
 * Creates Ali's budget optimization filter profile.
 * Optimized for protein per euro in the Dutch market.
 *
 * @param weeklyBudget - Weekly food budget in euros (default: €50)
 * @param customProfile - Optional profile customization
 * @returns FilterCriteria for budget-optimized nutrition
 *
 * @example
 * ```typescript
 * const budgetFilter = createAliBudgetProfile(45); // €45/week budget
 * const affordableFoods = createFilter(allProducts, budgetFilter);
 * // Returns halal foods optimized for protein per euro
 * ```
 */
export function createAliBudgetProfile(
  weeklyBudget: number = 50,
  customProfile?: Partial<AliProfile>
): FilterCriteria {
  const profile = { ...DEFAULT_ALI_PROFILE, ...customProfile };
  const dailyBudget = weeklyBudget / 7;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  return {
    halal: {
      strict: true,
      excludeAlcohol: true,
      excludeGelatine: true,
    },
    protein: {
      minProteinPer100g: 15, // Lower threshold for budget optimization
      targetDailyAmount: 170,
    },
    budget: {
      maxPricePerUnit: 2.50, // €2.50 per 100g maximum for Dutch market
      optimizeProteinPerEuro: true, // Focus on protein per euro efficiency
      maxTotalBudget: dailyBudget,
    },
    context: {
      isTrainingDay: profile.trainingDay,
      targetCalories: profile.trainingDay ? 2000 : 1750,
      targetCarbs: profile.trainingDay ? 220 : 120,
      mealTiming: 'general',
      avoidCombinations: ['tuna+rice', 'honey'], // Cost-conscious choices
    },
  };
}

/**
 * Creates Ali's training day context filter profile.
 * Optimized for higher calorie and carb intake on training days.
 *
 * @param customProfile - Optional profile customization
 * @returns FilterCriteria for training day nutrition
 *
 * @example
 * ```typescript
 * const trainingDayFilter = createAliTrainingDayProfile();
 * const trainingFoods = createFilter(allProducts, trainingDayFilter);
 * // Returns halal foods appropriate for 2000 kcal, 220g carb training days
 * ```
 */
export function createAliTrainingDayProfile(customProfile?: Partial<AliProfile>): FilterCriteria {
  const profile = { ...DEFAULT_ALI_PROFILE, ...customProfile };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  return {
    halal: {
      strict: true,
      excludeAlcohol: true,
      excludeGelatine: true,
    },
    protein: {
      minProteinPer100g: 18, // Slightly lower to allow for more carb-rich foods
      targetDailyAmount: 170,
    },
    context: {
      isTrainingDay: true,
      targetCalories: 2000, // Higher intake for training days
      targetCarbs: 220, // Adequate carbs for performance
      mealTiming: 'general',
      avoidCombinations: ['tuna+rice'], // Prefer tuna+potato for training fuel
    },
  };
}

/**
 * Creates Ali's rest day context filter profile.
 * Optimized for lower calorie and carb intake on rest days.
 *
 * @param customProfile - Optional profile customization
 * @returns FilterCriteria for rest day nutrition
 *
 * @example
 * ```typescript
 * const restDayFilter = createAliRestDayProfile();
 * const restFoods = createFilter(allProducts, restDayFilter);
 * // Returns halal foods appropriate for 1750 kcal, 120g carb rest days
 * ```
 */
export function createAliRestDayProfile(customProfile?: Partial<AliProfile>): FilterCriteria {
  const profile = { ...DEFAULT_ALI_PROFILE, ...customProfile };

  return {
    halal: {
      strict: true,
      excludeAlcohol: true,
      excludeGelatine: true,
    },
    protein: {
      minProteinPer100g: 22, // Higher protein focus on rest days for muscle maintenance
      targetDailyAmount: 170,
      minEfficiencyScore: 45,
    },
    fatLoss: {
      maxCaloriesPer100g: 150, // Moderate calorie density for rest day portion control
      preferHighVolume: true,
    },
    context: {
      isTrainingDay: false,
      targetCalories: 1750, // Lower intake for rest days
      targetCarbs: 120, // Reduced carbs for recovery
      mealTiming: 'general',
      avoidCombinations: ['honey'], // More restrictive on rest days
    },
  };
}

/**
 * Creates comprehensive Ali filter combinations for multiple output generation.
 * Returns all of Ali's common filtering scenarios for batch processing.
 *
 * @param customProfile - Optional profile customization
 * @returns Array of named filter combinations for Ali's use cases
 *
 * @example
 * ```typescript
 * const aliCombinations = createAliFilterCombinations();
 * const outputs = await generateMultipleOutputs(products, aliCombinations, config);
 * // Generates filtered files for all Ali's scenarios
 * ```
 */
export function createAliFilterCombinations(
  customProfile?: Partial<AliProfile>
): Array<{ name: string; criteria: FilterCriteria }> {
  return [
    {
      name: 'ali-daily-protein',
      criteria: createAliDailyProteinProfile(customProfile),
    },
    {
      name: 'ali-post-workout',
      criteria: createAliPostWorkoutProfile(customProfile),
    },
    {
      name: 'ali-cutting',
      criteria: createAliCuttingProfile(customProfile),
    },
    {
      name: 'ali-budget',
      criteria: createAliBudgetProfile(50, customProfile), // Default €50/week
    },
    {
      name: 'ali-training-day',
      criteria: createAliTrainingDayProfile(customProfile),
    },
    {
      name: 'ali-rest-day',
      criteria: createAliRestDayProfile(customProfile),
    },
  ];
}

/**
 * Gets Ali's current phase-specific filter profile based on body composition goals.
 *
 * @param phase - Current body composition phase
 * @param customProfile - Optional profile customization
 * @returns FilterCriteria optimized for the specified phase
 *
 * @example
 * ```typescript
 * const currentFilter = getAliPhaseProfile('cutting');
 * const phaseFoods = createFilter(allProducts, currentFilter);
 * // Returns foods optimized for Ali's current cutting phase
 * ```
 */
export function getAliPhaseProfile(
  phase: AliProfile['phase'],
  customProfile?: Partial<AliProfile>
): FilterCriteria {
  const profile = { ...DEFAULT_ALI_PROFILE, phase, ...customProfile };

  switch (phase) {
    case 'cutting':
      return createAliCuttingProfile(profile);
    case 'maintenance':
      return createAliDailyProteinProfile(profile);
    case 'bulking':
      // For bulking, relax calorie restrictions and focus on protein + carbs
      return {
        ...createAliDailyProteinProfile(profile),
        context: {
          ...createAliDailyProteinProfile(profile).context!,
          targetCalories: profile.trainingDay ? 2400 : 2200, // Higher for bulking
          targetCarbs: profile.trainingDay ? 300 : 250, // More carbs for growth
        },
      };
    case 'recomposition':
      // Body recomposition: moderate approach between cutting and maintenance
      return {
        ...createAliDailyProteinProfile(profile),
        fatLoss: {
          maxCaloriesPer100g: 200, // Moderate calorie density
          preferHighVolume: false, // Less restrictive than cutting
        },
      };
    default:
      return createAliDailyProteinProfile(profile);
  }
}

/**
 * Legacy compatibility function - integrates with createAliDefaults from filterEngine.
 * Provides backward compatibility while extending with profile-specific customization.
 *
 * @returns FilterCriteria matching the basic Ali defaults
 */
export function getBasicAliDefaults(): FilterCriteria {
  // Use the enhanced createAliDefaults from filterEngine for consistency
  return createAliDefaults();
}

/**
 * Creates Ali's avoid combinations list based on documented preferences.
 * Used across all profiles for consistent food combination preferences.
 *
 * @param phase - Current phase for phase-specific restrictions
 * @returns Array of food combinations to avoid
 */
export function getAliAvoidCombinations(phase: AliProfile['phase'] = 'cutting'): string[] {
  const baseCombinations = ['tuna+rice']; // Ali prefers tuna+potato

  // Add phase-specific restrictions
  switch (phase) {
    case 'cutting':
      return [...baseCombinations, 'honey']; // Avoid high-calorie additions
    case 'bulking':
      return baseCombinations; // More permissive during bulking
    case 'maintenance':
    case 'recomposition':
    default:
      return [...baseCombinations, 'honey']; // Moderate restrictions
  }
}
/**
 * Filter criteria interfaces and validation functions for Ali's health optimization system.
 *
 * This module provides comprehensive filtering criteria definitions with runtime validation
 * to support Ali's specific dietary requirements, CrossFit training needs, and Dutch market preferences.
 */

import type { BudgetFilterCriteria, ContextFilterCriteria, FatLossFilterCriteria, HalalFilterCriteria, PostWorkoutFilterCriteria, ProteinFilterCriteria, ValidationResult } from "@picklist/types";


/**
 * Default halal filter criteria optimized for Ali's requirements.
 * Provides strict halal compliance with allowance for natural additives.
 */
export const DEFAULT_HALAL_CRITERIA: HalalFilterCriteria = {
  strict: true,
  excludeAlcohol: true,
  excludeGelatine: true,
  additiveWhitelist: [
    'E300', // Ascorbic acid (Vitamin C)
    'E330', // Citric acid
    'E270', // Lactic acid
    'E101', // Riboflavin (Vitamin B2)
    'E100', // Curcumin (natural colorant)
  ],
};

/**
 * Default protein filter criteria optimized for Ali's CrossFit requirements.
 * Targets 170g daily protein with focus on high-efficiency sources.
 */
export const DEFAULT_PROTEIN_CRITERIA: ProteinFilterCriteria = {
  minProteinPer100g: 20, // High protein foods only
  targetDailyAmount: 170, // Ali's CrossFit target
  minEfficiencyScore: 40, // Focus on efficient sources
  preferredSources: [
    'zuivel', // Dairy - excellent protein bioavailability
    'vlees', // Meat - complete amino acid profiles
    'vis', // Fish - lean protein sources
    'peulvruchten', // Legumes - plant-based options
  ],
};

/**
 * Default post-workout filter criteria optimized for Ali's CrossFit recovery.
 * Targets immediate recovery window with balanced carb:protein ratios.
 */
export const DEFAULT_POST_WORKOUT_CRITERIA: PostWorkoutFilterCriteria = {
  minCarbProteinRatio: 2.0, // Minimum carbs for muscle recovery
  maxCarbProteinRatio: 4.0, // Maximum to avoid fat storage
  preferHighGI: true, // Fast carbs for glycogen replenishment
  recoveryWindow: 'immediate', // Optimal 30-minute window
};

/**
 * Default fat loss filter criteria optimized for Ali's cutting phases.
 * Targets sustainable fat loss with muscle preservation focus.
 */
export const DEFAULT_FAT_LOSS_CRITERIA: FatLossFilterCriteria = {
  maxCaloriesPer100g: 125, // Low calorie density for volume eating
  minSatietyScore: 60, // High satiety for hunger control
  preferHighVolume: true, // Volume advantage for fullness
  targetDeficit: 500, // Sustainable 1 lb/week fat loss
};

/**
 * Default budget filter criteria optimized for Ali's Dutch market shopping.
 * Focuses on protein efficiency with reasonable price thresholds.
 */
export const DEFAULT_BUDGET_CRITERIA: BudgetFilterCriteria = {
  maxPricePerUnit: 3.0, // €3.00 per 100g/100ml max
  optimizeProteinPerEuro: true, // Protein efficiency focus
  maxTotalBudget: 50, // €50 weekly budget
  preferredStores: ['AH', 'Jumbo'], // Major Dutch chains
};

/**
 * Default context filter criteria for Ali's training day optimization.
 * Uses documented training day targets with general meal timing.
 */
export const DEFAULT_CONTEXT_CRITERIA: ContextFilterCriteria = {
  isTrainingDay: true, // Training day default
  targetCalories: 2000, // Training day calories
  targetCarbs: 220, // Training day carbs
  mealTiming: 'general', // General meal timing
  avoidCombinations: ['tuna+rice', 'honey'], // Ali's documented preferences
};

/**
 * Validates E-number format for additive whitelist.
 * E-numbers must follow the pattern: E followed by digits.
 *
 * @param eNumber - The E-number to validate
 * @returns true if valid E-number format
 */
export function isValidENumber(eNumber: string): boolean {
  const eNumberPattern = /^E\d+$/;
  return eNumberPattern.test(eNumber);
}

/**
 * Type guard to check if a value is a valid HalalFilterCriteria
 */
export function isHalalFilterCriteria(value: unknown): value is HalalFilterCriteria {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.strict === 'boolean' &&
    (obj.excludeAlcohol === undefined || typeof obj.excludeAlcohol === 'boolean') &&
    (obj.excludeGelatine === undefined || typeof obj.excludeGelatine === 'boolean') &&
    (obj.additiveWhitelist === undefined || Array.isArray(obj.additiveWhitelist))
  );
}

/**
 * Validates halal filter criteria with comprehensive error checking.
 *
 * @param criteria - The halal filter criteria to validate
 * @returns ValidationResult with success status and error messages
 *
 * @example
 * ```typescript
 * const result = validateHalalFilterCriteria({
 *   strict: true,
 *   additiveWhitelist: ['E300', 'INVALID']
 * });
 *
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateHalalFilterCriteria(criteria: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if criteria is an object
  if (!criteria || typeof criteria !== 'object') {
    return {
      isValid: false,
      errors: ['Halal filter criteria must be an object'],
    };
  }

  const obj = criteria as Record<string, unknown>;

  // Validate strict field
  if (typeof obj.strict !== 'boolean') {
    errors.push('strict field must be a boolean value');
  }

  // Validate excludeAlcohol field (optional)
  if (obj.excludeAlcohol !== undefined && typeof obj.excludeAlcohol !== 'boolean') {
    errors.push('excludeAlcohol field must be a boolean value when provided');
  }

  // Validate excludeGelatine field (optional)
  if (obj.excludeGelatine !== undefined && typeof obj.excludeGelatine !== 'boolean') {
    errors.push('excludeGelatine field must be a boolean value when provided');
  }

  // Validate additiveWhitelist field (optional)
  if (obj.additiveWhitelist !== undefined) {
    if (!Array.isArray(obj.additiveWhitelist)) {
      errors.push('additiveWhitelist must be an array when provided');
    } else {
      // Validate each E-number in the whitelist
      const invalidENumbers = obj.additiveWhitelist.filter((item: unknown) => {
        return typeof item !== 'string' || !isValidENumber(item);
      });

      if (invalidENumbers.length > 0) {
        errors.push(
          `Invalid E-numbers in additiveWhitelist: ${invalidENumbers.join(', ')}. ` +
            'E-numbers must follow the format "E" followed by digits (e.g., E300, E330)',
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates default halal filter criteria for Ali's requirements.
 *
 * @param overrides - Optional overrides for specific requirements
 * @returns Complete HalalFilterCriteria with Ali's defaults
 *
 * @example
 * ```typescript
 * // Use Ali's defaults
 * const criteria = createAliHalalDefaults();
 *
 * // Override for less strict requirements
 * const lessStrict = createAliHalalDefaults({
 *   strict: false,
 *   excludeAlcohol: false
 * });
 * ```
 */
export function createAliHalalDefaults(
  overrides: Partial<HalalFilterCriteria> = {},
): HalalFilterCriteria {
  return {
    ...DEFAULT_HALAL_CRITERIA,
    ...overrides,
  };
}

export function createAliProteinDefaults(
  overrides: Partial<ProteinFilterCriteria> = {},
): ProteinFilterCriteria {
  return {
    ...DEFAULT_PROTEIN_CRITERIA,
    ...overrides,
  };
}

export function createAliPostWorkoutDefaults(
  overrides: Partial<PostWorkoutFilterCriteria> = {},
): PostWorkoutFilterCriteria {
  return {
    ...DEFAULT_POST_WORKOUT_CRITERIA,
    ...overrides,
  };
}

export function createAliFatLossDefaults(
  overrides: Partial<FatLossFilterCriteria> = {},
): FatLossFilterCriteria {
  return {
    ...DEFAULT_FAT_LOSS_CRITERIA,
    ...overrides,
  };
}

export function createAliBudgetDefaults(
  overrides: Partial<BudgetFilterCriteria> = {},
): BudgetFilterCriteria {
  return {
    ...DEFAULT_BUDGET_CRITERIA,
    ...overrides,
  };
}

export function createAliContextDefaults(
  overrides: Partial<ContextFilterCriteria> = {},
): ContextFilterCriteria {
  return {
    ...DEFAULT_CONTEXT_CRITERIA,
    ...overrides,
  };
}

/**
 * Error class for halal filter criteria validation failures
 */
export class HalalFilterValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[], message?: string) {
    super(message || `Halal filter validation failed: ${errors.join(', ')}`);
    this.name = 'HalalFilterValidationError';
    this.errors = errors;
  }
}

/**
 * Validates and throws on invalid halal filter criteria.
 * Convenience function for scenarios requiring strict validation.
 *
 * @param criteria - The criteria to validate
 * @throws HalalFilterValidationError if validation fails
 *
 * @example
 * ```typescript
 * try {
 *   validateHalalFilterCriteriaOrThrow(userCriteria);
 *   // Safe to use criteria
 * } catch (error) {
 *   if (error instanceof HalalFilterValidationError) {
 *     console.error('Invalid criteria:', error.errors);
 *   }
 * }
 * ```
 */
export function validateHalalFilterCriteriaOrThrow(
  criteria: unknown,
): asserts criteria is HalalFilterCriteria {
  const result = validateHalalFilterCriteria(criteria);
  if (!result.isValid) {
    throw new HalalFilterValidationError(result.errors);
  }
}

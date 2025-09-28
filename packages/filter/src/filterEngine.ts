/**
 * Core filtering engine for Ali's health optimization system.
 *
 * Provides functional composition-based filtering with boolean AND logic across multiple criteria.
 * Integrates with existing Product scoring data for consistent filtering behavior.
 */




import type { Product } from "@picklist/types";
// Types are sourced from @picklist/types package central definitions
import type {
  FilterCriteria,
  FilteredProduct,
  FilterMatchIndicators,
  FilterFunction,
  BudgetFilterCriteria,
  ContextFilterCriteria,
  FatLossFilterCriteria,
  HalalFilterCriteria,
  PostWorkoutFilterCriteria,
  ProteinFilterCriteria,
  ValidationResult,
} from '@picklist/types';
import { validateHalalFilterCriteria, createAliHalalDefaults, createAliProteinDefaults, createAliPostWorkoutDefaults, createAliFatLossDefaults, createAliBudgetDefaults, createAliContextDefaults } from "./filterCriteria.ts";

/**
 * Creates a halal compliance filter using existing halalCheck data.
 *
 * @param criteria - Halal filter criteria
 * @returns Filter function for halal compliance
 */
function createHalalFilter(criteria: HalalFilterCriteria): FilterFunction {
  return (product: Product) => {
    const halalData = product.halalCheck;
    if (!halalData) return false;

    // Strict mode requires explicit halal status
    if (criteria.strict && halalData.status !== 'halal') {
      return false;
    }

    // Alcohol exclusion
    if (criteria.excludeAlcohol && halalData.flags?.hasAlcohol) {
      return false;
    }

    // Gelatine exclusion
    if (criteria.excludeGelatine && halalData.flags?.hasAnimalGelatine) {
      return false;
    }

    // Additive whitelist checking
    if (criteria.additiveWhitelist && product.additiveInfo?.eNumbers) {
      const productENumbers = new Set(product.additiveInfo.eNumbers);
      const allowedENumbers = new Set(criteria.additiveWhitelist);

      // Check if any product E-numbers are not in the whitelist
      for (const eNumber of productENumbers) {
        if (!allowedENumbers.has(eNumber)) {
          return false;
        }
      }
    }

    return true;
  };
}

/**
 * Creates a protein optimization filter using existing proteinOptimization data.
 *
 * @param criteria - Protein filter criteria
 * @returns Filter function for protein requirements
 */
function createProteinFilter(criteria: ProteinFilterCriteria): FilterFunction {
  return (product: Product) => {
    const proteinData = product.proteinOptimization;
    if (!proteinData) return false;

    // Minimum protein per 100g
    if (proteinData.proteinContribution < criteria.minProteinPer100g) {
      return false;
    }

    // Minimum efficiency score
    if (
      criteria.minEfficiencyScore &&
      proteinData.proteinDensityScore < criteria.minEfficiencyScore
    ) {
      return false;
    }

    // Preferred source categories
    if (criteria.preferredSources && product.categories) {
      const productCategories = product.categories.map((cat) => cat.toLowerCase());
      const preferredCategories = criteria.preferredSources.map((cat) => cat.toLowerCase());

      const hasPreferredCategory = preferredCategories.some((preferred) =>
        productCategories.some((productCat) => productCat.includes(preferred)),
      );

      if (!hasPreferredCategory) {
        return false;
      }
    }

    return true;
  };
}

/**
 * Creates a post-workout recovery filter using existing postWorkoutOptimization data.
 *
 * @param criteria - Post-workout filter criteria
 * @returns Filter function for post-workout requirements
 */
function createPostWorkoutFilter(criteria: PostWorkoutFilterCriteria): FilterFunction {
  return (product: Product) => {
    const postWorkoutData = product.postWorkoutOptimization;
    if (!postWorkoutData) return false;

    // Carb:protein ratio range
    const ratio = postWorkoutData.carbProteinRatio;
    if (ratio < criteria.minCarbProteinRatio || ratio > criteria.maxCarbProteinRatio) {
      return false;
    }

    // High GI preference (simplified - uses glycemicBoost as proxy)
    if (criteria.preferHighGI && postWorkoutData.glycemicBoost < 1.2) {
      return false;
    }

    // Recovery window matching
    if (postWorkoutData.recoveryWindow !== criteria.recoveryWindow) {
      return false;
    }

    return true;
  };
}

/**
 * Creates a fat loss compatibility filter using existing fatLossCompatibility data.
 *
 * @param criteria - Fat loss filter criteria
 * @returns Filter function for fat loss requirements
 */
function createFatLossFilter(criteria: FatLossFilterCriteria): FilterFunction {
  return (product: Product) => {
    const fatLossData = product.fatLossCompatibility;
    if (!fatLossData) return false;

    // Maximum calorie density
    if (fatLossData.calorieDensity > criteria.maxCaloriesPer100g) {
      return false;
    }

    // Minimum satiety score (using satietyEfficiency as proxy)
    if (criteria.minSatietyScore && fatLossData.satietyEfficiency < criteria.minSatietyScore) {
      return false;
    }

    // High volume preference
    if (criteria.preferHighVolume && !fatLossData.volumeAdvantage) {
      return false;
    }

    return true;
  };
}

/**
 * Creates a budget optimization filter using price and protein efficiency data.
 *
 * @param criteria - Budget filter criteria
 * @returns Filter function for budget requirements
 */
function createBudgetFilter(criteria: BudgetFilterCriteria): FilterFunction {
  return (product: Product) => {
    const price = product.price?.regular;
    if (!price) return false;

    // Maximum price per unit
    if (criteria.maxPricePerUnit && price > criteria.maxPricePerUnit) {
      return false;
    }

    // Protein per euro optimization (requires protein data)
    if (criteria.optimizeProteinPerEuro) {
      const proteinData = product.proteinOptimization;
      if (!proteinData || proteinData.proteinContribution === 0) {
        return false;
      }

      // Calculate protein per euro (simplified metric)
      const proteinPerEuro = proteinData.proteinContribution / price;
      if (proteinPerEuro < 5) {
        // Minimum 5g protein per euro threshold
        return false;
      }
    }

    // Preferred stores (simplified - could integrate with store data)
    // For now, we'll assume all products pass this check
    // TODO: Integrate with actual store/brand data when available

    return true;
  };
}

/**
 * Creates a context-aware filter for training/rest day scenarios.
 *
 * @param criteria - Context filter criteria
 * @returns Filter function for context requirements
 */
function createContextFilter(criteria: ContextFilterCriteria): FilterFunction {
  return (product: Product) => {
    // Meal timing context (simplified implementation)
    if (criteria.mealTiming === 'post_workout') {
      // Require post-workout optimization data
      if (!product.postWorkoutOptimization) {
        return false;
      }
    } else if (criteria.mealTiming === 'pre_workout') {
      // Prefer higher carb products for energy
      const nutrition = product.nutrition;
      if (!nutrition?.carbs || nutrition.carbs < 10) {
        return false;
      }
    }

    // Avoid combinations
    if (criteria.avoidCombinations) {
      const productName = product.name.toLowerCase();
      const ingredients = product.ingredients?.join(' ').toLowerCase() || '';

      for (const avoidCombo of criteria.avoidCombinations) {
        const combo = avoidCombo.toLowerCase();

        // Handle specific combinations like "tuna+rice"
        if (combo.includes('+')) {
          const [item1, item2] = combo.split('+');
          if (
            (productName.includes(item1) || ingredients.includes(item1)) &&
            (productName.includes(item2) || ingredients.includes(item2))
          ) {
            return false;
          }
        } else {
          // Handle single items like "honey"
          if (productName.includes(combo) || ingredients.includes(combo)) {
            return false;
          }
        }
      }
    }

    return true;
  };
}

/**
 * Primary filtering function that applies all criteria with boolean AND logic.
 *
 * @param products - Array of products with existing scoring data
 * @param criteria - Filter criteria configuration
 * @returns Filtered products matching ALL specified criteria
 *
 * @example
 * ```typescript
 * const criteria: FilterCriteria = {
 *   halal: { strict: true, excludeAlcohol: true, excludeGelatine: true },
 *   protein: { minProteinPer100g: 20, targetDailyAmount: 170 }
 * };
 *
 * const filtered = createFilter(products, criteria);
 * // Returns only products that are both halal AND high-protein
 * ```
 */
export function createFilter(products: Product[], criteria: FilterCriteria): FilteredProduct[] {
  const validation = validateFilterCriteriaWithResult(criteria);
  if (!validation.isValid) {
    throw new FilterEngineError('Filter criteria validation failed', new Error(validation.errors.join('; ')));
  }

  // Build filter functions using functional composition
  const filters: Array<{
    name: keyof FilterMatchIndicators;
    filterFn: FilterFunction;
  }> = [];

  if (criteria.halal) {
    filters.push({
      name: 'halal',
      filterFn: createHalalFilter(criteria.halal),
    });
  }

  if (criteria.protein) {
    filters.push({
      name: 'protein',
      filterFn: createProteinFilter(criteria.protein),
    });
  }

  if (criteria.postWorkout) {
    filters.push({
      name: 'postWorkout',
      filterFn: createPostWorkoutFilter(criteria.postWorkout),
    });
  }

  if (criteria.fatLoss) {
    filters.push({
      name: 'fatLoss',
      filterFn: createFatLossFilter(criteria.fatLoss),
    });
  }

  if (criteria.budget) {
    filters.push({
      name: 'budget',
      filterFn: createBudgetFilter(criteria.budget),
    });
  }

  if (criteria.context) {
    filters.push({
      name: 'context',
      filterFn: createContextFilter(criteria.context),
    });
  }

  // Apply filters with boolean AND logic
  const filteredProducts: FilteredProduct[] = [];

  for (const product of products) {
    const filterMatch: FilterMatchIndicators = {};
    let passesAllFilters = true;

    // Test each filter and track results
    for (const { name, filterFn } of filters) {
      const passes = filterFn(product);
      filterMatch[name] = passes;

      if (!passes) {
        passesAllFilters = false;
        break; // Early exit on first failure (boolean AND)
      }
    }

    // Only include products that pass ALL filters
    if (passesAllFilters) {
      const filteredProduct: FilteredProduct = {
        ...product,
        filterMatch,
      };

      // Add optional filter score (simple average of available scores)
      const scores = [
        product.proteinOptimization?.proteinDensityScore,
        product.postWorkoutOptimization?.postWorkoutScore,
        product.fatLossCompatibility?.fatLossScore,
        product.enhancedCalorieEfficiency?.efficiencyScore,
      ].filter((score): score is number => typeof score === 'number');

      if (scores.length > 0) {
        filteredProduct.filterScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }

      filteredProducts.push(filteredProduct);
    }
  }

  return filteredProducts;
}

/**
 * Validates protein filter criteria.
 */
function validateProteinCriteria(criteria: ProteinFilterCriteria): string[] {
  const errors: string[] = [];

  if (criteria.minProteinPer100g <= 0 || criteria.minProteinPer100g > 100) {
    errors.push('minProteinPer100g must be between 0 and 100');
  }

  if (criteria.minEfficiencyScore !== undefined && (criteria.minEfficiencyScore < 0 || criteria.minEfficiencyScore > 100)) {
    errors.push('minEfficiencyScore must be between 0 and 100');
  }

  if (criteria.targetDailyAmount <= 0) {
    errors.push('targetDailyAmount must be greater than 0');
  }

  return errors;
}

/**
 * Validates post-workout filter criteria.
 */
function validatePostWorkoutCriteria(criteria: PostWorkoutFilterCriteria): string[] {
  const errors: string[] = [];

  if (criteria.minCarbProteinRatio <= 0) {
    errors.push('minCarbProteinRatio must be greater than 0');
  }

  if (criteria.maxCarbProteinRatio <= 0) {
    errors.push('maxCarbProteinRatio must be greater than 0');
  }

  if (criteria.maxCarbProteinRatio <= criteria.minCarbProteinRatio) {
    errors.push('maxCarbProteinRatio must be greater than minCarbProteinRatio');
  }

  const validRecoveryWindows = ['immediate', 'moderate', 'extended'];
  if (!validRecoveryWindows.includes(criteria.recoveryWindow)) {
    errors.push(`recoveryWindow must be one of: ${validRecoveryWindows.join(', ')}`);
  }

  return errors;
}

/**
 * Validates fat loss filter criteria.
 */
function validateFatLossCriteria(criteria: FatLossFilterCriteria): string[] {
  const errors: string[] = [];

  if (criteria.maxCaloriesPer100g <= 0) {
    errors.push('maxCaloriesPer100g must be greater than 0');
  }

  if (criteria.minSatietyScore !== undefined && (criteria.minSatietyScore < 0 || criteria.minSatietyScore > 100)) {
    errors.push('minSatietyScore must be between 0 and 100');
  }

  if (criteria.targetDeficit !== undefined && criteria.targetDeficit <= 0) {
    errors.push('targetDeficit must be greater than 0');
  }

  return errors;
}

/**
 * Validates budget filter criteria.
 */
function validateBudgetCriteria(criteria: BudgetFilterCriteria): string[] {
  const errors: string[] = [];

  if (criteria.maxPricePerUnit !== undefined && criteria.maxPricePerUnit <= 0) {
    errors.push('maxPricePerUnit must be greater than 0');
  }

  if (criteria.maxTotalBudget !== undefined && criteria.maxTotalBudget <= 0) {
    errors.push('maxTotalBudget must be greater than 0');
  }

  return errors;
}

/**
 * Validates context filter criteria.
 */
function validateContextCriteria(criteria: ContextFilterCriteria): string[] {
  const errors: string[] = [];

  if (criteria.targetCalories <= 0) {
    errors.push('targetCalories must be greater than 0');
  }

  if (criteria.targetCarbs < 0) {
    errors.push('targetCarbs must be non-negative');
  }

  const validMealTimings = ['pre_workout', 'post_workout', 'general'];
  if (criteria.mealTiming && !validMealTimings.includes(criteria.mealTiming)) {
    errors.push(`mealTiming must be one of: ${validMealTimings.join(', ')}`);
  }

  return errors;
}

/**
 * Validates filter criteria and throws on errors for use in tests and strict validation.
 *
 * @param criteria - Filter criteria to validate
 * @throws Error if criteria are invalid
 */
export function validateFilterCriteria(criteria: FilterCriteria): void {
  const result = validateFilterCriteriaWithResult(criteria);
  if (!result.isValid) {
    throw new FilterEngineError('Filter criteria validation failed', new Error(result.errors.join('; ')));
  }
}

/**
 * Validates filter criteria against business rules and type constraints.
 * Returns a ValidationResult object instead of throwing to support
 * both proactive validation and throw-on-use patterns.
 *
 * @param criteria - Filter criteria to validate
 * @returns ValidationResult containing aggregated errors (if any)
 *
 * @example
 * ```typescript
 * const result = validateFilterCriteriaWithResult(criteria);
 * if (!result.isValid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateFilterCriteriaWithResult(criteria: FilterCriteria): ValidationResult {
  const errors: string[] = [];

  // Validate each criteria type if present
  if (criteria.halal) {
    const result = validateHalalFilterCriteria(criteria.halal);
    if (!result.isValid) {
      errors.push(`Halal criteria: ${result.errors.join(', ')}`);
    }
  }

  if (criteria.protein) {
    const proteinErrors = validateProteinCriteria(criteria.protein);
    if (proteinErrors.length > 0) {
      errors.push(`Protein criteria: ${proteinErrors.join(', ')}`);
    }
  }

  if (criteria.postWorkout) {
    const postWorkoutErrors = validatePostWorkoutCriteria(criteria.postWorkout);
    if (postWorkoutErrors.length > 0) {
      errors.push(`Post-workout criteria: ${postWorkoutErrors.join(', ')}`);
    }
  }

  if (criteria.fatLoss) {
    const fatLossErrors = validateFatLossCriteria(criteria.fatLoss);
    if (fatLossErrors.length > 0) {
      errors.push(`Fat loss criteria: ${fatLossErrors.join(', ')}`);
    }
  }

  if (criteria.budget) {
    const budgetErrors = validateBudgetCriteria(criteria.budget);
    if (budgetErrors.length > 0) {
      errors.push(`Budget criteria: ${budgetErrors.join(', ')}`);
    }
  }

  if (criteria.context) {
    const contextErrors = validateContextCriteria(criteria.context);
    if (contextErrors.length > 0) {
      errors.push(`Context criteria: ${contextErrors.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates default filter criteria optimized for Ali's specific needs.
 *
 * @param options - Optional overrides for specific criteria
 * @returns Complete FilterCriteria with Ali's preferences
 *
 * @example
 * ```typescript
 * // Use Ali's defaults
 * const criteria = createAliDefaults();
 *
 * // Override for specific scenarios
 * const cuttingCriteria = createAliDefaults({
 *   fatLoss: { maxCaloriesPer100g: 100, minSatietyScore: 70 }
 * });
 * ```
 */
export function createAliDefaults(options: Partial<FilterCriteria> = {}): FilterCriteria {
  return {
    halal: createAliHalalDefaults(options.halal),
    protein: createAliProteinDefaults(options.protein),
    postWorkout: createAliPostWorkoutDefaults(options.postWorkout),
    fatLoss: createAliFatLossDefaults(options.fatLoss),
    budget: createAliBudgetDefaults(options.budget),
    context: createAliContextDefaults(options.context),
    ...options,
  };
}

/**
 * Error class for filter engine validation and processing failures.
 */
export class FilterEngineError extends Error {
  readonly cause?: Error;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'FilterEngineError';
    this.cause = cause;
  }
}

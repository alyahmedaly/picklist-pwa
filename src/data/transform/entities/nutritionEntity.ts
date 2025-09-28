/**
 * ProductNutrition Entity Implementation
 * Feature: 019-flexible-database-schema
 *
 * Handles nutritional data normalization from monolithic product structure
 * to flexible schema with validation and business rule enforcement.
 */

import type { Product } from '@picklist/types';
import type { FlexibleProductNutrition } from '../types';

/**
 * Normalizes nutrition data from monolithic Product to FlexibleProductNutrition
 */
export function normalizeNutritionEntity(product: Product): FlexibleProductNutrition | null {
  if (!product.nutrition) {
    return null;
  }

  const nutrition = product.nutrition;

  // Helper function to safely round nutrition values
  const roundNutrition = (value: number | undefined): number | undefined => {
    return (value !== undefined && value > 0) ? Math.round(value * 10) / 10 : undefined;
  };

  // Calculate kJ from kcal if kJ is not available
  let calculatedKj: number | undefined;
  if (nutrition.kJ !== undefined && nutrition.kJ > 0) {
    calculatedKj = nutrition.kJ;
  } else if (nutrition.kcal !== undefined && nutrition.kcal > 0) {
    calculatedKj = nutrition.kcal * 4.184; // 1 kcal = 4.184 kJ
  }

  // Calculate sodium from salt if not available (salt contains sodium)
  let calculatedSodium: number | undefined;
  if (nutrition.salt !== undefined && nutrition.salt > 0) {
    calculatedSodium = (nutrition.salt / 2.5) * 1000; // Convert to mg (salt = sodium * 2.5)
  }

  // Build nutrition entity with all fields (using undefined for missing values)
  const flexibleNutrition: FlexibleProductNutrition = {
    product_id: product.id,
    kcal: roundNutrition(nutrition.kcal),
    kj: roundNutrition(calculatedKj),
    protein: roundNutrition(nutrition.protein),
    carbs: roundNutrition(nutrition.carbs),
    sugars: roundNutrition(nutrition.sugars),
    fat: roundNutrition(nutrition.fat),
    saturated_fat: roundNutrition(nutrition.satFat), // Note: property is satFat not saturatedFat
    fiber: roundNutrition(nutrition.fiber),
    salt: roundNutrition(nutrition.salt),
    sodium: roundNutrition(calculatedSodium)
  };

  // Only return if we have at least one nutrition value
  const hasNutritionData = Object.keys(flexibleNutrition).length > 1; // More than just product_id
  return hasNutritionData ? flexibleNutrition : null;
}

/**
 * Validates nutrition entity against business rules
 */
export function validateNutritionEntity(nutrition: FlexibleProductNutrition): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!nutrition.product_id || nutrition.product_id.trim() === '') {
    errors.push('Product ID is required');
  }

  // Range validation for each nutrient (per 100g values)
  if (nutrition.kcal !== undefined) {
    if (nutrition.kcal < 0 || nutrition.kcal > 1000) {
      errors.push('Calories must be between 0 and 1000 per 100g');
    }
  }

  if (nutrition.kj !== undefined) {
    if (nutrition.kj < 0 || nutrition.kj > 5000) {
      errors.push('Kilojoules must be between 0 and 5000 per 100g');
    }
  }

  if (nutrition.protein !== undefined) {
    if (nutrition.protein < 0 || nutrition.protein > 100) {
      errors.push('Protein must be between 0 and 100g per 100g');
    }
  }

  if (nutrition.carbs !== undefined) {
    if (nutrition.carbs < 0 || nutrition.carbs > 100) {
      errors.push('Carbohydrates must be between 0 and 100g per 100g');
    }
  }

  if (nutrition.sugars !== undefined) {
    if (nutrition.sugars < 0 || nutrition.sugars > 100) {
      errors.push('Sugars must be between 0 and 100g per 100g');
    }
  }

  if (nutrition.fat !== undefined) {
    if (nutrition.fat < 0 || nutrition.fat > 100) {
      errors.push('Fat must be between 0 and 100g per 100g');
    }
  }

  if (nutrition.saturated_fat !== undefined) {
    if (nutrition.saturated_fat < 0 || nutrition.saturated_fat > 100) {
      errors.push('Saturated fat must be between 0 and 100g per 100g');
    }
  }

  if (nutrition.fiber !== undefined) {
    if (nutrition.fiber < 0 || nutrition.fiber > 100) {
      errors.push('Fiber must be between 0 and 100g per 100g');
    }
  }

  if (nutrition.salt !== undefined) {
    if (nutrition.salt < 0 || nutrition.salt > 50) {
      errors.push('Salt must be between 0 and 50g per 100g');
    }
  }

  if (nutrition.sodium !== undefined) {
    if (nutrition.sodium < 0 || nutrition.sodium > 20000) {
      errors.push('Sodium must be between 0 and 20000mg per 100g');
    }
  }

  // Business logic constraints
  if (nutrition.sugars !== undefined && nutrition.carbs !== undefined) {
    if (nutrition.sugars > nutrition.carbs) {
      errors.push('Sugars cannot exceed total carbohydrates');
    }
  }

  if (nutrition.saturated_fat !== undefined && nutrition.fat !== undefined) {
    if (nutrition.saturated_fat > nutrition.fat) {
      errors.push('Saturated fat cannot exceed total fat');
    }
  }

  // Energy consistency check (approximate)
  if (nutrition.kcal !== undefined && nutrition.protein !== undefined &&
      nutrition.carbs !== undefined && nutrition.fat !== undefined) {
    const calculatedKcal = (nutrition.protein * 4) + (nutrition.carbs * 4) + (nutrition.fat * 9);
    const tolerance = Math.max(20, calculatedKcal * 0.2); // 20% tolerance or min 20 kcal

    if (Math.abs(nutrition.kcal - calculatedKcal) > tolerance) {
      errors.push(`Energy values inconsistent: declared ${nutrition.kcal}kcal vs calculated ${Math.round(calculatedKcal)}kcal`);
    }
  }

  return errors;
}

/**
 * Batch normalizes nutrition data for multiple products
 */
export function normalizeNutritionEntities(products: Product[]): {
  nutritionData: FlexibleProductNutrition[];
  errors: Array<{ productId: string; errors: string[] }>;
} {
  const nutritionData: FlexibleProductNutrition[] = [];
  const errors: Array<{ productId: string; errors: string[] }> = [];

  for (const product of products) {
    try {
      const normalized = normalizeNutritionEntity(product);

      if (normalized) {
        const validationErrors = validateNutritionEntity(normalized);

        if (validationErrors.length > 0) {
          errors.push({
            productId: product.id,
            errors: validationErrors
          });
        } else {
          nutritionData.push(normalized);
        }
      }
      // If normalized is null, product has no nutrition data - this is okay
    } catch (error) {
      errors.push({
        productId: product.id || 'unknown',
        errors: [`Failed to normalize nutrition: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  return {
    nutritionData,
    errors
  };
}

/**
 * Calculates derived nutrition metrics
 */
export function calculateNutritionMetrics(nutrition: FlexibleProductNutrition): {
  proteinPercentage?: number;
  carbsPercentage?: number;
  fatPercentage?: number;
  proteinCarbRatio?: number;
  caloriesPerGram?: number;
  proteinEfficiency?: number;
} {
  const metrics: ReturnType<typeof calculateNutritionMetrics> = {};

  if (nutrition.kcal && nutrition.kcal > 0) {
    // Calculate macronutrient percentages of total calories
    if (nutrition.protein !== undefined) {
      metrics.proteinPercentage = Math.round((nutrition.protein * 4 / nutrition.kcal) * 100 * 10) / 10;
    }

    if (nutrition.carbs !== undefined) {
      metrics.carbsPercentage = Math.round((nutrition.carbs * 4 / nutrition.kcal) * 100 * 10) / 10;
    }

    if (nutrition.fat !== undefined) {
      metrics.fatPercentage = Math.round((nutrition.fat * 9 / nutrition.kcal) * 100 * 10) / 10;
    }

    // Calories per gram (useful for volume-based foods)
    metrics.caloriesPerGram = Math.round(nutrition.kcal / 100 * 100) / 100;
  }

  // Protein to carb ratio (useful for fitness contexts)
  if (nutrition.protein !== undefined && nutrition.carbs !== undefined && nutrition.carbs > 0) {
    metrics.proteinCarbRatio = Math.round((nutrition.protein / nutrition.carbs) * 100) / 100;
  }

  // Protein efficiency (protein per calorie)
  if (nutrition.protein !== undefined && nutrition.kcal !== undefined && nutrition.kcal > 0) {
    metrics.proteinEfficiency = Math.round((nutrition.protein / nutrition.kcal) * 1000) / 10; // protein per 100 kcal
  }

  return metrics;
}

/**
 * Checks if nutrition data meets specific dietary criteria
 */
export function checkNutritionCriteria(nutrition: FlexibleProductNutrition, criteria: {
  minProtein?: number;
  maxCarbs?: number;
  maxFat?: number;
  maxKcal?: number;
  minFiber?: number;
  maxSugars?: number;
  maxSalt?: number;
}): { meets: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (criteria.minProtein !== undefined && (nutrition.protein === undefined || nutrition.protein < criteria.minProtein)) {
    reasons.push(`Protein too low: ${nutrition.protein || 0}g < ${criteria.minProtein}g required`);
  }

  if (criteria.maxCarbs !== undefined && nutrition.carbs !== undefined && nutrition.carbs > criteria.maxCarbs) {
    reasons.push(`Carbs too high: ${nutrition.carbs}g > ${criteria.maxCarbs}g limit`);
  }

  if (criteria.maxFat !== undefined && nutrition.fat !== undefined && nutrition.fat > criteria.maxFat) {
    reasons.push(`Fat too high: ${nutrition.fat}g > ${criteria.maxFat}g limit`);
  }

  if (criteria.maxKcal !== undefined && nutrition.kcal !== undefined && nutrition.kcal > criteria.maxKcal) {
    reasons.push(`Calories too high: ${nutrition.kcal}kcal > ${criteria.maxKcal}kcal limit`);
  }

  if (criteria.minFiber !== undefined && (nutrition.fiber === undefined || nutrition.fiber < criteria.minFiber)) {
    reasons.push(`Fiber too low: ${nutrition.fiber || 0}g < ${criteria.minFiber}g required`);
  }

  if (criteria.maxSugars !== undefined && nutrition.sugars !== undefined && nutrition.sugars > criteria.maxSugars) {
    reasons.push(`Sugars too high: ${nutrition.sugars}g > ${criteria.maxSugars}g limit`);
  }

  if (criteria.maxSalt !== undefined && nutrition.salt !== undefined && nutrition.salt > criteria.maxSalt) {
    reasons.push(`Salt too high: ${nutrition.salt}g > ${criteria.maxSalt}g limit`);
  }

  return {
    meets: reasons.length === 0,
    reasons
  };
}

/**
 * Creates a test nutrition entity
 */
export function createTestNutritionEntity(overrides: Partial<FlexibleProductNutrition> = {}): FlexibleProductNutrition {
  const defaultNutrition: FlexibleProductNutrition = {
    product_id: 'test-product-001',
    kcal: 250,
    protein: 12.5,
    carbs: 30.0,
    fat: 8.5
  };

  return { ...defaultNutrition, ...overrides };
}
/**
 * Portion-Aware Filtering Utilities
 *
 * Provides realistic serving size calculations and portion-aware filtering for Ali's nutrition goals.
 * Converts per-100g nutrition data to realistic serving sizes and calculates daily target contributions.
 */

import type { Product } from '@picklist/types';

/**
 * Standard serving size mappings for common food categories.
 * Based on realistic portion sizes Ali would consume.
 */
export const CATEGORY_SERVING_SIZES: Record<string, { size: number; unit: string }> = {
  // Dairy and alternatives
  'yogurt': { size: 150, unit: 'g' },
  'yoghurt': { size: 150, unit: 'g' },
  'milk': { size: 250, unit: 'ml' },
  'cheese': { size: 30, unit: 'g' },
  'kwark': { size: 200, unit: 'g' }, // Dutch quark/cottage cheese

  // Proteins
  'chicken': { size: 150, unit: 'g' },
  'beef': { size: 120, unit: 'g' },
  'fish': { size: 125, unit: 'g' },
  'tuna': { size: 100, unit: 'g' }, // Canned portion
  'salmon': { size: 125, unit: 'g' },
  'eggs': { size: 60, unit: 'g' }, // Per egg
  'egg': { size: 60, unit: 'g' },

  // Nuts and seeds
  'nuts': { size: 15, unit: 'g' }, // Small handful
  'almonds': { size: 15, unit: 'g' },
  'peanuts': { size: 15, unit: 'g' },
  'seeds': { size: 10, unit: 'g' },

  // Grains and carbs
  'rice': { size: 75, unit: 'g' }, // Dry weight
  'pasta': { size: 75, unit: 'g' }, // Dry weight
  'oats': { size: 50, unit: 'g' }, // Dry weight
  'bread': { size: 30, unit: 'g' }, // Per slice
  'potato': { size: 200, unit: 'g' }, // Ali's preferred carb
  'potatoes': { size: 200, unit: 'g' },

  // Fruits
  'banana': { size: 120, unit: 'g' },
  'apple': { size: 150, unit: 'g' },
  'berries': { size: 100, unit: 'g' },

  // Vegetables
  'vegetables': { size: 200, unit: 'g' },
  'spinach': { size: 200, unit: 'g' },
  'broccoli': { size: 200, unit: 'g' },

  // Default fallback
  'default': { size: 100, unit: 'g' },
};

/**
 * Portion recommendation for a product including serving size and nutritional contribution.
 */
export interface PortionRecommendation {
  /** Recommended serving size */
  servingSize: number;
  /** Unit for serving size (g, ml, etc.) */
  servingUnit: string;
  /** Macros per serving */
  macrosPerServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  /** Cost per serving if price available */
  costPerServing?: number;
  /** Percentage of daily protein target this serving provides */
  proteinContribution: number;
  /** Percentage of daily calorie target this serving provides */
  calorieContribution: number;
  /** Number of servings needed to meet daily protein target from this food alone */
  servingsForProteinTarget: number;
}

/**
 * Daily nutrition targets for Ali's goals.
 */
export interface DailyTargets {
  /** Daily calorie target */
  calories: number;
  /** Daily protein target in grams */
  protein: number;
  /** Daily carbs target in grams */
  carbs: number;
  /** Daily fat target in grams */
  fat: number;
}

/**
 * Default daily targets for Ali based on training vs rest days.
 */
export const ALI_DAILY_TARGETS: {
  training: DailyTargets;
  rest: DailyTargets;
} = {
  training: {
    calories: 2000,
    protein: 170,
    carbs: 220,
    fat: 67, // ~30% of calories
  },
  rest: {
    calories: 1750,
    protein: 170, // Maintain protein on rest days
    carbs: 120,
    fat: 78, // Higher fat % on lower carb days
  },
};

/**
 * Determines appropriate serving size for a product based on its category and characteristics.
 *
 * @param product - Product to analyze
 * @returns Serving size recommendation
 *
 * @example
 * ```typescript
 * const yogurt = { name: 'Greek Yogurt', categories: ['yogurt'] };
 * const serving = determineServingSize(yogurt);
 * // Returns { size: 150, unit: 'g' }
 * ```
 */
export function determineServingSize(product: Product): { size: number; unit: string } {
  // Check categories for specific matches
  if (product.categories && product.categories.length > 0) {
    for (const category of product.categories) {
      const categoryLower = category.toLowerCase();

      // Direct category match
      if (CATEGORY_SERVING_SIZES[categoryLower]) {
        return CATEGORY_SERVING_SIZES[categoryLower];
      }

      // Partial matches for compound categories
      for (const [key, value] of Object.entries(CATEGORY_SERVING_SIZES)) {
        if (categoryLower.includes(key) || key.includes(categoryLower)) {
          return value;
        }
      }
    }
  }

  // Check product name for keywords
  const nameLower = product.name.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_SERVING_SIZES)) {
    if (nameLower.includes(key)) {
      return value;
    }
  }

  // Default serving size
  return CATEGORY_SERVING_SIZES.default;
}

/**
 * Calculates portion recommendation for a product based on realistic serving sizes.
 *
 * @param product - Product with nutrition data
 * @param dailyTargets - Daily nutrition targets (defaults to Ali's training day targets)
 * @returns Complete portion recommendation
 *
 * @example
 * ```typescript
 * const chickenBreast = {
 *   name: 'Chicken Breast',
 *   categories: ['chicken'],
 *   nutrition: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
 *   price: { regular: 1.89, currency: 'EUR' }
 * };
 *
 * const portion = calculatePortionRecommendation(chickenBreast);
 * // Returns serving of 150g = 248 kcal, 46.5g protein, 27% of daily protein target
 * ```
 */
export function calculatePortionRecommendation(
  product: Product,
  dailyTargets: DailyTargets = ALI_DAILY_TARGETS.training
): PortionRecommendation | null {
  // Require basic nutrition data
  const nutrition = product.nutrition;
  if (!nutrition || nutrition.kcal == null || nutrition.protein == null) {
    return null;
  }

  const serving = determineServingSize(product);
  const servingSizePer100g = serving.size / 100;

  // Calculate macros per serving
  const macrosPerServing = {
    calories: Math.round((nutrition.kcal || 0) * servingSizePer100g),
    protein: Math.round((nutrition.protein || 0) * servingSizePer100g * 10) / 10,
    carbs: Math.round((nutrition.carbs || nutrition.carbohydrates || 0) * servingSizePer100g * 10) / 10,
    fat: Math.round((nutrition.fat || 0) * servingSizePer100g * 10) / 10,
  };

  // Calculate cost per serving
  let costPerServing: number | undefined;
  if (product.price?.regular) {
    // Assuming price is per 100g/ml, convert to per serving
    costPerServing = Math.round(product.price.regular * servingSizePer100g * 100) / 100;
  }

  // Calculate daily target contributions
  const proteinContribution = Math.round((macrosPerServing.protein / dailyTargets.protein) * 100);
  const calorieContribution = Math.round((macrosPerServing.calories / dailyTargets.calories) * 100);

  // Calculate servings needed for protein target
  const servingsForProteinTarget = Math.ceil(dailyTargets.protein / macrosPerServing.protein);

  return {
    servingSize: serving.size,
    servingUnit: serving.unit,
    macrosPerServing,
    costPerServing,
    proteinContribution,
    calorieContribution,
    servingsForProteinTarget,
  };
}

/**
 * Adds portion recommendations to products for portion-aware filtering.
 *
 * @param products - Array of products to enhance
 * @param dailyTargets - Daily nutrition targets
 * @returns Products with portion recommendations added
 *
 * @example
 * ```typescript
 * const enhancedProducts = addPortionRecommendations(products, ALI_DAILY_TARGETS.training);
 * // Each product now has a portionRecommendation field
 * ```
 */
export function addPortionRecommendations(
  products: Product[],
  dailyTargets: DailyTargets = ALI_DAILY_TARGETS.training
): Product[] {
  return products.map(product => {
    const portionRecommendation = calculatePortionRecommendation(product, dailyTargets);

    return {
      ...product,
      portionRecommendation,
    };
  });
}

/**
 * Filters products based on portion-aware criteria (e.g., protein per serving, cost per serving).
 *
 * @param products - Products with portion recommendations
 * @param criteria - Portion-aware filtering criteria
 * @returns Filtered products meeting portion criteria
 *
 * @example
 * ```typescript
 * const highProteinServings = filterByPortionCriteria(products, {
 *   minProteinPerServing: 20, // At least 20g protein per serving
 *   maxCostPerServing: 1.50,  // Max €1.50 per serving
 *   minProteinContribution: 10, // At least 10% of daily protein target
 * });
 * ```
 */
export function filterByPortionCriteria(
  products: Product[],
  criteria: {
    minProteinPerServing?: number;
    maxCostPerServing?: number;
    minProteinContribution?: number;
    maxCaloriesPerServing?: number;
    minServingsForTarget?: number;
    maxServingsForTarget?: number;
  }
): Product[] {
  return products.filter(product => {
    const portion = product.portionRecommendation;
    if (!portion) return false;

    // Check protein per serving
    if (criteria.minProteinPerServing != null && portion.macrosPerServing.protein < criteria.minProteinPerServing) {
      return false;
    }

    // Check cost per serving
    if (criteria.maxCostPerServing != null && portion.costPerServing != null && portion.costPerServing > criteria.maxCostPerServing) {
      return false;
    }

    // Check protein contribution
    if (criteria.minProteinContribution != null && portion.proteinContribution < criteria.minProteinContribution) {
      return false;
    }

    // Check calories per serving
    if (criteria.maxCaloriesPerServing != null && portion.macrosPerServing.calories > criteria.maxCaloriesPerServing) {
      return false;
    }

    // Check servings needed for target (efficiency)
    if (criteria.minServingsForTarget != null && portion.servingsForProteinTarget < criteria.minServingsForTarget) {
      return false;
    }

    if (criteria.maxServingsForTarget != null && portion.servingsForProteinTarget > criteria.maxServingsForTarget) {
      return false;
    }

    return true;
  });
}

/**
 * Creates a meal plan recommendation based on protein target and calorie limits.
 *
 * @param products - Available products with portion recommendations
 * @param dailyTargets - Daily nutrition targets
 * @param maxItems - Maximum items in meal plan
 * @returns Optimized meal plan selection
 *
 * @example
 * ```typescript
 * const mealPlan = createMealPlanRecommendation(
 *   filteredProducts,
 *   ALI_DAILY_TARGETS.training,
 *   8 // Max 8 different foods per day
 * );
 * // Returns foods that together meet protein target within calorie limit
 * ```
 */
export function createMealPlanRecommendation(
  products: Product[],
  dailyTargets: DailyTargets = ALI_DAILY_TARGETS.training,
  maxItems: number = 8
): {
  foods: Product[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  totalCost?: number;
  proteinTargetMet: boolean;
} {
  // Filter products with portion recommendations
  const availableProducts = products.filter(p => p.portionRecommendation);

  // Sort by protein efficiency (protein per calorie) and cost efficiency
  const sortedProducts = availableProducts.sort((a, b) => {
    const aEfficiency = a.portionRecommendation!.macrosPerServing.protein / a.portionRecommendation!.macrosPerServing.calories;
    const bEfficiency = b.portionRecommendation!.macrosPerServing.protein / b.portionRecommendation!.macrosPerServing.calories;

    // Secondary sort by cost if both have pricing
    if (Math.abs(aEfficiency - bEfficiency) < 0.01) {
      const aCost = a.portionRecommendation!.costPerServing || 999;
      const bCost = b.portionRecommendation!.costPerServing || 999;
      return aCost - bCost;
    }

    return bEfficiency - aEfficiency;
  });

  const selectedFoods: Product[] = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalCost = 0;
  let hasCostData = false;

  // Greedy selection to meet protein target within calorie limit
  for (const product of sortedProducts) {
    if (selectedFoods.length >= maxItems) break;

    const portion = product.portionRecommendation!;
    const newCalories = totalCalories + portion.macrosPerServing.calories;

    // Don't exceed calorie target by more than 10%
    if (newCalories > dailyTargets.calories * 1.1) continue;

    selectedFoods.push(product);
    totalCalories = newCalories;
    totalProtein += portion.macrosPerServing.protein;
    totalCarbs += portion.macrosPerServing.carbs;
    totalFat += portion.macrosPerServing.fat;

    if (portion.costPerServing) {
      totalCost += portion.costPerServing;
      hasCostData = true;
    }

    // Stop if protein target is met
    if (totalProtein >= dailyTargets.protein) break;
  }

  return {
    foods: selectedFoods,
    totalMacros: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    },
    totalCost: hasCostData ? Math.round(totalCost * 100) / 100 : undefined,
    proteinTargetMet: totalProtein >= dailyTargets.protein,
  };
}

/**
 * Calculates protein density per euro for budget optimization.
 *
 * @param product - Product with pricing and nutrition data
 * @returns Protein grams per euro, or null if data unavailable
 *
 * @example
 * ```typescript
 * const efficiency = calculateProteinPerEuro(chickenBreast);
 * // Returns protein grams per euro spent
 * ```
 */
export function calculateProteinPerEuro(product: Product): number | null {
  const portion = product.portionRecommendation;
  const price = product.price?.regular;

  if (!portion || !price) return null;

  // Calculate protein per euro based on serving
  if (portion.costPerServing && portion.costPerServing > 0) {
    return Math.round((portion.macrosPerServing.protein / portion.costPerServing) * 10) / 10;
  }

  return null;
}

/**
 * Gets portion-optimized serving recommendations for Ali's specific goals.
 *
 * @param product - Product to analyze
 * @param goal - Ali's current goal (cutting, maintenance, bulking)
 * @returns Tailored portion recommendation
 *
 * @example
 * ```typescript
 * const cuttingPortion = getAliOptimizedPortion(yogurt, 'cutting');
 * // Returns smaller portions optimized for fat loss
 * ```
 */
export function getAliOptimizedPortion(
  product: Product,
  goal: 'cutting' | 'maintenance' | 'bulking' = 'cutting'
): PortionRecommendation | null {
  const baseTargets = goal === 'cutting' ? ALI_DAILY_TARGETS.rest : ALI_DAILY_TARGETS.training;

  // Adjust targets based on goal
  const adjustedTargets: DailyTargets = {
    ...baseTargets,
    calories: goal === 'bulking' ? baseTargets.calories * 1.2 : baseTargets.calories,
    carbs: goal === 'bulking' ? baseTargets.carbs * 1.3 : baseTargets.carbs,
  };

  return calculatePortionRecommendation(product, adjustedTargets);
}

/**
 * Utility for batch calculating portion recommendations with performance optimization.
 *
 * @param products - Large array of products
 * @param dailyTargets - Daily nutrition targets
 * @param batchSize - Process in batches for memory efficiency
 * @returns Products with portion recommendations
 */
export function batchCalculatePortionRecommendations(
  products: Product[],
  dailyTargets: DailyTargets = ALI_DAILY_TARGETS.training,
  batchSize: number = 1000
): Product[] {
  const results: Product[] = [];

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const enhancedBatch = addPortionRecommendations(batch, dailyTargets);
    results.push(...enhancedBatch);
  }

  return results;
}
/**
 * Nutrition Data Access Utilities
 *
 * Centralized, type-safe utilities for extracting nutrition data from Product objects.
 *
 * Key Safety Features:
 * - Dual-field checking with nullish coalescing
 * - Explicit validation and type narrowing
 * - Consistent error handling across all functions
 * - Runtime type guards for safe property access
 *
 * @module nutritionUtils
 */

import type { Product, Nutrition } from './types';

/**
 * Required macronutrients for body recomposition scoring.
 * All fields are guaranteed to be numbers (not undefined).
 */
export interface RequiredMacros {
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
}

/**
 * Complete nutrition data for advanced scoring algorithms.
 * All fields are guaranteed to be numbers (not undefined).
 */
export interface CompleteNutrition {
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
  readonly fiber: number;
  readonly sugars?: number;
  readonly salt?: number;
}

/**
 * Safely extracts calories from a product using dual-field access pattern.
 *
 * @param product - Product with potential nutrition data
 * @returns Calorie value or undefined if not available
 *
 * @example
 * ```typescript
 * const calories = extractCalories(product);
 * if (calories !== undefined && calories > 0) {
 *   // Safe to use calories
 * }
 * ```
 */
export function extractCalories(product: Partial<Product>): number | undefined {
  if (!product || typeof product !== 'object') {
    return undefined;
  }

  const calories = product.nutrition?.kcal;

  // Validate that it's a positive number
  if (typeof calories === 'number' && calories >= 0) {
    return calories;
  }

  return undefined;
}

/**
 * Safely extracts protein content from a product using dual-field access pattern.
 *
 * @param product - Product with potential nutrition data
 * @returns Protein value in grams or undefined if not available
 */
export function extractProtein(product: Partial<Product>): number | undefined {
  if (!product || typeof product !== 'object') {
    return undefined;
  }

  const protein = product.nutrition?.protein;

  // Validate that it's a non-negative number
  if (typeof protein === 'number' && protein >= 0) {
    return protein;
  }

  return undefined;
}

/**
 * Safely extracts carbohydrate content from a product using dual-field access pattern.
 *
 * @param product - Product with potential nutrition data
 * @returns Carbs value in grams or undefined if not available
 */
export function extractCarbs(product: Partial<Product>): number | undefined {
  if (!product || typeof product !== 'object') {
    return undefined;
  }

  const carbs = product.nutrition?.carbs;

  // Validate that it's a non-negative number
  if (typeof carbs === 'number' && carbs >= 0) {
    return carbs;
  }

  return undefined;
}

/**
 * Safely extracts fat content from a product using dual-field access pattern.
 *
 * @param product - Product with potential nutrition data
 * @returns Fat value in grams or undefined if not available
 */
export function extractFat(product: Partial<Product>): number | undefined {
  if (!product || typeof product !== 'object') {
    return undefined;
  }

  const fat = product.nutrition?.fat;

  // Validate that it's a non-negative number
  if (typeof fat === 'number' && fat >= 0) {
    return fat;
  }

  return undefined;
}

/**
 * Safely extracts fiber content from a product using dual-field access pattern.
 *
 * @param product - Product with potential nutrition data
 * @returns Fiber value in grams or undefined if not available
 */
export function extractFiber(product: Partial<Product>): number | undefined {
  if (!product || typeof product !== 'object') {
    return undefined;
  }

  const fiber = product.nutrition?.fiber;

  // Validate that it's a non-negative number
  if (typeof fiber === 'number' && fiber >= 0) {
    return fiber;
  }

  return undefined;
}

/**
 * Extracts required macronutrients (calories, protein, carbs, fat) safely.
 * Returns undefined if any required field is missing or invalid.
 *
 * @param product - Product with potential nutrition data
 * @returns RequiredMacros object or undefined if incomplete
 *
 * @example
 * ```typescript
 * const macros = extractRequiredMacros(product);
 * if (macros) {
 *   // All fields guaranteed to be valid numbers
 *   const ratio = macros.carbs / macros.protein;
 * }
 * ```
 */
export function extractRequiredMacros(product: Partial<Product>): RequiredMacros | undefined {
  const calories = extractCalories(product);
  const protein = extractProtein(product);
  const carbs = extractCarbs(product);
  const fat = extractFat(product);

  // All required fields must be present and positive
  if (
    calories !== undefined &&
    calories > 0 &&
    protein !== undefined &&
    protein >= 0 &&
    carbs !== undefined &&
    carbs >= 0 &&
    fat !== undefined &&
    fat >= 0
  ) {
    return {
      calories,
      protein,
      carbs,
      fat,
    } as const;
  }

  return undefined;
}

/**
 * Extracts complete nutrition data including fiber.
 * Returns undefined if core macronutrients are missing.
 *
 * @param product - Product with potential nutrition data
 * @returns CompleteNutrition object or undefined if incomplete
 */
export function extractCompleteNutrition(product: Partial<Product>): CompleteNutrition | undefined {
  const macros = extractRequiredMacros(product);
  if (!macros) {
    return undefined;
  }

  const fiber = extractFiber(product);

  // Fiber is required for complete nutrition
  if (fiber === undefined) {
    return undefined;
  }

  // Optional fields
  const sugars = product.nutrition?.sugars;
  const salt = product.nutrition?.salt;

  // Create result object with all fields at once due to readonly constraint
  const result: CompleteNutrition = {
    calories: macros.calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    fiber,
    ...(typeof sugars === 'number' && sugars >= 0 ? { sugars } : {}),
    ...(typeof salt === 'number' && salt >= 0 ? { salt } : {}),
  };

  return result;
}

/**
 * Type guard: checks if product has valid calorie data.
 *
 * @param product - Product to check
 * @returns true if product has valid calories > 0
 */
export function hasValidCalories(product: Partial<Product>): boolean {
  const calories = extractCalories(product);
  return calories !== undefined && calories > 0;
}

/**
 * Type guard: checks if product has complete macronutrient data.
 *
 * @param product - Product to check
 * @returns true if product has all required macros
 */
export function hasCompleteMacros(product: Partial<Product>): boolean {
  return extractRequiredMacros(product) !== undefined;
}

/**
 * Type guard: checks if product has complete nutrition data including fiber.
 *
 * @param product - Product to check
 * @returns true if product has complete nutrition
 */
export function hasCompleteNutrition(product: Partial<Product>): boolean {
  return extractCompleteNutrition(product) !== undefined;
}

/**
 * Creates a safe nutrition object for use with existing helper functions.
 * This bridges the gap between dual-field extraction and functions expecting Nutrition objects.
 *
 * @param product - Product with potential nutrition data
 * @returns Nutrition object with extracted values or undefined
 *
 * @example
 * ```typescript
 * const nutritionForHelpers = createNutritionObject(product);
 * if (nutritionForHelpers) {
 *   const confidence = calculateConfidence(product, nutritionForHelpers);
 * }
 * ```
 */
export function createNutritionObject(product: Partial<Product>): Nutrition | undefined {
  const calories = extractCalories(product);
  if (calories === undefined) {
    return undefined;
  }

  const protein = extractProtein(product);
  const carbs = extractCarbs(product);
  const fat = extractFat(product);
  const fiber = extractFiber(product);

  // Create nutrition object with extracted values
  const nutrition: Nutrition = {
    kcal: calories,
  };

  // Add optional fields if they exist
  if (protein !== undefined) nutrition.protein = protein;
  if (carbs !== undefined) nutrition.carbs = carbs;
  if (fat !== undefined) nutrition.fat = fat;
  if (fiber !== undefined) nutrition.fiber = fiber;

  // Add other optional nutrition fields
  const sugars = product.nutrition?.sugars;
  const salt = product.nutrition?.salt;
  const kJ = product.nutrition?.kJ;
  const satFat = product.nutrition?.satFat;

  if (typeof sugars === 'number' && sugars >= 0) nutrition.sugars = sugars;
  if (typeof salt === 'number' && salt >= 0) nutrition.salt = salt;
  if (typeof kJ === 'number' && kJ >= 0) nutrition.kJ = kJ;
  if (typeof satFat === 'number' && satFat >= 0) nutrition.satFat = satFat;

  return nutrition;
}

/**
 * Validates that macronutrient values are nutritionally consistent.
 * Checks that calories roughly match macronutrient composition.
 *
 * @param macros - Required macronutrients to validate
 * @returns true if values are consistent, false if suspicious
 */
export function validateMacroConsistency(macros: RequiredMacros): boolean {
  const { calories, protein, carbs, fat } = macros;

  // Calculate calories from macros (4-4-9 rule)
  const calculatedCalories = protein * 4 + carbs * 4 + fat * 9;

  // Allow 20% tolerance for rounding and measurement errors
  const tolerance = 0.2;
  const minExpected = calculatedCalories * (1 - tolerance);
  const maxExpected = calculatedCalories * (1 + tolerance);

  return calories >= minExpected && calories <= maxExpected;
}

/**
 * Safely extracts nutrition data with validation logging.
 * Useful for debugging nutrition data quality issues.
 *
 * @param product - Product to extract from
 * @param context - Context string for logging (function name, etc.)
 * @returns RequiredMacros or undefined with console warnings
 */
export function extractWithLogging(
  product: Partial<Product>,
  context: string,
): RequiredMacros | undefined {
  if (!product || typeof product !== 'object') {
    console.warn(`[${context}] Invalid product object:`, product);
    return undefined;
  }

  const calories = extractCalories(product);
  const protein = extractProtein(product);
  const carbs = extractCarbs(product);
  const fat = extractFat(product);

  // Log what's missing
  const missing: string[] = [];
  if (calories === undefined || calories <= 0) missing.push('calories');
  if (protein === undefined) missing.push('protein');
  if (carbs === undefined) missing.push('carbs');
  if (fat === undefined) missing.push('fat');

  if (missing.length > 0) {
    console.warn(
      `[${context}] Missing nutrition data for product ${product.id}: ${missing.join(', ')}`,
    );
    return undefined;
  }

  const macros: RequiredMacros = {
    calories: calories!,
    protein: protein!,
    carbs: carbs!,
    fat: fat!,
  };

  // Validate consistency
  if (!validateMacroConsistency(macros)) {
    console.warn(`[${context}] Inconsistent macronutrient data for product ${product.id}:`, macros);
  }

  return macros;
}

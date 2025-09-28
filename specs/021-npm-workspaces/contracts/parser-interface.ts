/**
 * @picklist/parser Package Interface
 *
 * Parsing functions for transforming raw CSV data into structured product data
 * Phase 1: Extract parsing logic from monolithic codebase (future phase)
 */

// Import shared types from @picklist/core
import type { Product, ParsedIngredients, ParsedAllergens, NutritionInfo, AdditiveInfo } from '@picklist/core';

// ==========================================
// PARSING RESULT INTERFACES
// ==========================================

export interface ParseProductOptions {
  csvRow: Record<string, string>;
  includeMetadata?: boolean;
  validateRequired?: boolean;
}

export interface ParseIngredientsOptions {
  detectAddedSugar?: boolean;
  detectAddedSalt?: boolean;
  filterPlaceholders?: boolean;
}

export interface ParseAllergensOptions {
  normalizePlurals?: boolean;
  filterUrls?: boolean;
  useWhitelist?: boolean;
}

export interface ParseAdditivesOptions {
  includeDutchCategories?: boolean;
  detectNaturalFlags?: boolean;
  includeSafetyFlags?: boolean;
}

export interface ParseNutritionOptions {
  validateRequired?: boolean;
  normalizeUnits?: boolean;
  detectServingSize?: boolean;
}

export interface ClassificationResult {
  categories: string[];
  confidence: number;
  excludedReasons: string[];
}

// ==========================================
// PARSER PACKAGE EXPORTS
// ==========================================

export interface ParserPackageExports {
  // Core parsing functions
  parseProduct(csvRow: Record<string, string>, options?: ParseProductOptions): Product;
  parseIngredients(ingredientsText: string, options?: ParseIngredientsOptions): ParsedIngredients;
  parseAllergens(allergensText: string, options?: ParseAllergensOptions): ParsedAllergens;
  parseNutrition(csvRow: Record<string, string>, options?: ParseNutritionOptions): NutritionInfo;
  parseAdditives(ingredientsText: string, options?: ParseAdditivesOptions): AdditiveInfo[];
  parseCategories(categoriesText: string): string[];
  parseUnits(unitText: string): { amount: number; unit: string };

  // Classification functions
  classifyProduct(product: { categories: string[]; ingredients: string[] }): ClassificationResult;

  // E-number database access
  lookupENumber(eNumber: string): AdditiveInfo | null;
  getAllENumbers(): AdditiveInfo[];

  // Dutch category mapping
  mapDutchCategory(dutchText: string): string[];

  // Validation functions
  validateParsingResult(result: unknown, type: 'product' | 'ingredients' | 'allergens' | 'nutrition'): { isValid: boolean; errors: string[] };
}

// ==========================================
// PARSING CONFIGURATION
// ==========================================

export interface ParsingConfig {
  // Ingredient parsing settings
  ingredients: {
    filterPlaceholders: boolean;
    detectAddedSugar: boolean;
    detectAddedSalt: boolean;
    preservativePatterns: RegExp[];
  };

  // Allergen parsing settings
  allergens: {
    normalizePlurals: boolean;
    whitelistEnabled: boolean;
    urlFilterEnabled: boolean;
  };

  // Additive parsing settings
  additives: {
    includeDutchCategories: boolean;
    eNumberDetection: boolean;
    safetyFlagsEnabled: boolean;
  };

  // Nutrition parsing settings
  nutrition: {
    validateRequired: boolean;
    normalizeUnits: boolean;
    servingSizeDetection: boolean;
  };
}

// ==========================================
// VALIDATION RULES
// ==========================================

/**
 * Parser Package Validation:
 * 1. All parsing functions must be deterministic (same input = same output)
 * 2. Must handle malformed/empty input gracefully (no exceptions)
 * 3. Must depend only on @picklist/core for shared types
 * 4. No external API calls or network dependencies
 * 5. All regex patterns must be tested and documented
 * 6. Must preserve original raw text in parsed results
 * 7. Dutch language support must be comprehensive
 */

// ==========================================
// USAGE EXAMPLES
// ==========================================

/**
 * Basic parsing usage:
 * ```typescript
 * import { parseIngredients, parseAllergens, parseNutrition } from '@picklist/parser';
 *
 * const ingredients = parseIngredients('Water, Sugar, Salt', {
 *   detectAddedSugar: true,
 *   filterPlaceholders: true
 * });
 *
 * const allergens = parseAllergens('Contains: milk, nuts', {
 *   normalizePlurals: true,
 *   useWhitelist: true
 * });
 *
 * const nutrition = parseNutrition(csvRow, {
 *   validateRequired: true,
 *   normalizeUnits: true
 * });
 * ```
 *
 * Full product parsing:
 * ```typescript
 * import { parseProduct } from '@picklist/parser';
 *
 * const product = parseProduct(csvRow, {
 *   includeMetadata: true,
 *   validateRequired: true
 * });
 * ```
 *
 * E-number lookup:
 * ```typescript
 * import { lookupENumber } from '@picklist/parser';
 *
 * const additive = lookupENumber('E100');
 * // Returns: { eNumber: 'E100', name: 'Curcumin', ... }
 * ```
 */
/**
 * @picklist/core Package Interface
 *
 * Shared utilities, types, and helper functions for the picklist ecosystem
 * Phase 1: Extract core utilities from monolithic codebase
 */

// ==========================================
// SHARED TYPES (from src/types.ts)
// ==========================================

export interface Product {
  id: string;
  name: string;
  brand?: string;
  categories: string[];
  ingredients: ParsedIngredients;
  allergens: ParsedAllergens;
  nutrition: NutritionInfo;
  additives: AdditiveInfo[];
  price?: Price;
  stores: string[];
  metadata: {
    processedAt: string;
    sourceFile: string;
    transformVersion: string;
  };
}

export interface ParsedIngredients {
  raw: string;
  parsed: string[];
  addedSugar: boolean;
  addedSalt: boolean;
  preservatives: string[];
  conflicts: string[];
}

export interface ParsedAllergens {
  raw: string;
  normalized: string[];
  detected: string[];
  warnings: string[];
}

export interface NutritionInfo {
  energy: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  perServing: boolean;
  servingSize?: string;
}

export interface AdditiveInfo {
  eNumber?: string;
  name: string;
  functionalCategory: string;
  dutchCategory?: string;
  safetyFlags: string[];
  isNatural: boolean;
}

export interface Price {
  amount: number;
  currency: string;
  unit: string;
  pricePerUnit?: number;
}

export interface SparsityAnalysis {
  totalColumns: number;
  emptyColumns: string[];
  sparsityThreshold: number;
  recommendedExclusions: string[];
}

export interface MergeResult {
  mergedProducts: Product[];
  duplicatesRemoved: number;
  conflicts: Array<{
    field: string;
    values: string[];
    resolution: string;
  }>;
}

// ==========================================
// CORE PACKAGE EXPORTS (Utilities Only)
// ==========================================

export interface CorePackageExports {
  // Data manipulation utilities
  mergeDuplicates(products: Product[]): MergeResult;
  calculateSparsity(csvData: Record<string, string>[]): SparsityAnalysis;

  // File I/O utilities
  writeJsonl(data: unknown[], outputPath: string): Promise<void>;
  writeIndexFile(products: Product[], outputPath: string): Promise<void>;
  writeSchemaDoc(schema: Record<string, unknown>, outputPath: string): Promise<void>;

  // Basic nutrition utilities (complex scoring moved to @picklist/scoring)
  extractNutritionValue(nutrition: NutritionInfo, field: keyof NutritionInfo): number | undefined;
  hasRequiredNutrition(nutrition: NutritionInfo): boolean;

  // String processing utilities
  normalizeText(text: string): string;                    // Trim whitespace, normalize case
  removePlaceholders(text: string): string;              // Remove "NA", "n/a", empty values
  splitAndTrim(text: string, delimiter: string): string[]; // Split and trim each element
  sanitizeForFilename(text: string): string;             // Remove invalid filename characters

  // Data validation utilities
  validateProduct(product: Partial<Product>): { isValid: boolean; errors: string[] };     // Required fields check
  validateNutrition(nutrition: Partial<NutritionInfo>): { isValid: boolean; errors: string[] }; // Numeric ranges check
  isValidSemver(version: string): boolean;               // Validate package version format
  isValidPackageName(name: string): boolean;             // Validate @picklist/* naming

  // Ordering and sorting utilities
  sortProducts(products: Product[], criteria: 'name' | 'protein' | 'price'): Product[];
  generateProductId(name: string, brand?: string): string;

  // Type constructors (for re-export)
  createProduct(data: Partial<Product>): Product;
  createNutritionInfo(data: Partial<NutritionInfo>): NutritionInfo;
}

// ==========================================
// VALIDATION RULES
// ==========================================

/**
 * Core Package Validation:
 * 1. All utility functions must be pure (no side effects except I/O)
 * 2. No parsing logic - only data manipulation and validation
 * 3. No external API calls or network dependencies
 * 4. All functions must handle empty/invalid input gracefully
 * 5. TypeScript strict mode compliance
 * 6. Memory usage must be predictable for large datasets
 */

// ==========================================
// USAGE EXAMPLES
// ==========================================

/**
 * Data utilities usage:
 * ```typescript
 * import { mergeDuplicates, calculateSparsity, writeJsonl } from '@picklist/core';
 *
 * // Merge duplicate products
 * const mergeResult = mergeDuplicates(products);
 *
 * // Analyze CSV sparsity
 * const sparsity = calculateSparsity(csvData);
 *
 * // Write output files
 * await writeJsonl(products, './output/products.jsonl');
 * ```
 *
 * Basic nutrition utilities:
 * ```typescript
 * import { extractNutritionValue, hasRequiredNutrition } from '@picklist/core';
 *
 * const protein = extractNutritionValue(nutrition, 'protein');
 * const isValid = hasRequiredNutrition(nutrition);
 * ```
 */
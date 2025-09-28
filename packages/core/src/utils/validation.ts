/**
 * Data validation utilities for @picklist/core
 * Validation functions for products, nutrition data, and package metadata
 */

import type { Nutrition, Product } from '@picklist/types';

/**
 * Validate product data for required fields and basic structure
 * @param product - Partial product data to validate
 * @returns Validation result with isValid flag and error array
 */
export function validateProduct(product: Partial<Product>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields validation
  if (!product.id || typeof product.id !== 'string') {
    errors.push('Product ID is required and must be a string');
  }

  if (!product.name || typeof product.name !== 'string') {
    errors.push('Product name is required and must be a string');
  }

  // Categories are optional - if present must be an array of strings
  if (product.categories !== undefined) {
    if (!Array.isArray(product.categories)) {
      errors.push('Product categories must be an array of strings when provided');
    } else if (product.categories.some((c) => typeof c !== 'string')) {
      errors.push('All product categories must be strings');
    }
  }

  // Nutrition validation (if present)
  if (product.nutrition) {
    const nutritionResult = validateNutrition(product.nutrition);
    if (!nutritionResult.isValid) {
      errors.push(...nutritionResult.errors.map((err) => `Nutrition: ${err}`));
    }
  }

  // Structure validation
  if (product.ingredients !== undefined) {
    if (!Array.isArray(product.ingredients)) {
      errors.push('Product ingredients must be an array of strings');
    } else if (product.ingredients.some((i) => typeof i !== 'string')) {
      errors.push('All product ingredients must be strings');
    }
  }

  if (product.allergens !== undefined && typeof product.allergens !== 'object') {
    errors.push('Product allergens must be an object');
  }

  // Removed validation for product.stores – field does not exist on Product type

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate nutrition information for numeric ranges and required fields
 * @param nutrition - Partial nutrition data to validate
 * @returns Validation result with isValid flag and error array
 */
export function validateNutrition(nutrition: Partial<Nutrition>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const check = (
    field: keyof Nutrition,
    value: unknown,
    opts: { max?: number; label?: string },
  ) => {
    if (value === undefined) return;
    const label = opts.label || field;
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      errors.push(`${label} must be a non-negative number`);
      return;
    }
    if (opts.max !== undefined && value > opts.max) {
      errors.push(`${label} value seems unreasonably high (> ${opts.max})`);
    }
  };

  // Map legacy semantic validations to current field names
  check('kcal', nutrition.kcal, { max: 2000, label: 'Calories (kcal/100g)' });
  check('fat', nutrition.fat, { max: 100, label: 'Fat (g/100g)' });
  check('satFat', nutrition.satFat, { max: 100, label: 'Saturated Fat (g/100g)' });
  check('carbs', nutrition.carbs, { max: 100, label: 'Carbohydrates (g/100g)' });
  check('sugars', nutrition.sugars, { max: 100, label: 'Sugars (g/100g)' });
  check('fiber', nutrition.fiber, { max: 50, label: 'Fiber (g/100g)' });
  check('protein', nutrition.protein, { max: 100, label: 'Protein (g/100g)' });
  check('salt', nutrition.salt, { max: 100, label: 'Salt (g/100g)' });

  if (nutrition.unit !== undefined && typeof nutrition.unit !== 'string') {
    errors.push('Nutrition unit must be a string when provided');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate semantic version string format
 * @param version - Version string to validate
 * @returns True if valid semver format
 */
export function isValidSemver(version: string): boolean {
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

/**
 * Validate @picklist/* package name format
 * @param name - Package name to validate
 * @returns True if valid @picklist package name
 */
export function isValidPackageName(name: string): boolean {
  const picklistPackageRegex = /^@picklist\/[a-z][a-z0-9-]*[a-z0-9]$/;
  return picklistPackageRegex.test(name);
}

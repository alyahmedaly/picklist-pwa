/**
 * Unit tests for validation utilities from @picklist/core
 * Testing validateProduct, validateNutrition, isValidSemver, isValidPackageName functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateProduct,
  validateNutrition,
  isValidSemver,
  isValidPackageName,
} from '@picklist/core';
import type { Product, Nutrition } from '@picklist/types';

describe('validateProduct', () => {
  it('should validate valid product', () => {
    const validProduct: Partial<Product> = {
      id: 'test-product-1',
      name: 'Test Product',
      categories: ['dairy', 'organic'],
      ingredients: ['milk', 'sugar'],
      allergens: { contains: ['milk'], mayContain: [] },
      nutrition: {
        kcal: 150,
        protein: 8.5,
        carbs: 12.0,
        fat: 6.2,
        fiber: 2.0,
        salt: 0.8,
      },
    };

    const result = validateProduct(validProduct);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should require id field', () => {
    const product: Partial<Product> = {
      name: 'Test Product',
      categories: [],
    };

    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Product ID is required and must be a string');
  });

  it('should require name field', () => {
    const product: Partial<Product> = {
      id: 'test-1',
      categories: [],
    };

    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Product name is required and must be a string');
  });

  it('should require categories to be array', () => {
    const product: Partial<Product> = {
      id: 'test-1',
      name: 'Test Product',
      categories: 'not-an-array' as unknown as string[],
    };

    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Product categories must be an array of strings when provided');
  });

  it('should require categories elements to be strings', () => {
    const product: Partial<Product> = {
      id: 'test-1',
      name: 'Test Product',
      categories: ['valid', 123 as unknown as string],
    };
    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('All product categories must be strings');
  });

  it('should validate nutrition if present (negative value)', () => {
    const product: Partial<Product> = {
      id: 'test-1',
      name: 'Test Product',
      categories: [],
      nutrition: { kcal: -50 },
    };

    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((err) =>
        err.includes('Calories (kcal/100g) must be a non-negative number'),
      ),
    ).toBe(true);
  });

  it('should validate ingredients must be array of strings', () => {
    const product: Partial<Product> = {
      id: 'test-1',
      name: 'Test Product',
      categories: [],
      ingredients: 'not-an-array' as unknown as string[],
    };
    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Product ingredients must be an array of strings');
  });

  it('should validate ingredients element types', () => {
    const product: Partial<Product> = {
      id: 'test-1',
      name: 'Test Product',
      categories: [],
      ingredients: ['valid', 123 as unknown as string],
    };
    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('All product ingredients must be strings');
  });
});

describe('validateNutrition', () => {
  it('should validate valid nutrition info', () => {
    const nutrition: Partial<Nutrition> = {
      kcal: 150,
      protein: 8.5,
      carbs: 12.0,
      fat: 6.2,
      fiber: 2.1,
      salt: 1.2,
    };

    const result = validateNutrition(nutrition);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject negative kcal values', () => {
    const nutrition: Partial<Nutrition> = { kcal: -50 };
    const result = validateNutrition(nutrition);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toMatch(/kcal/);
  });

  it('should reject unreasonably high kcal values', () => {
    const nutrition: Partial<Nutrition> = { kcal: 2500 };
    const result = validateNutrition(nutrition);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('unreasonably high'))).toBe(true);
  });

  it('should reject negative protein values', () => {
    const nutrition: Partial<Nutrition> = {
      protein: -5,
    };

    const result = validateNutrition(nutrition);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => /Protein.*non-negative/.test(e))).toBe(true);
  });

  it('should reject unreasonably high protein values', () => {
    const nutrition: Partial<Nutrition> = { protein: 150 };
    const result = validateNutrition(nutrition);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.includes('Protein') && e.includes('unreasonably high')),
    ).toBe(true);
  });

  it('should validate carbohydrates (carbs) range', () => {
    const result1 = validateNutrition({ carbs: -5 });
    expect(result1.isValid).toBe(false);
    expect(
      result1.errors.some(
        (e) => e.toLowerCase().includes('carbohydrate') || e.includes('Carbohydrates'),
      ),
    ).toBe(true);

    const result2 = validateNutrition({ carbs: 150 });
    expect(result2.isValid).toBe(false);
    expect(
      result2.errors.some((e) => e.includes('Carbohydrates') || e.includes('Carbohydrate')),
    ).toBe(true);
  });

  it('should validate fat range', () => {
    const result1 = validateNutrition({ fat: -2 });
    expect(result1.isValid).toBe(false);
    expect(result1.errors.some((e) => /Fat.*non-negative/.test(e))).toBe(true);

    const result2 = validateNutrition({ fat: 120 });
    expect(result2.isValid).toBe(false);
    expect(result2.errors.some((e) => /Fat.*unreasonably high/.test(e))).toBe(true);
  });

  it('should validate optional fiber range', () => {
    const result1 = validateNutrition({ fiber: -1 });
    expect(result1.isValid).toBe(false);
    expect(result1.errors.some((e) => /Fiber.*non-negative/.test(e))).toBe(true);

    const result2 = validateNutrition({ fiber: 60 });
    expect(result2.isValid).toBe(false);
    expect(result2.errors.some((e) => /Fiber.*unreasonably high/.test(e))).toBe(true);
  });

  it('should validate optional salt range', () => {
    const result1 = validateNutrition({ salt: -1 });
    expect(result1.isValid).toBe(false);
    expect(result1.errors.some((e) => e.includes('Salt') || e.includes('salt'))).toBe(true);

    const result2 = validateNutrition({ salt: 150 });
    expect(result2.isValid).toBe(false);
    expect(result2.errors.some((e) => e.includes('Salt') && e.includes('unreasonably high'))).toBe(
      true,
    );
  });

  it('should handle undefined values gracefully', () => {
    const result = validateNutrition({});
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('isValidSemver', () => {
  it('should validate correct semver formats', () => {
    expect(isValidSemver('1.0.0')).toBe(true);
    expect(isValidSemver('0.1.0')).toBe(true);
    expect(isValidSemver('10.20.30')).toBe(true);
    expect(isValidSemver('1.0.0-alpha')).toBe(true);
    expect(isValidSemver('1.0.0-alpha.1')).toBe(true);
    expect(isValidSemver('1.0.0+build.1')).toBe(true);
    expect(isValidSemver('1.0.0-alpha.beta+build.1')).toBe(true);
  });

  it('should reject invalid semver formats', () => {
    expect(isValidSemver('1.0')).toBe(false);
    expect(isValidSemver('1.0.0.0')).toBe(false);
    expect(isValidSemver('v1.0.0')).toBe(false);
    expect(isValidSemver('1.0.0-')).toBe(false);
    expect(isValidSemver('1.0.0+')).toBe(false);
    expect(isValidSemver('')).toBe(false);
    expect(isValidSemver('not-a-version')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidSemver('0.0.0')).toBe(true);
    expect(isValidSemver('999.999.999')).toBe(true);
    expect(isValidSemver('1.0.0-0')).toBe(true);
  });
});

describe('isValidPackageName', () => {
  it('should validate correct @picklist package names', () => {
    expect(isValidPackageName('@picklist/core')).toBe(true);
    expect(isValidPackageName('@picklist/parser')).toBe(true);
    expect(isValidPackageName('@picklist/cli')).toBe(true);
    expect(isValidPackageName('@picklist/database')).toBe(true);
    expect(isValidPackageName('@picklist/web')).toBe(true);
    expect(isValidPackageName('@picklist/scoring-engine')).toBe(true);
  });

  it('should reject invalid @picklist package names', () => {
    expect(isValidPackageName('picklist/core')).toBe(false); // Missing @
    expect(isValidPackageName('@picklist')).toBe(false); // Missing package name
    expect(isValidPackageName('@picklist/')).toBe(false); // Empty package name
    expect(isValidPackageName('@picklist/-core')).toBe(false); // Starts with hyphen
    expect(isValidPackageName('@picklist/core-')).toBe(false); // Ends with hyphen
    expect(isValidPackageName('@picklist/Core')).toBe(false); // Uppercase letter
    expect(isValidPackageName('@picklist/core_utils')).toBe(false); // Underscore
    expect(isValidPackageName('@other/core')).toBe(false); // Wrong scope
  });

  it('should handle edge cases', () => {
    expect(isValidPackageName('')).toBe(false);
    expect(isValidPackageName('@picklist/ab')).toBe(true); // Minimum 2 characters needed (start with letter, end with letter/number)
    expect(isValidPackageName('@picklist/a1')).toBe(true); // Letter followed by number
    expect(isValidPackageName('@picklist/1a')).toBe(false); // Cannot start with number
  });
});

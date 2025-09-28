import { describe, it, expect } from 'vitest';
import {
  createFilter,
  validateFilterCriteria,
  createAliDefaults,
} from '../../src/data/transform/filterEngine';
import type {
  Product,
  FilterCriteria,
  FilteredProduct,
  HalalFilterCriteria,
  ProteinFilterCriteria,
} from '../../src/data/transform/types';

describe('createFilter - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept Product[] and FilterCriteria parameters', () => {
      const products: Product[] = [];
      const criteria: FilterCriteria = {
        halal: { strict: true },
      };

      // This should fail initially (TDD red phase) since createFilter doesn't exist yet
      expect(() => createFilter(products, criteria)).not.toThrow();
    });

    it('should reject null or undefined inputs', () => {
      const products: Product[] = [];
      const criteria: FilterCriteria = { halal: { strict: true } };

      // Should throw for null/undefined products
      expect(() => createFilter(null as any, criteria)).toThrow();
      expect(() => createFilter(undefined as any, criteria)).toThrow();

      // Should throw for null/undefined criteria
      expect(() => createFilter(products, null as any)).toThrow();
      expect(() => createFilter(products, undefined as any)).toThrow();
    });

    it('should handle empty products array', () => {
      const emptyProducts: Product[] = [];
      const criteria: FilterCriteria = { halal: { strict: true } };

      // Should not throw with empty array
      expect(() => createFilter(emptyProducts, criteria)).not.toThrow();
    });
  });

  describe('Return Type Validation', () => {
    it('should return FilteredProduct[] array', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
          halalCheck: {
            status: 'halal',
            confidence: 'high',
            flags: {},
            details: {},
          },
        },
      ];
      const criteria: FilterCriteria = { halal: { strict: true } };

      const result = createFilter(products, criteria);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);

      // Check FilteredProduct structure
      if (result.length > 0) {
        const filteredProduct = result[0];
        expect(filteredProduct).toHaveProperty('filterMatch');
        expect(filteredProduct.filterMatch).toBeTypeOf('object');
        expect(filteredProduct).toHaveProperty('id');
        expect(filteredProduct).toHaveProperty('name');
        expect(filteredProduct).toHaveProperty('price');
      }
    });

    it('should include filter match indicators in results', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
          halalCheck: {
            status: 'halal',
            confidence: 'high',
            flags: {},
            details: {},
          },
          proteinOptimization: {
            proteinDensityScore: 85,
            proteinContribution: 25,
          },
        },
      ];
      const criteria: FilterCriteria = {
        halal: { strict: true },
        protein: { min: 20, target: 170 },
      };

      const result = createFilter(products, criteria);

      if (result.length > 0) {
        const product = result[0];
        expect(product.filterMatch).toHaveProperty('halal');
        expect(product.filterMatch).toHaveProperty('protein');
        expect(typeof product.filterMatch.halal).toBe('boolean');
        expect(typeof product.filterMatch.protein).toBe('boolean');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle products with missing scoring data', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Incomplete Product',
          price: { regular: 1.0, currency: 'EUR' },
          // Missing halalCheck, proteinOptimization, etc.
        },
      ];
      const criteria: FilterCriteria = {
        halal: { strict: true },
        protein: { min: 10, target: 170 },
      };

      expect(() => createFilter(products, criteria)).not.toThrow();
      const result = createFilter(products, criteria);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle complex filter combinations', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Complex Product',
          price: { regular: 3.5, currency: 'EUR' },
          halalCheck: {
            status: 'halal',
            confidence: 'high',
            flags: {},
            details: {},
          },
          proteinOptimization: {
            proteinDensityScore: 75,
            proteinContribution: 30,
          },
          postWorkoutOptimization: {
            postWorkoutScore: 82,
            carbProteinRatio: 3.0,
          },
        },
      ];
      const criteria: FilterCriteria = {
        halal: { strict: true },
        protein: { minProteinPer100g: 25, targetDailyAmount: 170 },
        postWorkout: { minCarbProteinRatio: 2.0, maxCarbProteinRatio: 4.0, preferHighGI: true, recoveryWindow: 'immediate' },
      };

      expect(() => createFilter(products, criteria)).not.toThrow();
    });

    it('should handle empty criteria object', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.0, currency: 'EUR' },
        },
      ];
      const emptyCriteria: FilterCriteria = {};

      // Should handle empty criteria - likely returns all products
      expect(() => createFilter(products, emptyCriteria)).not.toThrow();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid product data gracefully', () => {
      const invalidProducts = [
        { id: null, name: '', price: null }, // Invalid product
        {
          id: 2,
          name: 'Valid Product',
          price: { regular: 2.5, currency: 'EUR' },
        },
      ] as any[];
      const criteria: FilterCriteria = { halal: { strict: true } };

      // Should not crash on invalid data
      expect(() => createFilter(invalidProducts, criteria)).not.toThrow();
    });

    it('should handle invalid filter criteria values', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
        },
      ];

      const invalidCriteria: FilterCriteria = {
        protein: { min: -10, target: -50 }, // Invalid negative values
      };

      // Should validate and handle invalid criteria
      expect(() => createFilter(products, invalidCriteria)).not.toThrow();
    });
  });
});

describe('validateFilterCriteria - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept FilterCriteria parameter', () => {
      const validCriteria: FilterCriteria = {
        halal: { strict: true },
        protein: { min: 20, target: 170 },
      };

      expect(() => validateFilterCriteria(validCriteria)).not.toThrow();
    });

    it('should throw Error for invalid criteria', () => {
      const invalidCriteria: FilterCriteria = {
        protein: { minProteinPer100g: -10, targetDailyAmount: -50 }, // Invalid negative values
      };

      expect(() => validateFilterCriteria(invalidCriteria)).toThrow();
    });
  });

  describe('Validation Rules', () => {
    it('should validate protein criteria ranges', () => {
      const invalidProtein: FilterCriteria = {
        protein: { minProteinPer100g: 150, targetDailyAmount: 50 }, // invalid protein range
      };

      expect(() => validateFilterCriteria(invalidProtein)).toThrow();
    });

    it('should validate post-workout ratio ranges', () => {
      const invalidRatio: FilterCriteria = {
        postWorkout: { minCarbProteinRatio: 5.0, maxCarbProteinRatio: 2.0, preferHighGI: false, recoveryWindow: 'immediate' }, // minRatio > maxRatio is invalid
      };

      expect(() => validateFilterCriteria(invalidRatio)).toThrow();
    });

    it('should validate budget criteria', () => {
      const invalidBudget: FilterCriteria = {
        budget: { maxPricePerUnit: -1.0, optimizeProteinPerEuro: false }, // Negative price is invalid
      };

      expect(() => validateFilterCriteria(invalidBudget)).toThrow();
    });
  });
});

describe('createAliDefaults - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should work without parameters', () => {
      expect(() => createAliDefaults()).not.toThrow();
    });

    it('should accept partial FilterCriteria override', () => {
      const override: Partial<FilterCriteria> = {
        protein: { min: 25, target: 180 },
      };

      expect(() => createAliDefaults(override)).not.toThrow();
    });
  });

  describe('Return Type Validation', () => {
    it('should return complete FilterCriteria with Ali defaults', () => {
      const result = createAliDefaults();

      expect(result).toBeTypeOf('object');
      expect(result).toHaveProperty('halal');
      expect(result).toHaveProperty('protein');
      expect(result.halal?.strict).toBe(true); // Ali requires strict halal
      expect(result.protein?.targetDailyAmount).toBe(170); // Ali's 170g protein target
    });

    it('should include Ali-specific preferences', () => {
      const result = createAliDefaults();

      // Should include tuna+potato preference and honey avoidance
      expect(result.context?.avoidCombinations).toContain('honey');
      expect(result.context?.avoidCombinations).toContain('tuna+rice');
    });

    it('should apply overrides correctly', () => {
      const override: Partial<FilterCriteria> = {
        protein: { min: 25, target: 180 },
      };

      const result = createAliDefaults(override);

      expect(result.protein?.target).toBe(180); // Override applied
      expect(result.protein?.min).toBe(25); // Override applied
      expect(result.halal?.strict).toBe(true); // Default preserved
    });
  });
});

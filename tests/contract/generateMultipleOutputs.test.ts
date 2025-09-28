import { describe, it, expect } from 'vitest';
import {
  generateMultipleOutputs,
  generateFilterIndex,
  FilterOutput,
  FilterStatistics,
  OutputConfig,
  FilterCombination,
} from '../../src/data/transform/outputGenerator';
import type { Product } from '../../src/data/transform/types';
import type { FilterCriteria } from '../../src/data/transform/filterEngine';

describe('generateMultipleOutputs - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept Product[], FilterCombination[], and OutputConfig parameters', async () => {
      const products: Product[] = [];
      const combinations: FilterCombination[] = [
        { name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } },
        { name: 'protein', criteria: { protein: { minProteinPer100g: 20, targetDailyAmount: 170 } } },
      ];
      const config: OutputConfig = { outputDir: '/tmp/test', generateIndex: true, generateStats: true, format: 'standard' };

      // This should not throw with the correct implementation
      const result = await generateMultipleOutputs(products, combinations, config);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should reject null or undefined inputs', async () => {
      const products: Product[] = [];
      const combinations: FilterCombination[] = [{ name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } }];
      const config: OutputConfig = { outputDir: '/tmp/test', generateIndex: true, generateStats: true, format: 'standard' };

      // Should throw for null/undefined products
      await expect(generateMultipleOutputs(null as any, combinations, config)).rejects.toThrow();
      await expect(generateMultipleOutputs(undefined as any, combinations, config)).rejects.toThrow();

      // Should throw for null/undefined combinations array
      await expect(generateMultipleOutputs(products, null as any, config)).rejects.toThrow();
      await expect(generateMultipleOutputs(products, undefined as any, config)).rejects.toThrow();
    });

    it('should handle empty arrays', async () => {
      const emptyProducts: Product[] = [];
      const emptyCombinations: FilterCombination[] = [];
      const config: OutputConfig = { outputDir: '/tmp/test', generateIndex: true, generateStats: true, format: 'standard' };

      // Should not throw with empty arrays
      const result = await generateMultipleOutputs(emptyProducts, emptyCombinations, config);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('Return Type Validation', () => {
    it('should return Promise<FilterOutput[]>', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
          halalCheck: {
            status: 'halal',
            confidence: 'high',
            flags: {
              hasAnimalGelatine: false,
              hasAlcohol: false,
              hasPork: false,
              hasNonHalalMeat: false,
              hasDoubtfulAdditives: false,
            },
            details: {
              problematicIngredients: [],
              eNumberConcerns: [],
            },
          },
        },
      ];
      const combinations: FilterCombination[] = [{ name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } }];
      const config: OutputConfig = { outputDir: '/tmp/test', generateIndex: true, generateStats: true, format: 'standard' };

      const result = await generateMultipleOutputs(products, combinations, config);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);

      // Check FilterOutput structure
      if (result.length > 0) {
        const filterOutput = result[0];
        expect(filterOutput).toHaveProperty('filterName');
        expect(filterOutput).toHaveProperty('products');
        expect(filterOutput).toHaveProperty('statistics');
        expect(filterOutput).toHaveProperty('criteria');

        expect(typeof filterOutput.filterName).toBe('string');
        expect(Array.isArray(filterOutput.products)).toBe(true);
        expect(typeof filterOutput.statistics).toBe('object');
        expect(typeof filterOutput.criteria).toBe('object');
      }
    });

    it('should include proper FilterStatistics in each output', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
          halalCheck: {
            status: 'halal',
            confidence: 'high',
            flags: {
              hasAnimalGelatine: false,
              hasAlcohol: false,
              hasPork: false,
              hasNonHalalMeat: false,
              hasDoubtfulAdditives: false,
            },
            details: {
              problematicIngredients: [],
              eNumberConcerns: [],
            },
          },
        },
      ];
      const combinations: FilterCombination[] = [{ name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } }];
      const config: OutputConfig = { outputDir: '/tmp/test', generateIndex: true, generateStats: true, format: 'standard' };

      const result = await generateMultipleOutputs(products, combinations, config);

      if (result.length > 0) {
        const stats = result[0].statistics;
        expect(stats).toHaveProperty('totalProducts');
        expect(stats).toHaveProperty('filteredProducts');
        expect(stats).toHaveProperty('coveragePercentage');
        expect(stats).toHaveProperty('excludedReasons');
        expect(stats).toHaveProperty('filterSpecific');

        expect(typeof stats.totalProducts).toBe('number');
        expect(typeof stats.filteredProducts).toBe('number');
        expect(typeof stats.coveragePercentage).toBe('number');
        expect(typeof stats.excludedReasons).toBe('object');
        expect(typeof stats.filterSpecific).toBe('object');
      }
    });
  });

  describe('File Generation', () => {
    it('should generate separate outputs for each filter combination', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
          halalCheck: {
            status: 'halal',
            confidence: 'high',
            flags: {
              hasAnimalGelatine: false,
              hasAlcohol: false,
              hasPork: false,
              hasNonHalalMeat: false,
              hasDoubtfulAdditives: false,
            },
            details: {
              problematicIngredients: [],
              eNumberConcerns: [],
            },
          },
        },
      ];
      const combinations: FilterCombination[] = [
        { name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } },
        { name: 'protein', criteria: { protein: { minProteinPer100g: 20, targetDailyAmount: 170 } } },
      ];
      const config: OutputConfig = { outputDir: '/tmp/test-multi', generateIndex: true, generateStats: true, format: 'standard' };

      const result = await generateMultipleOutputs(products, combinations, config);

      // Should generate one output per combination
      expect(result.length).toBe(combinations.length);

      // Each should have unique filter names
      const filterNames = result.map((r) => r.filterName);
      const uniqueNames = new Set(filterNames);
      expect(uniqueNames.size).toBe(filterNames.length);
    });

    it('should handle file naming conventions', async () => {
      const products: Product[] = [];
      const combinations: FilterCombination[] = [
        { name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } },
        { name: 'protein', criteria: { protein: { minProteinPer100g: 20, targetDailyAmount: 170 } } },
        { name: 'halal-protein', criteria: {
            halal: { strict: true, excludeAlcohol: true, excludeGelatine: true },
            protein: { minProteinPer100g: 15, targetDailyAmount: 170 }
          }
        }, // Combined filter
      ];
      const config: OutputConfig = { outputDir: '/tmp/test-naming', generateIndex: true, generateStats: true, format: 'standard' };

      const result = await generateMultipleOutputs(products, combinations, config);

      // Check naming patterns
      const filterNames = result.map((r) => r.filterName);
      expect(filterNames).toContain('halal');
      expect(filterNames).toContain('protein');
      expect(filterNames).toContain('halal-protein');
    });
  });

  describe('Edge Cases', () => {
    it('should handle products with missing data', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Complete Product',
          price: { regular: 2.5, currency: 'EUR' },
          halalCheck: {
            status: 'halal',
            confidence: 'high',
            flags: {
              hasAnimalGelatine: false,
              hasAlcohol: false,
              hasPork: false,
              hasNonHalalMeat: false,
              hasDoubtfulAdditives: false,
            },
            details: {
              problematicIngredients: [],
              eNumberConcerns: [],
            },
          },
        },
        {
          id: 2,
          name: 'Incomplete Product',
          price: { regular: 1.0, currency: 'EUR' },
          // Missing halalCheck
        },
      ];
      const combinations: FilterCombination[] = [{ name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } }];
      const config: OutputConfig = { outputDir: '/tmp/test-incomplete', generateIndex: true, generateStats: true, format: 'standard' };

      const result = await generateMultipleOutputs(products, combinations, config);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle invalid output directories', async () => {
      const products: Product[] = [];
      const combinations: FilterCombination[] = [{ name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } }];
      const config: OutputConfig = { outputDir: '/invalid/path/that/does/not/exist', generateIndex: true, generateStats: true, format: 'standard' };

      // Should handle invalid paths gracefully
      await expect(generateMultipleOutputs(products, combinations, config)).rejects.toThrow();
    });

    it('should handle complex filter combinations', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Complex Product',
          price: { regular: 3.5, currency: 'EUR' },
        },
      ];
      const combinations: FilterCombination[] = [
        {
          name: 'complex',
          criteria: {
            halal: { strict: true, excludeAlcohol: true, excludeGelatine: true },
            protein: { minProteinPer100g: 25, targetDailyAmount: 170 },
            postWorkout: { minCarbProteinRatio: 2.0, maxCarbProteinRatio: 4.0, preferHighGI: true, recoveryWindow: 'immediate' },
            budget: { maxPricePerUnit: 5.0, optimizeProteinPerEuro: false },
          },
        },
      ];
      const config: OutputConfig = { outputDir: '/tmp/test-complex', generateIndex: true, generateStats: true, format: 'standard' };

      const result = await generateMultipleOutputs(products, combinations, config);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Performance Expectations', () => {
    it('should process large product arrays efficiently', async () => {
      // Generate large product array
      const products: Product[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: { regular: Math.random() * 10, currency: 'EUR' },
      }));

      const combinations: FilterCombination[] = [
        { name: 'halal', criteria: { halal: { strict: true, excludeAlcohol: true, excludeGelatine: true } } },
        { name: 'protein', criteria: { protein: { minProteinPer100g: 10, targetDailyAmount: 170 } } },
      ];
      const config: OutputConfig = { outputDir: '/tmp/test-performance', generateIndex: true, generateStats: true, format: 'standard' };

      const startTime = Date.now();
      await generateMultipleOutputs(products, combinations, config);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});

describe('generateFilterIndex - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept FilteredProduct[] parameter', () => {
      const filteredProducts: any[] = []; // Using any to avoid complex type setup for test

      // This should not throw with the correct implementation
      expect(() => generateFilterIndex(filteredProducts)).not.toThrow();
    });
  });

  describe('Return Type Validation', () => {
    it('should return lightweight index object', () => {
      const filteredProducts: any[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
          filterMatch: { halal: true },
        },
      ];

      const result = generateFilterIndex(filteredProducts);

      expect(typeof result).toBe('object');
      expect(Array.isArray(result.products)).toBe(true);
      expect(typeof result.metadata).toBe('object');
    });

    it('should include essential fields only', () => {
      const filteredProducts: any[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.5, currency: 'EUR' },
          filterMatch: { halal: true },
          filterScore: 85,
          categories: ['food', 'protein'],
          // Should exclude heavy fields like full nutrition data
          nutrition: { kcal: 150, protein: 25 },
        },
      ];

      const result = generateFilterIndex(filteredProducts);

      if (result.products.length > 0) {
        const indexProduct = result.products[0];
        expect(indexProduct).toHaveProperty('id');
        expect(indexProduct).toHaveProperty('name');
        expect(indexProduct).toHaveProperty('price');
        expect(indexProduct).toHaveProperty('filterScore');
        // Should NOT include full nutrition object
        expect(indexProduct).not.toHaveProperty('nutrition');
      }
    });
  });
});
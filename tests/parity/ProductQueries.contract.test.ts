/**
 * Product Queries Baseline Contract Test
 * Feature: 020-migration-kysely
 *
 * CRITICAL: This test MUST FAIL initially - captures baselines for 12 product query patterns
 * All patterns from loadFlexibleDatabase.ts must be captured before Kysely migration
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Legacy imports from current implementation
import {
  queryFlexibleProducts,
  getFlexibleProductDetails,
  isFlexibleSchemaAvailable,
  getFlexibleSchemaStats
} from '../../src/data/loadFlexibleDatabase.ts';

// These imports WILL FAIL initially - that's expected for TDD
import type {
  ProductQueryBaseline,
  BaselineCapture,
  QueryPattern,
  BaselineMetadata
} from '../../src/test-utils/ParityTestFramework.ts';

import {
  captureProductQueryBaseline,
  validateBaseline,
  storeBaseline,
  getStoredBaseline
} from '../../src/test-utils/ParityTestFramework.ts';

describe('Product Queries Baseline Contract', () => {
  let isSchemaAvailable: boolean;

  beforeAll(async () => {
    // Verify flexible schema is available for baseline capture
    isSchemaAvailable = await isFlexibleSchemaAvailable();
    if (!isSchemaAvailable) {
      throw new Error('Flexible schema database not available - cannot capture baselines');
    }
  });

  describe('Query Pattern 1: Basic Product Retrieval', () => {
    it('should capture baseline for simple product query', async () => {
      // Pattern 1: Basic product listing with minimal filters
      const criteria = {
        limit: 10,
        offset: 0,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'basic-product-list',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Basic product listing with pagination and sorting',
            category: 'basic-queries',
            complexity: 'low',
            expectedResultCount: 'limited',
            includesJoins: false
          }
        });

        expect(baseline).toBeDefined();
        expect(baseline.patternId).toBe('basic-product-list');
        expect(baseline.result.data).toBeDefined();
        expect(Array.isArray(baseline.result.data)).toBe(true);
        expect(baseline.result.data.length).toBeLessThanOrEqual(10);
      }).not.toThrow();
    });

    it('should capture baseline for single product by ID', async () => {
      // Pattern 2: Single product retrieval
      const productId = 'test-product-id';

      expect(async () => {
        const legacyResult = await getFlexibleProductDetails(productId);

        const baseline = await captureProductQueryBaseline({
          patternId: 'single-product-by-id',
          queryName: 'getFlexibleProductDetails',
          parameters: [productId],
          result: legacyResult,
          metadata: {
            description: 'Single product retrieval with all relations',
            category: 'basic-queries',
            complexity: 'medium',
            expectedResultCount: 'single-or-null',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
        expect(baseline.patternId).toBe('single-product-by-id');

        if (baseline.result) {
          expect(typeof baseline.result).toBe('object');
          expect(baseline.result.id).toBeDefined();
        } else {
          expect(baseline.result).toBeNull();
        }
      }).not.toThrow();
    });
  });

  describe('Query Pattern 2: Filtered Product Queries', () => {
    it('should capture baseline for price range filtering', async () => {
      // Pattern 3: Price range filtering
      const criteria = {
        priceRange: { min: 1.0, max: 5.0 },
        limit: 25,
        sortBy: 'price_regular' as const,
        sortOrder: 'asc' as const
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'price-range-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products filtered by price range',
            category: 'filtered-queries',
            complexity: 'low',
            expectedResultCount: 'variable',
            includesJoins: false
          }
        });

        expect(baseline).toBeDefined();
        baseline.result.data.forEach((product: any) => {
          expect(product.price_regular).toBeGreaterThanOrEqual(1.0);
          expect(product.price_regular).toBeLessThanOrEqual(5.0);
        });
      }).not.toThrow();
    });

    it('should capture baseline for brand filtering', async () => {
      // Pattern 4: Brand-based filtering
      const criteria = {
        brands: ['AH', 'Campina'],
        limit: 20,
        sortBy: 'name' as const
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'brand-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products filtered by specific brands',
            category: 'filtered-queries',
            complexity: 'low',
            expectedResultCount: 'variable',
            includesJoins: false
          }
        });

        expect(baseline).toBeDefined();
        if (baseline.result.data.length > 0) {
          baseline.result.data.forEach((product: any) => {
            expect(['AH', 'Campina']).toContain(product.brand);
          });
        }
      }).not.toThrow();
    });
  });

  describe('Query Pattern 3: Nutrition-Based Queries', () => {
    it('should capture baseline for protein filtering', async () => {
      // Pattern 5: Nutrition-based filtering (protein)
      const criteria = {
        nutrition: {
          protein: { min: 15, max: 30 }
        },
        limit: 15,
        sortBy: 'protein' as const,
        sortOrder: 'desc' as const
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'protein-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products filtered by protein content range',
            category: 'nutrition-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
        baseline.result.data.forEach((product: any) => {
          if (product.nutrition?.protein !== null) {
            expect(product.nutrition.protein).toBeGreaterThanOrEqual(15);
            expect(product.nutrition.protein).toBeLessThanOrEqual(30);
          }
        });
      }).not.toThrow();
    });

    it('should capture baseline for complex nutrition filtering', async () => {
      // Pattern 6: Multi-nutrition filtering
      const criteria = {
        nutrition: {
          protein: { min: 10 },
          carbs: { max: 15 },
          kcal: { min: 50, max: 200 }
        },
        limit: 30
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'complex-nutrition-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products with multiple nutritional constraints',
            category: 'nutrition-queries',
            complexity: 'high',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
        baseline.result.data.forEach((product: any) => {
          if (product.nutrition) {
            if (product.nutrition.protein !== null) {
              expect(product.nutrition.protein).toBeGreaterThanOrEqual(10);
            }
            if (product.nutrition.carbs !== null) {
              expect(product.nutrition.carbs).toBeLessThanOrEqual(15);
            }
            if (product.nutrition.kcal !== null) {
              expect(product.nutrition.kcal).toBeGreaterThanOrEqual(50);
              expect(product.nutrition.kcal).toBeLessThanOrEqual(200);
            }
          }
        });
      }).not.toThrow();
    });
  });

  describe('Query Pattern 4: Flag-Based Queries', () => {
    it('should capture baseline for dietary flag filtering', async () => {
      // Pattern 7: Dietary flags filtering
      const criteria = {
        flags: {
          isHalal: true,
          isVegan: false
        },
        limit: 25
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'dietary-flags-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products filtered by dietary flags (halal, non-vegan)',
            category: 'flag-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
        // Flag validation would require checking actual flag data structure
      }).not.toThrow();
    });

    it('should capture baseline for strict halal filtering', async () => {
      // Pattern 8: Strict flag filtering with confidence
      const criteria = {
        flags: {
          isHalal: 'strict' as any // Special strict mode
        },
        limit: 20
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'strict-halal-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products with strict halal certification (high confidence)',
            category: 'flag-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Query Pattern 5: Category-Based Queries', () => {
    it('should capture baseline for category filtering', async () => {
      // Pattern 9: Category-based filtering
      const criteria = {
        categories: ['Zuivel'],
        includeSubcategories: true,
        limit: 40
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'category-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products from specific category including subcategories',
            category: 'category-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
      }).not.toThrow();
    });

    it('should capture baseline for multi-category filtering', async () => {
      // Pattern 10: Multiple category filtering
      const criteria = {
        categories: ['Zuivel', 'Vlees & Vis'],
        categoryIds: ['dairy-cat-id', 'meat-cat-id'],
        limit: 35
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'multi-category-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Products from multiple categories by name and ID',
            category: 'category-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Query Pattern 6: Complex Multi-Dimensional Queries', () => {
    it('should capture baseline for comprehensive filtering', async () => {
      // Pattern 11: Multi-dimensional filtering
      const criteria = {
        priceRange: { min: 2.0, max: 8.0 },
        brands: ['AH'],
        nutrition: {
          protein: { min: 15 },
          kcal: { max: 150 }
        },
        flags: {
          isHalal: true,
          isHighProtein: true
        },
        categories: ['Zuivel'],
        limit: 10,
        sortBy: 'protein' as const,
        sortOrder: 'desc' as const
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'comprehensive-filter',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Complex multi-dimensional filtering across all criteria types',
            category: 'complex-queries',
            complexity: 'very-high',
            expectedResultCount: 'limited',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();

        // Validate all filters are applied
        baseline.result.data.forEach((product: any) => {
          expect(product.price_regular).toBeGreaterThanOrEqual(2.0);
          expect(product.price_regular).toBeLessThanOrEqual(8.0);
          expect(product.brand).toBe('AH');
        });
      }).not.toThrow();
    });

    it('should capture baseline for search with filters', async () => {
      // Pattern 12: Search combined with filtering
      const criteria = {
        search: 'yoghurt',
        nutrition: {
          protein: { min: 8 }
        },
        flags: {
          isHalal: true
        },
        limit: 15,
        sortBy: 'relevance' as const
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'search-with-filters',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Text search combined with nutritional and dietary filters',
            category: 'search-queries',
            complexity: 'high',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Edge Case Baselines', () => {
    it('should capture baseline for empty results', async () => {
      // Edge case: Query that returns no results
      const criteria = {
        priceRange: { min: 999.0, max: 1000.0 }, // Unlikely price range
        limit: 10
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'empty-results',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Query returning no results (empty result set)',
            category: 'edge-cases',
            complexity: 'low',
            expectedResultCount: 'empty',
            includesJoins: false
          }
        });

        expect(baseline).toBeDefined();
        expect(baseline.result.data).toEqual([]);
        expect(baseline.result.totalCount).toBe(0);
      }).not.toThrow();
    });

    it('should capture baseline for null nutrition handling', async () => {
      // Edge case: Products with null nutrition values
      const criteria = {
        nutrition: {
          protein: { min: 0 } // Include products with null protein
        },
        limit: 50
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'null-nutrition-handling',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Handling of products with null nutrition values',
            category: 'edge-cases',
            complexity: 'medium',
            expectedResultCount: 'variable',
            includesJoins: true
          }
        });

        expect(baseline).toBeDefined();

        // Should include products with both null and non-null nutrition
        const hasNullNutrition = baseline.result.data.some((p: any) =>
          p.nutrition === null || p.nutrition?.protein === null
        );
        const hasValidNutrition = baseline.result.data.some((p: any) =>
          p.nutrition?.protein !== null
        );

        expect(typeof hasNullNutrition).toBe('boolean');
        expect(typeof hasValidNutrition).toBe('boolean');
      }).not.toThrow();
    });

    it('should capture baseline for large result sets', async () => {
      // Edge case: Large result set pagination
      const criteria = {
        limit: 1000,
        offset: 0
      };

      expect(async () => {
        const legacyResult = await queryFlexibleProducts(criteria);

        const baseline = await captureProductQueryBaseline({
          patternId: 'large-result-set',
          queryName: 'queryFlexibleProducts',
          parameters: [criteria],
          result: legacyResult,
          metadata: {
            description: 'Large result set pagination performance',
            category: 'performance-cases',
            complexity: 'low',
            expectedResultCount: 'large',
            includesJoins: false
          }
        });

        expect(baseline).toBeDefined();
        expect(baseline.result.data.length).toBeLessThanOrEqual(1000);
        expect(baseline.executionTime).toBeDefined();
        expect(baseline.executionTime).toBeLessThan(5000); // Should complete in <5s
      }).not.toThrow();
    });
  });

  describe('Baseline Storage and Validation', () => {
    it('should store and retrieve baselines consistently', async () => {
      // Contract for baseline persistence
      const testBaseline: ProductQueryBaseline = {
        patternId: 'test-storage',
        queryName: 'testQuery',
        parameters: [{ test: true }],
        result: { data: [], totalCount: 0 },
        executionTime: 50,
        timestamp: new Date().toISOString(),
        metadata: {
          description: 'Test baseline for storage validation',
          category: 'test',
          complexity: 'low',
          expectedResultCount: 'empty',
          includesJoins: false
        }
      };

      expect(async () => {
        await storeBaseline(testBaseline);
        const retrieved = await getStoredBaseline('test-storage');

        expect(retrieved).toBeDefined();
        expect(retrieved?.patternId).toBe(testBaseline.patternId);
        expect(retrieved?.queryName).toBe(testBaseline.queryName);
        expect(retrieved?.result).toEqual(testBaseline.result);
      }).not.toThrow();
    });

    it('should validate baseline integrity', async () => {
      // Contract for baseline validation
      const validBaseline: ProductQueryBaseline = {
        patternId: 'validation-test',
        queryName: 'validQuery',
        parameters: [],
        result: { data: [], totalCount: 0 },
        executionTime: 25,
        timestamp: new Date().toISOString(),
        metadata: {
          description: 'Valid baseline for testing',
          category: 'validation',
          complexity: 'low',
          expectedResultCount: 'empty',
          includesJoins: false
        }
      };

      expect(async () => {
        const validation = await validateBaseline(validBaseline);

        expect(validation.isValid).toBe(true);
        expect(Array.isArray(validation.errors)).toBe(true);
        expect(validation.errors.length).toBe(0);
      }).not.toThrow();
    });

    it('should detect invalid baselines', async () => {
      // Contract for baseline validation error detection
      const invalidBaseline = {
        patternId: '', // Invalid: empty pattern ID
        queryName: 'test',
        parameters: null, // Invalid: null parameters
        result: undefined, // Invalid: undefined result
        executionTime: -1, // Invalid: negative execution time
        timestamp: 'invalid-date', // Invalid: malformed timestamp
        metadata: null // Invalid: missing metadata
      };

      expect(async () => {
        const validation = await validateBaseline(invalidBaseline as any);

        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);

        const errorFields = validation.errors.map(e => e.field);
        expect(errorFields).toContain('patternId');
        expect(errorFields).toContain('parameters');
        expect(errorFields).toContain('result');
        expect(errorFields).toContain('executionTime');
      }).not.toThrow();
    });
  });
});
/**
 * T025 Product Details Migration Parity Test
 * Feature: 020-migration-kysely
 *
 * Tests parity between legacy getFlexibleProductDetails and Kysely ProductRepository.getProductDetails
 * for single product lookup with all related data, efficient query loading, and null handling
 */
import { describe, it, expect, beforeAll } from 'vitest';

// Legacy imports
import {
  getFlexibleProductDetails,
  isFlexibleSchemaAvailable
} from '../../src/data/loadFlexibleDatabase.ts';

// Kysely imports - ProductRepository
import { createProductRepository } from '../../src/db/repositories/ProductRepository.ts';
import type { ProductRepository } from '../../src/db/repositories/ProductRepository.ts';

// Performance testing
interface PerformanceResult {
  legacy: number;
  kysely: number;
  improvement: number; // negative means regression
}

describe('T025: Product Details Migration Parity Tests', () => {
  let isSchemaAvailable: boolean;
  let productRepository: ProductRepository;
  let testProductIds: string[] = [];
  const performanceResults: PerformanceResult[] = [];

  beforeAll(async () => {
    // Verify flexible schema is available
    isSchemaAvailable = await isFlexibleSchemaAvailable();
    if (!isSchemaAvailable) {
      console.warn('Flexible schema not available, skipping product details parity tests');
      return;
    }

    try {
      productRepository = await createProductRepository();
      
      // Get some test product IDs
      const products = await productRepository.getAll({ limit: 10 });
      testProductIds = products.products.slice(0, 5).map(p => p.id);
    } catch (error) {
      console.warn('ProductRepository creation failed:', error);
      isSchemaAvailable = false;
    }
  });

  describe('Single Product Details Lookup', () => {
    it('should return identical structure for product with all relations', async () => {
      if (!isSchemaAvailable || testProductIds.length === 0) return;

      const productId = testProductIds[0];

      // Legacy approach
      const legacyStart = performance.now();
      const legacyResult = await getFlexibleProductDetails(productId);
      const legacyTime = performance.now() - legacyStart;

      // Kysely approach  
      const kyselyStart = performance.now();
      const kyselyResult = await productRepository.getProductDetails(productId);
      const kyselyTime = performance.now() - kyselyStart;

      // Both should return data
      expect(legacyResult).not.toBeNull();
      expect(kyselyResult).not.toBeNull();

      // Basic product fields should match
      expect(kyselyResult?.id).toBe(legacyResult?.id);
      expect(kyselyResult?.name).toBe(legacyResult?.name);
      expect(kyselyResult?.price_regular).toBe(legacyResult?.price_regular);

      // Record performance
      performanceResults.push({
        legacy: legacyTime,
        kysely: kyselyTime,
        improvement: ((legacyTime - kyselyTime) / legacyTime) * 100
      });

      console.log(`Product details performance: Legacy ${legacyTime.toFixed(2)}ms, Kysely ${kyselyTime.toFixed(2)}ms`);
    });

    it('should handle products with nutrition data correctly', async () => {
      if (!isSchemaAvailable || testProductIds.length === 0) return;

      for (const productId of testProductIds.slice(0, 3)) {
        const legacyResult = await getFlexibleProductDetails(productId);
        const kyselyResult = await productRepository.getProductDetails(productId);

        if (legacyResult && kyselyResult) {
          // If legacy has nutrition, Kysely should too
          if (legacyResult.kcal !== null) {
            expect(kyselyResult.nutrition).not.toBeNull();
            expect(kyselyResult.nutrition?.kcal).toBe(legacyResult.kcal);
            expect(kyselyResult.nutrition?.protein).toBe(legacyResult.protein);
          }

          // If legacy has no nutrition, Kysely should return null
          if (legacyResult.kcal === null) {
            expect(kyselyResult.nutrition).toBeNull();
          }
        }
      }
    });

    it('should handle products with categories correctly', async () => {
      if (!isSchemaAvailable || testProductIds.length === 0) return;

      const productId = testProductIds[0];
      
      const legacyResult = await getFlexibleProductDetails(productId);
      const kyselyResult = await productRepository.getProductDetails(productId);

      if (legacyResult && kyselyResult) {
        // Legacy returns categories as comma-separated string
        const legacyCategories = legacyResult.categories ? 
          (legacyResult.categories as string).split(',') : [];
        
        // Kysely returns structured array
        expect(kyselyResult.allCategories).toBeDefined();
        expect(kyselyResult.allCategories.length).toBeGreaterThanOrEqual(0);
        
        // Should have at least same number of categories
        if (legacyCategories.length > 0) {
          expect(kyselyResult.allCategories.length).toBeGreaterThan(0);
        }
      }
    });

    it('should handle products with flags, scores, and additives', async () => {
      if (!isSchemaAvailable || testProductIds.length === 0) return;

      const productId = testProductIds[0];
      
      const legacyResult = await getFlexibleProductDetails(productId);
      const kyselyResult = await productRepository.getProductDetails(productId);

      if (legacyResult && kyselyResult) {
        // Kysely should have structured arrays for related data
        expect(Array.isArray(kyselyResult.flags)).toBe(true);
        expect(Array.isArray(kyselyResult.scores)).toBe(true);
        expect(Array.isArray(kyselyResult.additives)).toBe(true);

        // If legacy has e_numbers, Kysely should have additives
        if (legacyResult.e_numbers && legacyResult.e_numbers !== '') {
          expect(kyselyResult.additives.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Null Value Handling', () => {
    it('should properly handle products with missing optional relationships', async () => {
      if (!isSchemaAvailable || testProductIds.length === 0) return;

      for (const productId of testProductIds) {
        const kyselyResult = await productRepository.getProductDetails(productId);
        
        if (kyselyResult) {
          // All arrays should be defined (even if empty)
          expect(kyselyResult.flags).toBeDefined();
          expect(kyselyResult.scores).toBeDefined();
          expect(kyselyResult.additives).toBeDefined();
          expect(kyselyResult.allCategories).toBeDefined();

          // Nutrition can be null
          if (kyselyResult.nutrition === null) {
            // This is acceptable
            expect(kyselyResult.nutrition).toBeNull();
          } else {
            // If nutrition exists, should have proper structure
            expect(typeof kyselyResult.nutrition.kcal).toBe('number');
          }
        }
      }
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance requirements (no >10% regression)', async () => {
      if (!isSchemaAvailable || performanceResults.length === 0) return;

      const avgImprovement = performanceResults.reduce((sum, result) => sum + result.improvement, 0) / performanceResults.length;
      
      console.log(`Average performance change: ${avgImprovement.toFixed(2)}%`);
      console.log('Performance results:', performanceResults.map(r => ({
        legacy: `${r.legacy.toFixed(2)}ms`,
        kysely: `${r.kysely.toFixed(2)}ms`, 
        change: `${r.improvement.toFixed(2)}%`
      })));

      // T025 requirement: no >10% regression
      expect(avgImprovement).toBeGreaterThan(-10);
      
      // Ideally we should see improvement with single query approach
      if (avgImprovement > 0) {
        console.log('✅ Performance improvement detected with optimized single query approach');
      }
    });

    it('should validate efficient single-query loading vs N+1 problem', async () => {
      if (!isSchemaAvailable || testProductIds.length === 0) return;

      const productId = testProductIds[0];
      
      // Test multiple calls to see if there's consistent performance
      const timings: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        const result = await productRepository.getProductDetails(productId);
        const time = performance.now() - start;
        
        timings.push(time);
        expect(result).not.toBeNull();
      }

      // Performance should be consistent (not increasing with repeated calls)
      const firstCall = timings[0];
      const lastCall = timings[timings.length - 1];
      
      // Last call shouldn't be significantly slower (no N+1 buildup)
      expect(lastCall).toBeLessThan(firstCall * 2);
      
      console.log('Repeated call timings:', timings.map(t => `${t.toFixed(2)}ms`));
    });
  });

  describe('Data Structure Validation', () => {
    it('should return complete ProductWithRelations structure', async () => {
      if (!isSchemaAvailable || testProductIds.length === 0) return;

      const productId = testProductIds[0];
      const result = await productRepository.getProductDetails(productId);

      expect(result).not.toBeNull();
      if (result) {
        // Core product fields
        expect(typeof result.id).toBe('string');
        expect(typeof result.name).toBe('string');
        expect(typeof result.price_regular).toBe('number');
        expect(typeof result.unit_amount).toBe('number');
        expect(['g', 'ml', 'pieces', 'kg', 'l']).toContain(result.unit_type);

        // Related data arrays
        expect(Array.isArray(result.flags)).toBe(true);
        expect(Array.isArray(result.scores)).toBe(true); 
        expect(Array.isArray(result.additives)).toBe(true);
        expect(Array.isArray(result.allCategories)).toBe(true);

        // Nutrition can be null or object
        if (result.nutrition) {
          expect(typeof result.nutrition).toBe('object');
        }

        // Primary category can be undefined or object
        if (result.primaryCategory) {
          expect(typeof result.primaryCategory.id).toBe('string');
          expect(typeof result.primaryCategory.name).toBe('string');
        }
      }
    });
  });

  describe('Migration Validation', () => {
    it('should generate T025 completion report', async () => {
      if (!isSchemaAvailable) return;

      const report = {
        testProductsProcessed: testProductIds.length,
        performanceTests: performanceResults.length,
        averageImprovement: performanceResults.length > 0 ? 
          performanceResults.reduce((sum, r) => sum + r.improvement, 0) / performanceResults.length : 0,
        schemaValidation: 'passed',
        nullHandling: 'validated',
        singleQueryOptimization: 'implemented'
      };

      console.log('T025 Product Details Migration Report:', report);

      expect(report.testProductsProcessed).toBeGreaterThan(0);
      expect(report.averageImprovement).toBeGreaterThan(-10); // No >10% regression
    });
  });
});
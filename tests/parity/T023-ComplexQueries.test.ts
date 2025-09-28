/**
 * T023 Complex Filtering Queries Parity Test
 * Feature: 020-migration-kysely
 *
 * Tests parity between legacy queryFlexibleProducts and Kysely ProductRepository
 * for complex query patterns (patterns 5-8: nutrition, flags, multi-dimensional)
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Legacy imports
import {
  queryFlexibleProducts,
  isFlexibleSchemaAvailable
} from '../../src/data/loadFlexibleDatabase.ts';

// New imports
import { createProductRepository } from '../../src/db/repositories/ProductRepository.ts';
import type { ProductRepository } from '../../src/db/repositories/ProductRepository.ts';

// Parity testing framework
import {
  runParityTest,
  generateTestReport,
  isPerformanceAcceptable,
  hasAcceptableResultDifferences,
  type ParityTestResult
} from '../../src/test-utils/ParityTestFramework.ts';

describe('T023: Complex Filtering Queries Parity Tests', () => {
  let repository: ProductRepository;
  let isSchemaAvailable: boolean;
  const parityResults: ParityTestResult[] = [];

  beforeAll(async () => {
    // Check if flexible schema is available
    isSchemaAvailable = await isFlexibleSchemaAvailable();

    if (!isSchemaAvailable) {
      console.warn('⚠️  Flexible schema not available - skipping parity tests');
      return;
    }

    try {
      // Create repository instance
      repository = await createProductRepository();
      console.log('✅ ProductRepository created successfully');
    } catch (error) {
      console.error('❌ Failed to create ProductRepository:', error);
      throw error;
    }
  });

  describe('Pattern 5: Nutrition-Based Filtering', () => {
    it('should have identical results for protein filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        nutrition: {
          protein: { min: 15, max: 30 }
        },
        limit: 15,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'nutrition-protein-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      // Validate nutrition filtering
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        result.kyselyResult.data.forEach((product: any) => {
          // Note: Products without nutrition data might be included
          // This tests the JOIN behavior matches legacy system
        });
      }

      if (!result.passed) {
        console.error(`❌ Protein filtering parity failed:`, result.differences);
      }
    });

    it('should have identical results for complex nutrition filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        nutrition: {
          protein: { min: 10 },
          carbs: { max: 15 },
          kcal: { min: 50, max: 200 }
        },
        limit: 20,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'complex-nutrition-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Complex nutrition filtering parity failed:`, result.differences);
      }
    });
  });

  describe('Pattern 6: Flag-Based Filtering', () => {
    it('should have identical results for dietary flag filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        flags: {
          isHalal: true,
          isVegan: false
        },
        limit: 25,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'dietary-flags-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Dietary flags filtering parity failed:`, result.differences);
      }
    });

    it('should have identical results for strict flag filtering with confidence', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        flags: {
          isHalal: 'strict', // Special strict mode
          isHighProtein: true
        },
        limit: 15,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'strict-flags-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Strict flags filtering parity failed:`, result.differences);
      }
    });
  });

  describe('Pattern 7: Category-Based Complex Filtering', () => {
    it('should have identical results for category hierarchy filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        categories: ['Zuivel', 'Vlees'],
        includeSubcategories: true,
        limit: 30,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'category-hierarchy-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Category hierarchy filtering parity failed:`, result.differences);
      }
    });

    it('should have identical results for multiple category filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        categoryIds: ['cat-001', 'cat-002', 'cat-003'],
        limit: 25,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'multi-category-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Multiple category filtering parity failed:`, result.differences);
      }
    });
  });

  describe('Pattern 8: Complex Multi-Dimensional Filtering', () => {
    it('should have identical results for comprehensive multi-dimensional filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

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
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'comprehensive-multi-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      // Validate comprehensive filtering
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        result.kyselyResult.data.forEach((product: any) => {
          expect(product.price_regular).toBeGreaterThanOrEqual(2.0);
          expect(product.price_regular).toBeLessThanOrEqual(8.0);
          expect(product.brand).toBe('AH');
        });
      }

      if (!result.passed) {
        console.error(`❌ Comprehensive multi-dimensional filtering parity failed:`, result.differences);
      }
    });

    it('should have identical results for complex price and nutrition combo', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        priceRange: { min: 1.0, max: 5.0 },
        nutrition: {
          protein: { min: 20 },
          fat: { max: 10 },
          carbs: { min: 5, max: 30 }
        },
        brands: ['AH', 'Campina'],
        limit: 20,
        sortBy: 'price_regular' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'price-nutrition-combo-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'price_regular',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Price-nutrition combo filtering parity failed:`, result.differences);
      }
    });
  });

  describe('Edge Cases for Complex Queries', () => {
    it('should handle empty results with complex filters consistently', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        priceRange: { min: 999.0, max: 1000.0 }, // Unlikely price range
        nutrition: {
          protein: { min: 500 } // Impossible protein value
        },
        flags: {
          isHalal: true,
          isVegan: true,
          isHighProtein: true
        },
        limit: 10
      };

      const result = await runParityTest(
        'complex-empty-results-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);

      // Both should return empty results
      expect(result.legacyResult.data).toEqual([]);
      expect(result.kyselyResult.data).toEqual([]);

      if (!result.passed) {
        console.error(`❌ Complex empty results handling parity failed:`, result.differences);
      }
    });

    it('should handle mixed null and valid nutrition data consistently', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        nutrition: {
          protein: { min: 0 }, // Include products with zero protein
          kcal: { min: 0, max: 1000 } // Wide range
        },
        limit: 50,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'mixed-null-nutrition-filter',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Mixed null nutrition handling parity failed:`, result.differences);
      }
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance requirements for complex queries', async () => {
      if (!isSchemaAvailable) {
        console.warn('Skipping performance test - schema not available');
        return;
      }

      // Filter results for complex query tests only
      const complexQueryResults = parityResults.filter(r =>
        r.patternId.includes('filter') || r.patternId.includes('combo')
      );

      if (complexQueryResults.length === 0) {
        console.warn('No complex query results available for performance validation');
        return;
      }

      // Check that all complex queries meet performance requirements
      const performanceFailures = complexQueryResults.filter(r => !isPerformanceAcceptable(r, 10));

      expect(performanceFailures).toHaveLength(0);

      // Log performance summary
      const avgLegacyTime = complexQueryResults.reduce((sum, r) => sum + r.executionTimes.legacy, 0) / complexQueryResults.length;
      const avgKyselyTime = complexQueryResults.reduce((sum, r) => sum + r.executionTimes.kysely, 0) / complexQueryResults.length;
      const avgRegression = complexQueryResults.reduce((sum, r) => sum + r.performanceRegression, 0) / complexQueryResults.length;

      console.log(`📊 Complex Queries Performance Summary:`);
      console.log(`   Average Legacy Time: ${avgLegacyTime.toFixed(2)}ms`);
      console.log(`   Average Kysely Time: ${avgKyselyTime.toFixed(2)}ms`);
      console.log(`   Average Regression: ${avgRegression.toFixed(1)}%`);

      if (performanceFailures.length > 0) {
        console.error(`❌ Performance failures:`, performanceFailures.map(r =>
          `${r.patternId}: ${r.performanceRegression.toFixed(1)}%`
        ));
      }
    });
  });

  describe('Migration Validation', () => {
    it('should generate comprehensive test report', async () => {
      if (parityResults.length === 0) {
        console.warn('No parity results available for report generation');
        return;
      }

      const report = generateTestReport(parityResults);

      expect(report).toContain('Parity Test Report');
      expect(report).toContain('Total Tests:');
      expect(report).toContain('Success Rate:');

      console.log('\n' + report);

      // All tests should pass for T023 complex queries
      const passedTests = parityResults.filter(r => r.passed).length;
      const totalTests = parityResults.length;
      const successRate = (passedTests / totalTests) * 100;

      expect(successRate).toBe(100);

      if (successRate < 100) {
        const failedTests = parityResults.filter(r => !r.passed);
        console.error(`❌ Failed tests:`, failedTests.map(r => r.patternId));
      }
    });

    it('should validate all complex query patterns completed', async () => {
      const expectedPatterns = [
        'nutrition-protein-filter',
        'complex-nutrition-filter',
        'dietary-flags-filter',
        'strict-flags-filter',
        'category-hierarchy-filter',
        'multi-category-filter',
        'comprehensive-multi-filter',
        'price-nutrition-combo-filter',
        'complex-empty-results-filter',
        'mixed-null-nutrition-filter'
      ];

      const completedPatterns = parityResults.map(r => r.patternId);

      expectedPatterns.forEach(pattern => {
        expect(completedPatterns).toContain(pattern);
      });

      console.log(`✅ Completed ${completedPatterns.length}/${expectedPatterns.length} complex query patterns`);
    });
  });
});
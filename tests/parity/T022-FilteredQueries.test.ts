/**
 * T022 Filtered Queries Parity Test
 * Feature: 020-migration-kysely
 *
 * Tests parity between legacy queryFlexibleProducts and Kysely ProductRepository
 * for filtered query patterns (patterns 3-4: price, brand filtering)
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

describe('T022: Filtered Queries Parity Tests', () => {
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

  describe('Pattern 3: Price Range Filtering', () => {
    it('should have identical results for price range filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        priceRange: { min: 1.0, max: 5.0 },
        limit: 25,
        sortBy: 'price' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'price-range-filter',
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

      // Validate that all returned products are within price range
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        result.kyselyResult.data.forEach((product: any) => {
          expect(product.price_regular).toBeGreaterThanOrEqual(1.0);
          expect(product.price_regular).toBeLessThanOrEqual(5.0);
        });
      }

      if (!result.passed) {
        console.error(`❌ Price range filtering parity failed:`, result.differences);
      }
    });

    it('should handle min-only price filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        priceRange: { min: 10.0 },
        limit: 15,
        sortBy: 'price' as const,
        sortOrder: 'desc' as const
      };

      const result = await runParityTest(
        'price-min-filter',
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

      // Validate that all returned products meet minimum price
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        result.kyselyResult.data.forEach((product: any) => {
          expect(product.price_regular).toBeGreaterThanOrEqual(10.0);
        });
      }

      if (!result.passed) {
        console.error(`❌ Minimum price filtering parity failed:`, result.differences);
      }
    });

    it('should handle max-only price filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        priceRange: { max: 3.0 },
        limit: 20,
        sortBy: 'price' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'price-max-filter',
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

      // Validate that all returned products meet maximum price
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        result.kyselyResult.data.forEach((product: any) => {
          expect(product.price_regular).toBeLessThanOrEqual(3.0);
        });
      }

      if (!result.passed) {
        console.error(`❌ Maximum price filtering parity failed:`, result.differences);
      }
    });
  });

  describe('Pattern 4: Brand Filtering', () => {
    it('should have identical results for single brand filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        brands: ['AH'],
        limit: 20,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'single-brand-filter',
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

      // Validate that all returned products have correct brand
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        result.kyselyResult.data.forEach((product: any) => {
          expect(product.brand).toBe('AH');
        });
      }

      if (!result.passed) {
        console.error(`❌ Single brand filtering parity failed:`, result.differences);
      }
    });

    it('should have identical results for multiple brand filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        brands: ['AH', 'Campina', 'Calvé'],
        limit: 30,
        sortBy: 'name' as const
      };

      const result = await runParityTest(
        'multi-brand-filter',
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

      // Validate that all returned products have one of the specified brands
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        const allowedBrands = ['AH', 'Campina', 'Calvé'];
        result.kyselyResult.data.forEach((product: any) => {
          expect(allowedBrands).toContain(product.brand);
        });
      }

      if (!result.passed) {
        console.error(`❌ Multiple brand filtering parity failed:`, result.differences);
      }
    });
  });

  describe('Pattern 5: Combined Price and Brand Filtering', () => {
    it('should have identical results for combined price and brand filtering', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        priceRange: { min: 2.0, max: 8.0 },
        brands: ['AH'],
        limit: 15,
        sortBy: 'price' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'combined-price-brand-filter',
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

      // Validate that all returned products meet both criteria
      if (result.kyselyResult?.data && Array.isArray(result.kyselyResult.data)) {
        result.kyselyResult.data.forEach((product: any) => {
          expect(product.price_regular).toBeGreaterThanOrEqual(2.0);
          expect(product.price_regular).toBeLessThanOrEqual(8.0);
          expect(product.brand).toBe('AH');
        });
      }

      if (!result.passed) {
        console.error(`❌ Combined price and brand filtering parity failed:`, result.differences);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results consistently', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        priceRange: { min: 999.0, max: 1000.0 }, // Unlikely price range
        limit: 10
      };

      const result = await runParityTest(
        'empty-results-filter',
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
        console.error(`❌ Empty results handling parity failed:`, result.differences);
      }
    });

    it('should handle non-existent brand consistently', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        brands: ['NonExistentBrand12345'],
        limit: 10
      };

      const result = await runParityTest(
        'non-existent-brand-filter',
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
        console.error(`❌ Non-existent brand handling parity failed:`, result.differences);
      }
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance requirements for filtered queries', async () => {
      if (!isSchemaAvailable) {
        console.warn('Skipping performance test - schema not available');
        return;
      }

      // Filter results for filtered query tests only
      const filteredQueryResults = parityResults.filter(r =>
        r.patternId.includes('filter')
      );

      if (filteredQueryResults.length === 0) {
        console.warn('No filtered query results available for performance validation');
        return;
      }

      // Check that all filtered queries meet performance requirements
      const performanceFailures = filteredQueryResults.filter(r => !isPerformanceAcceptable(r, 10));

      expect(performanceFailures).toHaveLength(0);

      // Log performance summary
      const avgLegacyTime = filteredQueryResults.reduce((sum, r) => sum + r.executionTimes.legacy, 0) / filteredQueryResults.length;
      const avgKyselyTime = filteredQueryResults.reduce((sum, r) => sum + r.executionTimes.kysely, 0) / filteredQueryResults.length;
      const avgRegression = filteredQueryResults.reduce((sum, r) => sum + r.performanceRegression, 0) / filteredQueryResults.length;

      console.log(`📊 Filtered Queries Performance Summary:`);
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

      // All tests should pass for T022 filtered queries
      const passedTests = parityResults.filter(r => r.passed).length;
      const totalTests = parityResults.length;
      const successRate = (passedTests / totalTests) * 100;

      expect(successRate).toBe(100);

      if (successRate < 100) {
        const failedTests = parityResults.filter(r => !r.passed);
        console.error(`❌ Failed tests:`, failedTests.map(r => r.patternId));
      }
    });

    it('should validate all filtered query patterns completed', async () => {
      const expectedPatterns = [
        'price-range-filter',
        'price-min-filter',
        'price-max-filter',
        'single-brand-filter',
        'multi-brand-filter',
        'combined-price-brand-filter',
        'empty-results-filter',
        'non-existent-brand-filter'
      ];

      const completedPatterns = parityResults.map(r => r.patternId);

      expectedPatterns.forEach(pattern => {
        expect(completedPatterns).toContain(pattern);
      });

      console.log(`✅ Completed ${completedPatterns.length}/${expectedPatterns.length} filtered query patterns`);
    });
  });
});
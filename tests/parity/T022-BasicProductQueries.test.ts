/**
 * T022 Basic Product Queries Parity Test
 * Feature: 020-migration-kysely
 *
 * Tests parity between legacy queryFlexibleProducts and Kysely ProductRepository
 * for basic query patterns (patterns 1-2)
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Legacy imports
import {
  queryFlexibleProducts,
  getFlexibleProductDetails,
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

describe('T022: Basic Product Queries Parity Tests', () => {
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

  describe('Pattern 1: Basic Product Retrieval', () => {
    it('should have identical results for simple product query', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        limit: 10,
        offset: 0,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'basic-product-list',
        () => queryFlexibleProducts(criteria),
        () => repository.queryFlexibleProducts(criteria),
        {
          sortBy: 'name',
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp'] // Ignore timing fields
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Basic product list parity failed:`, result.differences);
      }
    });

    it('should have identical results for basic product query with different limits', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        limit: 25,
        offset: 10,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'basic-product-list-paginated',
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
        console.error(`❌ Paginated product list parity failed:`, result.differences);
      }
    });

    it('should have identical results for price-based sorting', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const criteria = {
        limit: 15,
        sortBy: 'price' as const,
        sortOrder: 'asc' as const
      };

      const result = await runParityTest(
        'basic-product-list-price-sorted',
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
        console.error(`❌ Price-sorted product list parity failed:`, result.differences);
      }
    });
  });

  describe('Pattern 2: Single Product Retrieval', () => {
    it('should have identical results for single product by ID', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      // First get a valid product ID from the basic query
      const basicQuery = await queryFlexibleProducts({ limit: 1 });
      if (basicQuery.data.length === 0) {
        console.warn('No products available for single product test');
        return;
      }

      const productId = basicQuery.data[0].id;

      const result = await runParityTest(
        'single-product-by-id',
        () => getFlexibleProductDetails(productId),
        () => repository.getFlexibleProductDetails(productId),
        {
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp', 'computed_at'] // Ignore computed timestamps
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);
      expect(isPerformanceAcceptable(result, 10)).toBe(true);

      if (!result.passed) {
        console.error(`❌ Single product retrieval parity failed:`, result.differences);
      }
    });

    it('should handle non-existent product ID consistently', async () => {
      if (!isSchemaAvailable || !repository) {
        console.warn('Skipping test - schema or repository not available');
        return;
      }

      const nonExistentId = 'non-existent-product-id-12345';

      const result = await runParityTest(
        'single-product-not-found',
        () => getFlexibleProductDetails(nonExistentId),
        () => repository.getFlexibleProductDetails(nonExistentId),
        {
          tolerance: 0.001,
          ignoreFields: ['queryTimeMs', 'timestamp']
        }
      );

      parityResults.push(result);

      expect(result.passed).toBe(true);
      expect(hasAcceptableResultDifferences(result, 0)).toBe(true);

      // Both should return null for non-existent product
      expect(result.legacyResult).toBeNull();
      expect(result.kyselyResult).toBeNull();

      if (!result.passed) {
        console.error(`❌ Non-existent product handling parity failed:`, result.differences);
      }
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance requirements for basic queries', async () => {
      if (!isSchemaAvailable) {
        console.warn('Skipping performance test - schema not available');
        return;
      }

      // Filter results for basic query tests only
      const basicQueryResults = parityResults.filter(r =>
        r.patternId.startsWith('basic-product-') || r.patternId.startsWith('single-product-')
      );

      if (basicQueryResults.length === 0) {
        console.warn('No basic query results available for performance validation');
        return;
      }

      // Check that all basic queries meet performance requirements
      const performanceFailures = basicQueryResults.filter(r => !isPerformanceAcceptable(r, 10));

      expect(performanceFailures).toHaveLength(0);

      // Log performance summary
      const avgLegacyTime = basicQueryResults.reduce((sum, r) => sum + r.executionTimes.legacy, 0) / basicQueryResults.length;
      const avgKyselyTime = basicQueryResults.reduce((sum, r) => sum + r.executionTimes.kysely, 0) / basicQueryResults.length;
      const avgRegression = basicQueryResults.reduce((sum, r) => sum + r.performanceRegression, 0) / basicQueryResults.length;

      console.log(`📊 Basic Queries Performance Summary:`);
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

      // All tests should pass for T022 basic queries
      const passedTests = parityResults.filter(r => r.passed).length;
      const totalTests = parityResults.length;
      const successRate = (passedTests / totalTests) * 100;

      expect(successRate).toBe(100);

      if (successRate < 100) {
        const failedTests = parityResults.filter(r => !r.passed);
        console.error(`❌ Failed tests:`, failedTests.map(r => r.patternId));
      }
    });

    it('should validate all test patterns completed', async () => {
      const expectedPatterns = [
        'basic-product-list',
        'basic-product-list-paginated',
        'basic-product-list-price-sorted',
        'single-product-by-id',
        'single-product-not-found'
      ];

      const completedPatterns = parityResults.map(r => r.patternId);

      expectedPatterns.forEach(pattern => {
        expect(completedPatterns).toContain(pattern);
      });

      console.log(`✅ Completed ${completedPatterns.length}/${expectedPatterns.length} basic query patterns`);
    });
  });
});
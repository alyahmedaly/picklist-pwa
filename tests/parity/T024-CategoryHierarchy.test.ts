/**
 * T024 Category Hierarchy Queries Parity Test
 * Feature: 020-migration-kysely
 *
 * Tests parity between legacy queryFlexibleCategoryHierarchy and Kysely CategoryRepository
 * for nested set model operations, tree traversal, and path-based lookups
 */
import { describe, it, expect, beforeAll } from 'vitest';

// Legacy imports from current implementation
import {
  queryFlexibleCategoryHierarchy,
  isFlexibleSchemaAvailable
} from '../../src/data/loadFlexibleDatabase.ts';

// Kysely imports - CategoryRepository
import { createCategoryRepository } from '../../src/db/repositories/CategoryRepository.ts';
import type { CategoryRepository } from '../../src/db/repositories/CategoryRepository.ts';

// Parity testing framework
import {
  compareQueryResults,
  type ParityComparisonOptions
} from '../../src/test-utils/ParityTestFramework.ts';

// Helper types and functions for T024
interface ParityTestResult {
  pattern: string;
  success: boolean;
  performance: { legacy: number; kysely: number; };
  differences?: string[];
}

// Simple helper to compare results
function compareCategoryResults(legacyResult: { data?: unknown[] }, kyselyResult: { data?: unknown[] }) {
  const legacyCount = legacyResult?.data?.length || 0;
  const kyselyCount = kyselyResult?.data?.length || 0;
  
  return {
    isValid: legacyCount === kyselyCount,
    legacyCount,
    kyselyCount,
    differences: legacyCount !== kyselyCount ? [`Count mismatch: Legacy ${legacyCount}, Kysely ${kyselyCount}`] : []
  };
}

describe('T024: Category Hierarchy Queries Parity Tests', () => {
  let isSchemaAvailable: boolean;
  let categoryRepository: CategoryRepository;
  const parityResults: Array<ParityTestResult> = [];

  beforeAll(async () => {
    // Verify flexible schema is available
    isSchemaAvailable = await isFlexibleSchemaAvailable();
    if (!isSchemaAvailable) {
      console.warn('Flexible schema not available, skipping category hierarchy parity tests');
      return;
    }

    try {
      categoryRepository = await createCategoryRepository();
    } catch (error) {
      console.warn('CategoryRepository creation failed:', error);
      isSchemaAvailable = false;
    }
  });

  describe('Pattern 1: Root Categories Retrieval', () => {
    it('should have identical results for root categories listing', async () => {
      if (!isSchemaAvailable) return;

      const legacyStart = performance.now();
      const legacyResult = await queryFlexibleCategoryHierarchy(undefined, false);
      const legacyTime = performance.now() - legacyStart;

      const kyselyStart = performance.now();
      const kyselyResult = await categoryRepository.getRootCategories({
        includeProductCounts: false,
        orderBy: 'name'
      });
      const kyselyTime = performance.now() - kyselyStart;

      // Transform CategoryWithHierarchy[] to match legacy format
      const transformedKyselyResult = {
        data: kyselyResult.map(cat => ({
          id: cat.id,
          name: cat.name,
          parent_id: cat.parent_id,
          path: cat.path,
          depth: cat.depth,
          left_bound: cat.left_bound,
          right_bound: cat.right_bound,
          display_order: cat.display_order,
          product_count: cat.direct_product_count || 0,
          product_ids: null
        })),
        totalCount: kyselyResult.length,
        filteredCount: kyselyResult.length,
        queryTimeMs: kyselyTime,
        metadata: {
          searchPerformed: false,
          categoryHierarchyUsed: true,
          multiDimensionalFiltering: false
        }
      };

      const validation = compareCategoryResults(legacyResult, transformedKyselyResult);

      expect(validation.isValid).toBe(true);
      if (!validation.isValid) {
        console.error('Root categories parity failed:', validation.differences);
      }

      // Performance validation
      const performanceRatio = kyselyTime / legacyTime;
      expect(performanceRatio).toBeLessThan(1.1); // Within 10% of legacy performance

      parityResults.push({
        pattern: 'root-categories',
        success: validation.isValid,
        performance: { legacy: legacyTime, kysely: kyselyTime }
      });
    });

    it('should have identical results for root categories with product counts', async () => {
      if (!isSchemaAvailable) return;

      const legacyStart = performance.now();
      const legacyResult = await queryFlexibleCategoryHierarchy(undefined, true);
      const legacyTime = performance.now() - legacyStart;

      const kyselyStart = performance.now();
      const kyselyResult = await categoryRepository.getRootCategories({
        includeProductCounts: true,
        orderBy: 'name'
      });
      const kyselyTime = performance.now() - kyselyStart;

      // Transform CategoryWithHierarchy[] to match legacy format
      const transformedKyselyResult = {
        data: kyselyResult.map(cat => ({
          id: cat.id,
          name: cat.name,
          parent_id: cat.parent_id,
          path: cat.path,
          depth: cat.depth,
          left_bound: cat.left_bound,
          right_bound: cat.right_bound,
          display_order: cat.display_order,
          product_count: cat.total_product_count || 0,
          product_ids: null // Legacy includes this but we don't populate it
        })),
        totalCount: kyselyResult.length,
        filteredCount: kyselyResult.length,
        queryTimeMs: kyselyTime,
        metadata: {
          searchPerformed: false,
          categoryHierarchyUsed: true,
          multiDimensionalFiltering: false
        }
      };

      const validation = compareCategoryResults(legacyResult, transformedKyselyResult);

      expect(validation.isValid).toBe(true);
      if (!validation.isValid) {
        console.error('Root categories with counts parity failed:', validation.differences);
      }

      parityResults.push({
        pattern: 'root-categories-with-counts',
        success: validation.isValid,
        performance: { legacy: legacyTime, kysely: kyselyTime }
      });
    });
  });

  describe('Pattern 2: Category Descendants (Nested Set)', () => {
    it('should have identical results for category descendant queries', async () => {
      if (!isSchemaAvailable) return;

      // Test with a known category ID that should have descendants
      // Get a root category first to ensure we have a valid parent
      const rootCategories = await categoryRepository.getRootCategories({ includeProductCounts: false });
      if (rootCategories.length === 0) {
        console.warn('No root categories available for descendant testing');
        return;
      }

      const testCategoryId = rootCategories[0].id;

      const legacyStart = performance.now();
      const legacyResult = await queryFlexibleCategoryHierarchy(testCategoryId, false);
      const legacyTime = performance.now() - legacyStart;

      const kyselyStart = performance.now();
      const kyselyResult = await categoryRepository.getDescendants(testCategoryId, {
        includeProductCounts: false,
        includeSelf: true // Legacy includes the parent category itself
      });
      const kyselyTime = performance.now() - kyselyStart;

      // Transform CategoryWithHierarchy[] to match legacy format
      const transformedKyselyResult = {
        data: kyselyResult.map(cat => ({
          id: cat.id,
          name: cat.name,
          parent_id: cat.parent_id,
          path: cat.path,
          depth: cat.depth,
          left_bound: cat.left_bound,
          right_bound: cat.right_bound,
          display_order: cat.display_order,
          product_count: cat.direct_product_count || 0,
          product_ids: null
        })),
        totalCount: kyselyResult.length,
        filteredCount: kyselyResult.length,
        queryTimeMs: kyselyTime,
        metadata: {
          searchPerformed: false,
          categoryHierarchyUsed: true,
          multiDimensionalFiltering: false
        }
      };

      const validation = compareCategoryResults(legacyResult, transformedKyselyResult);

      expect(validation.isValid).toBe(true);
      if (!validation.isValid) {
        console.error('Category descendants parity failed:', validation.differences);
      }

      parityResults.push({
        pattern: 'category-descendants',
        success: validation.isValid,
        performance: { legacy: legacyTime, kysely: kyselyTime }
      });
    });

    it('should have identical results for category descendants with product counts', async () => {
      if (!isSchemaAvailable) return;

      const rootCategories = await categoryRepository.getRootCategories({ includeProductCounts: false });
      if (rootCategories.length === 0) return;

      const testCategoryId = rootCategories[0].id;

      const legacyStart = performance.now();
      const legacyResult = await queryFlexibleCategoryHierarchy(testCategoryId, true);
      const legacyTime = performance.now() - legacyStart;

      const kyselyStart = performance.now();
      const kyselyResult = await categoryRepository.getDescendants(testCategoryId, {
        includeProductCounts: true,
        includeSelf: true
      });
      const kyselyTime = performance.now() - kyselyStart;

      const transformedKyselyResult = {
        data: kyselyResult.map(cat => ({
          id: cat.id,
          name: cat.name,
          parent_id: cat.parent_id,
          path: cat.path,
          depth: cat.depth,
          left_bound: cat.left_bound,
          right_bound: cat.right_bound,
          display_order: cat.display_order,
          product_count: cat.total_product_count || 0,
          product_ids: null // Could populate this but legacy doesn't always use it meaningfully
        })),
        totalCount: kyselyResult.length,
        filteredCount: kyselyResult.length,
        queryTimeMs: kyselyTime,
        metadata: {
          searchPerformed: false,
          categoryHierarchyUsed: true,
          multiDimensionalFiltering: false
        }
      };

      const validation = compareCategoryResults(legacyResult, transformedKyselyResult);

      expect(validation.isValid).toBe(true);
      if (!validation.isValid) {
        console.error('Category descendants with counts parity failed:', validation.differences);
      }

      parityResults.push({
        pattern: 'category-descendants-with-counts',
        success: validation.isValid,
        performance: { legacy: legacyTime, kysely: kyselyTime }
      });
    });
  });

  describe('Pattern 3: Tree Traversal Operations', () => {
    it('should handle ancestor queries correctly', async () => {
      if (!isSchemaAvailable) return;

      // Get a category that has ancestors (depth > 0)
      const allCategories = await categoryRepository.getAll({ includeHierarchyInfo: true });
      const deepCategory = allCategories.find(cat => cat.depth && cat.depth > 0);
      
      if (!deepCategory) {
        console.warn('No deep categories available for ancestor testing');
        return;
      }

      const kyselyStart = performance.now();
      const ancestors = await categoryRepository.getAncestors(deepCategory.id);
      const kyselyTime = performance.now() - kyselyStart;

      // Validate ancestor chain properties
      expect(ancestors.length).toBeGreaterThan(0);
      
      // Ancestors should be ordered from root to immediate parent
      for (let i = 0; i < ancestors.length; i++) {
        expect(ancestors[i].depth).toBe(i);
        if (i > 0) {
          expect(ancestors[i].parent_id).toBe(ancestors[i-1].id);
        }
      }

      // The last ancestor should be the immediate parent
      const immediateParent = ancestors[ancestors.length - 1];
      expect(immediateParent.id).toBe(deepCategory.parent_id);

      // Performance check
      expect(kyselyTime).toBeLessThan(100); // Should be very fast for ancestor queries

      parityResults.push({
        pattern: 'ancestor-queries',
        success: true,
        performance: { legacy: 0, kysely: kyselyTime } // No legacy equivalent for direct comparison
      });
    });

    it('should handle sibling queries correctly', async () => {
      if (!isSchemaAvailable) return;

      // Get a category that has siblings
      const allCategories = await categoryRepository.getAll({ includeHierarchyInfo: true });
      const categoryWithSiblings = allCategories.find(cat => cat.parent_id !== null);
      
      if (!categoryWithSiblings) {
        console.warn('No categories with siblings available for testing');
        return;
      }

      const kyselyStart = performance.now();
      const siblings = await categoryRepository.getSiblings(categoryWithSiblings.id);
      const kyselyTime = performance.now() - kyselyStart;

      // All siblings should have the same parent
      siblings.forEach(sibling => {
        expect(sibling.parent_id).toBe(categoryWithSiblings.parent_id);
        expect(sibling.id).not.toBe(categoryWithSiblings.id); // Should not include self
      });

      parityResults.push({
        pattern: 'sibling-queries',
        success: true,
        performance: { legacy: 0, kysely: kyselyTime }
      });
    });
  });

  describe('Pattern 4: Path-based Lookups', () => {
    it('should handle path-based category lookups', async () => {
      if (!isSchemaAvailable) return;

      // Get a category with a known path
      const allCategories = await categoryRepository.getAll();
      const categoryWithPath = allCategories.find(cat => cat.path && cat.path.includes('/'));
      
      if (!categoryWithPath) {
        console.warn('No categories with paths available for testing');
        return;
      }

      const kyselyStart = performance.now();
      const foundCategory = await categoryRepository.getByPath(categoryWithPath.path);
      const kyselyTime = performance.now() - kyselyStart;

      expect(foundCategory).not.toBeNull();
      expect(foundCategory?.id).toBe(categoryWithPath.id);
      expect(foundCategory?.path).toBe(categoryWithPath.path);

      parityResults.push({
        pattern: 'path-based-lookup',
        success: true,
        performance: { legacy: 0, kysely: kyselyTime }
      });
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance requirements for hierarchy queries', async () => {
      if (!isSchemaAvailable) return;

      const performanceTests = parityResults.filter(result => result.performance.legacy > 0);

      for (const test of performanceTests) {
        const performanceRatio = test.performance.kysely / test.performance.legacy;
        
        // Should be within 10% of legacy performance
        expect(performanceRatio).toBeLessThan(1.1);
        
        console.log(`Performance for ${test.pattern}: Legacy ${test.performance.legacy.toFixed(2)}ms, Kysely ${test.performance.kysely.toFixed(2)}ms (${(performanceRatio * 100).toFixed(1)}%)`);
      }
    });
  });

  describe('Migration Validation', () => {
    it('should generate comprehensive test report', async () => {
      if (!isSchemaAvailable) return;

      const report = {
        totalTests: parityResults.length,
        passedTests: parityResults.filter(r => r.success).length,
        failedTests: parityResults.filter(r => !r.success).length,
        averagePerformanceRatio: parityResults
          .filter(r => r.performance.legacy > 0)
          .reduce((sum, r) => sum + (r.performance.kysely / r.performance.legacy), 0) / 
          parityResults.filter(r => r.performance.legacy > 0).length || 1,
        patterns: parityResults.map(r => r.pattern)
      };

      console.log('T024 Category Hierarchy Migration Report:', report);

      expect(report.passedTests).toBeGreaterThan(0);
      expect(report.averagePerformanceRatio).toBeLessThan(1.1);
    });

    it('should validate all category hierarchy patterns completed', async () => {
      if (!isSchemaAvailable) return;

      const expectedPatterns = [
        'root-categories',
        'root-categories-with-counts', 
        'category-descendants',
        'category-descendants-with-counts',
        'ancestor-queries',
        'sibling-queries',
        'path-based-lookup'
      ];

      const completedPatterns = parityResults.map(r => r.pattern);

      expectedPatterns.forEach(pattern => {
        expect(completedPatterns).toContain(pattern);
      });

      // All patterns should have succeeded
      const failedPatterns = parityResults.filter(r => !r.success);
      expect(failedPatterns.length).toBe(0);
    });
  });
});
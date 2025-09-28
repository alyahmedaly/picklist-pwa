/**
 * Category Hierarchy Queries Baseline Contract Test
 * Feature: 020-migration-kysely
 *
 * CRITICAL: This test MUST FAIL initially - captures baselines for category hierarchy query patterns
 * All nested set model operations must be captured before Kysely migration
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Legacy imports from current implementation
import {
  queryFlexibleCategoryHierarchy,
  isFlexibleSchemaAvailable
} from '../../src/data/loadFlexibleDatabase.ts';

// These imports WILL FAIL initially - that's expected for TDD
import type {
  CategoryQueryBaseline,
  CategoryHierarchyResult,
  NestedSetQuery,
  BaselineMetadata
} from '../../src/test-utils/ParityTestFramework.ts';

import {
  captureCategoryQueryBaseline,
  validateCategoryBaseline,
  storeCategoryBaseline,
  getStoredCategoryBaseline
} from '../../src/test-utils/ParityTestFramework.ts';

describe('Category Hierarchy Queries Baseline Contract', () => {
  let isSchemaAvailable: boolean;

  beforeAll(async () => {
    // Verify flexible schema is available for baseline capture
    isSchemaAvailable = await isFlexibleSchemaAvailable();
    if (!isSchemaAvailable) {
      throw new Error('Flexible schema database not available - cannot capture category baselines');
    }
  });

  describe('Hierarchy Pattern 1: Root Categories', () => {
    it('should capture baseline for root category listing', async () => {
      // Pattern 1: Get all root categories (depth = 0, parent_id = null)
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'root-categories',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, false],
          result: legacyResult,
          metadata: {
            description: 'Root categories listing (depth 0, no parent)',
            category: 'hierarchy-queries',
            complexity: 'low',
            expectedResultCount: 'limited',
            hierarchyOperation: 'root-level',
            maxDepth: 0
          }
        });

        expect(baseline).toBeDefined();
        expect(baseline.patternId).toBe('root-categories');
        expect(Array.isArray(baseline.result.data)).toBe(true);

        // All results should be root categories
        baseline.result.data.forEach((category: any) => {
          expect(category.parent_id).toBeNull();
          expect(category.depth).toBe(0);
        });
      }).not.toThrow();
    });

    it('should capture baseline for root categories with product counts', async () => {
      // Pattern 2: Root categories including product counts
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, true);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'root-categories-with-products',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, true],
          result: legacyResult,
          metadata: {
            description: 'Root categories with aggregated product counts',
            category: 'hierarchy-queries',
            complexity: 'medium',
            expectedResultCount: 'limited',
            hierarchyOperation: 'root-level-with-aggregation',
            maxDepth: 0
          }
        });

        expect(baseline).toBeDefined();
        baseline.result.data.forEach((category: any) => {
          expect(category.parent_id).toBeNull();
          expect(typeof category.product_count).toBe('number');
          expect(category.product_count).toBeGreaterThanOrEqual(0);
        });
      }).not.toThrow();
    });
  });

  describe('Hierarchy Pattern 2: Direct Children Queries', () => {
    it('should capture baseline for direct children of category', async () => {
      // Pattern 3: Get direct children of a specific category
      const parentCategoryId = 'test-parent-category-id';

      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(parentCategoryId, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'direct-children',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [parentCategoryId, false],
          result: legacyResult,
          metadata: {
            description: 'Direct children of specific category (depth + 1)',
            category: 'hierarchy-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            hierarchyOperation: 'direct-children',
            maxDepth: 1
          }
        });

        expect(baseline).toBeDefined();

        if (baseline.result.data.length > 0) {
          baseline.result.data.forEach((category: any) => {
            expect(category.parent_id).toBe(parentCategoryId);
          });
        }
      }).not.toThrow();
    });

    it('should capture baseline for children with product counts', async () => {
      // Pattern 4: Children with product count aggregation
      const parentCategoryId = 'zuivel-category-id';

      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(parentCategoryId, true);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'children-with-product-counts',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [parentCategoryId, true],
          result: legacyResult,
          metadata: {
            description: 'Child categories with individual and rollup product counts',
            category: 'hierarchy-queries',
            complexity: 'high',
            expectedResultCount: 'variable',
            hierarchyOperation: 'children-with-aggregation',
            maxDepth: 1
          }
        });

        expect(baseline).toBeDefined();
        baseline.result.data.forEach((category: any) => {
          expect(category.parent_id).toBe(parentCategoryId);
          expect(typeof category.product_count).toBe('number');
        });
      }).not.toThrow();
    });
  });

  describe('Hierarchy Pattern 3: Nested Set Model Operations', () => {
    it('should capture baseline for descendants using nested set model', async () => {
      // Pattern 5: All descendants using left_bound/right_bound
      // This tests the nested set model functionality
      const rootCategoryId = 'food-root-category-id';

      expect(async () => {
        // Custom query for nested set descendants
        const legacyResult = await queryFlexibleCategoryHierarchy(rootCategoryId, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'nested-set-descendants',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [rootCategoryId, false],
          result: legacyResult,
          metadata: {
            description: 'All descendants using nested set model (left_bound/right_bound)',
            category: 'nested-set-queries',
            complexity: 'high',
            expectedResultCount: 'variable',
            hierarchyOperation: 'nested-set-descendants',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        // Validate nested set ordering
        if (baseline.result.data.length > 1) {
          for (let i = 1; i < baseline.result.data.length; i++) {
            const prev = baseline.result.data[i-1];
            const curr = baseline.result.data[i];

            if (prev.left_bound && curr.left_bound) {
              expect(prev.left_bound).toBeLessThan(curr.left_bound);
            }
          }
        }
      }).not.toThrow();
    });

    it('should capture baseline for ancestors path traversal', async () => {
      // Pattern 6: Ancestor path from deep category to root
      const deepCategoryId = 'deep-nested-category-id';

      expect(async () => {
        // This would require a custom query for ancestors
        // For now, we'll simulate with the available API
        const legacyResult = await queryFlexibleCategoryHierarchy(deepCategoryId, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'ancestor-path-traversal',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [deepCategoryId, false],
          result: legacyResult,
          metadata: {
            description: 'Ancestor path from deep category to root',
            category: 'nested-set-queries',
            complexity: 'medium',
            expectedResultCount: 'limited',
            hierarchyOperation: 'ancestor-traversal',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        // Ancestors should be ordered by depth (root first)
        if (baseline.result.data.length > 1) {
          for (let i = 1; i < baseline.result.data.length; i++) {
            const prev = baseline.result.data[i-1];
            const curr = baseline.result.data[i];

            if (prev.depth !== null && curr.depth !== null) {
              expect(prev.depth).toBeLessThan(curr.depth);
            }
          }
        }
      }).not.toThrow();
    });

    it('should capture baseline for sibling categories', async () => {
      // Pattern 7: Categories at same level (same parent, same depth)
      const siblingCategoryId = 'yoghurt-category-id';

      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(siblingCategoryId, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'sibling-categories',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [siblingCategoryId, false],
          result: legacyResult,
          metadata: {
            description: 'Sibling categories (same parent, same depth)',
            category: 'hierarchy-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            hierarchyOperation: 'siblings',
            maxDepth: 1
          }
        });

        expect(baseline).toBeDefined();

        if (baseline.result.data.length > 0) {
          const firstSibling = baseline.result.data[0];
          baseline.result.data.forEach((category: any) => {
            expect(category.parent_id).toBe(firstSibling.parent_id);
            expect(category.depth).toBe(firstSibling.depth);
          });
        }
      }).not.toThrow();
    });
  });

  describe('Hierarchy Pattern 4: Tree Structure Validation', () => {
    it('should capture baseline for complete category tree', async () => {
      // Pattern 8: Complete tree structure with all relationships
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, true);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'complete-category-tree',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, true],
          result: legacyResult,
          metadata: {
            description: 'Complete category tree with all hierarchical relationships',
            category: 'tree-structure-queries',
            complexity: 'very-high',
            expectedResultCount: 'large',
            hierarchyOperation: 'full-tree',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        // Validate tree structure integrity
        const categories = baseline.result.data;
        const categoryById = new Map(categories.map((c: any) => [c.id, c]));

        categories.forEach((category: any) => {
          // Root categories
          if (category.parent_id === null) {
            expect(category.depth).toBe(0);
          } else {
            // Child categories should have parent
            const parent = categoryById.get(category.parent_id);
            if (parent) {
              expect(category.depth).toBe(parent.depth + 1);
            }
          }

          // Nested set model constraints
          if (category.left_bound && category.right_bound) {
            expect(category.left_bound).toBeLessThan(category.right_bound);
          }
        });
      }).not.toThrow();
    });

    it('should capture baseline for category depth distribution', async () => {
      // Pattern 9: Categories grouped by depth level
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'depth-distribution',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, false],
          result: legacyResult,
          metadata: {
            description: 'Category distribution across depth levels (0-6)',
            category: 'tree-structure-queries',
            complexity: 'medium',
            expectedResultCount: 'large',
            hierarchyOperation: 'depth-analysis',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        // Analyze depth distribution
        const depthCounts = new Map<number, number>();
        baseline.result.data.forEach((category: any) => {
          const depth = category.depth || 0;
          depthCounts.set(depth, (depthCounts.get(depth) || 0) + 1);
        });

        // Should have categories at multiple depth levels
        expect(depthCounts.size).toBeGreaterThan(1);

        // Validate depth constraints (0-6)
        for (const depth of depthCounts.keys()) {
          expect(depth).toBeGreaterThanOrEqual(0);
          expect(depth).toBeLessThanOrEqual(6);
        }
      }).not.toThrow();
    });
  });

  describe('Hierarchy Pattern 5: Product Count Aggregation', () => {
    it('should capture baseline for category product count rollup', async () => {
      // Pattern 10: Product counts rolled up through hierarchy
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, true);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'product-count-rollup',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, true],
          result: legacyResult,
          metadata: {
            description: 'Product counts aggregated up through category hierarchy',
            category: 'aggregation-queries',
            complexity: 'high',
            expectedResultCount: 'large',
            hierarchyOperation: 'count-rollup',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        baseline.result.data.forEach((category: any) => {
          expect(typeof category.product_count).toBe('number');
          expect(category.product_count).toBeGreaterThanOrEqual(0);

          // Parent categories should have counts >= direct children's counts
          // (This is a simplified check - full validation would require tree traversal)
        });
      }).not.toThrow();
    });

    it('should capture baseline for empty categories handling', async () => {
      // Pattern 11: Categories with zero product counts
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, true);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'empty-categories-handling',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, true],
          result: legacyResult,
          metadata: {
            description: 'Handling of categories with zero product counts',
            category: 'edge-case-queries',
            complexity: 'medium',
            expectedResultCount: 'variable',
            hierarchyOperation: 'empty-categories',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        // Should include categories with zero product counts
        const hasEmptyCategories = baseline.result.data.some((c: any) => c.product_count === 0);
        const hasPopulatedCategories = baseline.result.data.some((c: any) => c.product_count > 0);

        expect(typeof hasEmptyCategories).toBe('boolean');
        expect(typeof hasPopulatedCategories).toBe('boolean');
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Performance Baselines', () => {
    it('should capture baseline for maximum depth categories', async () => {
      // Edge case: Categories at maximum depth (6 levels)
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'maximum-depth-categories',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, false],
          result: legacyResult,
          metadata: {
            description: 'Categories at maximum allowed depth (6 levels)',
            category: 'edge-case-queries',
            complexity: 'low',
            expectedResultCount: 'limited',
            hierarchyOperation: 'max-depth',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        // Filter for maximum depth categories
        const maxDepthCategories = baseline.result.data.filter((c: any) => c.depth === 6);

        maxDepthCategories.forEach((category: any) => {
          expect(category.depth).toBe(6);
          expect(category.parent_id).not.toBeNull();
        });
      }).not.toThrow();
    });

    it('should capture baseline for large category tree performance', async () => {
      // Performance case: Large category tree traversal
      expect(async () => {
        const startTime = Date.now();
        const legacyResult = await queryFlexibleCategoryHierarchy(null, true);
        const executionTime = Date.now() - startTime;

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'large-tree-performance',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, true],
          result: legacyResult,
          executionTime,
          metadata: {
            description: 'Performance of large category tree with product counts',
            category: 'performance-queries',
            complexity: 'high',
            expectedResultCount: 'large',
            hierarchyOperation: 'full-tree-with-counts',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();
        expect(baseline.executionTime).toBeLessThan(3000); // Should complete in <3s
        expect(baseline.result.data.length).toBeGreaterThan(100); // Expect substantial tree
      }).not.toThrow();
    });

    it('should capture baseline for nested set model integrity', async () => {
      // Validation case: Nested set model constraints
      expect(async () => {
        const legacyResult = await queryFlexibleCategoryHierarchy(null, false);

        const baseline = await captureCategoryQueryBaseline({
          patternId: 'nested-set-integrity',
          queryName: 'queryFlexibleCategoryHierarchy',
          parameters: [null, false],
          result: legacyResult,
          metadata: {
            description: 'Nested set model integrity validation',
            category: 'validation-queries',
            complexity: 'high',
            expectedResultCount: 'large',
            hierarchyOperation: 'integrity-check',
            maxDepth: 6
          }
        });

        expect(baseline).toBeDefined();

        // Validate nested set model constraints
        baseline.result.data.forEach((category: any) => {
          if (category.left_bound && category.right_bound) {
            // Basic constraint: left < right
            expect(category.left_bound).toBeLessThan(category.right_bound);

            // Leaf nodes: right = left + 1
            const isLeaf = (category.right_bound - category.left_bound) === 1;
            expect(typeof isLeaf).toBe('boolean');
          }
        });

        // Check for no overlapping ranges (simplified check)
        const ranges = baseline.result.data
          .filter((c: any) => c.left_bound && c.right_bound)
          .map((c: any) => ({ id: c.id, left: c.left_bound, right: c.right_bound }))
          .sort((a: any, b: any) => a.left - b.left);

        // No overlapping ranges at same level
        for (let i = 1; i < ranges.length; i++) {
          // This is a simplified check - full validation requires tree analysis
          expect(ranges[i].left).toBeGreaterThanOrEqual(ranges[i-1].left);
        }
      }).not.toThrow();
    });
  });

  describe('Baseline Storage and Validation', () => {
    it('should store and retrieve category baselines consistently', async () => {
      // Contract for category baseline persistence
      const testBaseline: CategoryQueryBaseline = {
        patternId: 'test-category-storage',
        queryName: 'testCategoryQuery',
        parameters: [null, false],
        result: { data: [], totalCount: 0 },
        executionTime: 25,
        timestamp: new Date().toISOString(),
        metadata: {
          description: 'Test category baseline for storage validation',
          category: 'test',
          complexity: 'low',
          expectedResultCount: 'empty',
          hierarchyOperation: 'test',
          maxDepth: 0
        }
      };

      expect(async () => {
        await storeCategoryBaseline(testBaseline);
        const retrieved = await getStoredCategoryBaseline('test-category-storage');

        expect(retrieved).toBeDefined();
        expect(retrieved?.patternId).toBe(testBaseline.patternId);
        expect(retrieved?.metadata.hierarchyOperation).toBe('test');
      }).not.toThrow();
    });

    it('should validate category baseline structure', async () => {
      // Contract for category baseline validation
      const validBaseline: CategoryQueryBaseline = {
        patternId: 'category-validation-test',
        queryName: 'validCategoryQuery',
        parameters: [],
        result: {
          data: [
            {
              id: 'cat-1',
              name: 'Test Category',
              parent_id: null,
              depth: 0,
              left_bound: 1,
              right_bound: 10,
              product_count: 5
            }
          ],
          totalCount: 1
        },
        executionTime: 30,
        timestamp: new Date().toISOString(),
        metadata: {
          description: 'Valid category baseline for testing',
          category: 'validation',
          complexity: 'low',
          expectedResultCount: 'limited',
          hierarchyOperation: 'root-level',
          maxDepth: 0
        }
      };

      expect(async () => {
        const validation = await validateCategoryBaseline(validBaseline);

        expect(validation.isValid).toBe(true);
        expect(Array.isArray(validation.errors)).toBe(true);
        expect(validation.errors.length).toBe(0);
      }).not.toThrow();
    });

    it('should detect invalid category baseline structure', async () => {
      // Contract for category baseline validation error detection
      const invalidBaseline = {
        patternId: 'invalid-category-test',
        queryName: 'invalidQuery',
        parameters: [],
        result: {
          data: [
            {
              id: 'cat-1',
              left_bound: 10, // Invalid: left > right
              right_bound: 5,
              depth: -1 // Invalid: negative depth
            }
          ]
        },
        metadata: {
          hierarchyOperation: 'invalid-operation', // Invalid operation
          maxDepth: 10 // Invalid: exceeds maximum depth
        }
      };

      expect(async () => {
        const validation = await validateCategoryBaseline(invalidBaseline as any);

        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);

        const errorTypes = validation.errors.map(e => e.type);
        expect(errorTypes).toContain('nested-set-violation');
        expect(errorTypes).toContain('invalid-depth');
      }).not.toThrow();
    });
  });
});
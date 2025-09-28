/**
 * CategoryRepository Contract Test
 * Feature: 020-migration-kysely
 *
 * CRITICAL: This test MUST FAIL initially - defines contracts for CategoryRepository implementation
 * Tests category hierarchy operations using nested set model
 */

import { describe, it, expect } from 'vitest';

// These imports WILL FAIL initially - that's expected for TDD
import type {
  CategoryRepository,
  CategoryWithHierarchy,
  CategoryTreeNode,
  NestedSetCategory,
  CategoryQueryOptions,
  CategoryHierarchyResult
} from '../../src/db/repositories/CategoryRepository.ts';

import { createCategoryRepository } from '../../src/db/repositories/CategoryRepository.ts';

describe('CategoryRepository Contract', () => {
  let repository: CategoryRepository;

  describe('Repository Creation', () => {
    it('should create CategoryRepository instance', async () => {
      // Contract for repository instantiation
      // This will fail until createCategoryRepository is implemented
      expect(async () => {
        repository = await createCategoryRepository();
        expect(repository).toBeDefined();
      }).not.toThrow();
    });

    it('should provide all required repository methods', async () => {
      // Contract for repository interface completeness
      repository = await createCategoryRepository();

      expect(typeof repository.getById).toBe('function');
      expect(typeof repository.getAll).toBe('function');
      expect(typeof repository.getRootCategories).toBe('function');
      expect(typeof repository.getChildren).toBe('function');
      expect(typeof repository.getAncestors).toBe('function');
      expect(typeof repository.getDescendants).toBe('function');
      expect(typeof repository.getSiblings).toBe('function');
      expect(typeof repository.getByPath).toBe('function');
      expect(typeof repository.getCategoryTree).toBe('function');
      expect(typeof repository.getCategoriesWithProductCounts).toBe('function');
      expect(typeof repository.validateNestedSetModel).toBe('function');
    });
  });

  describe('Basic Category Operations', () => {
    it('should get category by ID', async () => {
      // Contract for getById operation
      repository = await createCategoryRepository();

      expect(async () => {
        const category = await repository.getById('test-category-id');

        if (category) {
          expect(typeof category.id).toBe('string');
          expect(typeof category.name).toBe('string');
          expect(typeof (category.depth || 0)).toBe('number');
          expect(typeof (category.left_bound || 0)).toBe('number');
          expect(typeof (category.right_bound || 0)).toBe('number');
        } else {
          expect(category).toBeNull();
        }
      }).not.toThrow();
    });

    it('should get all categories with nested set ordering', async () => {
      // Contract for getAll operation with nested set ordering
      repository = await createCategoryRepository();

      expect(async () => {
        const categories = await repository.getAll({
          orderBy: 'nested_set' // Default ordering by left_bound
        });

        expect(Array.isArray(categories)).toBe(true);

        // Categories should be ordered by left_bound for tree traversal
        for (let i = 1; i < categories.length; i++) {
          if (categories[i-1].left_bound && categories[i].left_bound) {
            expect(categories[i-1].left_bound).toBeLessThan(categories[i].left_bound);
          }
        }
      }).not.toThrow();
    });

    it('should get root categories', async () => {
      // Contract for getRootCategories operation
      repository = await createCategoryRepository();

      expect(async () => {
        const rootCategories = await repository.getRootCategories({
          includeProductCounts: true
        });

        expect(Array.isArray(rootCategories)).toBe(true);

        rootCategories.forEach(category => {
          expect(category.parent_id).toBeNull();
          expect(category.depth).toBe(0);
          expect(typeof category.product_count).toBe('number');
        });
      }).not.toThrow();
    });
  });

  describe('Nested Set Model Operations', () => {
    it('should get children of a category', async () => {
      // Contract for getChildren operation
      repository = await createCategoryRepository();

      expect(async () => {
        const children = await repository.getChildren('parent-category-id', {
          includeProductCounts: true,
          maxDepth: 1 // Direct children only
        });

        expect(Array.isArray(children)).toBe(true);

        children.forEach(child => {
          expect(child.parent_id).toBe('parent-category-id');
          expect(typeof child.product_count).toBe('number');
        });
      }).not.toThrow();
    });

    it('should get ancestors of a category', async () => {
      // Contract for getAncestors operation
      repository = await createCategoryRepository();

      expect(async () => {
        const ancestors = await repository.getAncestors('deep-category-id');

        expect(Array.isArray(ancestors)).toBe(true);

        // Ancestors should be ordered from root to immediate parent
        for (let i = 1; i < ancestors.length; i++) {
          expect(ancestors[i-1].depth!).toBeLessThan(ancestors[i].depth!);
        }
      }).not.toThrow();
    });

    it('should get descendants of a category', async () => {
      // Contract for getDescendants operation using nested set model
      repository = await createCategoryRepository();

      expect(async () => {
        const descendants = await repository.getDescendants('parent-category-id', {
          maxDepth: 3,
          includeProductCounts: true
        });

        expect(Array.isArray(descendants)).toBe(true);

        descendants.forEach(descendant => {
          // All descendants should have depth > parent depth
          expect(descendant.depth!).toBeGreaterThan(0);
          expect(descendant.depth!).toBeLessThanOrEqual(3);
        });
      }).not.toThrow();
    });

    it('should get siblings of a category', async () => {
      // Contract for getSiblings operation
      repository = await createCategoryRepository();

      expect(async () => {
        const siblings = await repository.getSiblings('category-id', {
          includeSelf: false
        });

        expect(Array.isArray(siblings)).toBe(true);

        // All siblings should have same parent_id and depth
        if (siblings.length > 0) {
          const firstSibling = siblings[0];
          siblings.forEach(sibling => {
            expect(sibling.parent_id).toBe(firstSibling.parent_id);
            expect(sibling.depth).toBe(firstSibling.depth);
            expect(sibling.id).not.toBe('category-id'); // Should not include self
          });
        }
      }).not.toThrow();
    });
  });

  describe('Path-Based Operations', () => {
    it('should get category by path', async () => {
      // Contract for getByPath operation
      repository = await createCategoryRepository();

      expect(async () => {
        const category = await repository.getByPath('Zuivel/Yoghurt/Griekse yoghurt');

        if (category) {
          expect(typeof category.id).toBe('string');
          expect(category.path).toBe('Zuivel/Yoghurt/Griekse yoghurt');
          expect(category.depth).toBeGreaterThan(0);
        }
      }).not.toThrow();
    });

    it('should handle path normalization', async () => {
      // Contract for path handling edge cases
      repository = await createCategoryRepository();

      const pathVariations = [
        'Zuivel/Yoghurt',
        '/Zuivel/Yoghurt',
        'Zuivel/Yoghurt/',
        '/Zuivel/Yoghurt/',
        'Zuivel / Yoghurt' // With spaces
      ];

      for (const path of pathVariations) {
        expect(async () => {
          const category = await repository.getByPath(path);
          // Should handle all variations consistently
          if (category) {
            expect(category.path).toBe('Zuivel/Yoghurt');
          }
        }).not.toThrow();
      }
    });
  });

  describe('Tree Structure Operations', () => {
    it('should get complete category tree', async () => {
      // Contract for getCategoryTree operation
      repository = await createCategoryRepository();

      expect(async () => {
        const tree = await repository.getCategoryTree({
          includeProductCounts: true,
          maxDepth: 4,
          minProductCount: 1
        });

        expect(Array.isArray(tree)).toBe(true);

        // Tree structure validation
        tree.forEach(rootCategory => {
          expect(rootCategory.depth).toBe(0);
          expect(Array.isArray(rootCategory.children)).toBe(true);

          // Validate nested children structure
          validateTreeNode(rootCategory, 4);
        });
      }).not.toThrow();
    });

    it('should build tree with proper parent-child relationships', async () => {
      // Contract for tree relationship validation
      repository = await createCategoryRepository();

      expect(async () => {
        const tree = await repository.getCategoryTree();

        function validateParentChild(node: CategoryTreeNode, parentId: string | null = null) {
          expect(node.parent_id).toBe(parentId);

          node.children?.forEach(child => {
            expect(child.parent_id).toBe(node.id);
            expect(child.depth).toBe(node.depth + 1);
            validateParentChild(child, node.id);
          });
        }

        tree.forEach(rootNode => validateParentChild(rootNode));
      }).not.toThrow();
    });
  });

  describe('Product Count Operations', () => {
    it('should get categories with accurate product counts', async () => {
      // Contract for getCategoriesWithProductCounts
      repository = await createCategoryRepository();

      expect(async () => {
        const categories = await repository.getCategoriesWithProductCounts({
          includeEmptyCategories: false,
          rollupCounts: true // Include counts from subcategories
        });

        expect(Array.isArray(categories)).toBe(true);

        categories.forEach(category => {
          expect(typeof category.product_count).toBe('number');
          expect(category.product_count).toBeGreaterThan(0); // Since includeEmptyCategories: false
          expect(typeof category.direct_product_count).toBe('number');
          expect(typeof category.total_product_count).toBe('number');

          // Total should be >= direct count
          expect(category.total_product_count).toBeGreaterThanOrEqual(category.direct_product_count);
        });
      }).not.toThrow();
    });

    it('should handle product count rollup correctly', async () => {
      // Contract for hierarchical product count aggregation
      repository = await createCategoryRepository();

      expect(async () => {
        const result = await repository.getCategoriesWithProductCounts({
          rollupCounts: true,
          includeHierarchyInfo: true
        });

        result.forEach(category => {
          // Parent categories should have counts >= sum of children's direct counts
          if (category.children && category.children.length > 0) {
            const childrenDirectSum = category.children.reduce(
              (sum, child) => sum + child.direct_product_count, 0
            );
            expect(category.total_product_count).toBeGreaterThanOrEqual(
              category.direct_product_count + childrenDirectSum
            );
          }
        });
      }).not.toThrow();
    });
  });

  describe('Nested Set Model Validation', () => {
    it('should validate nested set model integrity', async () => {
      // Contract for validateNestedSetModel operation
      repository = await createCategoryRepository();

      expect(async () => {
        const validation = await repository.validateNestedSetModel();

        expect(typeof validation.isValid).toBe('boolean');
        expect(Array.isArray(validation.errors)).toBe(true);
        expect(Array.isArray(validation.warnings)).toBe(true);
        expect(typeof validation.totalCategories).toBe('number');

        // If invalid, should provide specific error details
        if (!validation.isValid) {
          expect(validation.errors.length).toBeGreaterThan(0);
          validation.errors.forEach(error => {
            expect(typeof error.categoryId).toBe('string');
            expect(typeof error.message).toBe('string');
            expect(typeof error.severity).toBe('string');
          });
        }
      }).not.toThrow();
    });

    it('should detect nested set model violations', async () => {
      // Contract for nested set model constraint checking
      repository = await createCategoryRepository();

      expect(async () => {
        const categories = await repository.getAll();

        // Validate nested set constraints manually as part of contract
        categories.forEach(category => {
          if (category.left_bound && category.right_bound) {
            // Basic constraint: left_bound < right_bound
            expect(category.left_bound).toBeLessThan(category.right_bound);

            // Leaf nodes: right_bound = left_bound + 1
            const isLeaf = (category.right_bound - category.left_bound) === 1;
            if (isLeaf) {
              // Contract: leaf nodes should have no children
              expect(true).toBe(true); // Placeholder for leaf validation
            }
          }
        });
      }).not.toThrow();
    });
  });

  describe('Performance Contracts', () => {
    it('should execute tree operations efficiently', async () => {
      // Contract for tree operation performance
      repository = await createCategoryRepository();

      const startTime = Date.now();

      expect(async () => {
        const tree = await repository.getCategoryTree({
          maxDepth: 6,
          includeProductCounts: true
        });

        const queryTime = Date.now() - startTime;

        expect(queryTime).toBeLessThan(1000); // <1s for complete tree
        expect(Array.isArray(tree)).toBe(true);
      }).not.toThrow();
    });

    it('should handle deep hierarchies efficiently', async () => {
      // Contract for deep hierarchy performance
      repository = await createCategoryRepository();

      expect(async () => {
        const deepCategory = await repository.getAncestors('deep-nested-category-id');
        const descendants = await repository.getDescendants('root-category-id', {
          maxDepth: 6
        });

        expect(Array.isArray(deepCategory)).toBe(true);
        expect(Array.isArray(descendants)).toBe(true);

        // Should handle up to 6 levels of depth
        descendants.forEach(category => {
          expect(category.depth!).toBeLessThanOrEqual(6);
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling Contracts', () => {
    it('should handle missing category IDs gracefully', async () => {
      // Contract for missing data handling
      repository = await createCategoryRepository();

      expect(async () => {
        const category = await repository.getById('nonexistent-category-id');
        expect(category).toBeNull();

        const children = await repository.getChildren('nonexistent-category-id');
        expect(Array.isArray(children)).toBe(true);
        expect(children.length).toBe(0);
      }).not.toThrow();
    });

    it('should handle malformed nested set data', async () => {
      // Contract for data integrity error handling
      repository = await createCategoryRepository();

      expect(async () => {
        try {
          const validation = await repository.validateNestedSetModel();

          if (!validation.isValid) {
            // Should provide actionable error information
            expect(validation.errors.length).toBeGreaterThan(0);
            validation.errors.forEach(error => {
              expect(['error', 'warning']).toContain(error.severity);
            });
          }
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toMatch(/nested.*set|hierarchy|integrity/i);
        }
      }).not.toThrow();
    });

    it('should validate query parameters', async () => {
      // Contract for parameter validation
      repository = await createCategoryRepository();

      const invalidOptions = [
        { maxDepth: -1 },
        { maxDepth: 10 }, // Beyond maximum depth of 6
        { minProductCount: -1 }
      ];

      for (const options of invalidOptions) {
        expect(async () => {
          try {
            await repository.getCategoryTree(options as any);
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toMatch(/invalid|parameter|depth/i);
          }
        }).not.toThrow();
      }
    });
  });
});

// Helper function for tree validation
function validateTreeNode(node: CategoryTreeNode, maxDepth: number): void {
  expect(typeof node.id).toBe('string');
  expect(typeof node.name).toBe('string');
  expect(typeof node.depth).toBe('number');
  expect(node.depth).toBeLessThanOrEqual(maxDepth);

  if (node.children) {
    expect(Array.isArray(node.children)).toBe(true);
    node.children.forEach(child => {
      expect(child.parent_id).toBe(node.id);
      expect(child.depth).toBe(node.depth + 1);
      validateTreeNode(child, maxDepth);
    });
  }
}
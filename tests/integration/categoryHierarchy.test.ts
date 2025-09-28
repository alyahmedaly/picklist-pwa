import { describe, test, expect } from 'vitest';
import { readIntegrationProducts } from '../test-utils';
import type { Product, CategoryTree } from '../../src/data/transform/types.ts';

/** T010: Integration test category hierarchy - MUST FAIL before implementation */

describe('Category Hierarchy Integration (T010)', () => {
  test('should enable hierarchical product browsing for users', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can browse products by category hierarchy
    const deepProduct = products.find((p) => p.categories && p.categories.length >= 2);

    if (deepProduct) {
      // This MUST fail - categoryTree doesn't exist yet
      expect(deepProduct).toHaveProperty('categoryTree');

      const categoryTree = deepProduct.categoryTree as CategoryTree;
      expect(categoryTree.tree).toEqual(deepProduct.categories);
      expect(categoryTree.primary).toBe(deepProduct.categories![0]);
      expect(categoryTree.breadcrumbs).toContain(' > ');
      expect(categoryTree.depth).toBe(deepProduct.categories!.length);
    }
  });

  test('should support simple category filtering for single-category products', () => {
    const products = readIntegrationProducts() as Product[];

    const singleCategoryProduct = products.find((p) => p.categories && p.categories.length === 1);

    if (singleCategoryProduct?.categoryTree) {
      const categoryTree = singleCategoryProduct.categoryTree as CategoryTree;

      // Business value: Simple category filtering works correctly
      expect(categoryTree.tree).toEqual(singleCategoryProduct.categories);
      expect(categoryTree.primary).toBe(singleCategoryProduct.categories![0]);
      expect(categoryTree.breadcrumbs).toBe(singleCategoryProduct.categories![0]);
      expect(categoryTree.depth).toBe(1);
    }
  });

  test('should handle uncategorized products for comprehensive search', () => {
    const products = readIntegrationProducts() as Product[];

    const noCategoryProduct = products.find((p) => !p.categories || p.categories.length === 0);

    if (noCategoryProduct?.categoryTree) {
      const categoryTree = noCategoryProduct.categoryTree as CategoryTree;

      // Business value: Uncategorized products still appear in search results
      expect(categoryTree.tree).toEqual([]);
      expect(categoryTree.primary).toBe('');
      expect(categoryTree.breadcrumbs).toBe('');
      expect(categoryTree.depth).toBe(0);
    }
  });

  test('should provide consistent breadcrumb navigation for UI', () => {
    const products = readIntegrationProducts() as Product[];

    products.forEach((product) => {
      if (product.categoryTree && product.categories && product.categories.length > 1) {
        const categoryTree = product.categoryTree as CategoryTree;

        // Business value: Consistent breadcrumb UI navigation
        expect(categoryTree.breadcrumbs).toBe(product.categories.join(' > '));
        expect(categoryTree.breadcrumbs).not.toMatch(/^>/);
        expect(categoryTree.breadcrumbs).not.toMatch(/>$/);
      }
    });
  });

  test('should enable category-based product filtering', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can filter products by category
    const categorizedProducts = products.filter((p) => p.categories && p.categories.length > 0);
    expect(categorizedProducts.length).toBeGreaterThan(0);

    categorizedProducts.forEach((product) => {
      expect(Array.isArray(product.categories)).toBe(true);
      expect(product.categories!.length).toBeGreaterThan(0);
    });
  });

  test('should enable comprehensive category-based product discovery', () => {
    const products = readIntegrationProducts() as Product[];
    let hierarchyCount = 0;

    products.forEach((product) => {
      if (product.categories && product.categories.length > 0) {
        expect(product).toHaveProperty('categoryTree');

        if (product.categoryTree) {
          hierarchyCount++;
          const categoryTree = product.categoryTree as CategoryTree;

          // Business value: Complete category structure for product discovery
          expect(categoryTree.tree).toEqual(product.categories);
          expect(categoryTree.depth).toBe(product.categories.length);
          expect(categoryTree.primary).toBe(product.categories[0]);
        }
      }
    });

    // Should have processed some products with category hierarchy
    expect(hierarchyCount).toBeGreaterThan(0);
  });
});

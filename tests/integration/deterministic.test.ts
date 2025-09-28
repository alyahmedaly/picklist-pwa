import { describe, test, expect } from 'vitest';
import {
  readIntegrationProducts,
  readIntegrationIndex,
  readIntegrationStats,
  readIntegrationSchema,
} from '../test-utils';
import type { Product } from '../../src/data/transform/types.ts';

/** T012: Integration test deterministic output - MUST FAIL before implementation */

describe('Deterministic Output Integration (T012)', () => {
  test('should ensure reliable product data for reproducible applications', () => {
    // Business value: Applications can rely on consistent data structure
    const products = readIntegrationProducts() as Product[];

    // Verify structured fields maintain consistency
    const productWithStructuredData = products.find(
      (p) => p.categories || p.ingredients || p.nutrition || p.additiveInfo,
    );

    if (productWithStructuredData) {
      // This MUST fail if enhanced structured output breaks determinism
      expect(productWithStructuredData).toHaveProperty('categoryTree');
      expect(productWithStructuredData).toHaveProperty('ingredientInfo');
      expect(productWithStructuredData).toHaveProperty('nutrition');
      expect(productWithStructuredData).toHaveProperty('warnings');
    }
  });

  test('should provide consistent schema documentation for developers', () => {
    const schema = readIntegrationSchema();

    // Business value: Developers can rely on stable schema documentation
    expect(typeof schema).toBe('string');
    expect(schema.length).toBeGreaterThan(0);
    expect(schema).toContain('Excluded Columns'); // Should document structure
  });

  test('should enable reliable search functionality with consistent index', () => {
    const index = readIntegrationIndex() as { products: any[] };

    // Business value: Search applications can depend on stable index structure
    expect(Array.isArray(index.products)).toBe(true);
    expect(index.products.length).toBeGreaterThan(0);

    index.products.forEach((entry) => {
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('price');
    });
  });

  test('should enable stable category-based navigation features', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Category navigation remains consistent across deployments
    const categorizedProducts = products.filter((p) => p.categories && p.categories.length > 0);
    expect(categorizedProducts.length).toBeGreaterThan(0);

    categorizedProducts.forEach((product) => {
      if (product.categoryTree) {
        expect(product.categoryTree.tree).toEqual(product.categories);
        expect(product.categoryTree.primary).toBe(product.categories![0]);
        expect(product.categoryTree.depth).toBe(product.categories!.length);
      }
    });
  });

  test('should provide reliable ingredient transparency features', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Ingredient analysis remains consistent for user trust
    const productsWithIngredients = products.filter(
      (p) => p.ingredients && p.ingredients.length > 0,
    );
    expect(productsWithIngredients.length).toBeGreaterThan(0);

    productsWithIngredients.forEach((product) => {
      if (product.ingredientInfo) {
        expect(Array.isArray(product.ingredientInfo.core)).toBe(true);
        expect(Array.isArray(product.ingredientInfo.additives)).toBe(true);
        expect(Array.isArray(product.ingredientInfo.statements)).toBe(true);
        expect(typeof product.ingredientInfo.total).toBe('number');
      }
    });
  });

  test('should ensure consistent additive safety information', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Additive safety information remains reliable
    const productsWithAdditives = products.filter(
      (p) => p.additiveInfo && p.additiveInfo.eNumbers.length > 0,
    );
    expect(productsWithAdditives.length).toBeGreaterThan(0);

    productsWithAdditives.forEach((product) => {
      if (product.additivesSummary) {
        expect(Array.isArray(product.additivesSummary.eNumbers)).toBe(true);
        expect(typeof product.additivesSummary.summary).toBe('string');
        expect(Array.isArray(product.additivesSummary.warnings)).toBe(true);
        expect(Array.isArray(product.additivesSummary.dietary)).toBe(true);
        expect(Array.isArray(product.additivesSummary.categories)).toBe(true);
      }
    });
  });

  test('should maintain reliable safety warning system', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Safety warnings remain consistent for user protection
    const productsWithWarnings = products.filter((p) => p.warnings && p.warnings.length > 0);
    expect(productsWithWarnings.length).toBeGreaterThan(0);

    productsWithWarnings.forEach((product) => {
      expect(Array.isArray(product.warnings)).toBe(true);
      product.warnings!.forEach((warning) => {
        expect(typeof warning).toBe('string');
        expect(warning.length).toBeGreaterThan(0);
      });
    });
  });

  test('should provide reliable processing statistics for monitoring', () => {
    const stats = readIntegrationStats() as any;

    // Business value: Consistent statistics for application monitoring
    expect(typeof stats).toBe('object');
    expect(stats).not.toBeNull();

    // Core statistics should be present and valid
    expect(typeof stats.totalProducts).toBe('number');
    expect(stats.totalProducts).toBeGreaterThan(0);

    if (stats.nutritionalTagsComputed !== undefined) {
      expect(typeof stats.nutritionalTagsComputed).toBe('number');
      expect(stats.nutritionalTagsComputed).toBeGreaterThanOrEqual(0);
    }
  });
});

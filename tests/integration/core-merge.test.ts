/**
 * Integration Test: mergeDuplicates function
 *
 * CRITICAL: This test MUST FAIL until T010 and T015 implementation is complete
 * Tests the mergeDuplicates utility function from @picklist/core
 */

import { describe, it, expect } from 'vitest';
import type { Product } from '../../specs/021-npm-workspaces/contracts/core-interface';

describe('mergeDuplicates Integration Tests', () => {
  const createTestProduct = (id: string, name: string, overrides: Partial<Product> = {}): Product => ({
    id,
    name,
    categories: ['test-category'],
    ingredients: {
      raw: 'test ingredients',
      parsed: ['ingredient1'],
      addedSugar: false,
      addedSalt: false,
      preservatives: [],
      conflicts: []
    },
    allergens: {
      raw: 'test allergens',
      normalized: ['allergen1'],
      detected: ['allergen1'],
      warnings: []
    },
    nutrition: {
      energy: 100,
      protein: 10,
      carbohydrates: 20,
      fat: 5,
      perServing: false
    },
    additives: [],
    stores: ['test-store'],
    metadata: {
      processedAt: '2025-01-01',
      sourceFile: 'test.csv',
      transformVersion: '1.0.0'
    },
    ...overrides
  });

  it('should merge duplicate products and return merge result', async () => {
    // This will fail until mergeDuplicates is implemented
    const { mergeDuplicates } = await import('@picklist/core');

    const products = [
      createTestProduct('1', 'Product A'),
      createTestProduct('2', 'Product A'), // Duplicate name
      createTestProduct('3', 'Product B')
    ];

    const result = await mergeDuplicates(products);

    expect(result).toHaveProperty('mergedProducts');
    expect(result).toHaveProperty('duplicatesRemoved');
    expect(result).toHaveProperty('conflicts');
    expect(Array.isArray(result.mergedProducts)).toBe(true);
    expect(typeof result.duplicatesRemoved).toBe('number');
    expect(Array.isArray(result.conflicts)).toBe(true);
  });

  it('should handle empty product array', async () => {
    const { mergeDuplicates } = await import('@picklist/core');

    const result = await mergeDuplicates([]);

    expect(result.mergedProducts).toEqual([]);
    expect(result.duplicatesRemoved).toBe(0);
    expect(result.conflicts).toEqual([]);
  });

  it('should handle products with no duplicates', async () => {
    const { mergeDuplicates } = await import('@picklist/core');

    const products = [
      createTestProduct('1', 'Unique Product A'),
      createTestProduct('2', 'Unique Product B'),
      createTestProduct('3', 'Unique Product C')
    ];

    const result = await mergeDuplicates(products);

    expect(result.mergedProducts).toHaveLength(3);
    expect(result.duplicatesRemoved).toBe(0);
    expect(result.conflicts).toEqual([]);
  });

  it('should detect and resolve conflicts in duplicate products', async () => {
    const { mergeDuplicates } = await import('@picklist/core');

    const products = [
      createTestProduct('1', 'Product A', {
        nutrition: { energy: 100, protein: 10, carbohydrates: 20, fat: 5, perServing: false },
        stores: ['store1']
      }),
      createTestProduct('2', 'Product A', {
        nutrition: { energy: 110, protein: 12, carbohydrates: 18, fat: 6, perServing: false },
        stores: ['store2']
      })
    ];

    const result = await mergeDuplicates(products);

    expect(result.mergedProducts).toHaveLength(1);
    expect(result.duplicatesRemoved).toBe(1);
    expect(result.conflicts.length).toBeGreaterThan(0);

    // Should merge stores from both products
    const mergedProduct = result.mergedProducts[0];
    expect(mergedProduct.stores).toContain('store1');
    expect(mergedProduct.stores).toContain('store2');
  });

  it('should preserve metadata during merge process', async () => {
    const { mergeDuplicates } = await import('@picklist/core');

    const products = [
      createTestProduct('1', 'Product A', {
        metadata: {
          processedAt: '2025-01-01',
          sourceFile: 'file1.csv',
          transformVersion: '1.0.0'
        }
      }),
      createTestProduct('2', 'Product A', {
        metadata: {
          processedAt: '2025-01-02',
          sourceFile: 'file2.csv',
          transformVersion: '1.0.0'
        }
      })
    ];

    const result = await mergeDuplicates(products);

    expect(result.mergedProducts).toHaveLength(1);
    const mergedProduct = result.mergedProducts[0];
    expect(mergedProduct.metadata).toBeDefined();
    expect(mergedProduct.metadata.transformVersion).toBe('1.0.0');
  });
});
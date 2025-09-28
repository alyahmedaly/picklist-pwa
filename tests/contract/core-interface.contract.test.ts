/**
 * Contract Test: @picklist/core Package Interface
 *
 * CRITICAL: This test MUST FAIL until T010-T018 implementation is complete
 * Tests that @picklist/core exports match CorePackageExports interface
 */

import { describe, it, expect } from 'vitest';
import type { CorePackageExports, Product, NutritionInfo } from '../../specs/021-npm-workspaces/contracts/core-interface';

describe('@picklist/core Contract Tests', () => {
  it('should export all required functions from CorePackageExports interface', async () => {
    // This will fail until the package is implemented
    const corePackage = await import('@picklist/core');

    // Data manipulation utilities
    expect(typeof corePackage.mergeDuplicates).toBe('function');
    expect(typeof corePackage.calculateSparsity).toBe('function');

    // File I/O utilities
    expect(typeof corePackage.writeJsonl).toBe('function');
    expect(typeof corePackage.writeIndexFile).toBe('function');
    expect(typeof corePackage.writeSchemaDoc).toBe('function');

    // Basic nutrition utilities
    expect(typeof corePackage.extractNutritionValue).toBe('function');
    expect(typeof corePackage.hasRequiredNutrition).toBe('function');

    // String processing utilities
    expect(typeof corePackage.normalizeText).toBe('function');
    expect(typeof corePackage.removePlaceholders).toBe('function');
    expect(typeof corePackage.splitAndTrim).toBe('function');
    expect(typeof corePackage.sanitizeForFilename).toBe('function');

    // Data validation utilities
    expect(typeof corePackage.validateProduct).toBe('function');
    expect(typeof corePackage.validateNutrition).toBe('function');
    expect(typeof corePackage.isValidSemver).toBe('function');
    expect(typeof corePackage.isValidPackageName).toBe('function');

    // Ordering and sorting utilities
    expect(typeof corePackage.sortProducts).toBe('function');
    expect(typeof corePackage.generateProductId).toBe('function');

    // Type constructors
    expect(typeof corePackage.createProduct).toBe('function');
    expect(typeof corePackage.createNutritionInfo).toBe('function');
  });

  it('should export required TypeScript types', async () => {
    // This will fail until types are properly exported
    const corePackage = await import('@picklist/core');

    // Types should be available for import (tested via TypeScript compilation)
    // Runtime test: create sample instances to verify type structure
    const sampleProduct: Product = {
      id: 'test-id',
      name: 'Test Product',
      categories: ['test'],
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
      }
    };

    expect(sampleProduct.id).toBe('test-id');
    expect(sampleProduct.nutrition.protein).toBe(10);
  });

  it('should validate function signatures match contract', async () => {
    // This will fail until functions have correct signatures
    const corePackage = await import('@picklist/core');

    // Test mergeDuplicates signature
    const testProducts: Product[] = [];
    const mergeResult = corePackage.mergeDuplicates(testProducts);
    expect(mergeResult).toHaveProperty('mergedProducts');
    expect(mergeResult).toHaveProperty('duplicatesRemoved');
    expect(mergeResult).toHaveProperty('conflicts');

    // Test calculateSparsity signature
    const testCsvData: Record<string, string>[] = [{ col1: 'value1', col2: '' }];
    const sparsityResult = corePackage.calculateSparsity(testCsvData);
    expect(sparsityResult).toHaveProperty('totalColumns');
    expect(sparsityResult).toHaveProperty('emptyColumns');
    expect(sparsityResult).toHaveProperty('sparsityThreshold');
    expect(sparsityResult).toHaveProperty('recommendedExclusions');

    // Test string utilities
    expect(corePackage.normalizeText('  Test Text  ')).toBe('test text');
    expect(corePackage.removePlaceholders('NA')).toBe('');
    expect(corePackage.splitAndTrim('a, b , c', ',')).toEqual(['a', 'b', 'c']);

    // Test validation utilities
    const validationResult = corePackage.validateProduct({ name: 'Test' });
    expect(validationResult).toHaveProperty('isValid');
    expect(validationResult).toHaveProperty('errors');

    expect(corePackage.isValidSemver('1.0.0')).toBe(true);
    expect(corePackage.isValidSemver('invalid')).toBe(false);

    expect(corePackage.isValidPackageName('@picklist/core')).toBe(true);
    expect(corePackage.isValidPackageName('invalid-name')).toBe(false);
  });
});
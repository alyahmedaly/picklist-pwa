/**
 * Parity Test: Original vs @picklist/core imports
 *
 * CRITICAL: This test MUST FAIL until T010-T018 implementation is complete
 * Ensures identical behavior between original src/data/transform/ functions
 * and new @picklist/core package exports
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('@picklist/core Parity Tests', () => {
  const testCsvData = [
    { id: '1', name: 'Product A', category: 'food', price: '10.99', description: '' },
    { id: '2', name: 'Product A', category: 'food', price: '10.99', description: 'Same product' },
    { id: '3', name: 'Product B', category: '', price: '15.99', description: 'Different product' },
    { id: '4', name: 'Product C', category: 'drinks', price: '', description: 'No price' }
  ];

  it('should produce identical sparsity analysis results', async () => {
    // This will fail until both original and core implementations exist
    const originalSparsity = await import('../../src/data/transform/sparsity');
    const { calculateSparsity } = await import('@picklist/core');

    const originalResult = originalSparsity.calculateSparsity(testCsvData);
    const coreResult = await calculateSparsity(testCsvData);

    expect(coreResult).toEqual(originalResult);
    expect(coreResult.totalColumns).toBe(originalResult.totalColumns);
    expect(coreResult.emptyColumns).toEqual(originalResult.emptyColumns);
    expect(coreResult.sparsityThreshold).toBe(originalResult.sparsityThreshold);
    expect(coreResult.recommendedExclusions).toEqual(originalResult.recommendedExclusions);
  });

  it('should produce identical merge results for duplicate products', async () => {
    const originalMerge = await import('../../src/data/transform/mergeDuplicate');
    const { mergeDuplicates } = await import('@picklist/core');

    // Create test products in the format expected by original function
    const testProducts = [
      {
        id: '1',
        name: 'Duplicate Product',
        categories: ['food'],
        ingredients: { raw: 'test', parsed: ['test'], addedSugar: false, addedSalt: false, preservatives: [], conflicts: [] },
        allergens: { raw: 'none', normalized: [], detected: [], warnings: [] },
        nutrition: { energy: 100, protein: 10, carbohydrates: 20, fat: 5, perServing: false },
        additives: [],
        stores: ['store1'],
        metadata: { processedAt: '2025-01-01', sourceFile: 'test.csv', transformVersion: '1.0.0' }
      },
      {
        id: '2',
        name: 'Duplicate Product',
        categories: ['food'],
        ingredients: { raw: 'test', parsed: ['test'], addedSugar: false, addedSalt: false, preservatives: [], conflicts: [] },
        allergens: { raw: 'none', normalized: [], detected: [], warnings: [] },
        nutrition: { energy: 110, protein: 12, carbohydrates: 18, fat: 6, perServing: false },
        additives: [],
        stores: ['store2'],
        metadata: { processedAt: '2025-01-01', sourceFile: 'test.csv', transformVersion: '1.0.0' }
      }
    ];

    const originalResult = originalMerge.mergeDuplicates(testProducts);
    const coreResult = await mergeDuplicates(testProducts);

    expect(coreResult.duplicatesRemoved).toBe(originalResult.duplicatesRemoved);
    expect(coreResult.mergedProducts).toHaveLength(originalResult.mergedProducts.length);
    expect(coreResult.conflicts).toHaveLength(originalResult.conflicts.length);
  });

  it('should produce identical ordering results', async () => {
    const originalOrdering = await import('../../src/data/transform/ordering');
    const { sortProducts } = await import('@picklist/core');

    const testProducts = [
      { name: 'Zebra Product', nutrition: { protein: 5 }, price: { amount: 20 } },
      { name: 'Alpha Product', nutrition: { protein: 15 }, price: { amount: 10 } },
      { name: 'Beta Product', nutrition: { protein: 10 }, price: { amount: 15 } }
    ];

    // Test name sorting
    const originalByName = originalOrdering.sortProducts([...testProducts], 'name');
    const coreByName = sortProducts([...testProducts], 'name');
    expect(coreByName.map(p => p.name)).toEqual(originalByName.map(p => p.name));

    // Test protein sorting
    const originalByProtein = originalOrdering.sortProducts([...testProducts], 'protein');
    const coreByProtein = sortProducts([...testProducts], 'protein');
    expect(coreByProtein.map(p => p.nutrition.protein)).toEqual(originalByProtein.map(p => p.nutrition.protein));

    // Test price sorting
    const originalByPrice = originalOrdering.sortProducts([...testProducts], 'price');
    const coreByPrice = sortProducts([...testProducts], 'price');
    expect(coreByPrice.map(p => p.price?.amount)).toEqual(originalByPrice.map(p => p.price?.amount));
  });

  it('should produce identical file I/O results', async () => {
    const originalWriter = await import('../../src/data/transform/writer');
    const { writeJsonl, writeIndexFile } = await import('@picklist/core');

    const testData = [
      { id: 1, name: 'Test Item', data: 'sample' },
      { id: 2, name: 'Another Item', data: 'more sample' }
    ];

    const testDir = './test-parity-output';

    // Test JSONL writing parity
    const originalJsonlPath = join(testDir, 'original.jsonl');
    const coreJsonlPath = join(testDir, 'core.jsonl');

    await originalWriter.writeJsonl(testData, originalJsonlPath);
    await writeJsonl(testData, coreJsonlPath);

    const originalContent = readFileSync(originalJsonlPath, 'utf-8');
    const coreContent = readFileSync(coreJsonlPath, 'utf-8');

    expect(coreContent).toBe(originalContent);

    // Clean up
    const { rmSync } = await import('fs');
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should maintain identical validation behavior', async () => {
    const { validateProduct, validateNutrition, isValidSemver, isValidPackageName } = await import('@picklist/core');

    // Test product validation parity
    const validProduct = {
      id: 'test-id',
      name: 'Test Product',
      categories: ['food'],
      nutrition: { energy: 100, protein: 10, carbohydrates: 20, fat: 5, perServing: false }
    };

    const invalidProduct = {
      // Missing required fields
      name: 'Incomplete Product'
    };

    const validResult = validateProduct(validProduct);
    const invalidResult = validateProduct(invalidProduct);

    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);

    // Test nutrition validation parity
    const validNutrition = { energy: 100, protein: 10, carbohydrates: 20, fat: 5, perServing: false };
    const invalidNutrition = { energy: -100, protein: 'invalid' }; // Invalid values

    const validNutritionResult = validateNutrition(validNutrition);
    const invalidNutritionResult = validateNutrition(invalidNutrition);

    expect(validNutritionResult.isValid).toBe(true);
    expect(invalidNutritionResult.isValid).toBe(false);

    // Test semver validation
    expect(isValidSemver('1.0.0')).toBe(true);
    expect(isValidSemver('1.0')).toBe(false);
    expect(isValidSemver('invalid')).toBe(false);

    // Test package name validation
    expect(isValidPackageName('@picklist/core')).toBe(true);
    expect(isValidPackageName('@picklist/parser')).toBe(true);
    expect(isValidPackageName('invalid-name')).toBe(false);
    expect(isValidPackageName('@wrong/scope')).toBe(false);
  });

  it('should maintain identical string processing behavior', async () => {
    const { normalizeText, removePlaceholders, splitAndTrim, sanitizeForFilename } = await import('@picklist/core');

    // Test text normalization
    expect(normalizeText('  Mixed CASE Text  ')).toBe('mixed case text');
    expect(normalizeText('\t\nTabs and Newlines\t\n')).toBe('tabs and newlines');

    // Test placeholder removal
    expect(removePlaceholders('NA')).toBe('');
    expect(removePlaceholders('n/a')).toBe('');
    expect(removePlaceholders('N/A')).toBe('');
    expect(removePlaceholders('Valid text')).toBe('Valid text');

    // Test split and trim
    expect(splitAndTrim('a, b , c', ',')).toEqual(['a', 'b', 'c']);
    expect(splitAndTrim('  item1  ;  item2  ; item3  ', ';')).toEqual(['item1', 'item2', 'item3']);

    // Test filename sanitization
    expect(sanitizeForFilename('file<>:"/\\|?*name')).not.toContain('<');
    expect(sanitizeForFilename('normal-filename.txt')).toBe('normal-filename.txt');
  });

  it('should produce deterministic results across multiple runs', async () => {
    const { calculateSparsity, mergeDuplicates } = await import('@picklist/core');

    // Run sparsity analysis multiple times
    const run1 = await calculateSparsity(testCsvData);
    const run2 = await calculateSparsity(testCsvData);
    const run3 = await calculateSparsity(testCsvData);

    expect(run2).toEqual(run1);
    expect(run3).toEqual(run1);

    // Test with same product data multiple times
    const testProducts = [
      {
        id: '1', name: 'Test Product', categories: ['food'],
        ingredients: { raw: 'test', parsed: ['test'], addedSugar: false, addedSalt: false, preservatives: [], conflicts: [] },
        allergens: { raw: 'none', normalized: [], detected: [], warnings: [] },
        nutrition: { energy: 100, protein: 10, carbohydrates: 20, fat: 5, perServing: false },
        additives: [], stores: ['store1'],
        metadata: { processedAt: '2025-01-01', sourceFile: 'test.csv', transformVersion: '1.0.0' }
      }
    ];

    const merge1 = await mergeDuplicates([...testProducts]);
    const merge2 = await mergeDuplicates([...testProducts]);
    const merge3 = await mergeDuplicates([...testProducts]);

    expect(merge2).toEqual(merge1);
    expect(merge3).toEqual(merge1);
  });
});
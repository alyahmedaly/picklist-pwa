/**
 * Integration Test: File I/O utilities
 *
 * CRITICAL: This test MUST FAIL until T013 and T015 implementation is complete
 * Tests writeJsonl, writeIndexFile, and writeSchemaDoc functions from @picklist/core
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Product } from '../../specs/021-npm-workspaces/contracts/core-interface';

describe('File I/O Utilities Integration Tests', () => {
  const testDir = './test-output';

  beforeEach(() => {
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  const createTestProduct = (id: string, name: string): Product => ({
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
    }
  });

  it('should write JSONL file with proper line-delimited JSON format', async () => {
    // This will fail until writeJsonl is implemented
    const { writeJsonl } = await import('@picklist/core');

    const testData = [
      { id: 1, name: 'Item A' },
      { id: 2, name: 'Item B' },
      { id: 3, name: 'Item C' }
    ];

    const filePath = join(testDir, 'test.jsonl');
    await writeJsonl(testData, filePath);

    expect(existsSync(filePath)).toBe(true);

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');

    expect(lines).toHaveLength(3);
    expect(JSON.parse(lines[0])).toEqual({ id: 1, name: 'Item A' });
    expect(JSON.parse(lines[1])).toEqual({ id: 2, name: 'Item B' });
    expect(JSON.parse(lines[2])).toEqual({ id: 3, name: 'Item C' });
  });

  it('should write index file for products with search-optimized format', async () => {
    const { writeIndexFile } = await import('@picklist/core');

    const products = [
      createTestProduct('1', 'Product A'),
      createTestProduct('2', 'Product B'),
      createTestProduct('3', 'Product C')
    ];

    const filePath = join(testDir, 'index.json');
    await writeIndexFile(products, filePath);

    expect(existsSync(filePath)).toBe(true);

    const content = readFileSync(filePath, 'utf-8');
    const indexData = JSON.parse(content);

    expect(Array.isArray(indexData)).toBe(true);
    expect(indexData).toHaveLength(3);

    // Index should contain searchable fields
    expect(indexData[0]).toHaveProperty('id');
    expect(indexData[0]).toHaveProperty('name');
    expect(indexData[0].id).toBe('1');
    expect(indexData[0].name).toBe('Product A');
  });

  it('should write schema documentation file', async () => {
    const { writeSchemaDoc } = await import('@picklist/core');

    const schema = {
      version: '1.0.0',
      tables: {
        products: {
          id: 'string (primary key)',
          name: 'string (required)',
          nutrition: 'object (NutritionInfo)'
        },
        categories: {
          id: 'string (primary key)',
          name: 'string (required)',
          parent_id: 'string (nullable)'
        }
      },
      relationships: [
        'products -> categories (many-to-many)'
      ]
    };

    const filePath = join(testDir, 'schema.json');
    await writeSchemaDoc(schema, filePath);

    expect(existsSync(filePath)).toBe(true);

    const content = readFileSync(filePath, 'utf-8');
    const schemaData = JSON.parse(content);

    expect(schemaData.version).toBe('1.0.0');
    expect(schemaData.tables).toHaveProperty('products');
    expect(schemaData.tables).toHaveProperty('categories');
    expect(Array.isArray(schemaData.relationships)).toBe(true);
  });

  it('should handle empty data arrays gracefully', async () => {
    const { writeJsonl, writeIndexFile } = await import('@picklist/core');

    // Test empty JSONL
    const jsonlPath = join(testDir, 'empty.jsonl');
    await writeJsonl([], jsonlPath);
    expect(existsSync(jsonlPath)).toBe(true);

    const jsonlContent = readFileSync(jsonlPath, 'utf-8');
    expect(jsonlContent.trim()).toBe('');

    // Test empty index
    const indexPath = join(testDir, 'empty-index.json');
    await writeIndexFile([], indexPath);
    expect(existsSync(indexPath)).toBe(true);

    const indexContent = readFileSync(indexPath, 'utf-8');
    const indexData = JSON.parse(indexContent);
    expect(Array.isArray(indexData)).toBe(true);
    expect(indexData).toHaveLength(0);
  });

  it('should create directories if they do not exist', async () => {
    const { writeJsonl } = await import('@picklist/core');

    const nestedPath = join(testDir, 'nested', 'deep', 'file.jsonl');
    await writeJsonl([{ test: 'data' }], nestedPath);

    expect(existsSync(nestedPath)).toBe(true);

    const content = readFileSync(nestedPath, 'utf-8');
    expect(JSON.parse(content.trim())).toEqual({ test: 'data' });
  });

  it('should handle large datasets efficiently', async () => {
    const { writeJsonl } = await import('@picklist/core');

    // Generate large dataset (1000 items)
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      data: `test-data-${i}`.repeat(10) // Some bulk to each item
    }));

    const filePath = join(testDir, 'large.jsonl');
    const startTime = Date.now();

    await writeJsonl(largeDataset, filePath);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(existsSync(filePath)).toBe(true);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

    // Verify file structure
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    expect(lines).toHaveLength(1000);
  });

  it('should preserve data integrity during I/O operations', async () => {
    const { writeJsonl } = await import('@picklist/core');

    const complexData = [
      {
        id: 'complex-1',
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
          nullable: null,
          boolean: true
        },
        specialChars: 'Special chars: "quotes", \\backslash, \n newline',
        unicode: '🎯 Unicode test with émojis and àccents'
      }
    ];

    const filePath = join(testDir, 'complex.jsonl');
    await writeJsonl(complexData, filePath);

    const content = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content.trim());

    expect(parsed).toEqual(complexData[0]);
    expect(parsed.nested.array).toEqual([1, 2, 3]);
    expect(parsed.specialChars).toContain('newline');
    expect(parsed.unicode).toContain('🎯');
  });
});
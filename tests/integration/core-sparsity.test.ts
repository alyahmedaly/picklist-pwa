/**
 * Integration Test: calculateSparsity function
 *
 * CRITICAL: This test MUST FAIL until T011 and T015 implementation is complete
 * Tests the sparsity analysis utility function from @picklist/core
 */

import { describe, it, expect } from 'vitest';

describe('calculateSparsity Integration Tests', () => {
  it('should analyze CSV data sparsity and return SparsityAnalysis', async () => {
    // This will fail until calculateSparsity is implemented
    const { calculateSparsity } = await import('@picklist/core');

    const csvData = [
      { col1: 'value1', col2: 'value2', col3: '', col4: 'value4' },
      { col1: 'value1', col2: '', col3: '', col4: 'value4' },
      { col1: 'value1', col2: 'value2', col3: '', col4: '' },
      { col1: '', col2: '', col3: '', col4: 'value4' }
    ];

    const result = await calculateSparsity(csvData);

    expect(result).toHaveProperty('totalColumns');
    expect(result).toHaveProperty('emptyColumns');
    expect(result).toHaveProperty('sparsityThreshold');
    expect(result).toHaveProperty('recommendedExclusions');

    expect(result.totalColumns).toBe(4);
    expect(Array.isArray(result.emptyColumns)).toBe(true);
    expect(typeof result.sparsityThreshold).toBe('number');
    expect(Array.isArray(result.recommendedExclusions)).toBe(true);
  });

  it('should handle empty CSV data', async () => {
    const { calculateSparsity } = await import('@picklist/core');

    const result = await calculateSparsity([]);

    expect(result.totalColumns).toBe(0);
    expect(result.emptyColumns).toEqual([]);
    expect(result.recommendedExclusions).toEqual([]);
  });

  it('should identify columns with high sparsity (>90% empty)', async () => {
    const { calculateSparsity } = await import('@picklist/core');

    // Create data where col3 is 100% empty (should be recommended for exclusion)
    const csvData = Array.from({ length: 100 }, (_, i) => ({
      col1: `value${i}`,
      col2: i % 10 === 0 ? '' : `value${i}`, // 10% empty
      col3: '', // 100% empty - should be excluded
      col4: i % 2 === 0 ? `value${i}` : '' // 50% empty
    }));

    const result = await calculateSparsity(csvData);

    expect(result.totalColumns).toBe(4);
    expect(result.emptyColumns).toContain('col3');
    expect(result.recommendedExclusions).toContain('col3');
    expect(result.recommendedExclusions).not.toContain('col1'); // Never empty
    expect(result.recommendedExclusions).not.toContain('col4'); // Only 50% empty
  });

  it('should use configurable sparsity threshold', async () => {
    const { calculateSparsity } = await import('@picklist/core');

    const csvData = [
      { col1: 'value', col2: '', col3: 'value' },
      { col1: 'value', col2: 'value', col3: '' },
      { col1: 'value', col2: '', col3: 'value' }
    ];

    const result = await calculateSparsity(csvData);

    // col2 is 67% empty (2/3) - behavior depends on threshold
    expect(typeof result.sparsityThreshold).toBe('number');
    expect(result.sparsityThreshold).toBeGreaterThan(0);
    expect(result.sparsityThreshold).toBeLessThanOrEqual(1);
  });

  it('should provide detailed column-level analysis', async () => {
    const { calculateSparsity } = await import('@picklist/core');

    const csvData = [
      { name: 'Product A', price: '10.99', description: '', category: 'food' },
      { name: 'Product B', price: '', description: '', category: 'food' },
      { name: 'Product C', price: '15.99', description: 'Good product', category: '' }
    ];

    const result = await calculateSparsity(csvData);

    expect(result.totalColumns).toBe(4);
    expect(result.emptyColumns).toContain('description'); // 67% empty
    expect(result.emptyColumns.length).toBeGreaterThan(0);

    // Verify recommended exclusions logic
    if (result.sparsityThreshold <= 0.67) {
      expect(result.recommendedExclusions).toContain('description');
    }
  });

  it('should handle CSV data with inconsistent column structure', async () => {
    const { calculateSparsity } = await import('@picklist/core');

    const csvData = [
      { col1: 'value1', col2: 'value2' },
      { col1: 'value1', col2: 'value2', col3: 'value3' },
      { col1: 'value1' } // Missing col2
    ];

    const result = await calculateSparsity(csvData);

    expect(result.totalColumns).toBeGreaterThanOrEqual(2);
    expect(result.emptyColumns).toBeDefined();
    expect(result.recommendedExclusions).toBeDefined();
  });
});
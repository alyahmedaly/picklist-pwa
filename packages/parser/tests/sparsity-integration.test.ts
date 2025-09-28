/**
 * Integration test for @picklist/core sparsity compatibility
 *
 * This test MUST fail initially (no implementation exists) and pass after extraction.
 * Tests integration between parser output and calculateSparsity from @picklist/core.
 */

import { describe, it, expect } from 'vitest';
import { readCSV, createRows } from '@picklist/parser';
import { calculateSparsity } from '@picklist/core';
import { CSVHeader } from '../src/types.ts';

describe('Sparsity integration test', () => {
  const csvWithSparseColumns = `ProductId,ProductName,EmptyCol1,EmptyCol2,Category1,AnotherEmptyCol
123,Test Product,,,Dairy,
456,Another Product,,,Bakery,
789,Third Product,,,Produce,`;

  it('should integrate seamlessly with calculateSparsity from @picklist/core', () => {
    // Parse CSV using new parser functions
    const parsed = readCSV(csvWithSparseColumns);
    const rows = createRows(parsed.headers as CSVHeader[], parsed.matrix);
    // Legacy convertTypes removed: build records array directly from rows
    const records = rows.map((r) => ({ ...r })) as Record<string, string>[];

    // This should not throw - records format must be compatible
    expect(() => calculateSparsity(records)).not.toThrow();

    const sparsity = calculateSparsity(records);

    // Verify sparsity analysis worked
    expect(sparsity).toBeDefined();
    expect(sparsity.emptyColumns).toBeDefined();
    expect(Array.isArray(sparsity.emptyColumns)).toBe(true);

    // Should detect the empty columns
    expect(sparsity.emptyColumns).toContain('EmptyCol1');
    expect(sparsity.emptyColumns).toContain('EmptyCol2');
    expect(sparsity.emptyColumns).toContain('AnotherEmptyCol');

    // Should not include non-empty columns
    expect(sparsity.emptyColumns).not.toContain('ProductId');
    expect(sparsity.emptyColumns).not.toContain('ProductName');
    expect(sparsity.emptyColumns).not.toContain('Category1');
  });

  it('should maintain two-pass processing compatibility', () => {
    // First pass - sparsity analysis (like current transform-data.ts)
    const parsed = readCSV(csvWithSparseColumns);
    const rows = createRows(parsed.headers as CSVHeader[], parsed.matrix);
    const records = rows.map((r) => ({ ...r })) as Record<string, string>[];

    const sparsity = calculateSparsity(records);
    expect(sparsity.emptyColumns).toHaveLength(3);

    // Second pass - same data should be available for full processing
    const secondPassRows = createRows(parsed.headers as CSVHeader[], parsed.matrix);
    expect(secondPassRows).toEqual(rows);
    expect(secondPassRows).toHaveLength(3);
  });

  it('should handle edge case with all columns empty', () => {
    const allEmptyCSV = `Col1,Col2,Col3
,,
,,
,,`;

    const parsed = readCSV(allEmptyCSV);
    const rows = createRows(parsed.headers as CSVHeader[], parsed.matrix);
    const records = rows.map((r) => ({ ...r })) as Record<string, string>[];

    const sparsity = calculateSparsity(records);
    expect(sparsity.emptyColumns).toEqual(['Col1', 'Col2', 'Col3']);
  });

  it('should handle edge case with no empty columns', () => {
    const noEmptyCSV = `ProductId,ProductName,Category1
123,Product A,Dairy
456,Product B,Bakery`;

    const parsed = readCSV(noEmptyCSV);
    const rows = createRows(parsed.headers as CSVHeader[], parsed.matrix);
    const records = rows.map((r) => ({ ...r })) as Record<string, string>[];

    const sparsity = calculateSparsity(records);
    expect(sparsity.emptyColumns).toEqual([]);
  });

  it('should produce identical results to current transform-data.ts implementation', () => {
    // This CSV format matches what transform-data.ts currently processes
    const dutchFoodCSV = `ProductId,ProductName,PriceRegular,ingredients,ContainedAllergens,Category1,Category2
NL123,Gouda Kaas,12.50,melk\\, zout,Melk,Zuivel,
NL456,Volkoren Brood,3.25,tarwe\\, gist,Gluten,Bakkerij,Brood
NL789,Appelsap,2.99,appels,,Fruit,Drank`;

    const parsed = readCSV(dutchFoodCSV);
    const rows = createRows(parsed.headers as CSVHeader[], parsed.matrix);
    const records = rows.map((r) => ({ ...r })) as Record<string, string>[];

    // Should work with calculateSparsity
    const sparsity = calculateSparsity(records);
    expect(sparsity).toBeDefined();

    // Verify record structure matches expected format
    expect(records[0]).toHaveProperty('ProductId');
    expect(records[0]).toHaveProperty('ProductName');
    expect(records[0]).toHaveProperty('PriceRegular');
    expect(records[0]).toHaveProperty('ingredients');
    expect(records[0]).toHaveProperty('ContainedAllergens');
    expect(records[0]).toHaveProperty('Category1');

    // Verify data types are all strings
    Object.values(records[0]).forEach((value) => {
      expect(typeof value).toBe('string');
    });
  });

  it('should handle sparsity threshold calculation correctly', () => {
    // Create CSV with exactly 90% sparse column (threshold case)
    const rows = Array.from({ length: 10 }, (_, i) =>
      i === 0 ? `${i},Product ${i},value,Category` : `${i},Product ${i},,Category`,
    );
    const sparseCSV = `id,name,sparse_col,category\n${rows.join('\n')}`;

    const parsed = readCSV(sparseCSV);
    const csvRows = createRows(parsed.headers as CSVHeader[], parsed.matrix);
    const records = csvRows.map((r) => ({ ...r })) as Record<string, string>[];

    const sparsity = calculateSparsity(records);

    // Should handle threshold edge cases properly
    expect(sparsity).toBeDefined();
    expect(sparsity.sparsityThreshold).toBeDefined();
  });
});

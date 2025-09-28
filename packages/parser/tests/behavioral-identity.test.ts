/**
 * Behavioral identity validation test
 *
 * This test MUST fail initially (no implementation exists) and pass after extraction.
 * Compares parser output with transform-data.ts baseline to ensure identical behavior.
 */

import { describe, it, expect } from 'vitest';
import { readCSV, createRows, createCSVRow, csvRowToRecord } from '@picklist/parser';
import type { CSVRow } from '@picklist/parser';
import { parse } from '@std/csv';

describe('Behavioral identity validation', () => {
  const sampleCSV = `ProductId,ProductName,PriceRegular,Category1,ingredients,ContainedAllergens
123,Test Product,10.99,Dairy,milk\\, salt,Milk
456,Another Product,15.50,Bakery,flour\\, yeast,Gluten
789,Third Product,8.75,Produce,apples,`;

  it('should produce identical output to current transform-data.ts implementation', () => {
    // Current implementation (baseline from transform-data.ts:183-199)
    const parsedCsv = parse(sampleCSV, { skipFirstRow: false });
    const headerCols = parsedCsv[0] as string[];
    const matrix = parsedCsv.slice(1) as string[][];

    const baselineRecords = matrix.map((row) => {
      const record: Record<string, string> = {};
      headerCols.forEach((header, i) => {
        record[header] = row[i] || '';
      });
      return record;
    });

    // New implementation using extracted parser
    const parsed = readCSV(sampleCSV);
    // cast headers as CSVHeader[] for test purposes (sample includes lowercase 'ingredients')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = createRows(parsed.headers as any as (keyof CSVRow)[], parsed.matrix);
    // Direct mapping identical to baseline logic (convertTypes removed)
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        if (v !== undefined) rec[k] = v ?? '';
      }
      return rec;
    });

    // Should produce structurally identical results
    expect(records).toEqual(baselineRecords);
    expect(records).toHaveLength(baselineRecords.length);

    // Verify headers match
    expect(parsed.headers).toEqual(headerCols);

    // Verify matrix data matches
    expect(parsed.matrix).toEqual(matrix);
  });

  it('should produce identical createCSVRow behavior', () => {
    const headers = ['ProductId', 'ProductName', 'Category1'];
    const values = ['123', 'Test Product', undefined];

    // Current implementation from transform-data.ts:79-90
    const baselineCSVRow: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header !== undefined) {
        baselineCSVRow[header] = values[i] ?? '';
      }
    }

    // New implementation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csvRow = createCSVRow(headers as any as (keyof CSVRow)[], values);

    expect(csvRow).toEqual(baselineCSVRow);
  });

  it('should produce identical csvRowToRecord behavior', () => {
    const csvRow = {
      ProductId: '123',
      ProductName: 'Test Product',
      PriceRegular: undefined,
      Category1: 'Dairy',
    };

    // Current implementation from transform-data.ts:96-106
    const baselineRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(csvRow)) {
      if (value !== undefined) {
        baselineRecord[key] = value;
      }
    }

    // New implementation
    const record = csvRowToRecord(csvRow);

    expect(record).toEqual(baselineRecord);
  });

  it('should maintain exact same error handling behavior', () => {
    // Test empty CSV handling
    expect(() => readCSV('')).toThrow();
    expect(() => readCSV('\n')).toThrow();

    // Test that missing values are handled gracefully (same as @std/csv baseline)
    const csvWithMissingValues = 'header1,header2\nvalue1'; // Missing second value
    const result = readCSV(csvWithMissingValues);
    expect(result.matrix).toEqual([['value1']]); // Should handle gracefully, not throw
  });

  it('should handle Dutch food product CSV format identically', () => {
    const dutchCSV = `ProductId,ProductName,PriceRegular,ingredients,ContainedAllergens,MayContainAllergens,Category1,Category2
NL123,Gouda Kaas,12.50,melk\\, zout,Melk,,Zuivel,
NL456,Volkoren Brood,3.25,tarwe\\, gist,Gluten,Noten,Bakkerij,Brood`;

    // Baseline processing
    const parsedBaseline = parse(dutchCSV, { skipFirstRow: false });
    const headersBaseline = parsedBaseline[0] as string[];
    const matrixBaseline = parsedBaseline.slice(1) as string[][];

    const baselineRecords = matrixBaseline.map((row) => {
      const record: Record<string, string> = {};
      headersBaseline.forEach((header, i) => {
        record[header] = row[i] || '';
      });
      return record;
    });

    // New parser processing
    const parsed = readCSV(dutchCSV);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = createRows(parsed.headers as any as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        if (v !== undefined) rec[k] = v ?? '';
      }
      return rec;
    });

    // Should be identical
    expect(records).toEqual(baselineRecords);
    expect(parsed.headers).toEqual(headersBaseline);
    expect(parsed.matrix).toEqual(matrixBaseline);
  });

  it('should maintain performance characteristics', () => {
    // Generate larger CSV for performance comparison
    const largeCSVRows = Array.from(
      { length: 1000 },
      (_, i) =>
        `${i},Product ${i},${10 + i * 0.1},Category ${i % 5},ingredients ${i},allergen ${i}`,
    );
    const largeCSV = `ProductId,ProductName,PriceRegular,Category1,ingredients,ContainedAllergens\n${largeCSVRows.join('\n')}`;

    // Baseline timing
    const baselineStart = performance.now();
    const parsedBaseline = parse(largeCSV, { skipFirstRow: false });
    const headersBaseline = parsedBaseline[0] as string[];
    const matrixBaseline = parsedBaseline.slice(1) as string[][];
    const baselineRecords = matrixBaseline.map((row) => {
      const record: Record<string, string> = {};
      headersBaseline.forEach((header, i) => {
        record[header] = row[i] || '';
      });
      return record;
    });
    const baselineTime = performance.now() - baselineStart;

    // New parser timing
    const parserStart = performance.now();
    const parsed = readCSV(largeCSV);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = createRows(parsed.headers as any as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        if (v !== undefined) rec[k] = v ?? '';
      }
      return rec;
    });
    const parserTime = performance.now() - parserStart;

    // Should produce identical results
    expect(records).toEqual(baselineRecords);

    // Performance should be comparable (within 50% tolerance for test stability)
    expect(parserTime).toBeLessThan(baselineTime * 1.5);
  });

  it('should handle edge cases identically', () => {
    const edgeCases = [
      // Empty cells
      'a,b,c\n1,,3\n,2,',
      // Quoted fields
      'name,desc\n"Product A","Description with, comma"',
      // Different line endings
      'a,b\r\n1,2\r\n3,4',
      // Single column
      'col\nval1\nval2',
      // Single row (headers only)
      'col1,col2,col3',
    ];

    edgeCases.forEach((csvText) => {
      // Baseline
      const parsedBaseline = parse(csvText, { skipFirstRow: false });
      const headersBaseline = parsedBaseline[0] as string[];
      const matrixBaseline = parsedBaseline.slice(1) as string[][];

      // New parser
      const parsed = readCSV(csvText);

      expect(parsed.headers).toEqual(headersBaseline);
      expect(parsed.matrix).toEqual(matrixBaseline);
    });
  });
});

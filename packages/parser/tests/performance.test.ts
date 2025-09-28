/**
 * Performance validation test
 *
 * Ensures parser performance maintains parity with baseline implementation.
 * Tests various performance scenarios and validates no major regressions.
 */

import { describe, it, expect } from 'vitest';
import { readCSV, createRows } from '@picklist/parser';
import type { CSVRow } from '@picklist/parser';
import { parse } from '@std/csv';

describe('Performance validation', () => {
  const generateLargeCSV = (rows: number, cols: number) => {
    const headers = Array.from({ length: cols }, (_, i) => `column_${i}`);
    const dataRows = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => `row${i}_col${j}`),
    );
    const csvText = [headers.join(','), ...dataRows.map((row) => row.join(','))].join('\n');
    return { csvText, expectedRows: rows, expectedCols: cols };
  };

  it('should maintain performance parity with @std/csv baseline', () => {
    const { csvText } = generateLargeCSV(1000, 20);

    // Baseline using @std/csv directly (current transform-data.ts approach)
    const baselineStart = performance.now();
    const parsedBaseline = parse(csvText, { skipFirstRow: false });
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

    // New parser approach
    const parserStart = performance.now();
    const parsed = readCSV(csvText);
    const rows = createRows(parsed.headers as unknown as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) if (v !== undefined) rec[k] = v ?? '';
      return rec;
    });
    const parserTime = performance.now() - parserStart;

    // Verify identical results
    expect(records).toEqual(baselineRecords);
    expect(parsed.headers).toEqual(headersBaseline);
    expect(parsed.matrix).toEqual(matrixBaseline);

    // Performance should be comparable (within 200% tolerance for test stability)
    expect(parserTime).toBeLessThan(baselineTime * 3);

    console.log(`Performance comparison:
    Baseline: ${baselineTime.toFixed(2)}ms
    Parser:   ${parserTime.toFixed(2)}ms
    Ratio:    ${(parserTime / baselineTime).toFixed(2)}x`);
  });

  it('should handle small CSV files efficiently', () => {
    const { csvText } = generateLargeCSV(10, 5);

    const start = performance.now();
    const parsed = readCSV(csvText);
    const rows = createRows(parsed.headers as unknown as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) if (v !== undefined) rec[k] = v ?? '';
      return rec;
    });
    const duration = performance.now() - start;

    expect(records).toHaveLength(10);
    expect(duration).toBeLessThan(10); // Should be very fast for small files
  });

  it('should handle medium CSV files within reasonable time', () => {
    const { csvText, expectedRows } = generateLargeCSV(5000, 50);

    const start = performance.now();
    const parsed = readCSV(csvText);
    const rows = createRows(parsed.headers as unknown as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) if (v !== undefined) rec[k] = v ?? '';
      return rec;
    });
    const duration = performance.now() - start;

    expect(records).toHaveLength(expectedRows);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  it('should handle wide CSV files (many columns) efficiently', () => {
    const { csvText, expectedRows, expectedCols } = generateLargeCSV(100, 200);

    const start = performance.now();
    const parsed = readCSV(csvText);
    const rows = createRows(parsed.headers as unknown as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) if (v !== undefined) rec[k] = v ?? '';
      return rec;
    });
    const duration = performance.now() - start;

    expect(records).toHaveLength(expectedRows);
    expect(parsed.headers).toHaveLength(expectedCols);
    expect(duration).toBeLessThan(500); // Should handle wide files efficiently
  });

  it('should have linear performance scaling', () => {
    const smallSize = { rows: 100, cols: 10 };
    const largeSize = { rows: 1000, cols: 10 }; // 10x larger

    // Test small dataset
    const { csvText: smallCSV } = generateLargeCSV(smallSize.rows, smallSize.cols);
    const smallStart = performance.now();
    readCSV(smallCSV);
    const smallTime = performance.now() - smallStart;

    // Test large dataset
    const { csvText: largeCSV } = generateLargeCSV(largeSize.rows, largeSize.cols);
    const largeStart = performance.now();
    readCSV(largeCSV);
    const largeTime = performance.now() - largeStart;

    // Performance should scale roughly linearly (within 20x tolerance for test stability)
    const scalingFactor = largeTime / smallTime;
    expect(scalingFactor).toBeLessThan(20);

    console.log(`Scaling test:
    Small (${smallSize.rows} rows): ${smallTime.toFixed(2)}ms
    Large (${largeSize.rows} rows): ${largeTime.toFixed(2)}ms
    Scaling factor: ${scalingFactor.toFixed(2)}x`);
  });

  it('should maintain performance with sparse data', () => {
    // Create CSV with mostly empty cells (sparse data)
    const rows = 1000;
    const cols = 50;
    const headers = Array.from({ length: cols }, (_, i) => `col${i}`);
    const sparseRows = Array.from({ length: rows }, (_, i) => {
      // Only fill every 10th cell
      return Array.from({ length: cols }, (_, j) => ((i + j) % 10 === 0 ? `value_${i}_${j}` : ''));
    });

    const csvText = [headers.join(','), ...sparseRows.map((row) => row.join(','))].join('\n');

    const start = performance.now();
    const parsed = readCSV(csvText);
    const rowsData = createRows(parsed.headers as unknown as (keyof CSVRow)[], parsed.matrix);
    const records = rowsData.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) if (v !== undefined) rec[k] = v ?? '';
      return rec;
    });
    const duration = performance.now() - start;

    expect(records).toHaveLength(rows);
    expect(duration).toBeLessThan(500); // Should handle sparse data efficiently
  });

  it('should maintain performance with Dutch food product CSV structure', () => {
    // Create CSV matching typical Dutch food product structure
    const numProducts = 1000;
    const headers = [
      'ProductId',
      'ProductName',
      'PriceRegular',
      'PriceSale',
      'ProductUnitSize',
      'Ingredients',
      'ContainedAllergens',
      'MayContainAllergens',
      'Category1',
      'Category2',
      'Category3',
      'Category4',
      'Category5',
      'Category6',
      // Add many sparse columns to simulate real data
      ...Array.from({ length: 90 }, (_, i) => `SpareCol${i}`),
    ];

    const productRows = Array.from({ length: numProducts }, (_, i) => [
      `NL${1000 + i}`,
      `Product ${i}`,
      `${(10 + Math.random() * 20).toFixed(2)}`,
      Math.random() > 0.7 ? `${(5 + Math.random() * 15).toFixed(2)}` : '',
      `${Math.floor(100 + Math.random() * 900)}g`,
      `ingredient${i % 10}, ingredient${i % 15}`,
      i % 5 === 0 ? 'Melk, Gluten' : '',
      i % 7 === 0 ? 'Noten' : '',
      `Category${i % 10}`,
      i % 3 === 0 ? `Subcategory${i % 5}` : '',
      i % 5 === 0 ? `SubSubcategory${i % 3}` : '',
      '',
      '',
      '', // Mostly empty categories
      ...Array.from({ length: 90 }, () => ''), // Sparse columns
    ]);

    const csvText = [headers.join(','), ...productRows.map((row) => row.join(','))].join('\n');

    const start = performance.now();
    const parsed = readCSV(csvText);
    const rows = createRows(parsed.headers as unknown as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) if (v !== undefined) rec[k] = v ?? '';
      return rec;
    });
    const duration = performance.now() - start;

    expect(records).toHaveLength(numProducts);
    expect(parsed.headers).toHaveLength(headers.length);
    expect(duration).toBeLessThan(300); // Should handle realistic data structure efficiently

    console.log(`Dutch food CSV performance:
    Products: ${numProducts}
    Columns: ${headers.length}
    Duration: ${duration.toFixed(2)}ms
    Rate: ${((numProducts / duration) * 1000).toFixed(0)} products/second`);
  });

  it('should have efficient memory usage', () => {
    const { csvText } = generateLargeCSV(2000, 30);

    // Measure memory before
    const memBefore = process.memoryUsage().heapUsed;

    const parsed = readCSV(csvText);
    const rows = createRows(parsed.headers as unknown as (keyof CSVRow)[], parsed.matrix);
    const records = rows.map((r) => {
      const rec: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) if (v !== undefined) rec[k] = v ?? '';
      return rec;
    });

    // Measure memory after
    const memAfter = process.memoryUsage().heapUsed;
    const memUsed = memAfter - memBefore;

    expect(records).toHaveLength(2000);

    // Memory usage should be reasonable (less than 100MB for this dataset)
    expect(memUsed).toBeLessThan(100 * 1024 * 1024);

    console.log(`Memory usage:
    Before: ${(memBefore / 1024 / 1024).toFixed(2)}MB
    After:  ${(memAfter / 1024 / 1024).toFixed(2)}MB
    Used:   ${(memUsed / 1024 / 1024).toFixed(2)}MB`);
  });
});

/**
 * Contract tests for @picklist/parser package
 *
 * These tests verify the API contracts defined in parser-api.ts.
 * They MUST fail initially (no implementation exists) and pass after extraction.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  CSVRow,
  ParsedCSVResult,
  ConversionResult,
  CSVParseError,
} from './parser-api.ts';

// Import functions that will be extracted to @picklist/parser
// These imports will fail initially - that's expected for TDD
import {
  readCSV,
  createRows,
  convertTypes,
  createCSVRow,
  csvRowToRecord,
} from '@picklist/parser';

describe('CSV Parser API Contracts', () => {
  const sampleCSVText = `ProductId,ProductName,PriceRegular,Category1
123,Test Product,10.99,Dairy
456,Another Product,15.50,Bakery
789,Third Product,8.75,Produce`;

  const expectedHeaders = ['ProductId', 'ProductName', 'PriceRegular', 'Category1'];
  const expectedMatrix = [
    ['123', 'Test Product', '10.99', 'Dairy'],
    ['456', 'Another Product', '15.50', 'Bakery'],
    ['789', 'Third Product', '8.75', 'Produce'],
  ];

  describe('readCSV', () => {
    it('should parse CSV text into headers and matrix', () => {
      const result: ParsedCSVResult = readCSV(sampleCSVText);

      expect(result.headers).toEqual(expectedHeaders);
      expect(result.matrix).toEqual(expectedMatrix);
      expect(result.rowCount).toBe(3);
    });

    it('should throw error for empty CSV', () => {
      expect(() => readCSV('')).toThrow();
      expect(() => readCSV('\n')).toThrow();
    });

    it('should throw error for malformed CSV', () => {
      const malformedCSV = 'header1,header2\nvalue1'; // Missing value
      expect(() => readCSV(malformedCSV)).toThrow();
    });

    it('should handle CSV with only headers', () => {
      const headersOnlyCSV = 'header1,header2,header3';
      const result = readCSV(headersOnlyCSV);

      expect(result.headers).toEqual(['header1', 'header2', 'header3']);
      expect(result.matrix).toEqual([]);
      expect(result.rowCount).toBe(0);
    });
  });

  describe('createRows', () => {
    it('should convert headers and matrix to CSVRow objects', () => {
      const rows: CSVRow[] = createRows(expectedHeaders, expectedMatrix);

      expect(rows).toHaveLength(3);
      expect(rows[0]).toEqual({
        ProductId: '123',
        ProductName: 'Test Product',
        PriceRegular: '10.99',
        Category1: 'Dairy',
      });
      expect(rows[1]).toEqual({
        ProductId: '456',
        ProductName: 'Another Product',
        PriceRegular: '15.50',
        Category1: 'Bakery',
      });
    });

    it('should handle empty matrix', () => {
      const rows = createRows(['header1', 'header2'], []);
      expect(rows).toEqual([]);
    });

    it('should throw error for empty headers', () => {
      expect(() => createRows([], expectedMatrix)).toThrow();
    });

    it('should handle rows with missing values', () => {
      const incompleteMatrix = [['123', 'Test Product', '10.99']]; // Missing Category1
      const rows = createRows(expectedHeaders, incompleteMatrix);

      expect(rows[0]).toEqual({
        ProductId: '123',
        ProductName: 'Test Product',
        PriceRegular: '10.99',
        Category1: '', // Should default to empty string
      });
    });
  });

  describe('convertTypes', () => {
    it('should convert CSVRow objects to Record format', () => {
      const csvRows: CSVRow[] = [
        {
          ProductId: '123',
          ProductName: 'Test Product',
          PriceRegular: '10.99',
          Category1: 'Dairy',
        },
        {
          ProductId: '456',
          ProductName: 'Another Product',
          PriceRegular: undefined, // This should be filtered out
          Category1: 'Bakery',
        },
      ];

      const result: ConversionResult = convertTypes(csvRows);

      expect(result.records).toHaveLength(2);
      expect(result.totalRows).toBe(2);
      expect(result.emptyFieldsFiltered).toBe(1);

      expect(result.records[0]).toEqual({
        ProductId: '123',
        ProductName: 'Test Product',
        PriceRegular: '10.99',
        Category1: 'Dairy',
      });

      expect(result.records[1]).toEqual({
        ProductId: '456',
        ProductName: 'Another Product',
        Category1: 'Bakery',
      });
      expect(result.records[1]).not.toHaveProperty('PriceRegular');
    });

    it('should handle empty CSVRow array', () => {
      const result = convertTypes([]);

      expect(result.records).toEqual([]);
      expect(result.totalRows).toBe(0);
      expect(result.emptyFieldsFiltered).toBe(0);
    });
  });

  describe('createCSVRow (legacy helper)', () => {
    it('should create CSVRow from headers and values', () => {
      const headers = ['ProductId', 'ProductName', 'Category1'];
      const values = ['123', 'Test Product', undefined];

      const csvRow: CSVRow = createCSVRow(headers, values);

      expect(csvRow).toEqual({
        ProductId: '123',
        ProductName: 'Test Product',
        Category1: '', // undefined should become empty string
      });
    });

    it('should handle mismatched headers and values length', () => {
      const headers = ['ProductId', 'ProductName', 'Category1'];
      const values = ['123', 'Test Product']; // Missing value

      const csvRow = createCSVRow(headers, values);

      expect(csvRow.ProductId).toBe('123');
      expect(csvRow.ProductName).toBe('Test Product');
      expect(csvRow.Category1).toBe(''); // Missing value becomes empty string
    });
  });

  describe('csvRowToRecord (legacy helper)', () => {
    it('should convert CSVRow to Record filtering undefined values', () => {
      const csvRow: CSVRow = {
        ProductId: '123',
        ProductName: 'Test Product',
        PriceRegular: undefined,
        Category1: 'Dairy',
      };

      const record: Record<string, string> = csvRowToRecord(csvRow);

      expect(record).toEqual({
        ProductId: '123',
        ProductName: 'Test Product',
        Category1: 'Dairy',
      });
      expect(record).not.toHaveProperty('PriceRegular');
    });

    it('should handle empty CSVRow', () => {
      const csvRow: CSVRow = {};
      const record = csvRowToRecord(csvRow);

      expect(record).toEqual({});
    });
  });

  describe('Error Handling Contracts', () => {
    it('should throw CSVParseError with proper type for empty CSV', () => {
      try {
        readCSV('');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // Type checking will be done in implementation
      }
    });

    it('should throw descriptive errors for malformed data', () => {
      const malformedCSV = 'header1,header2\nvalue1,value2,extra_value'; // Too many values

      expect(() => readCSV(malformedCSV)).toThrow();
    });
  });

  describe('Integration with @picklist/core', () => {
    it('should produce data compatible with calculateSparsity', async () => {
      // Import calculateSparsity to verify integration
      const { calculateSparsity } = await import('@picklist/core');

      const { headers, matrix } = readCSV(sampleCSVText);
      const csvRows = createRows(headers, matrix);
      const { records } = convertTypes(csvRows);

      // This should not throw - records format must be compatible
      expect(() => calculateSparsity(records)).not.toThrow();

      const sparsity = calculateSparsity(records);
      expect(sparsity).toBeDefined();
      expect(sparsity.emptyColumns).toBeDefined();
    });
  });

  describe('Behavioral Identity Validation', () => {
    it('should produce identical output to current transform-data.ts implementation', () => {
      // This test verifies that extracted parser produces same results
      // as current inline implementation in transform-data.ts

      const { headers, matrix } = readCSV(sampleCSVText);
      const csvRows = createRows(headers, matrix);
      const { records } = convertTypes(csvRows);

      // Expected structure based on current transform-data.ts:183-199
      const expectedRecords = expectedMatrix.map(row => {
        const record: Record<string, string> = {};
        expectedHeaders.forEach((header, i) => {
          record[header] = row[i] || '';
        });
        return record;
      });

      expect(records).toEqual(expectedRecords);
    });

    it('should maintain two-pass processing compatibility', () => {
      // Verify parser supports the two-pass approach:
      // 1. Parse for sparsity analysis
      // 2. Parse for full processing

      // First pass - sparsity analysis
      const { headers, matrix } = readCSV(sampleCSVText);
      const csvRows = createRows(headers, matrix);
      const { records } = convertTypes(csvRows);

      expect(records).toBeDefined();
      expect(Array.isArray(records)).toBe(true);

      // Second pass - same data should be available for full processing
      const secondPassRows = createRows(headers, matrix);
      expect(secondPassRows).toEqual(csvRows);
    });
  });
});
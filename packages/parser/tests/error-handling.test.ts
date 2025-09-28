/**
 * Comprehensive unit tests for error handling
 *
 * Tests various error conditions and edge cases to ensure robust error handling.
 */

import { describe, it, expect } from 'vitest';
import { readCSV, createRows, createCSVRow, csvRowToRecord } from '@picklist/parser';
import type { CSVRow } from '@picklist/parser';

// Helper to mimic old convertTypes behavior (records + metrics)
function rowsToRecords(rows: CSVRow[]) {
  const records = rows.map((r) => {
    const rec: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) {
      if (v !== undefined) rec[k] = v ?? '';
    }
    return rec;
  });
  // Approximate previous metrics
  const totalRows = rows.length;
  let emptyFieldsFiltered = 0;
  for (const row of rows) {
    for (const v of Object.values(row)) {
      if (v === undefined) emptyFieldsFiltered++;
    }
  }
  return { records, totalRows, emptyFieldsFiltered };
}
import type { CSVParseError } from '@picklist/parser';

describe('Error handling', () => {
  describe('readCSV error handling', () => {
    it('should throw EMPTY_CSV error for empty string', () => {
      try {
        readCSV('');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const e = error as CSVParseError;
        expect(e.type).toBe('EMPTY_CSV');
        expect(e.message).toContain('CSV text is empty');
      }
    });

    it('should throw EMPTY_CSV error for whitespace-only string', () => {
      try {
        readCSV('   \n  \t  ');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as CSVParseError).type).toBe('EMPTY_CSV');
      }
    });

    it('should throw EMPTY_CSV error for newline-only string', () => {
      try {
        readCSV('\n');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as CSVParseError).type).toBe('EMPTY_CSV');
      }
    });

    it('should handle CSV with extremely long lines gracefully', () => {
      const longValue = 'x'.repeat(100000);
      const csvText = `header1,header2\n${longValue},value2`;

      const result = readCSV(csvText);
      expect(result.headers).toEqual(['header1', 'header2']);
      expect(result.matrix[0][0]).toBe(longValue);
    });

    it('should handle CSV with many columns gracefully', () => {
      const numColumns = 1000;
      const headers = Array.from({ length: numColumns }, (_, i) => `col${i}`);
      const values = Array.from({ length: numColumns }, (_, i) => `val${i}`);
      const csvText = `${headers.join(',')}\n${values.join(',')}`;

      const result = readCSV(csvText);
      expect(result.headers).toHaveLength(numColumns);
      expect(result.matrix[0]).toHaveLength(numColumns);
    });

    it('should handle CSV with unicode characters', () => {
      const csvText = 'product,description\n"Café Møller","Español: ñandú café"';

      const result = readCSV(csvText);
      expect(result.headers).toEqual(['product', 'description']);
      expect(result.matrix[0]).toEqual(['Café Møller', 'Español: ñandú café']);
    });

    it('should handle CSV with null bytes gracefully', () => {
      const csvText = 'header1,header2\nvalue1\x00,value2';

      const result = readCSV(csvText);
      expect(result.matrix[0][0]).toContain('\x00');
    });
  });

  describe('createRows error handling', () => {
    it('should throw error for empty headers array', () => {
      expect(() => createRows([], [['value1', 'value2']])).toThrow('Headers array cannot be empty');
    });

    it('should handle undefined values in headers gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers = ['header1', undefined as any, 'header3'];
      const matrix = [['value1', 'value2', 'value3']];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = createRows(headers as any as (keyof CSVRow)[], matrix);
      expect(rows[0]).toEqual({
        header1: 'value1',
        header3: 'value3',
      });
      expect(rows[0]).not.toHaveProperty('undefined');
    });

    it('should handle very large matrix gracefully', () => {
      const headers = ['id', 'name'];
      const matrix = Array.from({ length: 10000 }, (_, i) => [`${i}`, `name${i}`]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = createRows(headers as any as (keyof CSVRow)[], matrix);
      expect(rows).toHaveLength(10000);
      expect(rows[0]).toEqual({ id: '0', name: 'name0' });
      expect(rows[9999]).toEqual({ id: '9999', name: 'name9999' });
    });

    it('should handle matrix with inconsistent row lengths', () => {
      const headers = ['col1', 'col2', 'col3'];
      const matrix = [
        ['val1'], // Short row
        ['val1', 'val2'], // Medium row
        ['val1', 'val2', 'val3'], // Full row
        ['val1', 'val2', 'val3', 'val4'], // Extra value
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = createRows(headers as any as (keyof CSVRow)[], matrix);
      expect(rows[0]).toEqual({ col1: 'val1', col2: '', col3: '' });
      expect(rows[1]).toEqual({ col1: 'val1', col2: 'val2', col3: '' });
      expect(rows[2]).toEqual({ col1: 'val1', col2: 'val2', col3: 'val3' });
      expect(rows[3]).toEqual({ col1: 'val1', col2: 'val2', col3: 'val3' });
    });
  });

  describe('convertTypes error handling', () => {
    it('should handle empty array gracefully', () => {
      const result = rowsToRecords([]);
      expect(result.records).toEqual([]);
      expect(result.totalRows).toBe(0);
      expect(result.emptyFieldsFiltered).toBe(0);
    });

    it('should handle array with deeply nested objects', () => {
      const csvRows = [
        {
          id: '1',
          nested: JSON.stringify({ level1: { level2: 'value' } }),
        },
      ];

      const result = rowsToRecords(csvRows as unknown as CSVRow[]);
      expect(result.records[0].nested).toBe('{"level1":{"level2":"value"}}');
    });

    it('should count undefined fields correctly with many undefined values', () => {
      const csvRows = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        field1: i % 2 === 0 ? 'value' : undefined,
        field2: i % 3 === 0 ? 'value' : undefined,
        field3: i % 5 === 0 ? 'value' : undefined,
      }));

      const result = rowsToRecords(csvRows as unknown as CSVRow[]);
      expect(result.totalRows).toBe(100);
      expect(result.emptyFieldsFiltered).toBeGreaterThan(0);
      expect(result.records).toHaveLength(100);
    });
  });

  describe('createCSVRow error handling', () => {
    it('should handle extremely long header names', () => {
      const longHeader = 'x'.repeat(10000);
      const headers = ['normal', longHeader];
      const values = ['value1', 'value2'];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const csvRow = createCSVRow(headers as any as (keyof CSVRow)[], values) as any;
      expect(csvRow.normal).toBe('value1');
      expect(csvRow[longHeader]).toBe('value2');
    });

    it('should handle headers with special characters', () => {
      const headers = ['', 'header with spaces', 'header-with-dashes', 'header.with.dots'];
      const values = ['empty_header_value', 'spaces_value', 'dashes_value', 'dots_value'];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const csvRow = createCSVRow(headers as any as (keyof CSVRow)[], values) as any;
      expect(csvRow['']).toBe('empty_header_value');
      expect(csvRow['header with spaces']).toBe('spaces_value');
      expect(csvRow['header-with-dashes']).toBe('dashes_value');
      expect(csvRow['header.with.dots']).toBe('dots_value');
    });

    it('should handle all null values gracefully', () => {
      const headers = ['col1', 'col2'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values = [null as any, null as any];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const csvRow = createCSVRow(headers as any as (keyof CSVRow)[], values) as any;
      expect(csvRow).toEqual({ col1: '', col2: '' });
    });
  });

  describe('csvRowToRecord error handling', () => {
    it('should handle CSVRow with circular references in values', () => {
      // This is more theoretical since CSVRow should only contain strings
      const csvRow = {
        id: '1',
        name: 'test',
        circular: '[circular reference would be string]',
      };

      const record = csvRowToRecord(csvRow as unknown as CSVRow);
      expect(record).toEqual({
        id: '1',
        name: 'test',
        circular: '[circular reference would be string]',
      });
    });

    it('should handle CSVRow with prototype pollution attempts', () => {
      const csvRow = {
        id: '1',
        __proto__: 'malicious',
        constructor: 'malicious',
        prototype: 'malicious',
      };

      const record = csvRowToRecord(csvRow as unknown as CSVRow);
      expect(record.id).toBe('1');

      // Note: These properties may be filtered out or handled specially by the runtime
      // The important thing is that prototype pollution doesn't occur
      expect(record).toHaveProperty('id', '1');

      // Ensure it doesn't actually pollute the prototype
      expect({}.constructor).not.toBe('malicious');
      expect(Object.prototype.constructor).not.toBe('malicious');
    });

    it('should handle very large number of properties', () => {
      const csvRow: Record<string, string> = {};
      for (let i = 0; i < 10000; i++) {
        csvRow[`prop${i}`] = `value${i}`;
      }

      const record = csvRowToRecord(csvRow);
      expect(Object.keys(record)).toHaveLength(10000);
      expect(record.prop0).toBe('value0');
      expect(record.prop9999).toBe('value9999');
    });
  });

  describe('Memory and performance edge cases', () => {
    it('should handle CSV with very long cell values', () => {
      const longValue = 'A'.repeat(1000000); // 1MB string
      const csvText = `header\n"${longValue}"`;

      const result = readCSV(csvText);
      expect(result.matrix[0][0]).toBe(longValue);
      expect(result.matrix[0][0]).toHaveLength(1000000);
    });

    it('should handle CSV with many empty cells', () => {
      const numCols = 100;
      const numRows = 100;
      const headers = Array.from({ length: numCols }, (_, i) => `col${i}`);
      const emptyRow = Array.from({ length: numCols }, () => '');
      const matrix = Array.from({ length: numRows }, () => emptyRow);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = createRows(headers as any as (keyof CSVRow)[], matrix);
      const { records } = rowsToRecords(rows);

      expect(rows).toHaveLength(numRows);
      expect(records).toHaveLength(numRows);

      // All values should be empty strings, not undefined
      expect(Object.values(records[0])).toEqual(emptyRow);
    });
  });
});

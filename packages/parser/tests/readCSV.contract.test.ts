/**
 * Contract test for readCSV function
 *
 * This test MUST fail initially (no implementation exists) and pass after extraction.
 * Tests CSV text parsing to headers/matrix conversion.
 */

import { describe, it, expect } from 'vitest';
import { readCSV } from '@picklist/parser';
import type { ParsedCSVResult } from '@picklist/parser';

describe('readCSV function contract', () => {
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

  it('should parse CSV text into headers and matrix', () => {
    const result: ParsedCSVResult = readCSV(sampleCSVText);

    expect(result.headers).toEqual(expectedHeaders);
    expect(result.matrix).toEqual(expectedMatrix);
    expect(result.rowCount).toBe(3);
  });

  it('should throw error for empty CSV', () => {
    expect(() => readCSV('')).toThrow();
    expect(() => readCSV('\n')).toThrow();
    expect(() => readCSV('   ')).toThrow();
  });

  it('should handle CSV with only headers', () => {
    const headersOnlyCSV = 'header1,header2,header3';
    const result = readCSV(headersOnlyCSV);

    expect(result.headers).toEqual(['header1', 'header2', 'header3']);
    expect(result.matrix).toEqual([]);
    expect(result.rowCount).toBe(0);
  });

  it('should handle CSV with quoted fields', () => {
    const quotedCSV = `name,description
"Product A","Description with, comma"
"Product B","Another ""quoted"" description"`;

    const result = readCSV(quotedCSV);

    expect(result.headers).toEqual(['name', 'description']);
    expect(result.matrix).toEqual([
      ['Product A', 'Description with, comma'],
      ['Product B', 'Another "quoted" description'],
    ]);
    expect(result.rowCount).toBe(2);
  });

  it('should handle CSV with different line endings', () => {
    const windowsCSV = 'a,b\r\n1,2\r\n3,4';
    const result = readCSV(windowsCSV);

    expect(result.headers).toEqual(['a', 'b']);
    expect(result.matrix).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
    expect(result.rowCount).toBe(2);
  });

  it('should preserve empty cells as empty strings', () => {
    const csvWithEmpty = 'a,b,c\n1,,3\n,2,';
    const result = readCSV(csvWithEmpty);

    expect(result.matrix).toEqual([
      ['1', '', '3'],
      ['', '2', ''],
    ]);
  });

  it('should handle CSV with missing values gracefully', () => {
    const csvWithMissingValues = 'header1,header2\nvalue1'; // Missing second value
    const result = readCSV(csvWithMissingValues);

    expect(result.headers).toEqual(['header1', 'header2']);
    expect(result.matrix).toEqual([['value1']]); // @std/csv handles missing values gracefully
    expect(result.rowCount).toBe(1);
  });
});

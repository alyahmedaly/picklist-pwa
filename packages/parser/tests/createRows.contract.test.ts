/**
 * Contract test for createRows function
 *
 * This test MUST fail initially (no implementation exists) and pass after extraction.
 * Tests headers/matrix to CSVRow conversion.
 */

import { describe, it, expect } from 'vitest';
import { createRows } from '@picklist/parser';
import type { CSVRow } from '@picklist/parser';

describe('createRows function contract', () => {
  const sampleHeaders = ['ProductId', 'ProductName', 'PriceRegular', 'Category1'];
  const sampleMatrix = [
    ['123', 'Test Product', '10.99', 'Dairy'],
    ['456', 'Another Product', '15.50', 'Bakery'],
    ['789', 'Third Product', '8.75', 'Produce'],
  ];

  it('should convert headers and matrix to CSVRow objects', () => {
    const rows: CSVRow[] = createRows(sampleHeaders, sampleMatrix);

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
    expect(rows[2]).toEqual({
      ProductId: '789',
      ProductName: 'Third Product',
      PriceRegular: '8.75',
      Category1: 'Produce',
    });
  });

  it('should handle empty matrix', () => {
    const rows = createRows(['header1', 'header2'], []);
    expect(rows).toEqual([]);
  });

  it('should throw error for empty headers', () => {
    expect(() => createRows([], sampleMatrix)).toThrow();
  });

  it('should handle rows with missing values', () => {
    const incompleteMatrix = [
      ['123', 'Test Product', '10.99'], // Missing Category1
      ['456', 'Another Product'], // Missing PriceRegular and Category1
    ];
    const rows = createRows(sampleHeaders, incompleteMatrix);

    expect(rows[0]).toEqual({
      ProductId: '123',
      ProductName: 'Test Product',
      PriceRegular: '10.99',
      Category1: '', // Should default to empty string
    });
    expect(rows[1]).toEqual({
      ProductId: '456',
      ProductName: 'Another Product',
      PriceRegular: '', // Should default to empty string
      Category1: '', // Should default to empty string
    });
  });

  it('should handle Dutch food product column variations', () => {
    const dutchHeaders = [
      'id',
      'product_name',
      'price_regular',
      'ingredients',
      'ContainedAllergens',
    ];
    const dutchMatrix = [['NL123', 'Gouda Kaas', '12.50', 'melk, zout', 'Melk']];

    const rows = createRows(dutchHeaders, dutchMatrix);

    expect(rows[0]).toEqual({
      id: 'NL123',
      product_name: 'Gouda Kaas',
      price_regular: '12.50',
      ingredients: 'melk, zout',
      ContainedAllergens: 'Melk',
    });
  });

  it('should handle extra columns beyond CSVRow interface', () => {
    const headersWithExtra = ['ProductId', 'ProductName', 'ExtraColumn', 'AnotherExtra'];
    const matrixWithExtra = [['123', 'Test Product', 'extra1', 'extra2']];

    const rows = createRows(headersWithExtra, matrixWithExtra);

    expect(rows[0]).toEqual({
      ProductId: '123',
      ProductName: 'Test Product',
      ExtraColumn: 'extra1',
      AnotherExtra: 'extra2',
    });
  });

  it('should preserve empty strings and not convert to undefined', () => {
    const headers = ['ProductId', 'ProductName', 'PriceRegular'];
    const matrix = [
      ['123', '', '10.99'],
      ['', 'Product B', ''],
    ];

    const rows = createRows(headers, matrix);

    expect(rows[0]).toEqual({
      ProductId: '123',
      ProductName: '',
      PriceRegular: '10.99',
    });
    expect(rows[1]).toEqual({
      ProductId: '',
      ProductName: 'Product B',
      PriceRegular: '',
    });
  });
});

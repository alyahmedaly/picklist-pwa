/**
 * Contract test for createCSVRow legacy helper function
 *
 * This test MUST fail initially (no implementation exists) and pass after extraction.
 * Tests single row creation from headers and values.
 */

import { describe, it, expect } from 'vitest';
import { createCSVRow } from '@picklist/parser';
import type { CSVRow } from '@picklist/parser';

describe('createCSVRow function contract', () => {
  it('should create CSVRow from headers and values', () => {
    const headers = ['ProductId', 'ProductName', 'Category1'] as (keyof CSVRow)[];
    const values = ['123', 'Test Product', 'Dairy'];

    const csvRow: CSVRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      ProductId: '123',
      ProductName: 'Test Product',
      Category1: 'Dairy',
    });
  });

  it('should handle undefined values by converting to empty strings', () => {
    const headers = ['ProductId', 'ProductName', 'Category1'] as (keyof CSVRow)[];
    const values = ['123', 'Test Product', undefined];

    const csvRow: CSVRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      ProductId: '123',
      ProductName: 'Test Product',
      Category1: '', // undefined should become empty string
    });
  });

  it('should handle mismatched headers and values length (values shorter)', () => {
    const headers = ['ProductId', 'ProductName', 'Category1'] as (keyof CSVRow)[];
    const values = ['123', 'Test Product']; // Missing value

    const csvRow = createCSVRow(headers, values);

    expect(csvRow.ProductId).toBe('123');
    expect(csvRow.ProductName).toBe('Test Product');
    expect(csvRow.Category1).toBe(''); // Missing value becomes empty string
  });

  it('should handle mismatched headers and values length (values longer)', () => {
    const headers = ['ProductId', 'ProductName'] as (keyof CSVRow)[];
    const values = ['123', 'Test Product', 'Extra Value', 'Another Extra'];

    const csvRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      ProductId: '123',
      ProductName: 'Test Product',
      // Extra values should be ignored since no headers for them
    });
  });

  it('should handle empty headers array', () => {
    const headers: (keyof CSVRow)[] = [];
    const values = ['123', 'Test Product'];

    const csvRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({});
  });

  it('should handle empty values array', () => {
    const headers = ['ProductId', 'ProductName', 'Category1'] as (keyof CSVRow)[];
    const values: (string | undefined)[] = [];

    const csvRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      ProductId: '',
      ProductName: '',
      Category1: '',
    });
  });

  it('should preserve empty string values', () => {
    const headers = ['ProductId', 'ProductName', 'Category1'] as (keyof CSVRow)[];
    const values = ['123', '', 'Dairy'];

    const csvRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      ProductId: '123',
      ProductName: '',
      Category1: 'Dairy',
    });
  });

  it('should handle Dutch food product columns', () => {
    const headers = [
      'id',
      'product_name',
      'price_regular',
      'ingredients',
      'ContainedAllergens',
    ] as (keyof CSVRow)[];
    const values = ['NL123', 'Gouda Kaas', '12.50', 'melk, zout', 'Melk'];

    const csvRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      id: 'NL123',
      product_name: 'Gouda Kaas',
      price_regular: '12.50',
      ingredients: 'melk, zout',
      ContainedAllergens: 'Melk',
    });
  });

  it('should handle headers with special characters and spaces', () => {
    const headers = ['Product ID', 'Product-Name', 'Category #1'] as unknown as (keyof CSVRow)[];
    const values = ['123', 'Test Product', 'Dairy'];

    const csvRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      'Product ID': '123',
      'Product-Name': 'Test Product',
      'Category #1': 'Dairy',
    });
  });

  it('should handle all undefined values', () => {
    const headers = ['ProductId', 'ProductName', 'Category1'] as (keyof CSVRow)[];
    const values = [undefined, undefined, undefined];

    const csvRow = createCSVRow(headers, values);

    expect(csvRow).toEqual({
      ProductId: '',
      ProductName: '',
      Category1: '',
    });
  });
});

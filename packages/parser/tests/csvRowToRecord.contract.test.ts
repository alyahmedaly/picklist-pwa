/**
 * Contract test for csvRowToRecord legacy helper function
 *
 * This test MUST fail initially (no implementation exists) and pass after extraction.
 * Tests single row conversion from CSVRow to Record format.
 */

import { describe, it, expect } from 'vitest';
import { csvRowToRecord } from '@picklist/parser';
import type { CSVRow } from '@picklist/parser';

describe('csvRowToRecord function contract', () => {
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

  it('should preserve empty strings (not filter them)', () => {
    const csvRow: CSVRow = {
      ProductId: '123',
      ProductName: '',
      PriceRegular: '10.99',
      Category1: '',
    };

    const record = csvRowToRecord(csvRow);

    expect(record).toEqual({
      ProductId: '123',
      ProductName: '',
      PriceRegular: '10.99',
      Category1: '',
    });
  });

  it('should handle CSVRow with all undefined values', () => {
    const csvRow: CSVRow = {
      ProductId: undefined,
      ProductName: undefined,
      PriceRegular: undefined,
    };

    const record = csvRowToRecord(csvRow);

    expect(record).toEqual({});
  });

  it('should handle CSVRow with mixed defined and undefined values', () => {
    // Cast to any to allow lower-case keys used in mixed dataset samples
    const csvRow: CSVRow = {
      ProductId: '123',
      ProductName: undefined,
      PriceRegular: '10.99',
      Category1: undefined,
      // @ts-expect-error non-standard key for test coverage
      ingredients: 'milk, salt',
      ContainedAllergens: undefined,
    };

    const record = csvRowToRecord(csvRow);

    expect(record).toEqual({
      ProductId: '123',
      PriceRegular: '10.99',
      ingredients: 'milk, salt',
    });
    expect(Object.keys(record)).toHaveLength(3);
  });

  it('should maintain string type consistency for all values', () => {
    const csvRow: CSVRow = {
      ProductId: '123',
      ProductName: 'Test Product',
      PriceRegular: '10.99',
      Category1: 'Dairy',
    };

    const record = csvRowToRecord(csvRow);

    // All values should be strings
    Object.values(record).forEach((value) => {
      expect(typeof value).toBe('string');
    });
  });

  it('should handle Dutch food product columns', () => {
    const rawSnake: Record<string, string | undefined> = {
      id: 'NL123',
      product_name: 'Gouda Kaas',
      price_regular: '12.50',
      ingredients: 'melk, zout',
      ContainedAllergens: 'Melk',
      MayContainAllergens: undefined,
    };
    const csvRow = rawSnake as unknown as CSVRow;

    const record = csvRowToRecord(csvRow);

    expect(record).toEqual({
      id: 'NL123',
      product_name: 'Gouda Kaas',
      price_regular: '12.50',
      ingredients: 'melk, zout',
      ContainedAllergens: 'Melk',
    });
    expect(record).not.toHaveProperty('MayContainAllergens');
  });

  it('should handle extra properties beyond CSVRow interface', () => {
    const rawExtra: Record<string, string | undefined> = {
      ProductId: '123',
      ProductName: 'Test Product',
      ExtraProperty: 'extra value',
      AnotherExtra: undefined,
    };
    const csvRow = rawExtra as unknown as CSVRow;

    const record = csvRowToRecord(csvRow);

    expect(record).toEqual({
      ProductId: '123',
      ProductName: 'Test Product',
      ExtraProperty: 'extra value',
    });
    expect(record).not.toHaveProperty('AnotherExtra');
  });

  it('should handle special characters in property names', () => {
    const rawSpecialKeys: Record<string, string | undefined> = {
      'Product ID': '123',
      'Product-Name': 'Test Product',
      'Category #1': 'Dairy',
      'Empty Field': undefined,
    };
    const csvRow = rawSpecialKeys as unknown as CSVRow;

    const record = csvRowToRecord(csvRow);

    expect(record).toEqual({
      'Product ID': '123',
      'Product-Name': 'Test Product',
      'Category #1': 'Dairy',
    });
    expect(record).not.toHaveProperty('Empty Field');
  });

  it('should be compatible with legacy transform-data.ts usage', () => {
    // Test the exact usage pattern from transform-data.ts
    const csvRow: CSVRow = {
      ProductId: '123',
      ProductName: 'Test Product',
      PriceRegular: '10.99',
      Category1: 'Dairy',
      // @ts-expect-error non-standard key
      ingredients: 'milk, salt',
      ContainedAllergens: 'Milk',
      MayContainAllergens: undefined,
    };

    const record = csvRowToRecord(csvRow);

    // Should produce Record<string, string> format
    expect(typeof record).toBe('object');
    expect(record).not.toBeNull();

    // All values should be strings
    Object.entries(record).forEach(([key, value]) => {
      expect(typeof key).toBe('string');
      expect(typeof value).toBe('string');
    });

    // Should filter out undefined values
    expect(record).not.toHaveProperty('MayContainAllergens');
  });
});

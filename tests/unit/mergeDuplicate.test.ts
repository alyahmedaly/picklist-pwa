import { describe, test, expect } from 'vitest';
import { mergeDuplicate } from '../../src/data/transform/mergeDuplicate';
import type { Product } from '../../src/data/transform/types';

/** T014: Failing tests for duplicate merge logic */

describe('mergeDuplicate (T014)', () => {
  function base(id: number, overrides: Partial<Product> = {}): Product {
    return {
      id,
      name: 'Item',
      price: { regular: 10, currency: 'USD' },
      ...overrides,
    } as Product;
  }

  test('first record baseline, second fills null/undefined only', () => {
    const a = base(1, { nutrition: { protein: 5, unit: 'per 100g' } });
    const b = base(1, {
      nutrition: { protein: 5, carbs: 20, unit: 'per 100g' },
      ingredients: ['Sugar'],
    });
    const r = mergeDuplicate(a, b);
    expect(r.nutrition?.protein).toBe(5); // preserved from first
    expect(r.nutrition?.carbs).toBe(20); // filled from second
    // Ingredients normalized to lower-case
    expect(r.ingredients).toEqual(['sugar']);
  });

  test('numeric tolerance merging does not create conflict for close values', () => {
    const a = base(1, { nutrition: { protein: 5, unit: 'per 100g' } });
    const b = base(1, {
      nutrition: { protein: 5.00001, unit: 'per 100g' },
    });
    const r = mergeDuplicate(a, b, { epsilon: 0.001 });
    expect(r.duplicate_conflicts).toBeUndefined();
  });

  test('conflict registry collects differing non-null values beyond epsilon', () => {
    const a = base(1, { nutrition: { protein: 5, unit: 'per 100g' } });
    const b = base(1, { nutrition: { protein: 5.5, unit: 'per 100g' } });
    const r = mergeDuplicate(a, b, { epsilon: 0.001 });
    expect(r.duplicate_conflicts?.[0]).toMatchObject({
      field: 'nutrition.protein',
      first: 5,
      second: 5.5,
    });
  });

  test('arrays union + lower-case sort + de-dup', () => {
    const a = base(1, { ingredients: ['Sugar', 'Salt'] });
    const b = base(1, { ingredients: ['salt', 'Cocoa'] });
    const r = mergeDuplicate(a, b);
    expect(r.ingredients).toEqual(['cocoa', 'salt', 'sugar']);
  });
});

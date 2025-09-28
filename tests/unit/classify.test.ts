import { describe, test, expect } from 'vitest';
import { classify } from '../../src/data/transform/classify';

/** T016: Failing tests for classification heuristics */

describe('classify (T016)', () => {
  test('beverage product isFood true', () => {
    const r = classify({
      categories: ['Beverages', 'Soft Drinks'],
      ingredients: ['water', 'sugar'],
    });
    expect(r.flags.isFood).toBe(true);
    expect(r.flags.isPetFood).toBe(false);
  });

  test('bakery product isFood true', () => {
    const r = classify({
      categories: ['Bakery'],
      ingredients: ['wheat flour', 'salt'],
    });
    expect(r.flags.isFood).toBe(true);
  });

  test('pet food only sets isPetFood', () => {
    const r = classify({ categories: ['Pet Food', 'Dog'] });
    expect(r.flags.isPetFood).toBe(true);
    expect(r.flags.isFood).toBe(false);
  });

  test('non-food item both false', () => {
    const r = classify({ categories: ['Household'], ingredients: [] });
    expect(r.flags.isFood).toBe(false);
    expect(r.flags.isPetFood).toBe(false);
  });

  test('mismatch scenario (food + pet) produces error codes', () => {
    const r = classify({
      categories: ['Pet Food', 'Bakery'],
      ingredients: ['wheat flour'],
    });
    expect(r.flags.isPetFood).toBe(true);
    expect(r.flags.isFood).toBe(true); // ambiguous case still marks food
    expect(r.errors).toContain('classification_mismatch');
  });
});

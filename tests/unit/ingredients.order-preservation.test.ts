import { describe, test, expect } from 'vitest';
import { parseIngredients } from '../../src/data/transform/parseIngredients.ts';

describe('T006 ingredients order & dedupe', () => {
  test('preserves original ordering after removing placeholders and dedupes', () => {
    const input = 'Salt, Sugar, Salt, Water, NA, Pepper';
    const { tokens } = parseIngredients(input);
    // After filtering placeholders & dedupe first occurrence kept
    expect(tokens).toEqual(['Salt', 'Sugar', 'Water', 'Pepper']);
  });

  test('empty result omission responsibility (integration note)', () => {
    const input = 'NA, n/a, --';
    const { tokens } = parseIngredients(input);
    expect(tokens.length).toBe(0); // all placeholders removed
  });
});

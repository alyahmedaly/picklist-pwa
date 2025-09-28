import { describe, test, expect } from 'vitest';
import { parseIngredients } from '../../src/data/transform/parseIngredients.ts';

/** T011: Failing unit test for Dutch placeholder filtering */

describe('T011 Dutch placeholder filtering', () => {
  test('GEEN and NVT placeholders are filtered out', () => {
    const result = parseIngredients(
      'water, suiker, GEEN toegevoegde kleurstoffen, NVT (overige toevoegingen), zout',
    );

    // Dutch placeholders should be removed
    expect(result.tokens).not.toContain('GEEN toegevoegde kleurstoffen'); // will fail until implemented
    expect(result.tokens).not.toContain('NVT (overige toevoegingen)'); // will fail until implemented
    expect(result.tokens).not.toContain('GEEN'); // will fail until implemented
    expect(result.tokens).not.toContain('NVT'); // will fail until implemented

    // Valid ingredients should remain
    expect(result.tokens).toContain('water');
    expect(result.tokens).toContain('suiker');
    expect(result.tokens).toContain('zout');
  });

  test('case insensitive Dutch placeholder filtering', () => {
    const result = parseIngredients('water, geen smaakstoffen, nvt, melk');

    // Case insensitive filtering should work
    expect(result.tokens).not.toContain('geen smaakstoffen'); // will fail until implemented
    expect(result.tokens).not.toContain('nvt'); // will fail until implemented

    // Valid ingredients should remain
    expect(result.tokens).toContain('water');
    expect(result.tokens).toContain('melk');
  });

  test('mixed English and Dutch placeholders', () => {
    const result = parseIngredients('water, NA, GEEN, n/a, NVT, suiker');

    // All placeholders should be removed
    expect(result.tokens).not.toContain('NA');
    expect(result.tokens).not.toContain('GEEN'); // will fail until implemented
    expect(result.tokens).not.toContain('n/a');
    expect(result.tokens).not.toContain('NVT'); // will fail until implemented

    // Valid ingredients should remain
    expect(result.tokens).toContain('water');
    expect(result.tokens).toContain('suiker');
  });

  test('preserve valid Dutch ingredients that sound like placeholders', () => {
    const result = parseIngredients('water, kaas, geen lactose (melkproduct), natuurlijke aroma');

    // "geen lactose" is a valid ingredient description, not a placeholder
    expect(result.tokens).toContain('geen lactose (melkproduct)'); // this should stay
    expect(result.tokens).toContain('water');
    expect(result.tokens).toContain('kaas');
    expect(result.tokens).toContain('natuurlijke aroma');
  });
});

import { describe, test, expect } from 'vitest';
import { parseAllergens } from '../../src/data/transform/parseAllergens';

/** T012: Failing test for allergens parser */

describe('parseAllergens (T012)', () => {
  test('separates Contains vs May contain (singularizes peanut)', () => {
    const r = parseAllergens('Contains: milk, wheat. May contain: peanuts, soy.');
    expect(r.contains).toEqual(['milk', 'wheat']);
    // peanut plural singularized
    expect(r.mayContain).toEqual(['peanut', 'soy']);
  });

  test('tree nut detail extraction', () => {
    const r = parseAllergens('Contains: tree nuts (almonds, hazelnuts)');
    expect(r.contains).toEqual(['tree nuts']);
    expect(r.treeNutDetail).toEqual(['almonds', 'hazelnuts']);
  });

  test('alias mapping (wheat flour -> wheat)', () => {
    const r = parseAllergens('Contains: wheat flour, milk powder');
    // Alphabetical sorting expected
    expect(r.contains).toEqual(['milk', 'wheat']);
  });

  test('empty strings ignored & deterministic sorting', () => {
    const r = parseAllergens('Contains: milk, , wheat,  , soy');
    expect(r.contains).toEqual(['milk', 'soy', 'wheat']); // alphabetical
  });
});

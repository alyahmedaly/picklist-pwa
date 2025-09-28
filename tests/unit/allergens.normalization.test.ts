import { describe, test, expect } from 'vitest';
import { parseAllergens, ALLERGEN_WHITELIST } from '../../src/data/transform/parseAllergens.ts';

// T007: allergen normalization – assert singularization, whitelist filtering, dedupe.

describe('T007 allergen normalization', () => {
  test('singularizes plurals, dedupes, drops non-whitelisted', () => {
    const input = 'Contains: almonds, fish, almonds, peanuts, cars.';
    const parsed = parseAllergens(input);
    const out = parsed.contains;
    expect(out).toEqual(['almond', 'fish', 'peanut']);
    for (const t of out) {
      expect(ALLERGEN_WHITELIST).toContain(t);
    }
  });

  test('drops non-whitelisted tokens', () => {
    const input = 'Contains: fish, engine';
    const parsed = parseAllergens(input);
    expect(parsed.contains).toEqual(['fish']);
  });
});

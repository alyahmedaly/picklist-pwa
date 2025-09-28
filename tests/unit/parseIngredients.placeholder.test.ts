import { describe, test, expect } from 'vitest';
import {
  parseIngredients,
  INGREDIENT_PLACEHOLDERS,
} from '../../src/data/transform/parseIngredients.ts';

// T005: parseIngredients placeholder filtering – converted from scaffold to assert real implementation.
// Verifies: placeholder tokens removed case-insensitively; punctuation trimmed; non-placeholder tokens preserved.
// Also ensures chemical symbol 'Na' is retained while 'NA' placeholder removed.

describe('T005 parseIngredients placeholder filtering', () => {
  test('removes placeholder tokens (case-insensitive) and strips punctuation', () => {
    const input = 'Sugar, NA, salt , n/a , -- , Pepper!!!';
    const { tokens: out } = parseIngredients(input);
    expect(out).toEqual(['Sugar', 'salt', 'Pepper']);
    // Ensure none of the placeholder variants remain
    for (const ph of INGREDIENT_PLACEHOLDERS) {
      expect(out.map((o) => o.toLowerCase())).not.toContain(ph.toLowerCase());
    }
  });

  test('retains chemical symbol Na (sodium) vs placeholder NA', () => {
    const input = 'Water, Na, NA';
    const { tokens: out } = parseIngredients(input);
    expect(out).toContain('Na');
    // NA (uppercase) placeholder removed
    expect(out).not.toContain('NA');
  });
});

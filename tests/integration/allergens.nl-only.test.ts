import { describe, it, expect } from 'vitest';
import { readIntegrationStats } from '../test-utils';

// T004: Dutch-only allergen count (failing until counter & parsing implemented)

describe('dutch-only allergen counting', () => {
  it('increments dutchAllergenProducts when Dutch-only allergen present', () => {
    // Read from pre-computed fixture with real data containing Lupine (Dutch-only allergen)
    const stats = readIntegrationStats() as { dutchAllergenProducts: number };

    // Our fixture contains products with "Lupine" which is a Dutch-only allergen
    // Counter should be >= 1 once Dutch parsing is implemented
    expect(stats.dutchAllergenProducts).toBeGreaterThanOrEqual(1); // will fail until implemented
  });
});

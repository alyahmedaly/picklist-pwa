import { describe, test, expect } from 'vitest';
import { readIntegrationProducts } from '../test-utils';

/** T006: Failing test for Dutch added sugars extraction */

describe('T006 Dutch added sugars extraction', () => {
  test('at least one product has addedSugarsPer100 > 0 from Dutch phrase', () => {
    // Read from integration fixture which contains real Dutch products with added sugars
    const products = readIntegrationProducts() as Array<{
      addedSugarsPer100?: number;
    }>;

    // Our real data contains products with "Waarvan toegevoegde suikers X.X g per 100 gram"
    // Should extract values once Dutch parsing is implemented
    const withAdded = products.filter(
      (p) => typeof p.addedSugarsPer100 === 'number' && p.addedSugarsPer100 > 0,
    );
    expect(withAdded.length).toBeGreaterThanOrEqual(1); // will fail until implemented
  });
});

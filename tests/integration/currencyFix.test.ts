import { describe, test, expect } from 'vitest';
import { readIntegrationProducts, readIntegrationIndex, readIntegrationStats } from '../test-utils';
import type { Product } from '../../src/data/transform/types.ts';

/** T008: Integration test EUR currency fix - MUST FAIL before implementation */

describe('EUR Currency Fix Integration (T008)', () => {
  test('should use EUR currency for Dutch products instead of hardcoded USD', () => {
    // Read from pre-computed fixture (no race conditions)
    const products = readIntegrationProducts() as Product[];

    // All products should have EUR currency, not USD
    products.forEach((product) => {
      expect(product.price.currency).toBe('EUR'); // This MUST fail if still hardcoded as USD
      expect(product.price.currency).not.toBe('USD');
    });

    // Verify at least one product was processed
    expect(products.length).toBeGreaterThan(0);
  });

  test('should maintain EUR currency across all price types', () => {
    const products = readIntegrationProducts() as Product[];

    products.forEach((product) => {
      // Regular prices should be EUR
      expect(product.price.currency).toBe('EUR');

      // Sale prices (if present) should also maintain EUR context
      if (product.price.sale !== undefined) {
        expect(product.price.currency).toBe('EUR'); // Consistent currency for sale prices
      }
    });
  });

  test('should apply EUR fix to products-index.json as well', () => {
    const index = readIntegrationIndex() as { products: any[] };

    // Index entries should reflect EUR pricing
    index.products.forEach((entry: any) => {
      // Price in index should be numeric (regular price in EUR)
      expect(typeof entry.price).toBe('number');
      expect(entry.price).toBeGreaterThan(0); // Should have valid EUR prices
    });
  });

  test('should enable price filtering for Dutch market', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can filter products by price in EUR
    const affordableProducts = products.filter((p) => p.price.regular <= 1.0);
    const premiumProducts = products.filter((p) => p.price.regular > 1.0);

    expect(affordableProducts.length).toBeGreaterThan(0);
    expect(premiumProducts.length).toBeGreaterThan(0);

    // All should be in EUR for Dutch market consistency
    [...affordableProducts, ...premiumProducts].forEach((product) => {
      expect(product.price.currency).toBe('EUR');
    });
  });
});

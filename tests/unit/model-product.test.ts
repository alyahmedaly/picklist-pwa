import { describe, test, expect } from 'vitest';
import { validateProduct, type Product } from '../../src/data/transform/types.ts';

describe('Product model validation', () => {
  test('missing required fields', () => {
    const bad = {} as unknown as Product;
    const errs = validateProduct(bad);
    expect(errs).toContain('id_missing');
    expect(errs).toContain('name_missing');
    expect(errs).toContain('price_regular_missing');
  });

  test('invalid sale >= regular', () => {
    const p: Product = {
      id: 1,
      name: 'Test',
      price: { regular: 10, sale: 12, currency: 'EUR' },
    };
    const errs = validateProduct(p);
    expect(errs).toContain('price_sale_invalid');
  });

  test('minimal valid product passes', () => {
    const p: Product = {
      id: 'SKU1',
      name: 'Valid',
      price: { regular: 1.99, currency: 'EUR' },
    };
    const errs = validateProduct(p);
    expect(errs.length).toBe(0);
  });
});

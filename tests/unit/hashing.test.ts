import { describe, test, expect } from 'vitest';
import type { Product } from '../../src/data/transform/types';
// Ordering function moved/retained elsewhere (adjust path if needed)
import { canonicalOrderProducts } from '../../src/data/transform/ordering';

/** T020 (reduced): Only verify deterministic product ordering; hashing removed. */

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 2,
    name: 'Zeta Bar',
    price: { regular: 199, currency: 'USD' },
    ingredients: ['Sugar', 'Cocoa'],
    flags: { isFood: true },
    ...overrides,
  } as Product;
}

describe('ordering (T020)', () => {
  test('product list ordering by id then name', () => {
    const products: Product[] = [
      makeProduct({ id: 10, name: 'Beta' }),
      makeProduct({ id: 2, name: 'Omega' }),
      makeProduct({ id: 2, name: 'Alpha' }),
      makeProduct({ id: 1, name: 'Zed' }),
    ];
    const ordered = canonicalOrderProducts(products).map((p) => ({
      id: p.id,
      name: p.name,
    }));
    expect(ordered).toEqual([
      { id: 1, name: 'Zed' },
      { id: 2, name: 'Alpha' },
      { id: 2, name: 'Omega' },
      { id: 10, name: 'Beta' },
    ]);
  });
});

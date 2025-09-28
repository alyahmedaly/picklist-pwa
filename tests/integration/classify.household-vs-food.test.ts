import { describe, test, expect } from 'vitest';
import { readIntegrationProducts } from '../test-utils';

/** T007: Failing test for Dutch household vs food classification */

describe('T007 Dutch classification household vs food', () => {
  test('Dutch household items are non-food and bakery items are food', () => {
    // Read from integration fixture with real household and food products
    const products = readIntegrationProducts() as Array<{
      id: string;
      flags?: { isFood: boolean };
      categories: string[];
    }>;

    const find = (id: string) => products.find((p) => String(p.id) === id);
    const householdItem1 = find('562'); // Glorix bleach - household product
    const householdItem2 = find('648'); // AH bleach - household product
    const baguette = find('73'); // French baguette - bakery

    // Dutch household items should be classified as non-food
    expect(householdItem1 && householdItem1.flags && householdItem1.flags.isFood).toBe(false);
    expect(householdItem2 && householdItem2.flags && householdItem2.flags.isFood).toBe(false);

    // Bakery items should be classified as food
    expect(baguette && baguette.flags && baguette.flags.isFood).toBe(true);

    // General validation - household products vs food products
    const householdProducts = products.filter((p) =>
      p.categories.some((cat) => cat.includes('Huishouden')),
    );
    const foodProducts = products.filter((p) =>
      p.categories.some(
        (cat) => cat.includes('Bakkerij') || cat.includes('Zuivel') || cat.includes('eieren'),
      ),
    );

    expect(householdProducts.length).toBeGreaterThan(0);
    expect(foodProducts.length).toBeGreaterThan(0);

    householdProducts.forEach((product) => {
      expect(product.flags?.isFood).toBe(false);
    });
    foodProducts.forEach((product) => {
      expect(product.flags?.isFood).toBe(true);
    });
  });
});

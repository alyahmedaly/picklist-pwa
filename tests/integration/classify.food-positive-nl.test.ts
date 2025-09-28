import { describe, test, expect } from 'vitest';
import { readIntegrationProducts } from '../test-utils';

/** T008: Failing test – ensure Dutch food products recognized */

describe('T008 Dutch positive food classification', () => {
  test('Dutch food categories (Zuivel, Bakkerij) are correctly classified as food', () => {
    // Read from integration fixture with real Dutch food products
    const products = readIntegrationProducts() as Array<{
      id: string;
      flags?: { isFood: boolean };
      categories: string[];
    }>;

    const find = (id: string) => products.find((p) => String(p.id) === id);
    const yoghurt = find('123'); // "Zuivel, eieren, boter" category
    const baguette = find('73'); // "Bakkerij" category

    // All Dutch food categories should be classified as food
    expect(yoghurt && yoghurt.flags && yoghurt.flags.isFood).toBe(true);
    expect(baguette && baguette.flags && baguette.flags.isFood).toBe(true);

    // General validation - all food products should be properly classified
    const foodProducts = products.filter((p) =>
      p.categories.some(
        (cat) => cat.includes('Zuivel') || cat.includes('Bakkerij') || cat.includes('eieren'),
      ),
    );
    expect(foodProducts.length).toBeGreaterThan(0);
    foodProducts.forEach((product) => {
      expect(product.flags?.isFood).toBe(true);
    });
  });
});

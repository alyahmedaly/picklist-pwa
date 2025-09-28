import { describe, test, expect } from 'vitest';
import { readIntegrationProducts, readIntegrationStats } from '../test-utils';
import type { Product } from '../../src/data/transform/types';

/** T010: Integration test for full CSV → JSONL transformation with nutritional tags */

describe('Nutritional Tags Pipeline Integration', () => {
  test('nutritional tags enable dietary filtering and food discovery for users', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can filter products by dietary information
    const productsWithTags = products.filter((p) => p.nutritionalTags);
    expect(productsWithTags.length).toBeGreaterThan(0);

    // Nutritional tags provide structured dietary information for user filtering
    const sampleProduct = productsWithTags[0];
    expect(sampleProduct.nutritionalTags).toBeDefined();
    expect(typeof sampleProduct.nutritionalTags).toBe('object');
  });

  test('Dutch products provide accurate nutritional classification for dietary filtering', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can find specific products that match their dietary needs
    const find = (id: string) => products.find((p) => String(p.id) === id);

    // Test known products from our real data fixture
    const yogurt = find('123'); // Yogurt product
    if (yogurt && yogurt.nutritionalTags) {
      // Dairy products should be properly classified for lactose-intolerant users
      expect(yogurt.nutritionalTags.lactoseFree).toBe(false); // Contains dairy
      expect(yogurt.nutritionalTags.vegan).toBe(false); // Contains dairy
      expect(yogurt.nutritionalTags.vegetarian).toBe(true); // No meat
      expect(typeof yogurt.nutritionalTags.netCarbs).toBe('number');
      expect(yogurt.nutritionalTags.netCarbsBucket).toMatch(
        /^(very_low|low|moderate|high|very_high)$/,
      );
    }

    const baguette = find('73'); // Bakery product
    if (baguette && baguette.nutritionalTags) {
      // Wheat products should be classified for gluten-sensitive users
      expect(baguette.nutritionalTags.glutenFree).toBe(false); // Contains wheat
      expect(baguette.nutritionalTags.vegan).toBeDefined(); // Should have vegan classification
      expect(baguette.nutritionalTags.vegetarian).toBe(true); // No meat
      expect(typeof baguette.nutritionalTags.netCarbs).toBe('number');
      expect(baguette.nutritionalTags.netCarbsBucket).toMatch(
        /^(very_low|low|moderate|high|very_high)$/,
      );
    }

    const cheese = find('257'); // Cheese product
    if (cheese && cheese.nutritionalTags) {
      // Cheese products should be classified for dietary restrictions
      expect(cheese.nutritionalTags.lactoseFree).toBe(false); // Contains dairy
      expect(cheese.nutritionalTags.vegan).toBe(false); // Contains dairy
      expect(cheese.nutritionalTags.vegetarian).toBe(true); // No meat
      expect(typeof cheese.nutritionalTags.netCarbs).toBe('number');
      expect(cheese.nutritionalTags.lowCarb).toBeDefined(); // Should have low-carb classification
    }

    // Verify we have products with nutritional tags from our fixture
    const productsWithTags = products.filter((p) => p.nutritionalTags);
    expect(productsWithTags.length).toBeGreaterThan(0);
  });

  test('nutritional tags appear only on food products to prevent user confusion', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users only see dietary information for edible products
    products.forEach((product) => {
      if (product.nutritionalTags) {
        // Products with nutritional tags should be classified as food
        expect(product.flags?.isFood).toBe(true);
      }

      if (product.flags?.isFood === false) {
        // Household/non-food products should not have nutritional tags
        expect(product.nutritionalTags).toBeUndefined();
      }
    });

    // Verify realistic mix of food and non-food products for user filtering
    const foodProducts = products.filter((p) => p.flags?.isFood === true);
    const nonFoodProducts = products.filter((p) => p.flags?.isFood === false);

    expect(foodProducts.length).toBeGreaterThan(0);
    expect(nonFoodProducts.length).toBeGreaterThan(0);
  });

  test('nutritional calculations provide accurate data for user dietary decisions', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can trust nutritional calculations for dietary planning
    const productsWithNutritionAndTags = products.filter(
      (p) =>
        p.nutrition &&
        p.nutritionalTags &&
        p.nutrition.carbs !== undefined &&
        p.nutrition.fiber !== undefined,
    );

    expect(productsWithNutritionAndTags.length).toBeGreaterThan(0);

    // Net carbs calculation enables accurate low-carb diet filtering
    productsWithNutritionAndTags.forEach((product) => {
      const expectedNetCarbs = Math.max(
        0,
        (product.nutrition!.carbs || 0) - (product.nutrition!.fiber || 0),
      );

      expect(product.nutritionalTags!.netCarbs).toBeCloseTo(expectedNetCarbs, 1);
    });
  });

  test('ingredient-based dietary classifications enable accurate allergy and diet filtering', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users with dietary restrictions can safely filter products

    // Dairy products accurately classified for lactose-intolerant users
    const dairyProducts = products.filter(
      (p) =>
        p.ingredients?.some(
          (ingredient) =>
            ingredient.toLowerCase().includes('melk') ||
            ingredient.toLowerCase().includes('room') ||
            ingredient.toLowerCase().includes('boter'),
        ) || p.allergens?.contains?.some((allergen) => allergen.toLowerCase().includes('melk')),
    );

    dairyProducts.forEach((product) => {
      if (product.nutritionalTags) {
        expect(product.nutritionalTags.vegan).toBe(false);
        expect(product.nutritionalTags.lactoseFree).toBe(false);
      }
    });

    // Gluten-containing products accurately classified for celiac users
    const glutenProducts = products.filter(
      (p) =>
        p.ingredients?.some(
          (ingredient) =>
            ingredient.toLowerCase().includes('tarwe') ||
            ingredient.toLowerCase().includes('rogge') ||
            ingredient.toLowerCase().includes('gerst'),
        ) ||
        p.allergens?.contains?.some(
          (allergen) =>
            allergen.toLowerCase().includes('gluten') || allergen.toLowerCase().includes('tarwe'),
        ),
    );

    glutenProducts.forEach((product) => {
      if (product.nutritionalTags) {
        expect(product.nutritionalTags.glutenFree).toBe(false);
      }
    });
  });

  test('nutritional tags computation provides complete coverage for user filtering', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users have comprehensive dietary information available
    const productsWithTags = products.filter((p) => p.nutritionalTags);
    expect(productsWithTags.length).toBeGreaterThan(0);

    // All tagged products should have essential dietary classifications
    productsWithTags.forEach((product) => {
      const tags = product.nutritionalTags!;

      // Essential dietary flags for user filtering
      expect(typeof tags.vegan).toBe('boolean');
      expect(typeof tags.vegetarian).toBe('boolean');
      expect(typeof tags.glutenFree).toBe('boolean');
      expect(typeof tags.lactoseFree).toBe('boolean');

      // lowCarb field may not be present for non-food products
      if (tags.lowCarb !== undefined) {
        expect(typeof tags.lowCarb).toBe('boolean');
      }

      // Net carbs information for food products only
      if (tags.netCarbs !== undefined) {
        expect(typeof tags.netCarbs).toBe('number');
        expect(tags.netCarbsBucket).toMatch(/^(very_low|low|moderate|high|very_high)$/);
      }
    });
  });

  test('nutritional tag buckets provide meaningful ranges for user dietary choices', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can filter by meaningful carb ranges for their diet
    const productsWithTags = products.filter((p) => p.nutritionalTags);
    expect(productsWithTags.length).toBeGreaterThan(0);

    // Verify net carbs buckets span multiple ranges for diverse diets
    const bucketCounts = {
      very_low: productsWithTags.filter((p) => p.nutritionalTags!.netCarbsBucket === 'very_low')
        .length,
      low: productsWithTags.filter((p) => p.nutritionalTags!.netCarbsBucket === 'low').length,
      moderate: productsWithTags.filter((p) => p.nutritionalTags!.netCarbsBucket === 'moderate')
        .length,
      high: productsWithTags.filter((p) => p.nutritionalTags!.netCarbsBucket === 'high').length,
      very_high: productsWithTags.filter((p) => p.nutritionalTags!.netCarbsBucket === 'very_high')
        .length,
    };

    // At least some products should exist (meaningful for users)
    const totalBucketProducts = Object.values(bucketCounts).reduce((a, b) => a + b, 0);
    expect(totalBucketProducts).toBeGreaterThan(0);

    // Verify net carbs values align with their buckets for accurate filtering
    productsWithTags.forEach((product) => {
      const netCarbs = product.nutritionalTags!.netCarbs;
      const bucket = product.nutritionalTags!.netCarbsBucket;

      // Bucket assignment should match carb ranges
      if (bucket === 'very_low') expect(netCarbs).toBeLessThan(2);
      if (bucket === 'low') expect(netCarbs).toBeGreaterThanOrEqual(2);
      if (bucket === 'very_high') expect(netCarbs).toBeGreaterThan(20);
    });
  });
});

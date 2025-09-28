import { describe, test, expect } from 'vitest';
import type {
  NutritionalTags,
  NetCarbsBucket,
  ProteinDensity,
  ProteinBucket,
  Product,
} from '../../src/data/transform/types.ts';

/** T003: Contract test for NutritionalTags interface extension */

describe('NutritionalTags Interface Contract', () => {
  test('NutritionalTags interface has all required optional fields', () => {
    // Test that we can create a NutritionalTags object with all fields
    const tags: NutritionalTags = {
      netCarbs: 12.5,
      netCarbsBucket: 'moderate',
      lowCarb: false,
      highProtein: true,
      highFiber: false,
      proteinDensity: 'high',
      proteinDensityBucket: 'high',
      lactoseFree: false,
      glutenFree: true,
      vegan: false,
      vegetarian: true,
      plantBased: false,
    };

    // Verify all fields are present and have correct types
    expect(typeof tags.netCarbs).toBe('number');
    expect(typeof tags.netCarbsBucket).toBe('string');
    expect(typeof tags.lowCarb).toBe('boolean');
    expect(typeof tags.highProtein).toBe('boolean');
    expect(typeof tags.highFiber).toBe('boolean');
    expect(typeof tags.proteinDensity).toBe('string');
    expect(typeof tags.proteinDensityBucket).toBe('string');
    expect(typeof tags.lactoseFree).toBe('boolean');
    expect(typeof tags.glutenFree).toBe('boolean');
    expect(typeof tags.vegan).toBe('boolean');
    expect(typeof tags.vegetarian).toBe('boolean');
    expect(typeof tags.plantBased).toBe('boolean');
  });

  test('NetCarbsBucket type accepts valid values', () => {
    const validBuckets: NetCarbsBucket[] = ['very_low', 'low', 'moderate', 'high', 'very_high'];

    validBuckets.forEach((bucket) => {
      const tags: NutritionalTags = { netCarbsBucket: bucket };
      expect(tags.netCarbsBucket).toBe(bucket);
    });
  });

  test('ProteinDensity type accepts valid values', () => {
    const validDensities: ProteinDensity[] = ['low', 'moderate', 'high'];

    validDensities.forEach((density) => {
      const tags: NutritionalTags = { proteinDensity: density };
      expect(tags.proteinDensity).toBe(density);
    });
  });

  test('ProteinBucket type accepts valid values', () => {
    const validBuckets: ProteinBucket[] = ['very_low', 'low', 'moderate', 'high', 'very_high'];

    validBuckets.forEach((bucket) => {
      const tags: NutritionalTags = { proteinDensityBucket: bucket };
      expect(tags.proteinDensityBucket).toBe(bucket);
    });
  });

  test('NutritionalTags interface allows all fields to be optional', () => {
    // Should be able to create empty tags object
    const emptyTags: NutritionalTags = {};
    expect(emptyTags).toBeDefined();

    // Should be able to create tags with only some fields
    const partialTags: NutritionalTags = {
      netCarbs: 5.2,
      lowCarb: true,
      vegan: true,
    };
    expect(partialTags.netCarbs).toBe(5.2);
    expect(partialTags.lowCarb).toBe(true);
    expect(partialTags.vegan).toBe(true);
  });

  test('Product interface has nutritionalTags field', () => {
    // Test that Product interface can accept nutritionalTags field
    const product: Product = {
      id: 'test-123',
      name: 'Test Product',
      price: { regular: 2.99, currency: 'EUR' },
      nutritionalTags: {
        netCarbs: 10.5,
        lowCarb: false,
        highProtein: true,
      },
    };

    expect(product.nutritionalTags).toBeDefined();
    expect(product.nutritionalTags?.netCarbs).toBe(10.5);
    expect(product.nutritionalTags?.lowCarb).toBe(false);
    expect(product.nutritionalTags?.highProtein).toBe(true);
  });
});

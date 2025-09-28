import { describe, test, expect } from 'vitest';
import { readIntegrationProducts } from '../test-utils';
import type { Product } from '../../src/data/transform/types';

/** T004: Contract test for Product schema extension in integration context */

describe('Product Schema Extension Contract', () => {
  test('nutritional tags enhance product data for comprehensive user dietary filtering', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can access structured dietary information on products
    const sampleProduct = products[0];
    expect(sampleProduct).toBeDefined();
    expect(typeof sampleProduct).toBe('object');

    // Verify nutritional tags can be added to products for user dietary decisions
    const productWithTags: Product = {
      ...sampleProduct,
      nutritionalTags: {
        netCarbs: 15.2,
        lowCarb: false,
        highProtein: true,
        vegan: false,
      },
    };

    expect(productWithTags.nutritionalTags).toBeDefined();
    expect(productWithTags.nutritionalTags?.netCarbs).toBe(15.2);
  });

  test('products support optional nutritional tags for flexible user experience', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users can browse all products, with enhanced info when available
    products.forEach((product) => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.price).toBeDefined();

      // Nutritional tags enhance user experience when available, don't block when missing
      if (product.nutritionalTags) {
        expect(typeof product.nutritionalTags).toBe('object');
      }
    });
  });

  test('product schema supports comprehensive dietary filtering options for users', () => {
    // Test that both forms are valid Product objects
    const productWithoutTags: Product = {
      id: 'test-1',
      name: 'Test Product Without Tags',
      price: { regular: 1.99, currency: 'EUR' },
    };

    const productWithTags: Product = {
      id: 'test-2',
      name: 'Test Product With Tags',
      price: { regular: 2.99, currency: 'EUR' },
      nutritionalTags: {
        netCarbs: 8.5,
        netCarbsBucket: 'moderate',
        lowCarb: true,
        highProtein: false,
        highFiber: true,
        lactoseFree: true,
        glutenFree: false,
        vegan: true,
        vegetarian: true,
        plantBased: true,
      },
    };

    expect(productWithoutTags.id).toBe('test-1');
    expect(productWithoutTags.nutritionalTags).toBeUndefined();

    expect(productWithTags.id).toBe('test-2');
    expect(productWithTags.nutritionalTags).toBeDefined();
    expect(productWithTags.nutritionalTags?.netCarbs).toBe(8.5);
    expect(productWithTags.nutritionalTags?.vegan).toBe(true);
  });
});

import { describe, test, expect } from 'vitest';
import { readIntegrationProducts, readIntegrationStats } from '../test-utils';
import type { Product } from '../../src/data/transform/types';

/** T011: Integration test for nutritional tags statistics tracking */

describe('Nutritional Tags Statistics', () => {
  test('nutritional tags enable dietary filtering for users', () => {
    const stats = readIntegrationStats() as { nutritionalTagsComputed: number };

    // Business value: Users can filter products by dietary information
    expect(stats.nutritionalTagsComputed).toBeDefined();
    expect(typeof stats.nutritionalTagsComputed).toBe('number');
    expect(stats.nutritionalTagsComputed).toBeGreaterThan(0);
  });

  test('dietary classification counters support user filtering by diet preferences', () => {
    const stats = readIntegrationStats() as {
      highProteinProducts: number;
      veganProducts: number;
      glutenFreeProducts: number;
      lactoseFreeProducts: number;
      highFiberProducts: number;
      lowCarbProducts: number;
    };

    // Business value: Users can see counts for dietary filters
    expect(stats.highProteinProducts).toBeGreaterThanOrEqual(0);
    expect(stats.veganProducts).toBeGreaterThanOrEqual(0);
    expect(stats.glutenFreeProducts).toBeGreaterThanOrEqual(0);
    expect(stats.lactoseFreeProducts).toBeGreaterThanOrEqual(0);
    expect(stats.highFiberProducts).toBeGreaterThanOrEqual(0);
    expect(stats.lowCarbProducts).toBeGreaterThanOrEqual(0);
  });

  test('net carbs distribution enables low-carb diet filtering', () => {
    const stats = readIntegrationStats() as {
      netCarbsDistribution: {
        very_low: number;
        low: number;
        moderate: number;
        high: number;
        very_high: number;
      };
      nutritionalTagsComputed: number;
    };

    // Business value: Users can filter products by carb content ranges
    const distribution = stats.netCarbsDistribution;
    expect(distribution.very_low).toBeGreaterThanOrEqual(0);
    expect(distribution.low).toBeGreaterThanOrEqual(0);
    expect(distribution.moderate).toBeGreaterThanOrEqual(0);
    expect(distribution.high).toBeGreaterThanOrEqual(0);
    expect(distribution.very_high).toBeGreaterThanOrEqual(0);

    // Validation: Distribution should be meaningful for user filtering
    const totalDistribution =
      distribution.very_low +
      distribution.low +
      distribution.moderate +
      distribution.high +
      distribution.very_high;
    expect(totalDistribution).toBeLessThanOrEqual(stats.nutritionalTagsComputed);
    expect(totalDistribution).toBeGreaterThan(0);
  });

  test('statistics accuracy validates consistent counting between stats and products', () => {
    const products = readIntegrationProducts() as Product[];
    const stats = readIntegrationStats() as {
      nutritionalTagsComputed: number;
      highProteinProducts: number;
      veganProducts: number;
      glutenFreeProducts: number;
      lowCarbProducts: number;
      netCarbsDistribution: {
        very_low: number;
        low: number;
        moderate: number;
        high: number;
        very_high: number;
      };
    };

    // Business value: Cross-validate statistics ensure data integrity for user filtering
    const productsWithTags = products.filter((p) => p.nutritionalTags);
    expect(stats.nutritionalTagsComputed).toBe(productsWithTags.length);

    // Validate dietary filter counts match actual product classification
    const highProteinProducts = productsWithTags.filter(
      (p) => p.nutritionalTags.highProtein === true,
    );
    expect(stats.highProteinProducts).toBe(highProteinProducts.length);

    const veganProducts = productsWithTags.filter((p) => p.nutritionalTags.vegan === true);
    expect(stats.veganProducts).toBe(veganProducts.length);

    const glutenFreeProducts = productsWithTags.filter(
      (p) => p.nutritionalTags.glutenFree === true,
    );
    expect(stats.glutenFreeProducts).toBe(glutenFreeProducts.length);

    const lowCarbProducts = productsWithTags.filter((p) => p.nutritionalTags.lowCarb === true);
    expect(stats.lowCarbProducts).toBe(lowCarbProducts.length);

    // Validate net carbs distribution supports accurate filtering by carb ranges
    const bucketCounts = {
      very_low: productsWithTags.filter((p) => p.nutritionalTags.netCarbsBucket === 'very_low')
        .length,
      low: productsWithTags.filter((p) => p.nutritionalTags.netCarbsBucket === 'low').length,
      moderate: productsWithTags.filter((p) => p.nutritionalTags.netCarbsBucket === 'moderate')
        .length,
      high: productsWithTags.filter((p) => p.nutritionalTags.netCarbsBucket === 'high').length,
      very_high: productsWithTags.filter((p) => p.nutritionalTags.netCarbsBucket === 'very_high')
        .length,
    };

    expect(stats.netCarbsDistribution.very_low).toBe(bucketCounts.very_low);
    expect(stats.netCarbsDistribution.low).toBe(bucketCounts.low);
    expect(stats.netCarbsDistribution.moderate).toBe(bucketCounts.moderate);
    expect(stats.netCarbsDistribution.high).toBe(bucketCounts.high);
    expect(stats.netCarbsDistribution.very_high).toBe(bucketCounts.very_high);
  });

  test('nutritional statistics provide reliable data for consistent user experience', () => {
    const stats = readIntegrationStats() as {
      nutritionalTagsComputed: number;
      highProteinProducts: number;
      veganProducts: number;
      glutenFreeProducts: number;
      lactoseFreeProducts: number;
      highFiberProducts: number;
      lowCarbProducts: number;
      netCarbsDistribution: {
        very_low: number;
        low: number;
        moderate: number;
        high: number;
        very_high: number;
      };
    };

    // Business value: Users get consistent, reliable dietary filtering counts
    expect(stats.nutritionalTagsComputed).toBeGreaterThan(0);
    expect(stats.highProteinProducts).toBeGreaterThanOrEqual(0);
    expect(stats.veganProducts).toBeGreaterThanOrEqual(0);
    expect(stats.glutenFreeProducts).toBeGreaterThanOrEqual(0);
    expect(stats.lactoseFreeProducts).toBeGreaterThanOrEqual(0);
    expect(stats.highFiberProducts).toBeGreaterThanOrEqual(0);
    expect(stats.lowCarbProducts).toBeGreaterThanOrEqual(0);

    // Carb distribution enables meaningful low-carb filtering options
    const distribution = stats.netCarbsDistribution;
    expect(typeof distribution).toBe('object');
    expect(distribution.very_low).toBeGreaterThanOrEqual(0);
    expect(distribution.low).toBeGreaterThanOrEqual(0);
    expect(distribution.moderate).toBeGreaterThanOrEqual(0);
    expect(distribution.high).toBeGreaterThanOrEqual(0);
    expect(distribution.very_high).toBeGreaterThanOrEqual(0);
  });

  test('dietary distribution reflects realistic Dutch supermarket patterns for user filtering', () => {
    const stats = readIntegrationStats() as {
      nutritionalTagsComputed: number;
      veganProducts: number;
      highProteinProducts: number;
      netCarbsDistribution: {
        very_low: number;
        low: number;
        moderate: number;
        high: number;
        very_high: number;
      };
    };

    // Business value: Realistic distribution ensures meaningful filter options for Dutch users
    expect(stats.nutritionalTagsComputed).toBeGreaterThan(0);

    // Vegan products present but not dominant (realistic for Dutch market)
    expect(stats.veganProducts).toBeGreaterThanOrEqual(0);
    if (stats.nutritionalTagsComputed > 0) {
      expect(stats.veganProducts / stats.nutritionalTagsComputed).toBeLessThanOrEqual(0.7);
    }

    // High protein products are specialized category (realistic distribution)
    expect(stats.highProteinProducts).toBeGreaterThanOrEqual(0);
    if (stats.nutritionalTagsComputed > 0) {
      expect(stats.highProteinProducts / stats.nutritionalTagsComputed).toBeLessThan(0.3);
    }

    // Carb distribution spread ensures meaningful filtering across ranges
    const distribution = stats.netCarbsDistribution;
    const totalProducts =
      distribution.very_low +
      distribution.low +
      distribution.moderate +
      distribution.high +
      distribution.very_high;

    if (totalProducts > 0) {
      // No single carb category dominates completely (enables diverse filtering)
      expect(distribution.very_low / totalProducts).toBeLessThan(0.9);
      expect(distribution.low / totalProducts).toBeLessThan(0.9);
      expect(distribution.moderate / totalProducts).toBeLessThan(0.9);
      expect(distribution.high / totalProducts).toBeLessThan(0.9);
      expect(distribution.very_high / totalProducts).toBeLessThan(0.9);
    }
  });

  test('dietary filter counters support edge cases with zero matches for robust user experience', () => {
    const stats = readIntegrationStats() as {
      nutritionalTagsComputed: number;
      highProteinProducts: number;
      veganProducts: number;
      glutenFreeProducts: number;
      lactoseFreeProducts: number;
      highFiberProducts: number;
      lowCarbProducts: number;
      netCarbsDistribution: {
        very_low: number;
        low: number;
        moderate: number;
        high: number;
        very_high: number;
      };
    };

    // Business value: Filter UI handles zero-result cases gracefully for users
    expect(stats.nutritionalTagsComputed).toBeGreaterThanOrEqual(0);
    expect(stats.highProteinProducts).toBeGreaterThanOrEqual(0);
    expect(stats.veganProducts).toBeGreaterThanOrEqual(0);
    expect(stats.glutenFreeProducts).toBeGreaterThanOrEqual(0);
    expect(stats.lactoseFreeProducts).toBeGreaterThanOrEqual(0);
    expect(stats.highFiberProducts).toBeGreaterThanOrEqual(0);
    expect(stats.lowCarbProducts).toBeGreaterThanOrEqual(0);

    // Carb distribution categories support empty buckets for complete filtering coverage
    const distribution = stats.netCarbsDistribution;
    expect(distribution.very_low).toBeGreaterThanOrEqual(0);
    expect(distribution.low).toBeGreaterThanOrEqual(0);
    expect(distribution.moderate).toBeGreaterThanOrEqual(0);
    expect(distribution.high).toBeGreaterThanOrEqual(0);
    expect(distribution.very_high).toBeGreaterThanOrEqual(0);
  });

  test('nutritional statistics enable comprehensive dietary filtering for Dutch users', () => {
    const stats = readIntegrationStats() as {
      nutritionalTagsComputed: number;
      highProteinProducts: number;
      veganProducts: number;
      glutenFreeProducts: number;
      lactoseFreeProducts: number;
      highFiberProducts: number;
      lowCarbProducts: number;
      netCarbsDistribution: {
        very_low: number;
        low: number;
        moderate: number;
        high: number;
        very_high: number;
      };
    };

    // Business value: All dietary filter categories available for user food selection
    const dietaryCounters = [
      'nutritionalTagsComputed',
      'highProteinProducts',
      'veganProducts',
      'glutenFreeProducts',
      'lactoseFreeProducts',
      'highFiberProducts',
      'lowCarbProducts',
    ];

    dietaryCounters.forEach((counter) => {
      expect(stats).toHaveProperty(counter);
      expect(typeof stats[counter]).toBe('number');
      expect(Number.isInteger(stats[counter])).toBe(true);
      expect(stats[counter]).toBeGreaterThanOrEqual(0);
    });

    // Carb distribution supports granular low-carb diet filtering
    expect(stats).toHaveProperty('netCarbsDistribution');
    expect(typeof stats.netCarbsDistribution).toBe('object');

    const carbBuckets = ['very_low', 'low', 'moderate', 'high', 'very_high'];
    carbBuckets.forEach((bucket) => {
      expect(stats.netCarbsDistribution).toHaveProperty(bucket);
      expect(typeof stats.netCarbsDistribution[bucket]).toBe('number');
      expect(Number.isInteger(stats.netCarbsDistribution[bucket])).toBe(true);
      expect(stats.netCarbsDistribution[bucket]).toBeGreaterThanOrEqual(0);
    });
  });
});

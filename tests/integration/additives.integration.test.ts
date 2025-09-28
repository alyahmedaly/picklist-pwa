import { describe, test, expect } from 'vitest';
import { readIntegrationProducts, readIntegrationStats } from '../test-utils.ts';
import type { Product } from '../../src/data/transform/types.ts';

/** T005: Integration test Dutch E-number analysis - Real fixtures + controlled scenarios */

describe('Dutch E-number Integration (T005)', () => {
  test('parses E-numbers from real Dutch CSV fixture products', () => {
    // Read from pre-computed fixture output
    const products = readIntegrationProducts() as Product[];
    expect(products.length).toBeGreaterThan(0);

    // Find AH Franse baguettes with E300 (ascorbic acid)
    const baguette = products.find((p) => p.name === 'AH Franse baguettes');
    expect(baguette).toBeDefined();

    if (!baguette) return;

    // Contract validation - all food products should have additive analysis
    expect(baguette.additiveInfo).toBeDefined();
    expect(baguette.additiveFlags).toBeDefined();

    // E300 (ascorbic acid) should be detected and classified correctly
    expect(baguette.additiveInfo!.eNumbers).toContain('E300');
    expect(baguette.additiveInfo!.totalAdditives).toBeGreaterThan(0);
    expect(baguette.additiveInfo!.antioxidants).toContain('E300');

    // E300 properties: natural, organic compatible, safe
    expect(baguette.additiveInfo!.naturalAdditives).toContain('E300');
    expect(baguette.additiveFlags!.allNaturalAdditives).toBe(true);
    expect(baguette.additiveFlags!.organicCompatible).toBe(true);
    expect(baguette.additiveFlags!.requiresChildWarning).toBe(false);
    expect(baguette.additiveFlags!.hasPreservatives).toBe(false);

    // Verify statistics are being tracked
    const stats = readIntegrationStats() as {
      additiveAnalysisComputed: number;
      productsWithAdditives: number;
    };
    expect(stats.additiveAnalysisComputed).toBeGreaterThan(0);
    expect(stats.productsWithAdditives).toBeGreaterThan(0);
  });

  test('comprehensive E-number scenarios from real data', () => {
    // Read from pre-computed fixture output with real production data
    const products = readIntegrationProducts() as Product[];
    expect(products.length).toBeGreaterThan(0);

    // Test 1: Roomkaas with multiple E-numbers (requirement FR-001, FR-002, FR-003)
    const roomkaas = products.find((p) => p.name.includes('Roomkaas'));
    expect(roomkaas).toBeDefined();
    expect(roomkaas?.additiveInfo).toBeDefined();
    expect(roomkaas?.additiveInfo?.eNumbers).toEqual(
      expect.arrayContaining(['E270', 'E330', 'E223']),
    );
    expect(roomkaas?.additiveInfo?.totalAdditives).toBe(3);
    expect(roomkaas?.additiveInfo?.functionalCategories).toEqual(
      expect.arrayContaining(['Zuurteregelaar', 'Voedingszuur', 'Conserveermiddel']),
    );
    expect(roomkaas?.additiveFlags?.containsAllergenicAdditives).toBe(true); // E223 is sulfite (FR-006)

    // Test 2: Yogurt with natural color (requirement FR-004: natural vs synthetic)
    const yogurt = products.find((p) => p.name.toLowerCase().includes('yoghurt'));
    expect(yogurt).toBeDefined();
    expect(yogurt?.additiveInfo?.eNumbers).toContain('E100');
    expect(yogurt?.additiveInfo?.colors).toContain('E100');
    expect(yogurt?.additiveInfo?.naturalAdditives).toContain('E100');
    expect(yogurt?.additiveFlags?.allNaturalAdditives).toBe(true);
    expect(yogurt?.additiveFlags?.organicCompatible).toBe(true); // E100 is organic compatible (FR-010)

    // Test 3: Comprehensive additive validation with real data
    const allFoodProducts = products.filter((p) => p.flags?.isFood);
    expect(allFoodProducts.length).toBeGreaterThan(0);

    // All food products should have additive analysis (requirement FR-016)
    allFoodProducts.forEach((product) => {
      expect(product.additiveInfo).toBeDefined();
      expect(product.additiveFlags).toBeDefined();
    });

    // Verify statistics tracking (requirement FR-017)
    const stats = readIntegrationStats() as {
      additiveAnalysisComputed: number;
      productsWithAdditives: number;
      productsWithPreservatives: number;
      productsWithAllergenicAdditives: number;
      organicCompatibleProducts: number;
      naturalAdditivesOnlyProducts: number;
    };
    expect(stats.additiveAnalysisComputed).toBeGreaterThan(0);
    expect(stats.productsWithAdditives).toBeGreaterThan(0);
    expect(stats.productsWithPreservatives).toBeGreaterThan(0);
    expect(stats.productsWithAllergenicAdditives).toBeGreaterThan(0);
  });
});

import { describe, test, expect } from 'vitest';
import { readIntegrationProducts } from '../test-utils';
import type { Product } from '../../src/data/transform/types.ts';

/** T011: Integration test warnings consolidation - MUST FAIL before implementation */

describe('Warnings Consolidation Integration (T011)', () => {
  test('should provide unified safety information for consumer protection', () => {
    const products = readIntegrationProducts() as Product[];

    // Business value: Users get all safety warnings in one place
    const flaggedProduct = products.find(
      (p) =>
        p.additiveFlags &&
        (p.additiveFlags.requiresChildWarning ||
          p.additiveFlags.containsAllergenicAdditives ||
          p.additiveFlags.requiresPKUWarning ||
          p.additiveFlags.mayWorsenAsthmaEczema),
    );

    if (flaggedProduct) {
      // This MUST fail - warnings consolidation not implemented yet
      expect(flaggedProduct).toHaveProperty('warnings');
      expect(Array.isArray(flaggedProduct.warnings)).toBe(true);
      expect(flaggedProduct.warnings!.length).toBeGreaterThan(0);

      flaggedProduct.warnings!.forEach((warning) => {
        expect(typeof warning).toBe('string');
        expect(warning.length).toBeGreaterThan(0);
      });
    }
  });

  test('should warn parents about color additives affecting children', () => {
    const products = readIntegrationProducts() as Product[];

    const colorProduct = products.find((p) => p.additiveFlags?.requiresChildWarning);

    if (colorProduct?.warnings) {
      // Business value: Parents can make informed choices about color additives
      const childWarning = colorProduct.warnings.find(
        (w) =>
          w.includes('children') ||
          w.includes('child') ||
          w.includes('activity') ||
          w.includes('attention'),
      );
      expect(childWarning).toBeDefined();
    }
  });

  test('should protect PKU patients from aspartame exposure', () => {
    const products = readIntegrationProducts() as Product[];

    const aspartameProduct = products.find((p) => p.additiveFlags?.requiresPKUWarning);

    if (aspartameProduct?.warnings) {
      // Business value: PKU patients can avoid dangerous products
      const pkuWarning = aspartameProduct.warnings.find(
        (w) => w.includes('phenylketonuria') || w.includes('PKU') || w.includes('aspartame'),
      );
      expect(pkuWarning).toBeDefined();
    }
  });

  test('should alert asthmatics about sulfite allergens', () => {
    const products = readIntegrationProducts() as Product[];

    const sulfiteProduct = products.find((p) => p.additiveFlags?.containsAllergenicAdditives);

    if (sulfiteProduct?.warnings) {
      // Business value: Asthmatics can avoid triggering ingredients
      const sulfiteWarning = sulfiteProduct.warnings.find(
        (w) => w.includes('sulfite') || w.includes('allergic') || w.includes('asthma'),
      );
      expect(sulfiteWarning).toBeDefined();
    }
  });

  test('should provide comprehensive allergen information for safety', () => {
    const products = readIntegrationProducts() as Product[];

    const allergenProduct = products.find(
      (p) => p.allergens && (p.allergens.contains.length > 0 || p.allergens.mayContain.length > 0),
    );

    if (allergenProduct?.warnings) {
      // Business value: Comprehensive allergen warnings for consumer safety
      const allergenWarnings = allergenProduct.warnings.filter(
        (w) => w.includes('allergen') || w.includes('contains') || w.includes('may contain'),
      );
      expect(allergenWarnings.length).toBeGreaterThan(0);
    }
  });

  test('should clearly indicate safe products with no warnings', () => {
    const products = readIntegrationProducts() as Product[];

    const cleanProduct = products.find(
      (p) =>
        !p.additiveFlags?.requiresChildWarning &&
        !p.additiveFlags?.containsAllergenicAdditives &&
        !p.additiveFlags?.requiresPKUWarning &&
        (!p.allergens ||
          (p.allergens.contains.length === 0 && p.allergens.mayContain.length === 0)),
    );

    if (cleanProduct) {
      // Business value: Users can confidently choose products with no safety concerns
      if (cleanProduct.warnings) {
        expect(cleanProduct.warnings).toEqual([]);
      }
    }
  });

  test('should provide clean, non-redundant warning messages', () => {
    const products = readIntegrationProducts() as Product[];

    products.forEach((product) => {
      if (product.warnings && product.warnings.length > 1) {
        // Business value: Clear, non-redundant warning messages for users
        const uniqueWarnings = new Set(product.warnings);
        expect(uniqueWarnings.size).toBe(product.warnings.length);
      }
    });
  });

  test('should enable comprehensive safety-based product filtering', () => {
    const products = readIntegrationProducts() as Product[];
    let warningsProcessed = 0;

    products.forEach((product) => {
      if (product.warnings) {
        warningsProcessed++;
        expect(Array.isArray(product.warnings)).toBe(true);

        product.warnings.forEach((warning) => {
          // Business value: Clean, properly formatted warnings for UI display
          expect(typeof warning).toBe('string');
          expect(warning.trim()).toBe(warning);
          expect(warning.length).toBeGreaterThan(0);
        });
      }
    });

    // Should have processed some products with warnings
    expect(warningsProcessed).toBeGreaterThan(0);
  });
});

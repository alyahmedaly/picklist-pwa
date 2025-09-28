import { describe, it, expect, beforeAll, vi } from 'vitest';
import { estimateGlycemicIndexWithNEVO, preloadNEVODatabase, getNEVOStats } from '../../packages/parser/src/nevo/nevoIntegration.ts';

describe('NEVO Integration - Basmati Rice Test', () => {
  beforeAll(async () => {
    // Try to preload NEVO database (will fallback to patterns if not available)
    await preloadNEVODatabase();
  });

  describe('Basmati Rice GI Correction', () => {
    it('should correctly classify basmati rice as low GI (1.0x multiplier)', () => {
      const ingredients = ['basmati rijst', 'water', 'zout'];
      const categories = ['granen', 'rijst'];
      const productName = 'Basmati Rijst Volkoren';

      const result = estimateGlycemicIndexWithNEVO(ingredients, categories, productName);

      // Should be 1.0 (low GI) instead of the old 1.1 (medium GI)
      expect(result).toBe(1.0);
    });

    it('should correctly classify whole grain basmati as low GI', () => {
      const ingredients = ['volkoren basmati rijst', 'water'];
      const categories = ['granen', 'volkoren'];
      const productName = 'Volkoren Basmati Rijst';

      const result = estimateGlycemicIndexWithNEVO(ingredients, categories, productName);

      // Whole grain should definitely be low GI
      expect(result).toBe(1.0);
    });

    it('should distinguish basmati from regular white rice', () => {
      const basmatiResult = estimateGlycemicIndexWithNEVO(
        ['basmati rijst'],
        ['rijst'],
        'Basmati Rijst'
      );

      const whiteRiceResult = estimateGlycemicIndexWithNEVO(
        ['witte rijst'],
        ['rijst'],
        'Witte Rijst'
      );

      // Basmati should be lower GI than regular white rice
      expect(basmatiResult).toBeLessThan(whiteRiceResult);
      expect(basmatiResult).toBe(1.0); // Low GI
      expect(whiteRiceResult).toBeGreaterThan(1.2); // High GI
    });

    it('should handle English basmati rice terms', () => {
      const result = estimateGlycemicIndexWithNEVO(
        ['basmati rice', 'water'],
        ['grains', 'rice'],
        'Basmati Rice'
      );

      expect(result).toBe(1.0);
    });
  });

  describe('Pattern Fallback Improvements', () => {
    it('should maintain correct classification for other low GI foods', () => {
      const quinoaResult = estimateGlycemicIndexWithNEVO(['quinoa'], ['granen']);
      const lentilResult = estimateGlycemicIndexWithNEVO(['linzen'], ['peulvruchten']);
      const oatsResult = estimateGlycemicIndexWithNEVO(['haver'], ['granen']);

      expect(quinoaResult).toBe(1.0);
      expect(lentilResult).toBe(1.0);
      expect(oatsResult).toBe(1.0);
    });

    it('should maintain correct classification for high GI foods', () => {
      const whiteRiceResult = estimateGlycemicIndexWithNEVO(['witte rijst'], ['rijst']);
      const glucoseResult = estimateGlycemicIndexWithNEVO(['glucose'], ['suiker']);

      expect(whiteRiceResult).toBeGreaterThan(1.2);
      expect(glucoseResult).toBeGreaterThan(1.2);
    });
  });

  describe('NEVO Database Status', () => {
    it('should report database loading status', () => {
      const stats = getNEVOStats();

      expect(stats).toHaveProperty('loaded');
      expect(stats).toHaveProperty('entries');
      expect(stats).toHaveProperty('version');

      // Should be either loaded with NEVO data or using pattern fallback
      expect(typeof stats.loaded).toBe('boolean');
      expect(typeof stats.entries).toBe('number');
      expect(typeof stats.version).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid inputs gracefully', () => {
      const result1 = estimateGlycemicIndexWithNEVO([], []);
      const result2 = estimateGlycemicIndexWithNEVO(null as any, null as any);

      // Should return valid multipliers within range
      expect(result1).toBeGreaterThanOrEqual(1.0);
      expect(result1).toBeLessThanOrEqual(1.5);
      expect(result2).toBeGreaterThanOrEqual(1.0);
      expect(result2).toBeLessThanOrEqual(1.5);
    });

    it('should handle empty product names', () => {
      const result = estimateGlycemicIndexWithNEVO(['water'], ['dranken'], '');
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(1.0);
      expect(result).toBeLessThanOrEqual(1.5);
    });
  });
});

describe('Real Product Test Cases', () => {
  it('should correctly score the basmati rice products from the original issue', () => {
    // Original problematic products
    const products = [
      {
        name: 'Basmati Rijst',
        ingredients: ['basmati rijst'],
        categories: ['rijst', 'granen'],
        expectedGI: 1.0 // Should be low GI
      },
      {
        name: 'Volkoren Basmati Rijst',
        ingredients: ['volkoren basmati rijst'],
        categories: ['volkoren', 'rijst', 'granen'],
        expectedGI: 1.0 // Should definitely be low GI
      },
      {
        name: 'Witte Rijst',
        ingredients: ['witte rijst'],
        categories: ['rijst', 'granen'],
        expectedGI: 1.3 // Should be high GI
      }
    ];

    for (const product of products) {
      const result = estimateGlycemicIndexWithNEVO(
        product.ingredients,
        product.categories,
        product.name
      );

      expect(result).toBe(product.expectedGI);
    }
  });
});
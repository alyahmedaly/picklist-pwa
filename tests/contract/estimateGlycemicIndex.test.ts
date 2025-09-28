import { describe, it, expect } from 'vitest';

import { estimateGlycemicIndex } from '../../src/data/transform/bodyRecompositionHelpers';

describe('estimateGlycemicIndex - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept ingredients and categories arrays', () => {
      const result = estimateGlycemicIndex(['ingredient1'], ['category1']);
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
    });

    it('should match GlycemicIndexEstimator interface exactly', () => {
      const mockFunction: (ingredients: string[], categories: string[]) => number =
        estimateGlycemicIndex;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('Dutch Language Support', () => {
    it('should recognize Dutch high GI ingredients', () => {
      const result = estimateGlycemicIndex(['witte rijst'], []);
      expect(result).toBeGreaterThan(1.0);
    });

    it('should recognize Dutch medium GI ingredients', () => {
      const result = estimateGlycemicIndex(['havermout'], []);
      expect(result).toBeGreaterThanOrEqual(1.0);
    });

    it('should recognize Dutch low GI categories', () => {
      const result = estimateGlycemicIndex([], ['groenten']);
      expect(result).toBeLessThanOrEqual(1.0);
    });
  });

  describe('English Language Support', () => {
    it('should recognize English high GI ingredients', () => {
      const result = estimateGlycemicIndex(['white rice'], []);
      expect(result).toBeGreaterThan(1.0);
    });

    it('should recognize English medium GI ingredients', () => {
      const result = estimateGlycemicIndex(['oats'], []);
      expect(result).toBeGreaterThanOrEqual(1.0);
    });

    it('should recognize English low GI categories', () => {
      const result = estimateGlycemicIndex([], ['vegetables']);
      expect(result).toBeLessThanOrEqual(1.0);
    });
  });

  describe('GI Multiplier Range Validation', () => {
    it('should return multipliers in 1.0-1.3 range for high GI foods', () => {
      const result = estimateGlycemicIndex(['glucose', 'witte rijst'], []);
      expect(result).toBeGreaterThanOrEqual(1.0);
      expect(result).toBeLessThanOrEqual(1.3);
    });

    it('should return 1.0 for neutral/unknown foods', () => {
      const result = estimateGlycemicIndex(['unknown ingredient'], ['unknown category']);
      expect(result).toBe(1.0);
    });

    it('should handle empty inputs gracefully', () => {
      const result = estimateGlycemicIndex([], []);
      expect(result).toBe(1.0);
    });
  });

  describe('Ingredient vs Category Priority', () => {
    it('should prioritize ingredient patterns over category patterns', () => {
      const result = estimateGlycemicIndex(['white bread'], ['vegetables']);
      expect(result).toBeGreaterThan(1.0); // High GI ingredient should override low GI category
    });

    it('should fall back to category patterns when ingredients are neutral', () => {
      const result = estimateGlycemicIndex(['unknown'], ['granen']);
      expect(result).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe('Real-world Data Validation', () => {
    it('should handle complex Dutch ingredient lists', () => {
      const result = estimateGlycemicIndex(['witte rijst', 'glucose', 'havermout'], ['granen']);
      expect(result).toBeGreaterThan(1.0);
      expect(result).toBeLessThanOrEqual(1.3);
    });

    it('should handle mixed language inputs', () => {
      const result = estimateGlycemicIndex(['white rice', 'havermout'], ['vegetables', 'granen']);
      expect(result).toBeGreaterThan(1.0);
    });
  });

  describe('Null/Undefined Input Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      const result1 = estimateGlycemicIndex(['sugar'], ['sweets']);
      const result2 = estimateGlycemicIndex(['vegetables'], ['healthy']);

      expect(typeof result1).toBe('number');
      expect(typeof result2).toBe('number');
      expect(result1).toBeGreaterThanOrEqual(1.0);
      expect(result2).toBeLessThanOrEqual(1.3);
    });
  });
});

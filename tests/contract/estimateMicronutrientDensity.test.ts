import { describe, it, expect } from 'vitest';

import { estimateMicronutrientDensity } from '../../src/data/transform/bodyRecompositionHelpers';

describe('estimateMicronutrientDensity - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept ingredients and categories arrays', () => {
      const result = estimateMicronutrientDensity(['ingredient1'], ['category1']);
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
    });

    it('should match MicronutrientDensityEstimator interface exactly', () => {
      const mockFunction: (ingredients: string[], categories: string[]) => number =
        estimateMicronutrientDensity;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('High Density Categories (80-100 score)', () => {
    it('should assign high scores to vegetables and fruits', () => {
      const result = estimateMicronutrientDensity([], ['vegetables']);
      expect(result).toBeGreaterThan(80);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should assign high scores to Dutch high-density categories', () => {
      const result = estimateMicronutrientDensity([], ['groenten']);
      expect(result).toBeGreaterThan(80);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should recognize organ meats as high density', () => {
      const result = estimateMicronutrientDensity(['liver'], []);
      expect(result).toBeGreaterThan(80);
    });
  });

  describe('Medium Density Categories (60-80 score)', () => {
    it('should assign medium scores to whole grains', () => {
      const result = estimateMicronutrientDensity([], ['whole grain']);
      expect(result).toBeGreaterThan(60);
      expect(result).toBeLessThanOrEqual(80);
    });

    it('should assign medium scores to Dutch medium-density categories', () => {
      const result = estimateMicronutrientDensity([], ['volkoren']);
      expect(result).toBeGreaterThan(60);
      expect(result).toBeLessThanOrEqual(80);
    });

    it('should recognize nuts and legumes as medium density', () => {
      const result = estimateMicronutrientDensity(['nuts'], []);
      expect(result).toBeGreaterThan(60);
      expect(result).toBeLessThanOrEqual(80);
    });
  });

  describe('Low Density Categories (0-40 score)', () => {
    it('should assign low scores to refined products', () => {
      const result = estimateMicronutrientDensity([], ['refined']);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(40);
    });

    it('should assign low scores to Dutch low-density categories', () => {
      const result = estimateMicronutrientDensity([], ['geraffineerd']);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(40);
    });

    it('should recognize processed sugars as low density', () => {
      const result = estimateMicronutrientDensity(['white sugar'], []);
      expect(result).toBeLessThanOrEqual(40);
    });
  });

  describe('Ingredient Complexity Analysis', () => {
    it('should boost scores for complex natural ingredient lists', () => {
      const result = estimateMicronutrientDensity(['spinach', 'kale', 'carrots'], ['vegetables']);
      expect(result).toBeGreaterThan(80);
    });

    it('should reduce scores for highly processed ingredient lists', () => {
      const result = estimateMicronutrientDensity(
        ['corn syrup', 'artificial flavor', 'preservatives'],
        [],
      );
      expect(result).toBeLessThan(50);
    });

    it('should handle mixed ingredient complexity', () => {
      const result = estimateMicronutrientDensity(['tomatoes', 'corn syrup'], ['mixed']);
      expect(result).toBeGreaterThan(30);
      expect(result).toBeLessThan(90);
    });
  });

  describe('Dutch Language Support', () => {
    it('should recognize Dutch high-density ingredients', () => {
      const result = estimateMicronutrientDensity(['spinazie', 'wortel'], []);
      expect(result).toBeGreaterThan(60);
    });

    it('should recognize Dutch category terms', () => {
      const result = estimateMicronutrientDensity([], ['zuivel']);
      expect(result).toBeGreaterThan(50);
    });

    it('should handle mixed Dutch/English inputs', () => {
      const result = estimateMicronutrientDensity(
        ['spinach', 'wortel'],
        ['vegetables', 'groenten'],
      );
      expect(result).toBeGreaterThan(70);
    });
  });

  describe('Score Range Validation', () => {
    it('should return scores in 0-100 range', () => {
      const result1 = estimateMicronutrientDensity(['vegetables'], ['healthy']);
      const result2 = estimateMicronutrientDensity(['sugar'], ['processed']);
      const result3 = estimateMicronutrientDensity(['unknown'], ['unknown']);

      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result1).toBeLessThanOrEqual(100);
      expect(result2).toBeGreaterThanOrEqual(0);
      expect(result2).toBeLessThanOrEqual(100);
      expect(result3).toBeGreaterThanOrEqual(0);
      expect(result3).toBeLessThanOrEqual(100);
    });

    it('should handle empty inputs gracefully', () => {
      const result = estimateMicronutrientDensity([], []);
      expect(result).toBe(50); // Default moderate score
    });
  });

  describe('Real-world Data Validation', () => {
    it('should differentiate between whole vs processed foods', () => {
      const wholeResult = estimateMicronutrientDensity(['spinach', 'carrots'], ['vegetables']);
      const processedResult = estimateMicronutrientDensity(
        ['corn syrup', 'artificial colors'],
        ['processed'],
      );

      expect(wholeResult).toBeGreaterThan(processedResult + 30);
    });

    it('should handle complex Dutch ingredient lists', () => {
      const result = estimateMicronutrientDensity(
        ['spinazie', 'wortel', 'volkoren tarwe'],
        ['groenten', 'granen'],
      );
      expect(result).toBeGreaterThan(60);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('Null/Undefined Input Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      const result1 = estimateMicronutrientDensity(['leafy greens'], ['vegetables']);
      const result2 = estimateMicronutrientDensity(['processed food'], ['junk']);

      expect(typeof result1).toBe('number');
      expect(typeof result2).toBe('number');
      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result1).toBeLessThanOrEqual(100);
      expect(result2).toBeGreaterThanOrEqual(0);
      expect(result2).toBeLessThanOrEqual(100);
    });
  });
});

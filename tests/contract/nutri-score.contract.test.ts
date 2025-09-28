import { describe, it, expect } from 'vitest';
import { computeNutriScore } from '../../src/data/transform/compute/computeNutriScore';
import type { Nutrition } from '../../src/data/transform/types';

describe('computeNutriScore - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept Nutrition object and optional category string', () => {
      const nutrition: Nutrition = {
        kcal: 150,
        satFat: 2,
        sugars: 10,
        salt: 0.5,
        fiber: 3,
        protein: 8,
      };

      // Should accept nutrition only
      expect(() => computeNutriScore(nutrition)).not.toThrow();

      // Should accept nutrition with category
      expect(() => computeNutriScore(nutrition, 'general')).not.toThrow();
      expect(() => computeNutriScore(nutrition, 'beverages')).not.toThrow();
    });
  });

  describe('Return Type Validation', () => {
    it('should return number or undefined', () => {
      const validNutrition: Nutrition = {
        kcal: 150,
        satFat: 2,
        sugars: 10,
        salt: 0.5,
        fiber: 3,
        protein: 8,
      };

      const result = computeNutriScore(validNutrition);
      expect(typeof result === 'number' || result === undefined).toBe(true);
    });

    it('should return integer in range [-15, +40] for valid nutrition', () => {
      const validNutrition: Nutrition = {
        kcal: 150,
        satFat: 2,
        sugars: 10,
        salt: 0.5,
        fiber: 3,
        protein: 8,
      };

      const result = computeNutriScore(validNutrition);
      if (result !== undefined) {
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(-15);
        expect(result).toBeLessThanOrEqual(40);
      }
    });

    it('should return undefined for insufficient nutrition data', () => {
      const insufficientNutrition: Nutrition = {
        kcal: 150,
        // Missing required fields: satFat, sugars, salt
      };

      const result = computeNutriScore(insufficientNutrition);
      expect(result).toBeUndefined();
    });
  });

  describe('Category-Specific Behavior', () => {
    it('should handle beverage vs general categories differently', () => {
      const nutrition: Nutrition = {
        kcal: 100,
        satFat: 0,
        sugars: 20,
        salt: 0.1,
        fiber: 0,
        protein: 0,
      };

      const generalScore = computeNutriScore(nutrition, 'general');
      const beverageScore = computeNutriScore(nutrition, 'beverages');

      // Both should be valid numbers or both undefined
      if (generalScore !== undefined && beverageScore !== undefined) {
        // Beverages have stricter energy thresholds, so score should differ
        expect(generalScore).not.toBe(beverageScore);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty nutrition object gracefully', () => {
      const emptyNutrition: Nutrition = {};

      const result = computeNutriScore(emptyNutrition);
      expect(result).toBeUndefined();
    });

    it('should handle null/undefined values in nutrition', () => {
      const partialNutrition: Nutrition = {
        kcal: undefined,
        satFat: 2,
        sugars: null as any,
        salt: 0.5,
      };

      const result = computeNutriScore(partialNutrition);
      expect(result).toBeUndefined();
    });
  });

  describe('Integration Requirements', () => {
    it('should be a pure function (no side effects)', () => {
      const nutrition: Nutrition = {
        kcal: 150,
        satFat: 2,
        sugars: 10,
        salt: 0.5,
      };

      const originalNutrition = { ...nutrition };
      computeNutriScore(nutrition);

      // Nutrition object should remain unchanged
      expect(nutrition).toEqual(originalNutrition);
    });

    it('should return consistent results for identical input', () => {
      const nutrition: Nutrition = {
        kcal: 150,
        satFat: 2,
        sugars: 10,
        salt: 0.5,
        fiber: 3,
        protein: 8,
      };

      const result1 = computeNutriScore(nutrition, 'general');
      const result2 = computeNutriScore(nutrition, 'general');

      expect(result1).toBe(result2);
    });
  });
});

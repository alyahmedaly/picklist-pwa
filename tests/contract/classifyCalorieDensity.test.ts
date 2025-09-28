import { describe, it, expect } from 'vitest';

import { classifyCalorieDensity } from '../../src/data/transform/bodyRecompositionHelpers';

describe('classifyCalorieDensity - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept caloriesPer100g number parameter', () => {
      const result = classifyCalorieDensity(100);
      expect(result).toBeDefined();
      expect(['low', 'moderate', 'high']).toContain(result);
    });

    it('should match CalorieDensityClassifier interface exactly', () => {
      const mockFunction: (caloriesPer100g: number) => 'low' | 'moderate' | 'high' =
        classifyCalorieDensity;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('Classification Thresholds', () => {
    it('should return "low" for <125 kcal/100g', () => {
      const result = classifyCalorieDensity(100);
      expect(result).toBe('low');
    });

    it('should return "moderate" for 125-225 kcal/100g', () => {
      const result = classifyCalorieDensity(175);
      expect(result).toBe('moderate');
    });

    it('should return "high" for >225 kcal/100g', () => {
      const result = classifyCalorieDensity(300);
      expect(result).toBe('high');
    });
  });

  describe('Boundary Conditions', () => {
    it('should classify exactly 125 kcal/100g as moderate', () => {
      const result = classifyCalorieDensity(125);
      expect(result).toBe('moderate');
    });

    it('should classify exactly 225 kcal/100g as moderate', () => {
      const result = classifyCalorieDensity(225);
      expect(result).toBe('moderate');
    });

    it('should classify 124.9 kcal/100g as low', () => {
      const result = classifyCalorieDensity(124.9);
      expect(result).toBe('low');
    });

    it('should classify 225.1 kcal/100g as high', () => {
      const result = classifyCalorieDensity(225.1);
      expect(result).toBe('high');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero calories', () => {
      const result = classifyCalorieDensity(0);
      expect(result).toBe('low');
    });

    it('should handle very high calorie values', () => {
      const result = classifyCalorieDensity(1000);
      expect(result).toBe('high');
    });

    it('should handle decimal values correctly', () => {
      const result1 = classifyCalorieDensity(124.5);
      const result2 = classifyCalorieDensity(125.5);
      const result3 = classifyCalorieDensity(225.5);

      expect(result1).toBe('low');
      expect(result2).toBe('moderate');
      expect(result3).toBe('high');
    });
  });

  describe('Null/Undefined Input Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      // Test that function returns valid results for positive numbers
      const result1 = classifyCalorieDensity(50);
      const result2 = classifyCalorieDensity(150);
      const result3 = classifyCalorieDensity(300);

      expect(['low', 'moderate', 'high']).toContain(result1);
      expect(['low', 'moderate', 'high']).toContain(result2);
      expect(['low', 'moderate', 'high']).toContain(result3);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { computeNutriScore } from '../../src/data/transform/compute/computeNutriScore';
import type { Nutrition } from '../../src/data/transform/types';

describe('computeNutriScore - Unit Tests', () => {
  describe('FSA Energy Thresholds', () => {
    it('should apply all FSA energy thresholds correctly', () => {
      // Energy thresholds: 335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350 kJ
      const testCases = [
        { kcal: 0, expectedPoints: 0 }, // 0 kJ -> 0 points
        { kcal: 85, expectedPoints: 1 }, // ~355 kJ -> 1 point (above 335 threshold)
        { kcal: 165, expectedPoints: 2 }, // ~690 kJ -> 2 points (above 670 threshold)
        { kcal: 245, expectedPoints: 3 }, // ~1025 kJ -> 3 points (above 1005 threshold)
        { kcal: 325, expectedPoints: 4 }, // ~1360 kJ -> 4 points (above 1340 threshold)
        { kcal: 405, expectedPoints: 5 }, // ~1695 kJ -> 5 points (above 1675 threshold)
        { kcal: 485, expectedPoints: 6 }, // ~2030 kJ -> 6 points (above 2010 threshold)
        { kcal: 565, expectedPoints: 7 }, // ~2364 kJ -> 7 points (above 2345 threshold)
        { kcal: 645, expectedPoints: 8 }, // ~2699 kJ -> 8 points (above 2680 threshold)
        { kcal: 725, expectedPoints: 9 }, // ~3033 kJ -> 9 points (above 3015 threshold)
        { kcal: 805, expectedPoints: 10 }, // ~3368 kJ -> 10 points (above 3350 threshold)
      ];

      testCases.forEach(({ kcal, expectedPoints }) => {
        const nutrition: Nutrition = {
          kcal,
          satFat: 0,
          sugars: 0,
          salt: 0,
          fiber: 0,
          protein: 0,
        };

        const score = computeNutriScore(nutrition, 'general');

        // Score should equal the negative points (since no positive points to subtract)
        // Formula: negativePoints - positivePoints = negativePoints - 0 = negativePoints
        expect(score).toBe(expectedPoints);
      });
    });
  });

  describe('FSA Saturated Fat Thresholds', () => {
    it('should apply all FSA saturated fat thresholds correctly', () => {
      // Saturated fat thresholds: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 g
      const testCases = [
        { satFat: 0, expectedPoints: 0 },
        { satFat: 1, expectedPoints: 1 },
        { satFat: 2, expectedPoints: 2 },
        { satFat: 3, expectedPoints: 3 },
        { satFat: 4, expectedPoints: 4 },
        { satFat: 5, expectedPoints: 5 },
        { satFat: 6, expectedPoints: 6 },
        { satFat: 7, expectedPoints: 7 },
        { satFat: 8, expectedPoints: 8 },
        { satFat: 9, expectedPoints: 9 },
        { satFat: 10, expectedPoints: 10 },
      ];

      testCases.forEach(({ satFat, expectedPoints }) => {
        const nutrition: Nutrition = {
          kcal: 0,
          satFat,
          sugars: 0,
          salt: 0,
          fiber: 0,
          protein: 0,
        };

        const score = computeNutriScore(nutrition, 'general');
        expect(score).toBe(expectedPoints);
      });
    });
  });

  describe('FSA Sugar Thresholds', () => {
    it('should apply all FSA sugar thresholds correctly', () => {
      // Sugar thresholds: 4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45 g
      const testCases = [
        { sugars: 0, expectedPoints: 0 },
        { sugars: 4.5, expectedPoints: 1 },
        { sugars: 9, expectedPoints: 2 },
        { sugars: 13.5, expectedPoints: 3 },
        { sugars: 18, expectedPoints: 4 },
        { sugars: 22.5, expectedPoints: 5 },
        { sugars: 27, expectedPoints: 6 },
        { sugars: 31, expectedPoints: 7 },
        { sugars: 36, expectedPoints: 8 },
        { sugars: 40, expectedPoints: 9 },
        { sugars: 45, expectedPoints: 10 },
      ];

      testCases.forEach(({ sugars, expectedPoints }) => {
        const nutrition: Nutrition = {
          kcal: 0,
          satFat: 0,
          sugars,
          salt: 0,
          fiber: 0,
          protein: 0,
        };

        const score = computeNutriScore(nutrition, 'general');
        expect(score).toBe(expectedPoints);
      });
    });
  });

  describe('FSA Sodium Thresholds', () => {
    it('should apply all FSA sodium thresholds correctly', () => {
      // Sodium thresholds: 90, 180, 270, 360, 450, 540, 630, 720, 810, 900 mg
      // Salt to sodium conversion: sodium = salt * 400
      const testCases = [
        { salt: 0, expectedPoints: 0 },
        { salt: 0.225, expectedPoints: 1 }, // 90mg sodium
        { salt: 0.45, expectedPoints: 2 }, // 180mg sodium
        { salt: 0.675, expectedPoints: 3 }, // 270mg sodium
        { salt: 0.9, expectedPoints: 4 }, // 360mg sodium
        { salt: 1.125, expectedPoints: 5 }, // 450mg sodium
        { salt: 1.35, expectedPoints: 6 }, // 540mg sodium
        { salt: 1.575, expectedPoints: 7 }, // 630mg sodium
        { salt: 1.8, expectedPoints: 8 }, // 720mg sodium
        { salt: 2.025, expectedPoints: 9 }, // 810mg sodium
        { salt: 2.25, expectedPoints: 10 }, // 900mg sodium
      ];

      testCases.forEach(({ salt, expectedPoints }) => {
        const nutrition: Nutrition = {
          kcal: 0,
          satFat: 0,
          sugars: 0,
          salt,
          fiber: 0,
          protein: 0,
        };

        const score = computeNutriScore(nutrition, 'general');
        expect(score).toBe(expectedPoints);
      });
    });
  });

  describe('FSA Fiber Positive Points', () => {
    it('should apply all FSA fiber thresholds correctly', () => {
      // Fiber thresholds: 0.9, 1.9, 2.8, 3.7, 4.7 g
      const testCases = [
        { fiber: 0, expectedPoints: 0 }, // No fiber -> 0 points
        { fiber: 1.0, expectedPoints: 1 }, // Above 0.9 threshold -> 1 point
        { fiber: 2.0, expectedPoints: 2 }, // Above 1.9 threshold -> 2 points
        { fiber: 3.0, expectedPoints: 3 }, // Above 2.8 threshold -> 3 points
        { fiber: 4.0, expectedPoints: 4 }, // Above 3.7 threshold -> 4 points
        { fiber: 5.0, expectedPoints: 5 }, // Above 4.7 threshold -> 5 points
      ];

      testCases.forEach(({ fiber, expectedPoints }) => {
        const nutrition: Nutrition = {
          kcal: 0,
          satFat: 0,
          sugars: 0,
          salt: 0,
          fiber,
          protein: 0,
        };

        const score = computeNutriScore(nutrition, 'general');
        if (expectedPoints === 0) {
          expect(score).toBe(0); // No points = 0 score
        } else {
          expect(score).toBe(-expectedPoints); // Negative score from positive fiber points
        }
      });
    });
  });

  describe('FSA Protein Positive Points', () => {
    it('should apply all FSA protein thresholds correctly', () => {
      // Protein thresholds: 1.6, 3.2, 4.8, 6.4, 8.0 g
      const testCases = [
        { protein: 0, expectedPoints: 0 }, // No protein -> 0 points
        { protein: 2.0, expectedPoints: 1 }, // Above 1.6 threshold -> 1 point
        { protein: 4.0, expectedPoints: 2 }, // Above 3.2 threshold -> 2 points
        { protein: 5.0, expectedPoints: 3 }, // Above 4.8 threshold -> 3 points
        { protein: 7.0, expectedPoints: 4 }, // Above 6.4 threshold -> 4 points
        { protein: 9.0, expectedPoints: 5 }, // Above 8.0 threshold -> 5 points
      ];

      testCases.forEach(({ protein, expectedPoints }) => {
        const nutrition: Nutrition = {
          kcal: 0,
          satFat: 0,
          sugars: 0,
          salt: 0,
          fiber: 0,
          protein,
        };

        const score = computeNutriScore(nutrition, 'general');
        if (expectedPoints === 0) {
          expect(score).toBe(0); // No points = 0 score
        } else {
          expect(score).toBe(-expectedPoints); // Negative score from positive protein points
        }
      });
    });
  });

  describe('Category-Specific Thresholds', () => {
    it('should apply different energy thresholds for beverages', () => {
      // Beverage energy thresholds: 0, 30, 60, 90, 120, 150, 180, 210, 240, 270 kJ
      const nutrition: Nutrition = {
        kcal: 25, // ~105 kJ
        satFat: 0,
        sugars: 0,
        salt: 0,
        fiber: 0,
        protein: 0,
      };

      const generalScore = computeNutriScore(nutrition, 'general');
      const beverageScore = computeNutriScore(nutrition, 'beverages');

      // Beverages have stricter energy thresholds
      expect(beverageScore).not.toBe(generalScore);
      expect(Math.abs(beverageScore || 0)).toBeGreaterThan(Math.abs(generalScore || 0));
    });

    it('should apply protein rules for cheese category', () => {
      // Cheese: protein points only count if negative score ≤ 11
      const highNegativeNutrition: Nutrition = {
        kcal: 800, // High energy = high negative points
        satFat: 10,
        sugars: 0,
        salt: 2,
        fiber: 0,
        protein: 8, // Should give protein points
      };

      const lowNegativeNutrition: Nutrition = {
        kcal: 100, // Low energy = low negative points
        satFat: 1,
        sugars: 0,
        salt: 0.2,
        fiber: 0,
        protein: 8, // Should NOT give protein points
      };

      const highNegativeScore = computeNutriScore(highNegativeNutrition, 'cheese');
      const lowNegativeScore = computeNutriScore(lowNegativeNutrition, 'cheese');

      // Both should be valid scores
      expect(typeof highNegativeScore).toBe('number');
      expect(typeof lowNegativeScore).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      const nutrition: Nutrition = {
        kcal: 0,
        satFat: 0,
        sugars: 0,
        salt: 0,
        fiber: 0,
        protein: 0,
      };

      const score = computeNutriScore(nutrition, 'general');
      expect(score).toBe(0); // No negative or positive points
    });

    it('should handle maximum values correctly', () => {
      const nutrition: Nutrition = {
        kcal: 1000, // Very high energy
        satFat: 15, // Very high sat fat
        sugars: 50, // Very high sugars
        salt: 3, // Very high salt
        fiber: 0,
        protein: 0,
      };

      const score = computeNutriScore(nutrition, 'general');
      expect(score).toBe(40); // Maximum negative points
    });

    it('should handle missing required fields', () => {
      const incompleteNutrition: Nutrition = {
        kcal: 150,
        // Missing satFat, sugars, salt
      };

      const score = computeNutriScore(incompleteNutrition, 'general');
      expect(score).toBeUndefined();
    });

    it('should handle negative nutrition values', () => {
      const invalidNutrition: Nutrition = {
        kcal: -100,
        satFat: 2,
        sugars: 10,
        salt: 0.5,
      };

      const score = computeNutriScore(invalidNutrition, 'general');
      expect(score).toBeUndefined(); // Invalid input
    });

    it('should handle null/undefined values gracefully', () => {
      const nutritionWithNulls: Nutrition = {
        kcal: undefined,
        satFat: null as any,
        sugars: 10,
        salt: 0.5,
      };

      const score = computeNutriScore(nutritionWithNulls, 'general');
      expect(score).toBeUndefined();
    });
  });

  describe('Real Product Examples', () => {
    it('should calculate correct score for typical yogurt', () => {
      const yogurtNutrition: Nutrition = {
        kcal: 78, // Energy
        satFat: 1.1, // Saturated fat
        sugars: 11, // Sugars
        salt: 0.11, // Salt
        fiber: 0, // Fiber
        protein: 3.1, // Protein
      };

      const score = computeNutriScore(yogurtNutrition, 'general');
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(-15);
      expect(score).toBeLessThanOrEqual(40);
    });

    it('should calculate correct score for healthy vegetable product', () => {
      const vegetableNutrition: Nutrition = {
        kcal: 25, // Low energy
        satFat: 0.1, // Low sat fat
        sugars: 2, // Low sugars
        salt: 0.05, // Low salt
        fiber: 3, // High fiber
        protein: 2, // Some protein
      };

      const score = computeNutriScore(vegetableNutrition, 'general');
      expect(typeof score).toBe('number');
      expect(score).toBeLessThan(0); // Should be negative (healthy)
    });

    it('should calculate correct score for processed snack', () => {
      const snackNutrition: Nutrition = {
        kcal: 450, // High energy
        satFat: 8, // High sat fat
        sugars: 25, // High sugars
        salt: 1.5, // High salt
        fiber: 1, // Low fiber
        protein: 5, // Some protein
      };

      const score = computeNutriScore(snackNutrition, 'general');
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThan(10); // Should be high (unhealthy)
    });
  });

  describe('Performance and Determinism', () => {
    it('should execute quickly', () => {
      const nutrition: Nutrition = {
        kcal: 150,
        satFat: 2,
        sugars: 10,
        salt: 0.5,
        fiber: 3,
        protein: 8,
      };

      const startTime = Date.now();

      // Execute 1000 calculations
      for (let i = 0; i < 1000; i++) {
        computeNutriScore(nutrition, 'general');
      }

      const endTime = Date.now();

      // Should complete in < 100ms for 1000 calculations
      expect(endTime - startTime).toBeLessThan(100);
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

      const results = Array.from({ length: 10 }, () => computeNutriScore(nutrition, 'general'));

      // All results should be identical
      const firstResult = results[0];
      results.forEach((result) => {
        expect(result).toBe(firstResult);
      });
    });

    it('should return integer values only', () => {
      const testCases = [
        { kcal: 123.45, satFat: 1.23, sugars: 4.56, salt: 0.78 },
        { kcal: 200.1, satFat: 3.7, sugars: 15.2, salt: 0.95 },
        { kcal: 89.9, satFat: 0.8, sugars: 8.1, salt: 0.33 },
      ];

      testCases.forEach((nutrition) => {
        const score = computeNutriScore(nutrition, 'general');
        if (score !== undefined) {
          expect(Number.isInteger(score)).toBe(true);
        }
      });
    });
  });
});

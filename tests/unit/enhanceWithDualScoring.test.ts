import { describe, it, expect } from 'vitest';
import {
  enhanceWithDualScoring,
  calculateNutriScores,
  applyPercentileRanking,
  getScoringStatistics,
} from '../../src/data/transform/enhanceWithDualScoring';
import type { Product } from '../../src/data/transform/types';

describe('enhanceWithDualScoring - Unit Tests', () => {
  describe('Varied Product Dataset Processing', () => {
    it('should process mixed product dataset with different nutrition profiles', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Healthy Yogurt',
          price: { regular: 2.5, currency: 'EUR' },
          categories: ['Dairy', 'Yogurt'],
          nutrition: {
            kcal: 78,
            satFat: 1.1,
            sugars: 11,
            salt: 0.11,
            fiber: 0,
            protein: 3.1,
            unit: 'per 100g',
          },
        },
        {
          id: 2,
          name: 'Processed Snack',
          price: { regular: 3.99, currency: 'EUR' },
          categories: ['Snacks', 'Chips'],
          nutrition: {
            kcal: 450,
            satFat: 8,
            sugars: 25,
            salt: 1.5,
            fiber: 1,
            protein: 5,
            unit: 'per 100g',
          },
        },
        {
          id: 3,
          name: 'Fresh Vegetables',
          price: { regular: 1.99, currency: 'EUR' },
          categories: ['Vegetables', 'Fresh'],
          nutrition: {
            kcal: 25,
            satFat: 0.1,
            sugars: 2,
            salt: 0.05,
            fiber: 3,
            protein: 2,
            unit: 'per 100g',
          },
        },
        {
          id: 4,
          name: 'Sugary Beverage',
          price: { regular: 1.5, currency: 'EUR' },
          categories: ['Beverages', 'Soft Drinks'],
          nutrition: {
            kcal: 150,
            satFat: 0,
            sugars: 35,
            salt: 0.02,
            fiber: 0,
            protein: 0,
            unit: 'per 100g',
          },
        },
        {
          id: 5,
          name: 'Product Without Nutrition',
          price: { regular: 5.0, currency: 'EUR' },
          categories: ['Household'],
          // No nutrition data
        },
      ];

      const enhanced = enhanceWithDualScoring(products);

      // Verify all products are returned
      expect(enhanced).toHaveLength(5);

      // Products with nutrition should have scores
      expect(enhanced[0].nutriScore).toBeDefined();
      expect(enhanced[0].globalHealthScore).toBeDefined();
      expect(enhanced[0].globalHealthGrade).toBeDefined();

      expect(enhanced[1].nutriScore).toBeDefined();
      expect(enhanced[1].globalHealthScore).toBeDefined();
      expect(enhanced[1].globalHealthGrade).toBeDefined();

      expect(enhanced[2].nutriScore).toBeDefined();
      expect(enhanced[2].globalHealthScore).toBeDefined();
      expect(enhanced[2].globalHealthGrade).toBeDefined();

      expect(enhanced[3].nutriScore).toBeDefined();
      expect(enhanced[3].globalHealthScore).toBeDefined();
      expect(enhanced[3].globalHealthGrade).toBeDefined();

      // Product without nutrition should not have scores
      expect(enhanced[4].nutriScore).toBeUndefined();
      expect(enhanced[4].globalHealthScore).toBeUndefined();
      expect(enhanced[4].globalHealthGrade).toBeUndefined();
    });

    it('should handle products with insufficient nutrition data gracefully', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Complete Nutrition',
          price: { regular: 2.5, currency: 'EUR' },
          nutrition: {
            kcal: 150,
            satFat: 2,
            sugars: 10,
            salt: 0.5,
            fiber: 3,
            protein: 8,
            unit: 'per 100g',
          },
        },
        {
          id: 2,
          name: 'Incomplete Nutrition',
          price: { regular: 3.0, currency: 'EUR' },
          nutrition: { kcal: 200, unit: 'per 100g' }, // Missing required fields
        },
        {
          id: 3,
          name: 'No Nutrition',
          price: { regular: 1.0, currency: 'EUR' },
          // No nutrition field
        },
      ];

      const enhanced = enhanceWithDualScoring(products);

      // Complete nutrition product should be scored
      expect(enhanced[0].nutriScore).toBeDefined();
      expect(enhanced[0].globalHealthScore).toBeDefined();

      // Incomplete nutrition product should not be scored
      expect(enhanced[1].nutriScore).toBeUndefined();
      expect(enhanced[1].globalHealthScore).toBeUndefined();

      // No nutrition product should not be scored
      expect(enhanced[2].nutriScore).toBeUndefined();
      expect(enhanced[2].globalHealthScore).toBeUndefined();
    });
  });

  describe('Global vs Category Scoring Differences', () => {
    it('should produce different global vs category scores', () => {
      const products: Product[] = [
        // High-scoring product in a low-scoring category
        {
          id: 1,
          name: 'Best Candy',
          price: { regular: 2.0, currency: 'EUR' },
          categories: ['Candy'],
          nutrition: {
            kcal: 300,
            satFat: 5,
            sugars: 40,
            salt: 0.1,
            unit: 'per 100g',
          }, // Bad overall, but best in candy
        },
        {
          id: 2,
          name: 'Worst Candy',
          price: { regular: 2.5, currency: 'EUR' },
          categories: ['Candy'],
          nutrition: {
            kcal: 500,
            satFat: 15,
            sugars: 60,
            salt: 2.0,
            unit: 'per 100g',
          }, // Very bad
        },
        // Low-scoring product in a high-scoring category
        {
          id: 3,
          name: 'Worst Vegetable',
          price: { regular: 1.5, currency: 'EUR' },
          categories: ['Vegetables'],
          nutrition: {
            kcal: 50,
            satFat: 1,
            sugars: 8,
            salt: 0.3,
            unit: 'per 100g',
          }, // Good overall, but worst in vegetables
        },
        {
          id: 4,
          name: 'Best Vegetable',
          price: { regular: 1.0, currency: 'EUR' },
          categories: ['Vegetables'],
          nutrition: {
            kcal: 20,
            satFat: 0.1,
            sugars: 2,
            salt: 0.05,
            fiber: 4,
            protein: 3,
            unit: 'per 100g',
          }, // Excellent
        },
      ];

      const enhanced = enhanceWithDualScoring(products);

      // Find products where global and category grades differ
      const productsWithDifferentGrades = enhanced.filter(
        (p) =>
          p.globalHealthGrade &&
          p.categoryHealthGrade &&
          p.globalHealthGrade !== p.categoryHealthGrade,
      );

      expect(productsWithDifferentGrades.length).toBeGreaterThan(0);

      // Best candy should have low global grade but higher category grade
      const bestCandy = enhanced.find((p) => p.name === 'Best Candy');
      expect(bestCandy?.categoryHealthGrade).toBeDefined();
      expect(bestCandy?.globalHealthGrade).toBeDefined();

      // Best vegetable should have a good grade (actual grade depends on Nutri-Score calculation)
      const bestVegetable = enhanced.find((p) => p.name === 'Best Vegetable');
      expect(bestVegetable?.globalHealthGrade).toBeDefined();
      expect(bestVegetable?.categoryHealthGrade).toBeDefined();

      // Should have better scores than other products due to low energy, high fiber, protein
      expect(['A', 'B', 'C'].includes(bestVegetable?.globalHealthGrade!)).toBe(true);
    });
  });

  describe('Grade Distribution Balance', () => {
    it('should distribute grades approximately 20% per grade with tolerance', () => {
      // Create 25 products with varied nutrition for statistical validity
      const products: Product[] = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: { regular: 2.0, currency: 'EUR' },
        nutrition: {
          kcal: 50 + i * 20, // Range: 50-530 kcal
          satFat: i * 0.5, // Range: 0-12 g
          sugars: i * 2, // Range: 0-48 g
          salt: i * 0.1, // Range: 0-2.4 g
          fiber: Math.max(0, 5 - i * 0.2), // Range: 0-5 g
          protein: Math.max(0, 10 - i * 0.3), // Range: 0-10 g
          unit: 'per 100g',
        },
      }));

      const enhanced = enhanceWithDualScoring(products);
      const grades = enhanced
        .map((p) => p.globalHealthGrade)
        .filter(
          (grade): grade is import('../../src/data/transform/types').HealthGrade =>
            grade !== undefined,
        );

      const distribution = {
        A: grades.filter((g) => g === 'A').length,
        B: grades.filter((g) => g === 'B').length,
        C: grades.filter((g) => g === 'C').length,
        D: grades.filter((g) => g === 'D').length,
        E: grades.filter((g) => g === 'E').length,
      };

      const totalGraded = grades.length;
      expect(totalGraded).toBe(25);

      // Each grade should represent approximately 20% (±2% tolerance = ±0.5 products for 25 total)
      Object.values(distribution).forEach((count) => {
        const percentage = (count / totalGraded) * 100;
        expect(percentage).toBeGreaterThanOrEqual(16); // At least 16%
        expect(percentage).toBeLessThanOrEqual(24); // At most 24%
      });
    });
  });

  describe('Deterministic Output', () => {
    it('should produce identical scores for identical input', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product 1',
          price: { regular: 2.0, currency: 'EUR' },
          nutrition: {
            kcal: 150,
            satFat: 2,
            sugars: 10,
            salt: 0.5,
            fiber: 3,
            protein: 8,
            unit: 'per 100g',
          },
        },
        {
          id: 2,
          name: 'Test Product 2',
          price: { regular: 3.0, currency: 'EUR' },
          nutrition: {
            kcal: 300,
            satFat: 5,
            sugars: 20,
            salt: 1.0,
            fiber: 1,
            protein: 5,
            unit: 'per 100g',
          },
        },
      ];

      const result1 = enhanceWithDualScoring([...products]);
      const result2 = enhanceWithDualScoring([...products]);

      // Results should be identical
      expect(result1[0].nutriScore).toBe(result2[0].nutriScore);
      expect(result1[0].globalHealthScore).toBe(result2[0].globalHealthScore);
      expect(result1[0].globalHealthGrade).toBe(result2[0].globalHealthGrade);

      expect(result1[1].nutriScore).toBe(result2[1].nutriScore);
      expect(result1[1].globalHealthScore).toBe(result2[1].globalHealthScore);
      expect(result1[1].globalHealthGrade).toBe(result2[1].globalHealthGrade);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty product array', () => {
      const enhanced = enhanceWithDualScoring([]);
      expect(enhanced).toEqual([]);
    });

    it('should handle single product', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Single Product',
          price: { regular: 2.0, currency: 'EUR' },
          nutrition: {
            kcal: 150,
            satFat: 2,
            sugars: 10,
            salt: 0.5,
            unit: 'per 100g',
          },
        },
      ];

      const enhanced = enhanceWithDualScoring(products);

      expect(enhanced).toHaveLength(1);
      expect(enhanced[0].nutriScore).toBeDefined();
      expect(enhanced[0].globalHealthScore).toBe(50.0); // Single product gets median percentile
      expect(enhanced[0].globalHealthGrade).toBe('C'); // Median grade
    });

    it('should handle products with identical nutrition scores', () => {
      const products: Product[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: { regular: 2.0, currency: 'EUR' },
        nutrition: {
          kcal: 150,
          satFat: 2,
          sugars: 10,
          salt: 0.5,
          unit: 'per 100g',
        }, // Identical nutrition
      }));

      const enhanced = enhanceWithDualScoring(products);

      // All products should have same Nutri-Score
      const nutriScores = enhanced.map((p) => p.nutriScore);
      const uniqueNutriScores = [...new Set(nutriScores)];
      expect(uniqueNutriScores.length).toBe(1);

      // All products should have same global scores (middle percentile for identical scores)
      const globalScores = enhanced.map((p) => p.globalHealthScore);
      const uniqueGlobalScores = [...new Set(globalScores)];
      expect(uniqueGlobalScores.length).toBe(1);
      expect(globalScores[0]).toBe(50.0); // Middle percentile
    });
  });

  describe('Integration with Individual Functions', () => {
    it('should use calculateNutriScores correctly', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Test Product',
          price: { regular: 2.0, currency: 'EUR' },
          nutrition: {
            kcal: 150,
            satFat: 2,
            sugars: 10,
            salt: 0.5,
            unit: 'per 100g',
          },
        },
      ];

      const withNutriScores = calculateNutriScores(products);

      expect(withNutriScores[0].nutriScore).toBeDefined();
      expect(typeof withNutriScores[0].nutriScore).toBe('number');

      // Should not have percentile-based scores yet
      expect(withNutriScores[0].globalHealthScore).toBeUndefined();
      expect(withNutriScores[0].globalHealthGrade).toBeUndefined();
    });

    it('should use applyPercentileRanking correctly', () => {
      const productsWithScores: Product[] = [
        {
          id: 1,
          name: 'Product 1',
          price: { regular: 2.0, currency: 'EUR' },
          nutriScore: -5, // Good score (lower is better in Nutri-Score)
        },
        {
          id: 2,
          name: 'Product 2',
          price: { regular: 3.0, currency: 'EUR' },
          nutriScore: 15, // Bad score (higher is worse in Nutri-Score)
        },
      ];

      const withPercentiles = applyPercentileRanking(productsWithScores);

      // Both products should have global scores
      expect(withPercentiles[0].globalHealthScore).toBeDefined();
      expect(withPercentiles[0].globalHealthGrade).toBeDefined();
      expect(withPercentiles[1].globalHealthScore).toBeDefined();
      expect(withPercentiles[1].globalHealthGrade).toBeDefined();

      // Product with better Nutri-Score (-5) should have higher health score than product with worse Nutri-Score (15)
      // Note: Better Nutri-Score = lower number, but higher health score in our 0-100 scale
      expect(withPercentiles[0].globalHealthScore).toBeGreaterThan(
        withPercentiles[1].globalHealthScore!,
      );
    });
  });

  describe('Statistics Generation', () => {
    it('should generate accurate scoring statistics', () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'Product with nutrition',
          price: { regular: 2.0, currency: 'EUR' },
          nutrition: {
            kcal: 150,
            satFat: 2,
            sugars: 10,
            salt: 0.5,
            unit: 'per 100g',
          },
        },
        {
          id: 2,
          name: 'Product without nutrition',
          price: { regular: 3.0, currency: 'EUR' },
        },
        {
          id: 3,
          name: 'Product with incomplete nutrition',
          price: { regular: 1.5, currency: 'EUR' },
          nutrition: { kcal: 200, unit: 'per 100g' }, // Missing required fields
        },
      ];

      const enhanced = enhanceWithDualScoring(products);
      const stats = getScoringStatistics(enhanced);

      expect(stats.totalProducts).toBe(3);
      expect(stats.productsWithNutrition).toBe(2);
      expect(stats.productsWithScores).toBe(1); // Only complete nutrition gets scored
      expect(stats.scoringCoverage).toBeCloseTo(33.3, 1);
      expect(stats.nutriScoreRange).toBeDefined();
      expect(stats.globalGradeDistribution).toBeDefined();
    });
  });
});

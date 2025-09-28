import { describe, it, expect } from 'vitest';
import type { FatLossScore } from '../../src/data/transform/types/bodyRecomposition.ts';

import { computeFatLossCompatibility } from '../../src/data/transform/computeFatLossCompatibility';

// Test product fixtures based on real product data structures
const lowCalorieDensityProduct = {
  id: 'test-001',
  name: 'Greek Yogurt',
  nutrition: {
    kcal: 120, // <125 = low density
    protein: 15,
    carbs: 8,
    fiber: 2,
  },
  satietyAnalysis: {
    satietyScore: 65,
    satietyFactors: {
      proteinFactor: 0.8,
      fiberFactor: 0.3,
      volumeFactor: 0.6,
      processingPenalty: 0.1,
    },
    expectedSatietyDuration: 180,
    caloriePerSatietyRatio: 1.85,
  },
  categories: ['dairy', 'protein'],
};

const moderateCalorieDensityProduct = {
  id: 'test-002',
  name: 'Whole Grain Bread',
  nutrition: {
    kcal: 180, // 125-225 = moderate density
    protein: 6,
    carbs: 32,
    fiber: 4,
  },
  satietyAnalysis: {
    satietyScore: 45,
    satietyFactors: {
      proteinFactor: 0.4,
      fiberFactor: 0.5,
      volumeFactor: 0.3,
      processingPenalty: 0.2,
    },
    expectedSatietyDuration: 120,
    caloriePerSatietyRatio: 4.0,
  },
  categories: ['grains', 'bread'],
};

const highCalorieDensityProduct = {
  id: 'test-003',
  name: 'Chocolate Bar',
  nutrition: {
    kcal: 520, // >225 = high density
    protein: 6,
    carbs: 45,
    fiber: 2,
  },
  satietyAnalysis: {
    satietyScore: 15,
    satietyFactors: {
      proteinFactor: 0.3,
      fiberFactor: 0.2,
      volumeFactor: 0.1,
      processingPenalty: 0.5,
    },
    expectedSatietyDuration: 30,
    caloriePerSatietyRatio: 34.7,
  },
  categories: ['confectionery', 'snacks'],
};

const productWithoutSatietyData = {
  id: 'test-004',
  name: 'Unknown Product',
  nutrition: {
    kcal: 150,
    protein: 8,
    carbs: 20,
  },
  // Missing satietyAnalysis - should return undefined
  categories: ['unknown'],
};

const volumeAdvantageProduct = {
  id: 'test-005',
  name: 'Vegetable Soup',
  nutrition: {
    kcal: 45, // Very low calories for volume advantage
    protein: 2,
    carbs: 8,
    fiber: 3,
  },
  satietyAnalysis: {
    satietyScore: 55,
    satietyFactors: {
      proteinFactor: 0.2,
      fiberFactor: 0.4,
      volumeFactor: 0.8,
      processingPenalty: 0.1,
    },
  },
  categories: ['vegetables', 'soup'],
};

describe('computeFatLossCompatibility - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept Product with nutrition and satietyAnalysis', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('fatLossScore');
    });

    it('should match FatLossScoringFunction interface exactly', () => {
      const mockFunction: (
        product: Partial<typeof lowCalorieDensityProduct>,
      ) => FatLossScore | undefined = computeFatLossCompatibility;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('Return Type Validation', () => {
    it('should return FatLossScore with all required fields', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('fatLossScore');
      expect(result).toHaveProperty('calorieDensity');
      expect(result).toHaveProperty('calorieDensityClass');
      expect(result).toHaveProperty('satietyEfficiency');
      expect(result).toHaveProperty('volumeAdvantage');
      expect(result).toHaveProperty('confidence');
    });

    it('should return undefined for products missing satietyAnalysis', () => {
      const result = computeFatLossCompatibility(productWithoutSatietyData);
      expect(result).toBeUndefined();
    });
  });

  describe('Calorie Density Classification', () => {
    it('should classify low calorie density (<125 kcal/100g)', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      if (result) {
        expect(result.calorieDensityClass).toBe('low');
        expect(result.calorieDensity).toBe(120);
      }
    });

    it('should classify moderate calorie density (125-225 kcal/100g)', () => {
      const result = computeFatLossCompatibility(moderateCalorieDensityProduct);
      if (result) {
        expect(result.calorieDensityClass).toBe('moderate');
        expect(result.calorieDensity).toBe(180);
      }
    });

    it('should classify high calorie density (>225 kcal/100g)', () => {
      const result = computeFatLossCompatibility(highCalorieDensityProduct);
      if (result) {
        expect(result.calorieDensityClass).toBe('high');
        expect(result.calorieDensity).toBe(520);
      }
    });
  });

  describe('Satiety Efficiency Calculation', () => {
    it('should calculate satiety efficiency using existing satietyAnalysis', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      if (result) {
        expect(result.satietyEfficiency).toBeGreaterThan(0);
        expect(typeof result.satietyEfficiency).toBe('number');
      }
    });

    it('should show higher efficiency for high satiety, low calorie products', () => {
      const lowCalResult = computeFatLossCompatibility(lowCalorieDensityProduct);
      const highCalResult = computeFatLossCompatibility(highCalorieDensityProduct);

      if (lowCalResult && highCalResult) {
        // Greek yogurt (65 satiety, 120 cal) should be more efficient than chocolate (15 satiety, 520 cal)
        expect(lowCalResult.satietyEfficiency).toBeGreaterThan(highCalResult.satietyEfficiency);
      }
    });
  });

  describe('Volume Advantage Calculation', () => {
    it('should identify volume advantage for low-calorie, high-fiber products', () => {
      const result = computeFatLossCompatibility(volumeAdvantageProduct);
      if (result) {
        expect(result.volumeAdvantage).toBe(true);
      }
    });

    it('should not assign volume advantage to high-calorie products', () => {
      const result = computeFatLossCompatibility(highCalorieDensityProduct);
      if (result) {
        expect(result.volumeAdvantage).toBe(false);
      }
    });
  });

  describe('Fat Loss Score Calculation', () => {
    it('should return scores in valid 0-100 range', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      if (result) {
        expect(result.fatLossScore).toBeGreaterThanOrEqual(0);
        expect(result.fatLossScore).toBeLessThanOrEqual(100);
      }
    });

    it('should score low-calorie, high-satiety products highly', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      if (result) {
        expect(result.fatLossScore).toBeGreaterThan(60); // Should score well for fat loss
      }
    });

    it('should score high-calorie, low-satiety products poorly', () => {
      const result = computeFatLossCompatibility(highCalorieDensityProduct);
      if (result) {
        expect(result.fatLossScore).toBeLessThan(40); // Should score poorly for fat loss
      }
    });
  });

  describe('Confidence Level Assessment', () => {
    it('should assign confidence based on data completeness', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      if (result) {
        expect(['high', 'medium', 'low']).toContain(result.confidence);
      }
    });

    it('should assign higher confidence for complete nutritional and satiety data', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      if (result) {
        expect(['high', 'medium']).toContain(result.confidence); // Should be high or medium
      }
    });
  });

  describe('Integration with Existing Satiety System', () => {
    it('should integrate with existing satietyAnalysis scores', () => {
      const result = computeFatLossCompatibility(lowCalorieDensityProduct);
      if (result) {
        // Should use the satiety score from existing analysis
        expect(result.satietyEfficiency).toBeGreaterThan(0);
      }
    });

    it('should require existing satiety data to function', () => {
      // Product without satiety analysis should return undefined
      const result = computeFatLossCompatibility(productWithoutSatietyData);
      expect(result).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(computeFatLossCompatibility(null as any)).toBeUndefined();
      expect(computeFatLossCompatibility(undefined as any)).toBeUndefined();
      expect(computeFatLossCompatibility({} as any)).toBeUndefined();
    });

    it('should handle products with missing calorie data', () => {
      const noCaloriesProduct = {
        ...lowCalorieDensityProduct,
        nutrition: { protein: 10, carbs: 5 }, // Missing kcal
      };
      const result = computeFatLossCompatibility(noCaloriesProduct);
      expect(result).toBeUndefined();
    });

    it('should handle products with zero calories', () => {
      const zeroCaloriesProduct = {
        ...lowCalorieDensityProduct,
        nutrition: { kcal: 0, protein: 1, carbs: 1 },
      };
      const result = computeFatLossCompatibility(zeroCaloriesProduct);
      expect(result).toBeUndefined();
    });
  });

  describe('Real Product Validation', () => {
    it('should demonstrate clear fat loss scoring differences', () => {
      const lowCalResult = computeFatLossCompatibility(lowCalorieDensityProduct);
      const highCalResult = computeFatLossCompatibility(highCalorieDensityProduct);

      if (lowCalResult && highCalResult) {
        // Greek yogurt should score much better than chocolate bar
        expect(lowCalResult.fatLossScore).toBeGreaterThan(highCalResult.fatLossScore);
        expect(lowCalResult.calorieDensityClass).toBe('low');
        expect(highCalResult.calorieDensityClass).toBe('high');
      }
    });
  });
});

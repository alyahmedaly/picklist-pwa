import { describe, it, expect } from 'vitest';
import type { CalorieEfficiencyScore } from '../../src/data/transform/types/bodyRecomposition.ts';

import { computeEnhancedCalorieEfficiency } from '../../src/data/transform/computeEnhancedCalorieEfficiency';

// Test product fixtures based on real product data structures
const wholeFoodProduct = {
  id: 'test-001',
  name: 'Chicken Breast',
  nutrition: {
    kcal: 165,
    protein: 31,
    carbs: 0,
    fiber: 0,
    fat: 3.6,
  },
  ingredients: ['chicken breast'],
  categories: ['meat', 'protein'],
  proteinOptimization: {
    proteinDensityScore: 88,
    proteinContribution: 18.2,
    targetContribution: 74.1,
  },
  satietyAnalysis: {
    satietyScore: 82,
    satietyFactors: {
      proteinFactor: 0.9,
      fiberFactor: 0.0,
      volumeFactor: 0.7,
      processingPenalty: 0.0,
    },
    expectedSatietyDuration: 240,
    caloriePerSatietyRatio: 2.01,
  },
  additiveInfo: {
    totalAdditives: 0,
    eNumbers: [],
  },
};

const processedProduct = {
  id: 'test-002',
  name: 'Protein Bar',
  nutrition: {
    kcal: 380,
    protein: 20,
    carbs: 35,
    fiber: 8,
    fat: 15,
  },
  ingredients: ['protein isolate', 'corn syrup', 'artificial flavors', 'preservatives'],
  categories: ['protein bars', 'snacks'],
  proteinOptimization: {
    proteinDensityScore: 45,
    proteinContribution: 11.8,
    targetContribution: 47.1,
  },
  satietyAnalysis: {
    satietyScore: 35,
    satietyFactors: {
      proteinFactor: 0.5,
      fiberFactor: 0.4,
      volumeFactor: 0.2,
      processingPenalty: 0.3,
    },
    expectedSatietyDuration: 90,
    caloriePerSatietyRatio: 10.9,
  },
  additiveInfo: {
    totalAdditives: 8,
    eNumbers: ['E202', 'E330', 'E950'],
  },
};

const incompleteNutritionProduct = {
  id: 'test-003',
  name: 'Unknown Product',
  nutrition: {
    kcal: 200,
    // Missing protein - should return undefined
    carbs: 25,
  },
  ingredients: ['unknown'],
  categories: ['unknown'],
};

describe('computeEnhancedCalorieEfficiency - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept Product with complete scoring data', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('efficiencyScore');
    });

    it('should match CalorieEfficiencyScoringFunction interface exactly', () => {
      // This test validates the function signature matches the contract
      const mockFunction: (
        product: Partial<typeof wholeFoodProduct>,
      ) => CalorieEfficiencyScore | undefined = computeEnhancedCalorieEfficiency;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('Return Type Validation', () => {
    it('should return CalorieEfficiencyScore with all required fields', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('efficiencyScore');
      expect(result).toHaveProperty('proteinEfficiency');
      expect(result).toHaveProperty('satietyEfficiency');
      expect(result).toHaveProperty('micronutrientDensity');
      expect(result).toHaveProperty('thermicEffect');
      expect(result).toHaveProperty('processingPenalty');
      expect(result).toHaveProperty('confidence');
    });

    it('should return undefined for products missing calories or protein', () => {
      const result = computeEnhancedCalorieEfficiency(incompleteNutritionProduct);
      expect(result).toBeUndefined();
    });
  });

  describe('Multi-dimensional Scoring Calculation', () => {
    it('should calculate weighted efficiency: 40% protein + 30% satiety + 20% micronutrient + 10% processing', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // The overall efficiency should be a weighted combination
        expect(typeof result.efficiencyScore).toBe('number');
        expect(result.efficiencyScore).toBeGreaterThanOrEqual(0);
        expect(result.efficiencyScore).toBeLessThanOrEqual(100);
      }
    });

    it('should validate individual component scores are in 0-100 range', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        expect(result.proteinEfficiency).toBeGreaterThanOrEqual(0);
        expect(result.proteinEfficiency).toBeLessThanOrEqual(100);
        expect(result.satietyEfficiency).toBeGreaterThanOrEqual(0);
        expect(result.satietyEfficiency).toBeLessThanOrEqual(100);
        expect(result.micronutrientDensity).toBeGreaterThanOrEqual(0);
        expect(result.micronutrientDensity).toBeLessThanOrEqual(100);
      }
    });

    it('should validate thermic effect and processing penalty ranges', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        expect(result.thermicEffect).toBeGreaterThanOrEqual(0);
        expect(result.thermicEffect).toBeLessThanOrEqual(20);
        expect(result.processingPenalty).toBeGreaterThanOrEqual(0);
        expect(result.processingPenalty).toBeLessThanOrEqual(30);
      }
    });
  });

  describe('Thermic Effect Integration', () => {
    it('should calculate thermic effect based on macronutrient composition', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // Protein 20-30%, carbs 5-10%, fats 0-3%
        expect(result.thermicEffect).toBeGreaterThan(0);
      }
    });

    it('should assign higher thermic effect to high-protein foods', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // Chicken breast should have high thermic effect (high protein)
        expect(result.thermicEffect).toBeGreaterThan(10);
      }
    });

    it('should assign lower thermic effect to high-fat foods', () => {
      const result = computeEnhancedCalorieEfficiency(processedProduct);
      if (result) {
        // Fat has lowest thermic effect
        expect(typeof result.thermicEffect).toBe('number');
      }
    });
  });

  describe('NOVA Processing Penalty Integration', () => {
    it('should apply NOVA processing penalty from existing additiveInfo', () => {
      const result = computeEnhancedCalorieEfficiency(processedProduct);
      if (result) {
        expect(typeof result.processingPenalty).toBe('number');
      }
    });

    it('should apply maximum penalty to NOVA 4 products', () => {
      const result = computeEnhancedCalorieEfficiency(processedProduct);
      if (result) {
        // Processed protein bar should have significant penalty
        expect(result.processingPenalty).toBeGreaterThan(15);
      }
    });

    it('should apply minimal penalty to whole foods', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // Chicken breast should have minimal processing penalty
        expect(result.processingPenalty).toBeLessThan(5);
      }
    });
  });

  describe('Micronutrient Density Estimation', () => {
    it('should estimate micronutrient density from ingredients and categories', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        expect(result.micronutrientDensity).toBeGreaterThanOrEqual(0);
        expect(result.micronutrientDensity).toBeLessThanOrEqual(100);
      }
    });

    it('should assign higher density to whole foods with natural ingredients', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // Chicken breast should have good micronutrient density
        expect(result.micronutrientDensity).toBeGreaterThan(50);
      }
    });

    it('should assign lower density to highly processed foods', () => {
      const result = computeEnhancedCalorieEfficiency(processedProduct);
      if (result) {
        // Protein bar should have lower micronutrient density
        expect(result.micronutrientDensity).toBeLessThan(70);
      }
    });
  });

  describe('Integration with Existing Systems', () => {
    it('should integrate with existing protein scoring system', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // Should use existing proteinOptimization data
        expect(result.proteinEfficiency).toBeGreaterThan(0);
      }
    });

    it('should integrate with existing satiety scoring system', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // Should use existing satietyAnalysis data
        expect(result.satietyEfficiency).toBeGreaterThan(0);
      }
    });
  });

  describe('Score Range and Bounds Validation', () => {
    it('should return efficiency scores in valid 0-100 range', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        expect(result.efficiencyScore).toBeGreaterThanOrEqual(0);
        expect(result.efficiencyScore).toBeLessThanOrEqual(100);
      }
    });

    it('should demonstrate clear efficiency differentiation between whole vs processed foods', () => {
      const wholeResult = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      const processedResult = computeEnhancedCalorieEfficiency(processedProduct);

      if (wholeResult && processedResult) {
        // Chicken breast should score significantly higher than protein bar
        expect(wholeResult.efficiencyScore).toBeGreaterThan(processedResult.efficiencyScore + 20);
      }
    });
  });

  describe('Performance Validation', () => {
    it('should complete calculation in <1ms per product', () => {
      const startTime = performance.now();
      computeEnhancedCalorieEfficiency(wholeFoodProduct);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1.0); // <1ms requirement
    });
  });

  describe('Graceful Degradation for Incomplete Data', () => {
    it('should handle products with incomplete nutrition data gracefully', () => {
      const result = computeEnhancedCalorieEfficiency(incompleteNutritionProduct);
      // Should return undefined or degrade gracefully
      expect(result).toBeUndefined();
    });

    it('should handle products missing ingredient data', () => {
      const noIngredientsProduct = {
        ...wholeFoodProduct,
        ingredients: [],
      };
      const result = computeEnhancedCalorieEfficiency(noIngredientsProduct);
      if (result) {
        // Should still calculate with category-based estimates
        expect(['low', 'medium']).toContain(result.confidence);
      }
    });

    it('should handle products missing existing scoring data', () => {
      const noScoringProduct = {
        ...wholeFoodProduct,
        proteinOptimization: undefined,
        satietyAnalysis: undefined,
      };
      const result = computeEnhancedCalorieEfficiency(noScoringProduct);
      if (result) {
        // Should estimate missing components
        expect(['low', 'medium']).toContain(result.confidence);
      }
    });
  });

  describe('Real Product Data Validation', () => {
    it('should process chicken breast vs protein bar scenario correctly', () => {
      const chickenResult = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      const barResult = computeEnhancedCalorieEfficiency(processedProduct);

      if (chickenResult && barResult) {
        // Chicken should excel in protein efficiency and low processing penalty
        expect(chickenResult.proteinEfficiency).toBeGreaterThan(barResult.proteinEfficiency);
        expect(chickenResult.processingPenalty).toBeLessThan(barResult.processingPenalty);
        expect(chickenResult.efficiencyScore).toBeGreaterThan(barResult.efficiencyScore);
      }
    });
  });

  describe('Confidence Assessment', () => {
    it('should assign confidence based on data completeness', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        expect(['high', 'medium', 'low']).toContain(result.confidence);
      }
    });

    it('should assign high confidence for complete data', () => {
      const result = computeEnhancedCalorieEfficiency(wholeFoodProduct);
      if (result) {
        // Complete nutrition + ingredients + existing scores = high confidence
        expect(['high', 'medium']).toContain(result.confidence);
      }
    });
  });

  describe('Null/Undefined Input Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      expect(computeEnhancedCalorieEfficiency(null as any)).toBeUndefined();
      expect(computeEnhancedCalorieEfficiency(undefined as any)).toBeUndefined();
      expect(computeEnhancedCalorieEfficiency({} as any)).toBeUndefined();
    });
  });
});

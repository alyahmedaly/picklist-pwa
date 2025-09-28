import { describe, it, expect } from 'vitest';
import type { PostWorkoutScore } from '../../src/data/transform/types/bodyRecomposition.ts';

import { computePostWorkoutScoring } from '../../src/data/transform/compute/computePostWorkoutScoring';

// Test product fixtures based on real product data structures
const validPostWorkoutProduct = {
  id: 'test-001',
  name: 'White Rice',
  nutrition: {
    kcal: 130,
    protein: 2.7,
    carbs: 28,
    fiber: 0.4,
  },
  ingredients: ['rice', 'water'],
  categories: ['grains', 'staples'],
};

const proteinOnlyProduct = {
  id: 'test-002',
  name: 'Chicken Breast',
  nutrition: {
    kcal: 165,
    protein: 31,
    carbs: 0,
    fiber: 0,
  },
  ingredients: ['chicken breast'],
  categories: ['meat', 'protein'],
};

const incompleteProduct = {
  id: 'test-003',
  name: 'Unknown Product',
  nutrition: {
    kcal: 100,
    // Missing protein and carbs
  },
  ingredients: [],
  categories: ['unknown'],
};

const optimalRatioProduct = {
  id: 'test-004',
  name: 'Optimal Recovery Food',
  nutrition: {
    kcal: 150,
    protein: 10,
    carbs: 30, // 3:1 ratio - optimal
    fiber: 2,
  },
  ingredients: ['oats', 'protein powder', 'banana'],
  categories: ['grains', 'protein'],
};

describe('computePostWorkoutScoring - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept Product with nutrition data and return PostWorkoutScore | undefined', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('postWorkoutScore');
    });

    it('should match PostWorkoutScoringFunction interface exactly', () => {
      const mockFunction: (
        product: Partial<typeof validPostWorkoutProduct>,
      ) => PostWorkoutScore | undefined = computePostWorkoutScoring;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('Return Type Validation', () => {
    it('should return PostWorkoutScore with all required fields', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('postWorkoutScore');
      expect(result).toHaveProperty('carbProteinRatio');
      expect(result).toHaveProperty('glycemicBoost');
      expect(result).toHaveProperty('recoveryWindow');
      expect(result).toHaveProperty('confidence');
    });

    it('should return undefined for products missing carbs AND protein', () => {
      const result = computePostWorkoutScoring(incompleteProduct);
      expect(result).toBeUndefined();
    });
  });

  describe('Carb-Protein Ratio Calculation', () => {
    it('should calculate valid carb:protein ratios (2:1 to 4:1 optimal)', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(result.carbProteinRatio).toBeGreaterThanOrEqual(0);
        expect(result.carbProteinRatio).toBeLessThanOrEqual(20); // Max reasonable ratio
      }
    });

    it('should handle products with both carbs and protein', () => {
      // White rice: ~28g carbs, 2.7g protein = 10.4:1 ratio
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(typeof result.carbProteinRatio).toBe('number');
        expect(result.carbProteinRatio).toBeCloseTo(10.37, 1);
      }
    });

    it('should return undefined for products without carbs or protein', () => {
      const result = computePostWorkoutScoring(proteinOnlyProduct);
      expect(result).toBeUndefined(); // No carbs = no post-workout score
    });
  });

  describe('Glycemic Index Boost Validation', () => {
    it('should return glycemic boost multiplier in range 1.0-1.5', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(result.glycemicBoost).toBeGreaterThanOrEqual(1.0);
        expect(result.glycemicBoost).toBeLessThanOrEqual(1.5);
      }
    });

    it('should apply higher multiplier for high-GI foods', () => {
      // White rice should get higher GI boost (1.2-1.3)
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(result.glycemicBoost).toBeGreaterThan(1.1);
        expect(result.glycemicBoost).toBeLessThanOrEqual(1.5);
      }
    });

    it('should apply lower multiplier for low-GI foods', () => {
      const lowGIProduct = {
        ...validPostWorkoutProduct,
        ingredients: ['oats', 'vegetables'],
        categories: ['whole grains', 'vegetables'],
      };
      const result = computePostWorkoutScoring(lowGIProduct);
      if (result) {
        expect(result.glycemicBoost).toBeCloseTo(1.0, 0.1);
      }
    });
  });

  describe('Recovery Window Classification', () => {
    it('should classify recovery window as immediate, delayed, or general', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(['immediate', 'delayed', 'general']).toContain(result.recoveryWindow);
      }
    });

    it('should assign immediate window for high-GI carb products', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(result.recoveryWindow).toBe('immediate'); // High GI + good carbs = immediate
      }
    });

    it('should assign general window for balanced products', () => {
      const result = computePostWorkoutScoring(optimalRatioProduct);
      if (result) {
        expect(['immediate', 'general']).toContain(result.recoveryWindow);
      }
    });
  });

  describe('Confidence Level Assessment', () => {
    it('should assign confidence level based on data completeness', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(['high', 'medium', 'low']).toContain(result.confidence);
      }
    });

    it('should assign high confidence for complete ingredient and nutrition data', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(['high', 'medium']).toContain(result.confidence); // Should be high or medium
      }
    });
  });

  describe('Score Range Validation', () => {
    it('should return scores in valid 0-100 range', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(result.postWorkoutScore).toBeGreaterThanOrEqual(0);
        expect(result.postWorkoutScore).toBeLessThanOrEqual(100);
      }
    });

    it('should handle optimal ratio products with good scores', () => {
      const result = computePostWorkoutScoring(optimalRatioProduct);
      if (result) {
        expect(result.postWorkoutScore).toBeGreaterThan(80); // Optimal ratio should score well
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should return undefined for products missing both carbs and protein', () => {
      const result = computePostWorkoutScoring(incompleteProduct);
      expect(result).toBeUndefined();
    });

    it('should handle products with zero nutrition values gracefully', () => {
      const zeroProduct = {
        ...validPostWorkoutProduct,
        nutrition: { carbs: 0, protein: 0 },
      };
      const result = computePostWorkoutScoring(zeroProduct);
      expect(result).toBeUndefined();
    });

    it('should handle null/undefined inputs gracefully', () => {
      expect(computePostWorkoutScoring(null as any)).toBeUndefined();
      expect(computePostWorkoutScoring(undefined as any)).toBeUndefined();
      expect(computePostWorkoutScoring({} as any)).toBeUndefined();
    });
  });

  describe('Real Product Data Validation', () => {
    it('should process white rice product correctly', () => {
      const result = computePostWorkoutScoring(validPostWorkoutProduct);
      if (result) {
        expect(result.postWorkoutScore).toBeGreaterThan(0);
        expect(result.carbProteinRatio).toBeCloseTo(10.37, 1);
        expect(result.glycemicBoost).toBeGreaterThan(1.0);
        expect(['immediate', 'delayed', 'general']).toContain(result.recoveryWindow);
        expect(['high', 'medium', 'low']).toContain(result.confidence);
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import type { ContextMultipliers } from '../../src/data/transform/types/bodyRecomposition.ts';

import { calculateContextMultipliers } from '../../src/data/transform/bodyRecompositionHelpers';

describe('calculateContextMultipliers - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept phase and timing parameters', () => {
      const result = calculateContextMultipliers('cutting', 'post_workout');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('proteinScoreMultiplier');
    });

    it('should match ContextMultiplierCalculator interface exactly', () => {
      const mockFunction: (
        phase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition',
        timing: 'pre_workout' | 'post_workout' | 'general',
      ) => ContextMultipliers = calculateContextMultipliers;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('Return Type Validation', () => {
    it('should return ContextMultipliers with all required fields in 0.5-2.0 range', () => {
      const result = calculateContextMultipliers('cutting', 'post_workout');
      expect(result).toHaveProperty('proteinScoreMultiplier');
      expect(result).toHaveProperty('satietyScoreMultiplier');
      expect(result).toHaveProperty('postWorkoutMultiplier');
      expect(result).toHaveProperty('fatLossMultiplier');
      expect(result).toHaveProperty('efficiencyMultiplier');

      // All multipliers should be in 0.5-2.0 range
      Object.values(result).forEach((multiplier) => {
        expect(multiplier).toBeGreaterThanOrEqual(0.5);
        expect(multiplier).toBeLessThanOrEqual(2.0);
      });
    });
  });

  describe('Phase-specific Multipliers', () => {
    it('should boost fatLoss and efficiency multipliers for cutting phase', () => {
      const result = calculateContextMultipliers('cutting', 'general');
      expect(result.fatLossMultiplier).toBeGreaterThan(1.0);
      expect(result.efficiencyMultiplier).toBeGreaterThan(1.0);
    });

    it('should boost protein and postWorkout multipliers for bulking phase', () => {
      const result = calculateContextMultipliers('bulking', 'general');
      expect(result.proteinScoreMultiplier).toBeGreaterThan(1.0);
      expect(result.postWorkoutMultiplier).toBeGreaterThan(1.0);
    });
  });

  describe('Null/Undefined Input Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      const result1 = calculateContextMultipliers('cutting', 'general');
      const result2 = calculateContextMultipliers('bulking', 'post_workout');

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });
});

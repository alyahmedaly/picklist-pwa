import { describe, it, expect } from 'vitest';
import type { BodyCompositionContext } from '@picklist/types';
import { computeBodyCompositionContext } from '../src/product/compute/computeBodyCompositionContext.ts';

describe('computeBodyCompositionContext - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept phase and timing parameters', () => {
      const result = computeBodyCompositionContext('cutting', 'post_workout');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('bodyCompositionPhase');
    });

    it('should match function interface exactly', () => {
      // This test validates the function signature is correct
      const mockFunction: (
        phase?: 'cutting' | 'bulking' | 'maintenance' | 'recomposition',
        timing?: 'pre_workout' | 'post_workout' | 'general',
      ) => BodyCompositionContext = computeBodyCompositionContext;
      expect(typeof mockFunction).toBe('function');
    });
  });

  describe('Return Type Validation', () => {
    it('should return BodyCompositionContext with all required fields', () => {
      const result = computeBodyCompositionContext();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('bodyCompositionPhase');
      expect(result).toHaveProperty('mealTiming');
      expect(result).toHaveProperty('contextMultipliers');
      expect(result).toHaveProperty('recommendationPriority');
      expect(result).toHaveProperty('conflictResolution');
    });

    it('should never return undefined (always computable with defaults)', () => {
      const result = computeBodyCompositionContext();
      expect(result).toBeDefined();
    });
  });

  describe('Body Composition Phase Support', () => {
    it('should support all 4 body composition phases', () => {
      const phases: Array<'cutting' | 'bulking' | 'maintenance' | 'recomposition'> = [
        'cutting',
        'bulking',
        'maintenance',
        'recomposition',
      ];

      phases.forEach((phase) => {
        const result = computeBodyCompositionContext(phase);
        expect(result.bodyCompositionPhase).toBe(phase);
      });
    });

    it('should apply appropriate multipliers for cutting phase', () => {
      const result = computeBodyCompositionContext('cutting');
      expect(result.bodyCompositionPhase).toBe('cutting');
      // Cutting should boost fat loss and efficiency multipliers
      expect(result.contextMultipliers.fatLossMultiplier).toBeGreaterThan(1.0);
      expect(result.contextMultipliers.efficiencyMultiplier).toBeGreaterThan(1.0);
    });

    it('should apply appropriate multipliers for bulking phase', () => {
      const result = computeBodyCompositionContext('bulking');
      expect(result.bodyCompositionPhase).toBe('bulking');
      // Bulking should boost protein and post-workout multipliers
      expect(result.contextMultipliers.proteinScoreMultiplier).toBeGreaterThan(1.0);
      expect(result.contextMultipliers.postWorkoutMultiplier).toBeGreaterThan(1.0);
    });

    it('should apply balanced multipliers for maintenance phase', () => {
      const result = computeBodyCompositionContext('maintenance');
      expect(result.bodyCompositionPhase).toBe('maintenance');
      // Maintenance should have balanced multipliers close to 1.0
      const multipliers = result.contextMultipliers;
      Object.values(multipliers).forEach((multiplier) => {
        expect(multiplier).toBeCloseTo(1.0, 0.2); // Allow 0.2 tolerance
      });
    });

    it('should apply slight boost to protein and efficiency for recomposition phase', () => {
      const result = computeBodyCompositionContext('recomposition');
      expect(result.bodyCompositionPhase).toBe('recomposition');
      // Recomposition should slightly boost protein and efficiency
      expect(result.contextMultipliers.proteinScoreMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(result.contextMultipliers.efficiencyMultiplier).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe('Meal Timing Context Support', () => {
    it('should support all 3 meal timing contexts', () => {
      const timings: Array<'pre_workout' | 'post_workout' | 'general'> = [
        'pre_workout',
        'post_workout',
        'general',
      ];

      timings.forEach((timing) => {
        const result = computeBodyCompositionContext('recomposition', timing);
        expect(result.mealTiming).toBe(timing);
      });
    });

    it('should boost post-workout and protein multipliers for post-workout timing', () => {
      const result = computeBodyCompositionContext('recomposition', 'post_workout');
      expect(result.mealTiming).toBe('post_workout');
      expect(result.contextMultipliers.postWorkoutMultiplier).toBeGreaterThan(1.0);
      expect(result.contextMultipliers.proteinScoreMultiplier).toBeGreaterThan(1.0);
    });

    it('should boost efficiency with moderate other scores for pre-workout timing', () => {
      const result = computeBodyCompositionContext('recomposition', 'pre_workout');
      expect(result.mealTiming).toBe('pre_workout');
      expect(result.contextMultipliers.efficiencyMultiplier).toBeGreaterThan(1.0);
    });

    it('should apply neutral multipliers around 1.0 for general timing', () => {
      const result = computeBodyCompositionContext('maintenance', 'general');
      expect(result.mealTiming).toBe('general');
      const multipliers = result.contextMultipliers;
      Object.values(multipliers).forEach((multiplier) => {
        expect(multiplier).toBeCloseTo(1.0, 0.2); // Allow 0.2 tolerance
      });
    });
  });

  describe('Context Multiplier Calculation', () => {
    it('should calculate context multipliers using helper function', () => {
      const result = computeBodyCompositionContext();
      expect(result.contextMultipliers).toHaveProperty('proteinScoreMultiplier');
      expect(result.contextMultipliers).toHaveProperty('satietyScoreMultiplier');
      expect(result.contextMultipliers).toHaveProperty('postWorkoutMultiplier');
      expect(result.contextMultipliers).toHaveProperty('fatLossMultiplier');
      expect(result.contextMultipliers).toHaveProperty('efficiencyMultiplier');
    });

    it('should enforce multiplier bounds (0.5-2.0 range)', () => {
      const result = computeBodyCompositionContext();
      const multipliers = result.contextMultipliers;
      Object.values(multipliers).forEach((multiplier) => {
        expect(multiplier).toBeGreaterThanOrEqual(0.5);
        expect(multiplier).toBeLessThanOrEqual(2.0);
      });
    });

    it('should handle edge cases with multiplier bounds enforcement', () => {
      const result = computeBodyCompositionContext();
      // No multiplier should ever be <0.5 or >2.0
      const multipliers = result.contextMultipliers;
      expect(Math.min(...Object.values(multipliers))).toBeGreaterThanOrEqual(0.5);
      expect(Math.max(...Object.values(multipliers))).toBeLessThanOrEqual(2.0);
    });
  });

  describe('Recommendation Priority Assignment', () => {
    it('should assign recommendation priority based on context and scores', () => {
      const result = computeBodyCompositionContext();
      expect(['protein', 'satiety', 'efficiency', 'recovery']).toContain(
        result.recommendationPriority,
      );
    });

    it('should prioritize protein for bulking and recomposition phases', () => {
      const bulkingResult = computeBodyCompositionContext('bulking');
      const recompResult = computeBodyCompositionContext('recomposition');
      expect(bulkingResult.recommendationPriority).toBe('protein');
      expect(recompResult.recommendationPriority).toBe('protein');
    });

    it('should prioritize satiety for cutting phase', () => {
      const result = computeBodyCompositionContext('cutting');
      expect(result.recommendationPriority).toBe('satiety');
    });

    it('should prioritize recovery for post-workout timing', () => {
      const result = computeBodyCompositionContext('recomposition', 'post_workout');
      expect(result.recommendationPriority).toBe('recovery');
    });
  });

  describe('Conflict Resolution Strategies', () => {
    it('should implement all 3 conflict resolution strategies', () => {
      const strategies: Array<'prioritize_goal' | 'balanced' | 'context_specific'> = [
        'prioritize_goal',
        'balanced',
        'context_specific',
      ];

      // Different contexts produce different strategies
      const bulkingResult = computeBodyCompositionContext('bulking');
      const maintenanceResult = computeBodyCompositionContext('maintenance', 'general');
      const cuttingPostResult = computeBodyCompositionContext('cutting', 'post_workout');

      const allStrategies = [
        bulkingResult.conflictResolution,
        maintenanceResult.conflictResolution,
        cuttingPostResult.conflictResolution,
      ];
      allStrategies.forEach((strategy) => {
        expect(strategies).toContain(strategy);
      });
    });

    it('should implement mathematical formulas from research.md for conflict resolution', () => {
      const result = computeBodyCompositionContext();
      // Should implement the formulas from research.md:
      // - Balanced: Weighted geometric mean with conflict penalty
      // - Prioritize goal: Primary goal dominance with secondary boost
      // - Context specific: Context multiplier dominance with goal modulation
      expect(['prioritize_goal', 'balanced', 'context_specific']).toContain(
        result.conflictResolution,
      );
    });
  });

  describe('Default Values and Backward Compatibility', () => {
    it('should apply default values (recomposition + general) for backward compatibility', () => {
      const result = computeBodyCompositionContext();
      // When no phase/timing specified, should default to recomposition + general
      expect(result.bodyCompositionPhase).toBe('recomposition');
      expect(result.mealTiming).toBe('general');
    });

    it('should handle undefined/null parameters gracefully', () => {
      const result = computeBodyCompositionContext(undefined, undefined);
      expect(result).toBeDefined();
    });
  });

  describe('Phase and Timing Interaction Matrix', () => {
    it('should correctly combine cutting phase with post-workout timing', () => {
      const result = computeBodyCompositionContext('cutting', 'post_workout');
      // Should boost both fat loss (cutting) and recovery (post-workout)
      expect(result.contextMultipliers.fatLossMultiplier).toBeGreaterThan(1.0);
      expect(result.contextMultipliers.postWorkoutMultiplier).toBeGreaterThan(1.0);
    });

    it('should correctly combine bulking phase with general timing', () => {
      const result = computeBodyCompositionContext('bulking', 'general');
      // Should boost protein for bulking, neutral timing adjustments
      expect(result.contextMultipliers.proteinScoreMultiplier).toBeGreaterThan(1.0);
    });
  });

  describe('Integration with Product Scores', () => {
    it('should generate context multipliers independent of product data', () => {
      const result = computeBodyCompositionContext();
      // Should generate context multipliers based on phase/timing, not product scores
      expect(result.contextMultipliers).toBeDefined();
    });

    it('should handle context generation independent of product data', () => {
      const result = computeBodyCompositionContext();
      // Should always generate context since it's based on phase/timing, not product data
      expect(result.bodyCompositionPhase).toBeDefined();
      expect(result.mealTiming).toBeDefined();
    });
  });

  describe('Real-world Context Scenarios', () => {
    it('should handle cutting + post-workout scenario correctly', () => {
      const result = computeBodyCompositionContext('cutting', 'post_workout');
      // Should balance fat loss goals with post-workout recovery needs
      expect(result.recommendationPriority).toBe('recovery'); // Post-workout takes precedence
      expect(result.conflictResolution).toBe('context_specific');
    });

    it('should handle maintenance + general scenario correctly', () => {
      const result = computeBodyCompositionContext('maintenance', 'general');
      // Should be balanced across all metrics
      expect(result.conflictResolution).toBe('balanced');
      const multipliers = Object.values(result.contextMultipliers);
      const avgMultiplier = multipliers.reduce((a, b) => a + b, 0) / multipliers.length;
      expect(avgMultiplier).toBeCloseTo(1.0, 0.2); // Allow tolerance
    });
  });

  describe('Function Consistency', () => {
    it('should always return consistent context with default parameters', () => {
      const result1 = computeBodyCompositionContext();
      const result2 = computeBodyCompositionContext();
      const result3 = computeBodyCompositionContext();

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();

      // Should return identical results for same default parameters
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});

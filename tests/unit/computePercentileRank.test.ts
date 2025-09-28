import { describe, it, expect } from 'vitest';
import { computePercentileRank } from '../../src/data/transform/compute/computePercentileRank';

describe('computePercentileRank - Unit Tests', () => {
  describe('Known Dataset Percentile Calculations', () => {
    it('should calculate correct percentiles for known dataset [-5, -2, 0, 3, 8, 12, 15]', () => {
      const scores = [-5, -2, 0, 3, 8, 12, 15]; // 7 products

      // Test each score's expected percentile rank using midpoint method
      expect(computePercentileRank(-5, scores)).toBeCloseTo(0.071, 3); // (0 + 0.5) / 7
      expect(computePercentileRank(-2, scores)).toBeCloseTo(0.214, 3); // (1 + 0.5) / 7
      expect(computePercentileRank(0, scores)).toBeCloseTo(0.357, 3); // (2 + 0.5) / 7
      expect(computePercentileRank(3, scores)).toBeCloseTo(0.5, 3); // (3 + 0.5) / 7
      expect(computePercentileRank(8, scores)).toBeCloseTo(0.643, 3); // (4 + 0.5) / 7
      expect(computePercentileRank(12, scores)).toBeCloseTo(0.786, 3); // (5 + 0.5) / 7
      expect(computePercentileRank(15, scores)).toBeCloseTo(0.929, 3); // (6 + 0.5) / 7
    });

    it('should handle larger known dataset correctly', () => {
      const scores = [-10, -5, -1, 0, 2, 5, 8, 10, 15, 20]; // 10 products

      // Test specific percentiles using midpoint method
      expect(computePercentileRank(-10, scores)).toBeCloseTo(0.05, 3); // (0 + 0.5) / 10
      expect(computePercentileRank(0, scores)).toBeCloseTo(0.35, 3); // (3 + 0.5) / 10
      expect(computePercentileRank(8, scores)).toBeCloseTo(0.65, 3); // (6 + 0.5) / 10
      expect(computePercentileRank(20, scores)).toBeCloseTo(0.95, 3); // (9 + 0.5) / 10
    });
  });

  describe('Duplicate Score Handling', () => {
    it('should maintain deterministic ranking for duplicate scores', () => {
      const scoresWithDuplicates = [0, 0, 0, 5, 5, 10]; // 6 products with duplicates

      const rank1 = computePercentileRank(0, scoresWithDuplicates);
      const rank2 = computePercentileRank(0, scoresWithDuplicates);
      const rank3 = computePercentileRank(0, scoresWithDuplicates);

      // All identical scores should get same percentile
      expect(rank1).toBe(rank2);
      expect(rank2).toBe(rank3);
    });

    it('should handle arrays with all identical scores', () => {
      const identicalScores = [5, 5, 5, 5, 5]; // All same score

      const rank = computePercentileRank(5, identicalScores);
      expect(rank).toBeCloseTo(0.5, 2); // Middle percentile for identical scores
    });

    it('should handle duplicates at boundaries correctly', () => {
      const scores = [0, 0, 5, 5, 10, 10]; // Duplicates at each level

      const lowRank = computePercentileRank(0, scores);
      const midRank = computePercentileRank(5, scores);
      const highRank = computePercentileRank(10, scores);

      // Should maintain order: low < mid < high
      expect(lowRank).toBeLessThan(midRank);
      expect(midRank).toBeLessThan(highRank);
    });
  });

  describe('Edge Cases', () => {
    it('should return 0.5 for single element array', () => {
      const singleScore = [5];
      const rank = computePercentileRank(5, singleScore);
      expect(rank).toBe(0.5);
    });

    it('should return 0.5 for single element with different query score', () => {
      const singleScore = [5];
      const rank = computePercentileRank(3, singleScore);
      expect(rank).toBe(0.5); // Still middle rank
    });

    it('should throw meaningful error for empty array', () => {
      const emptyArray: number[] = [];
      expect(() => computePercentileRank(5, emptyArray)).toThrow();
      expect(() => computePercentileRank(5, emptyArray)).toThrow(/empty/i);
    });

    it('should handle two-element arrays correctly', () => {
      const twoScores = [3, 7];

      const lowRank = computePercentileRank(3, twoScores);
      const highRank = computePercentileRank(7, twoScores);

      expect(lowRank).toBeLessThan(0.5);
      expect(highRank).toBeGreaterThan(0.5);
    });
  });

  describe('Negative Score Handling', () => {
    it('should handle negative scores correctly', () => {
      const negativeScores = [-20, -10, -5, 0, 5];

      const veryLowRank = computePercentileRank(-20, negativeScores);
      const lowRank = computePercentileRank(-10, negativeScores);
      const zeroRank = computePercentileRank(0, negativeScores);
      const positiveRank = computePercentileRank(5, negativeScores);

      // Should maintain proper order
      expect(veryLowRank).toBeLessThan(lowRank);
      expect(lowRank).toBeLessThan(zeroRank);
      expect(zeroRank).toBeLessThan(positiveRank);
    });

    it('should handle all-negative score arrays', () => {
      const allNegative = [-50, -30, -20, -10, -5];

      allNegative.forEach((score) => {
        const rank = computePercentileRank(score, allNegative);
        expect(rank).toBeGreaterThanOrEqual(0);
        expect(rank).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle 1000+ elements efficiently', () => {
      // Create array of 1000 elements: -500 to 499
      const largeScores = Array.from({ length: 1000 }, (_, i) => i - 500);

      const startTime = Date.now();

      // Test multiple percentile calculations
      const testScores = [-400, -200, 0, 200, 400];
      testScores.forEach((score) => {
        const rank = computePercentileRank(score, largeScores);
        expect(rank).toBeGreaterThanOrEqual(0);
        expect(rank).toBeLessThanOrEqual(1);
      });

      const endTime = Date.now();

      // Should complete in reasonable time (< 50ms for 5 calculations)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle 10000+ elements with consistent performance', () => {
      // Create array of 10000 elements
      const veryLargeScores = Array.from({ length: 10000 }, (_, i) => Math.random() * 1000 - 500);

      const startTime = Date.now();
      const rank = computePercentileRank(0, veryLargeScores);
      const endTime = Date.now();

      expect(rank).toBeGreaterThanOrEqual(0);
      expect(rank).toBeLessThanOrEqual(1);
      // Should complete in reasonable time (< 20ms)
      expect(endTime - startTime).toBeLessThan(20);
    });
  });

  describe('Unsorted Array Handling', () => {
    it('should handle unsorted arrays gracefully', () => {
      const unsortedScores = [15, 3, -2, 8, 0, 12, -5]; // Unsorted version of known dataset

      // Should produce same results as sorted version
      const sortedScores = [-5, -2, 0, 3, 8, 12, 15];

      const testScore = 8;
      const unsortedRank = computePercentileRank(testScore, unsortedScores);
      const sortedRank = computePercentileRank(testScore, sortedScores);

      expect(unsortedRank).toBeCloseTo(sortedRank, 3);
    });

    it('should handle randomly ordered arrays', () => {
      const orderedScores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffledScores = [7, 2, 9, 1, 5, 10, 3, 8, 4, 6];

      const testScore = 5;
      const orderedRank = computePercentileRank(testScore, orderedScores);
      const shuffledRank = computePercentileRank(testScore, shuffledScores);

      expect(orderedRank).toBeCloseTo(shuffledRank, 3);
    });
  });

  describe('Score Not in Array', () => {
    it('should handle scores between array values', () => {
      const scores = [0, 10, 20, 30, 40];

      // Test intermediate values
      const rank15 = computePercentileRank(15, scores); // Between 10 and 20
      const rank25 = computePercentileRank(25, scores); // Between 20 and 30

      expect(rank15).toBeGreaterThan(0);
      expect(rank15).toBeLessThan(1);
      expect(rank25).toBeGreaterThan(rank15); // Should be higher percentile
    });

    it('should handle scores outside array range', () => {
      const scores = [10, 20, 30, 40, 50];

      // Below minimum
      const belowRank = computePercentileRank(5, scores);
      expect(belowRank).toBeGreaterThanOrEqual(0);
      expect(belowRank).toBeLessThan(0.5);

      // Above maximum
      const aboveRank = computePercentileRank(55, scores);
      expect(aboveRank).toBeGreaterThan(0.5);
      expect(aboveRank).toBeLessThanOrEqual(1);
    });
  });

  describe('Precision and Determinism', () => {
    it('should return consistent results with 3 decimal precision', () => {
      const scores = [-5, -2, 0, 3, 8, 12, 15];

      // Multiple calls should return identical results
      const results = Array.from({ length: 10 }, () => computePercentileRank(8, scores));

      const firstResult = results[0];
      results.forEach((result) => {
        expect(result).toBe(firstResult);
      });

      // Should have reasonable precision (3 decimal places)
      expect(firstResult.toString()).toMatch(/^\d+\.\d{1,3}$/);
    });

    it('should handle floating-point scores correctly', () => {
      const floatingScores = [1.1, 2.7, 3.14, 4.999, 5.0001];

      const rank = computePercentileRank(3.14, floatingScores);
      expect(rank).toBeGreaterThanOrEqual(0);
      expect(rank).toBeLessThanOrEqual(1);
    });
  });

  describe('Mathematical Properties', () => {
    it('should maintain monotonic ordering', () => {
      const scores = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

      // Lower scores should get lower percentiles
      const ranks = scores.map((score) => computePercentileRank(score, scores));

      for (let i = 1; i < ranks.length; i++) {
        expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i - 1]);
      }
    });

    it('should have symmetric behavior for symmetric datasets', () => {
      const symmetricScores = [-10, -5, 0, 5, 10];

      const negativeRank = computePercentileRank(-5, symmetricScores);
      const positiveRank = computePercentileRank(5, symmetricScores);

      // Should be symmetric around center
      expect(negativeRank + positiveRank).toBeCloseTo(1.0, 2);
    });

    it('should handle boundary conditions consistently', () => {
      const scores = [0, 1, 2, 3, 4];

      // First and last elements should get extreme percentiles
      const firstRank = computePercentileRank(0, scores);
      const lastRank = computePercentileRank(4, scores);

      expect(firstRank).toBeLessThan(0.3);
      expect(lastRank).toBeGreaterThan(0.7);
    });
  });

  describe('Integration Requirements', () => {
    it('should not modify input array', () => {
      const originalScores = [5, 2, 8, 1, 9];
      const scoresCopy = [...originalScores];

      computePercentileRank(5, originalScores);

      // Original array should be unchanged
      expect(originalScores).toEqual(scoresCopy);
    });

    it('should work with various numeric types', () => {
      const intScores = [1, 2, 3, 4, 5];
      const floatScores = [1.1, 2.2, 3.3, 4.4, 5.5];
      const mixedScores = [1, 2.5, 3, 4.7, 5];

      expect(() => computePercentileRank(3, intScores)).not.toThrow();
      expect(() => computePercentileRank(3.3, floatScores)).not.toThrow();
      expect(() => computePercentileRank(2.5, mixedScores)).not.toThrow();
    });

    it('should have O(log N) performance characteristics', () => {
      // Test with increasing array sizes
      const sizes = [100, 1000, 10000];
      const times: number[] = [];

      sizes.forEach((size) => {
        const scores = Array.from({ length: size }, (_, i) => i);

        const startTime = Date.now();
        computePercentileRank(size / 2, scores);
        const endTime = Date.now();

        times.push(endTime - startTime);
      });

      // Each 10x increase should not increase time by more than 4x (generous O(log N) test)
      if (times.length >= 2 && times[0] > 0) {
        expect(times[1] / times[0]).toBeLessThan(4);
      }
      if (times.length >= 3 && times[1] > 0) {
        expect(times[2] / times[1]).toBeLessThan(4);
      }
    });
  });
});

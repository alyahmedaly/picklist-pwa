import { describe, it, expect } from 'vitest';
import { computePercentileRank } from '../../src/data/transform/compute/computePercentileRank';

describe('computePercentileRank - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept number score and number array', () => {
      const scores = [-5, -2, 0, 3, 8, 12, 15];

      expect(() => computePercentileRank(8, scores)).not.toThrow();
      expect(() => computePercentileRank(-5, scores)).not.toThrow();
      expect(() => computePercentileRank(15, scores)).not.toThrow();
    });

    it('should accept negative scores and handle gracefully', () => {
      const scores = [-10, -5, 0, 5, 10];

      expect(() => computePercentileRank(-5, scores)).not.toThrow();
      expect(() => computePercentileRank(-15, scores)).not.toThrow();
    });
  });

  describe('Return Type Validation', () => {
    it('should return number in range [0, 1]', () => {
      const scores = [-5, -2, 0, 3, 8, 12, 15];

      const result = computePercentileRank(8, scores);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should return consistent percentile for known dataset', () => {
      const scores = [-5, -2, 0, 3, 8, 12, 15]; // 7 products

      // Score 12 should be 6th out of 7 (5 scores less + 0.5 * 1 equal) / 7 = 0.786
      const result = computePercentileRank(12, scores);
      expect(result).toBeCloseTo(0.786, 3);
    });
  });

  describe('Edge Cases', () => {
    it('should return 0.5 for single score array', () => {
      const singleScore = [5];
      const result = computePercentileRank(5, singleScore);
      expect(result).toBe(0.5);
    });

    it('should throw error for empty array', () => {
      const emptyArray: number[] = [];
      expect(() => computePercentileRank(5, emptyArray)).toThrow();
    });

    it('should handle duplicate scores consistently', () => {
      const scoresWithDuplicates = [0, 0, 0, 5, 5, 10];

      const rank1 = computePercentileRank(0, scoresWithDuplicates);
      const rank2 = computePercentileRank(0, scoresWithDuplicates);

      // Should return identical percentile for identical score
      expect(rank1).toBe(rank2);
    });

    it('should handle score not in array', () => {
      const scores = [0, 5, 10, 15, 20];

      // Score 7 is between 5 and 10
      const result = computePercentileRank(7, scores);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('Mathematical Properties', () => {
    it('should maintain order relationship', () => {
      const scores = [-5, -2, 0, 3, 8, 12, 15];

      const lowRank = computePercentileRank(-5, scores);
      const midRank = computePercentileRank(3, scores);
      const highRank = computePercentileRank(15, scores);

      expect(lowRank).toBeLessThan(midRank);
      expect(midRank).toBeLessThan(highRank);
    });

    it('should handle boundary values correctly', () => {
      const scores = [0, 10, 20, 30, 40];

      // Lowest score should get low percentile
      const minRank = computePercentileRank(0, scores);
      expect(minRank).toBeLessThan(0.5);

      // Highest score should get high percentile
      const maxRank = computePercentileRank(40, scores);
      expect(maxRank).toBeGreaterThan(0.5);
    });
  });

  describe('Input Validation', () => {
    it('should handle unsorted arrays gracefully', () => {
      const unsortedScores = [15, 3, -2, 8, 0, 12, -5];

      // Should not throw error and should return valid percentile
      const result = computePercentileRank(8, unsortedScores);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle large datasets efficiently', () => {
      // Create array of 1000 elements
      const largeScores = Array.from({ length: 1000 }, (_, i) => i - 500);

      const startTime = Date.now();
      const result = computePercentileRank(0, largeScores);
      const endTime = Date.now();

      // Should complete in reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(result).toBeCloseTo(0.5, 1);
    });
  });

  describe('Integration Requirements', () => {
    it('should be a pure function (no side effects)', () => {
      const scores = [-5, -2, 0, 3, 8, 12, 15];
      const originalScores = [...scores];

      computePercentileRank(8, scores);

      // Scores array should remain unchanged
      expect(scores).toEqual(originalScores);
    });

    it('should return deterministic results', () => {
      const scores = [1, 2, 3, 4, 5];

      const result1 = computePercentileRank(3, scores);
      const result2 = computePercentileRank(3, scores);

      expect(result1).toBe(result2);
    });
  });
});

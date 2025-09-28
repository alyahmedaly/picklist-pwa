import { describe, it, expect } from 'vitest';
import { computeHealthGrade } from '../../src/data/transform/computeHealthGrade';

describe('computeHealthGrade - Unit Tests', () => {
  describe('Exact Boundary Conditions', () => {
    it('should handle A/B boundary at 0.8 correctly', () => {
      expect(computeHealthGrade(0.8)).toBe('A'); // Exactly at boundary -> A
      expect(computeHealthGrade(0.8001)).toBe('A'); // Just above boundary -> A
      expect(computeHealthGrade(0.7999)).toBe('B'); // Just below boundary -> B
    });

    it('should handle B/C boundary at 0.6 correctly', () => {
      expect(computeHealthGrade(0.6)).toBe('B'); // Exactly at boundary -> B
      expect(computeHealthGrade(0.6001)).toBe('B'); // Just above boundary -> B
      expect(computeHealthGrade(0.5999)).toBe('C'); // Just below boundary -> C
    });

    it('should handle C/D boundary at 0.4 correctly', () => {
      expect(computeHealthGrade(0.4)).toBe('C'); // Exactly at boundary -> C
      expect(computeHealthGrade(0.4001)).toBe('C'); // Just above boundary -> C
      expect(computeHealthGrade(0.3999)).toBe('D'); // Just below boundary -> D
    });

    it('should handle D/E boundary at 0.2 correctly', () => {
      expect(computeHealthGrade(0.2)).toBe('D'); // Exactly at boundary -> D
      expect(computeHealthGrade(0.2001)).toBe('D'); // Just above boundary -> D
      expect(computeHealthGrade(0.1999)).toBe('E'); // Just below boundary -> E
    });
  });

  describe('Grade Range Validation', () => {
    it('should assign grade A for 80th-100th percentile (0.8-1.0)', () => {
      const aGradePercentiles = [0.8, 0.85, 0.9, 0.95, 1.0];

      aGradePercentiles.forEach((percentile) => {
        expect(computeHealthGrade(percentile)).toBe('A');
      });
    });

    it('should assign grade B for 60th-80th percentile (0.6-0.8)', () => {
      const bGradePercentiles = [0.6, 0.65, 0.7, 0.75, 0.79];

      bGradePercentiles.forEach((percentile) => {
        expect(computeHealthGrade(percentile)).toBe('B');
      });
    });

    it('should assign grade C for 40th-60th percentile (0.4-0.6)', () => {
      const cGradePercentiles = [0.4, 0.45, 0.5, 0.55, 0.59];

      cGradePercentiles.forEach((percentile) => {
        expect(computeHealthGrade(percentile)).toBe('C');
      });
    });

    it('should assign grade D for 20th-40th percentile (0.2-0.4)', () => {
      const dGradePercentiles = [0.2, 0.25, 0.3, 0.35, 0.39];

      dGradePercentiles.forEach((percentile) => {
        expect(computeHealthGrade(percentile)).toBe('D');
      });
    });

    it('should assign grade E for 0th-20th percentile (0.0-0.2)', () => {
      const eGradePercentiles = [0.0, 0.05, 0.1, 0.15, 0.19];

      eGradePercentiles.forEach((percentile) => {
        expect(computeHealthGrade(percentile)).toBe('E');
      });
    });
  });

  describe('Extreme Value Handling', () => {
    it('should handle perfect percentile (1.0)', () => {
      expect(computeHealthGrade(1.0)).toBe('A');
    });

    it('should handle worst percentile (0.0)', () => {
      expect(computeHealthGrade(0.0)).toBe('E');
    });

    it('should handle middle percentile (0.5)', () => {
      expect(computeHealthGrade(0.5)).toBe('C');
    });
  });

  describe('Floating-Point Precision Edge Cases', () => {
    it('should handle floating-point precision at boundaries', () => {
      // Test values very close to boundaries (within floating-point precision)
      const precisionTests = [
        { percentile: 0.8000000000001, expectedGrade: 'A' },
        { percentile: 0.7999999999999, expectedGrade: 'B' },
        { percentile: 0.6000000000001, expectedGrade: 'B' },
        { percentile: 0.5999999999999, expectedGrade: 'C' },
        { percentile: 0.4000000000001, expectedGrade: 'C' },
        { percentile: 0.3999999999999, expectedGrade: 'D' },
        { percentile: 0.2000000000001, expectedGrade: 'D' },
        { percentile: 0.1999999999999, expectedGrade: 'E' },
      ];

      precisionTests.forEach(({ percentile, expectedGrade }) => {
        expect(computeHealthGrade(percentile)).toBe(expectedGrade);
      });
    });

    it('should handle computed percentiles from real calculations', () => {
      // These are typical percentiles that might result from real percentile calculations
      const realPercentiles = [
        0.8571428571428571, // Should be A
        0.7142857142857143, // Should be B
        0.5714285714285714, // Should be C
        0.3571428571428571, // Should be D
        0.07142857142857142, // Should be E
      ];

      expect(computeHealthGrade(realPercentiles[0])).toBe('A');
      expect(computeHealthGrade(realPercentiles[1])).toBe('B');
      expect(computeHealthGrade(realPercentiles[2])).toBe('C');
      expect(computeHealthGrade(realPercentiles[3])).toBe('D');
      expect(computeHealthGrade(realPercentiles[4])).toBe('E');
    });
  });

  describe('Input Validation', () => {
    it('should throw error for negative percentiles', () => {
      expect(() => computeHealthGrade(-0.1)).toThrow();
      expect(() => computeHealthGrade(-1.0)).toThrow();
      expect(() => computeHealthGrade(-0.5)).toThrow();
    });

    it('should throw error for percentiles > 1.0', () => {
      expect(() => computeHealthGrade(1.1)).toThrow();
      expect(() => computeHealthGrade(2.0)).toThrow();
      expect(() => computeHealthGrade(1.5)).toThrow();
    });

    it('should throw error for invalid inputs', () => {
      expect(() => computeHealthGrade(NaN)).toThrow();
      expect(() => computeHealthGrade(Infinity)).toThrow();
      expect(() => computeHealthGrade(-Infinity)).toThrow();
    });

    it('should provide meaningful error messages', () => {
      expect(() => computeHealthGrade(-0.1)).toThrow(/range.*0.*1/i);
      expect(() => computeHealthGrade(1.1)).toThrow(/range.*0.*1/i);
      expect(() => computeHealthGrade(NaN)).toThrow(/invalid/i);
    });
  });

  describe('Grade Distribution Validation', () => {
    it('should distribute 100 uniform percentiles evenly across grades', () => {
      // Generate 100 percentiles from 0 to 1 (inclusive)
      const percentiles = Array.from({ length: 101 }, (_, i) => i / 100);
      const grades = percentiles.map((p) => computeHealthGrade(p));

      const distribution = {
        A: grades.filter((g) => g === 'A').length,
        B: grades.filter((g) => g === 'B').length,
        C: grades.filter((g) => g === 'C').length,
        D: grades.filter((g) => g === 'D').length,
        E: grades.filter((g) => g === 'E').length,
      };

      // Each grade should represent approximately 20% (±2% tolerance)
      // With 101 samples, each grade should get ~20 samples (±2)
      Object.values(distribution).forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(18); // At least 18%
        expect(count).toBeLessThanOrEqual(23); // At most 23%
      });
    });

    it('should maintain exactly 20% boundaries', () => {
      // Test the exact 20% marks
      const twentyPercentMarks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
      const expectedGrades = ['E', 'D', 'C', 'B', 'A', 'A'];

      twentyPercentMarks.forEach((percentile, index) => {
        expect(computeHealthGrade(percentile)).toBe(expectedGrades[index]);
      });
    });
  });

  describe('Consistency and Determinism', () => {
    it('should return consistent results for repeated calls', () => {
      const testPercentiles = [0.1, 0.3, 0.5, 0.7, 0.9];

      testPercentiles.forEach((percentile) => {
        const results = Array.from({ length: 10 }, () => computeHealthGrade(percentile));

        // All results should be identical
        const firstResult = results[0];
        results.forEach((result) => {
          expect(result).toBe(firstResult);
        });
      });
    });

    it('should maintain monotonic ordering', () => {
      // Lower percentiles should never get better grades than higher percentiles
      const sortedPercentiles = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
      const grades = sortedPercentiles.map((p) => computeHealthGrade(p));

      const gradeOrder = { E: 0, D: 1, C: 2, B: 3, A: 4 };

      for (let i = 1; i < grades.length; i++) {
        const currentGradeValue = gradeOrder[grades[i]];
        const previousGradeValue = gradeOrder[grades[i - 1]];

        // Current grade should be same or better than previous
        expect(currentGradeValue).toBeGreaterThanOrEqual(previousGradeValue);
      }
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle percentiles from actual percentile calculations', () => {
      // These percentiles might come from computePercentileRank
      const realWorldPercentiles = [
        0.07142857142857142, // 1st out of 14 products
        0.21428571428571427, // 3rd out of 14 products
        0.5, // 7th out of 14 products (median)
        0.7857142857142857, // 11th out of 14 products
        0.9285714285714286, // 13th out of 14 products
      ];

      const grades = realWorldPercentiles.map((p) => computeHealthGrade(p));

      expect(grades[0]).toBe('E'); // Bottom percentile
      expect(grades[1]).toBe('D'); // Low percentile
      expect(grades[2]).toBe('C'); // Middle percentile
      expect(grades[3]).toBe('B'); // High percentile
      expect(grades[4]).toBe('A'); // Top percentile
    });

    it('should work with percentiles from uniform distribution', () => {
      // Simulate percentiles that would come from a perfectly uniform score distribution
      const uniformPercentiles = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

      const grades = uniformPercentiles.map((p) => computeHealthGrade(p));
      const expectedGrades = ['E', 'D', 'D', 'C', 'C', 'B', 'B', 'A', 'A', 'A'];

      grades.forEach((grade, index) => {
        expect(grade).toBe(expectedGrades[index]);
      });
    });
  });

  describe('Mathematical Properties', () => {
    it('should create equal-sized buckets for uniform distribution', () => {
      // Create 1000 uniformly distributed percentiles
      const percentiles = Array.from({ length: 1000 }, (_, i) => i / 999);
      const grades = percentiles.map((p) => computeHealthGrade(p));

      const distribution = {
        A: grades.filter((g) => g === 'A').length,
        B: grades.filter((g) => g === 'B').length,
        C: grades.filter((g) => g === 'C').length,
        D: grades.filter((g) => g === 'D').length,
        E: grades.filter((g) => g === 'E').length,
      };

      // Each bucket should have approximately 200 items (20% of 1000)
      // Allow ±1% tolerance (±10 items)
      Object.values(distribution).forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(190);
        expect(count).toBeLessThanOrEqual(210);
      });
    });

    it('should have complementary symmetry for mirrored percentiles', () => {
      const testPairs = [
        [0.1, 0.9], // E and A
        [0.3, 0.7], // D and B
        [0.45, 0.55], // Both C
      ];

      testPairs.forEach(([low, high]) => {
        const lowGrade = computeHealthGrade(low);
        const highGrade = computeHealthGrade(high);

        const gradeOrder = ['E', 'D', 'C', 'B', 'A'];
        const lowIndex = gradeOrder.indexOf(lowGrade);
        const highIndex = gradeOrder.indexOf(highGrade);

        // Higher percentile should get same or better grade
        expect(highIndex).toBeGreaterThanOrEqual(lowIndex);
      });
    });
  });

  describe('Integration Requirements', () => {
    it('should be a pure function with no side effects', () => {
      const testPercentile = 0.75;

      // Function should not modify any external state
      const grade1 = computeHealthGrade(testPercentile);
      const grade2 = computeHealthGrade(testPercentile);

      expect(grade1).toBe(grade2);
      expect(grade1).toBe('B'); // 75th percentile should be B
    });

    it('should work correctly with percentiles from percentile ranking function', () => {
      // Simulate the integration with computePercentileRank
      const mockPercentileResults = [
        { score: -10, percentile: 0.1 },
        { score: -5, percentile: 0.3 },
        { score: 0, percentile: 0.5 },
        { score: 5, percentile: 0.7 },
        { score: 10, percentile: 0.9 },
      ];

      const grades = mockPercentileResults.map(({ percentile }) => computeHealthGrade(percentile));

      expect(grades).toEqual(['E', 'D', 'C', 'B', 'A']);
    });

    it('should handle edge cases that might arise from percentile calculations', () => {
      // Edge cases that might result from actual percentile ranking
      const edgeCases = [
        0.0, // Worst score in dataset
        0.00001, // Nearly worst
        0.19999, // Just below D threshold
        0.49999, // Just below C threshold
        0.99999, // Nearly perfect
        1.0, // Perfect score
      ];

      const grades = edgeCases.map((p) => computeHealthGrade(p));

      expect(grades[0]).toBe('E');
      expect(grades[1]).toBe('E');
      expect(grades[2]).toBe('E');
      expect(grades[3]).toBe('C'); // Around middle (0.49999 is still in C range)
      expect(grades[4]).toBe('A');
      expect(grades[5]).toBe('A');
    });
  });
});

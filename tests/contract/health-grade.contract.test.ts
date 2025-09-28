import { describe, it, expect } from 'vitest';
import { computeHealthGrade } from '../../src/data/transform/computeHealthGrade';
import type { HealthGrade } from '../../src/data/transform/types';

describe('computeHealthGrade - Contract Tests', () => {
  describe('Function Signature', () => {
    it('should accept number percentile in range [0, 1]', () => {
      expect(() => computeHealthGrade(0.0)).not.toThrow();
      expect(() => computeHealthGrade(0.5)).not.toThrow();
      expect(() => computeHealthGrade(1.0)).not.toThrow();
      expect(() => computeHealthGrade(0.85)).not.toThrow();
    });

    it('should handle edge case percentiles', () => {
      expect(() => computeHealthGrade(0.8)).not.toThrow(); // A/B boundary
      expect(() => computeHealthGrade(0.6)).not.toThrow(); // B/C boundary
      expect(() => computeHealthGrade(0.4)).not.toThrow(); // C/D boundary
      expect(() => computeHealthGrade(0.2)).not.toThrow(); // D/E boundary
    });
  });

  describe('Return Type Validation', () => {
    it('should return HealthGrade type (A|B|C|D|E)', () => {
      const validGrades: HealthGrade[] = ['A', 'B', 'C', 'D', 'E'];

      const resultA = computeHealthGrade(0.9);
      const resultC = computeHealthGrade(0.5);
      const resultE = computeHealthGrade(0.1);

      expect(validGrades).toContain(resultA);
      expect(validGrades).toContain(resultC);
      expect(validGrades).toContain(resultE);
    });

    it('should return only valid grade letters', () => {
      const testPercentiles = [0.0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0];

      testPercentiles.forEach((percentile) => {
        const grade = computeHealthGrade(percentile);
        expect(['A', 'B', 'C', 'D', 'E']).toContain(grade);
      });
    });
  });

  describe('Grade Distribution (20% Buckets)', () => {
    it('should assign grade A for top 20% (0.8-1.0)', () => {
      expect(computeHealthGrade(0.9)).toBe('A');
      expect(computeHealthGrade(0.8)).toBe('A'); // Boundary condition
      expect(computeHealthGrade(1.0)).toBe('A'); // Perfect score
    });

    it('should assign grade B for next 20% (0.6-0.8)', () => {
      expect(computeHealthGrade(0.7)).toBe('B');
      expect(computeHealthGrade(0.6)).toBe('B'); // Boundary condition
      expect(computeHealthGrade(0.79)).toBe('B'); // Just below A threshold
    });

    it('should assign grade C for middle 20% (0.4-0.6)', () => {
      expect(computeHealthGrade(0.5)).toBe('C');
      expect(computeHealthGrade(0.4)).toBe('C'); // Boundary condition
      expect(computeHealthGrade(0.59)).toBe('C'); // Just below B threshold
    });

    it('should assign grade D for next 20% (0.2-0.4)', () => {
      expect(computeHealthGrade(0.3)).toBe('D');
      expect(computeHealthGrade(0.2)).toBe('D'); // Boundary condition
      expect(computeHealthGrade(0.39)).toBe('D'); // Just below C threshold
    });

    it('should assign grade E for bottom 20% (0.0-0.2)', () => {
      expect(computeHealthGrade(0.1)).toBe('E');
      expect(computeHealthGrade(0.0)).toBe('E'); // Worst score
      expect(computeHealthGrade(0.19)).toBe('E'); // Just below D threshold
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle exact boundary values consistently', () => {
      // Test exact boundaries
      expect(computeHealthGrade(0.8)).toBe('A'); // A/B boundary -> A
      expect(computeHealthGrade(0.6)).toBe('B'); // B/C boundary -> B
      expect(computeHealthGrade(0.4)).toBe('C'); // C/D boundary -> C
      expect(computeHealthGrade(0.2)).toBe('D'); // D/E boundary -> D
    });

    it('should handle values just below boundaries', () => {
      expect(computeHealthGrade(0.79)).toBe('B'); // Just below A
      expect(computeHealthGrade(0.59)).toBe('C'); // Just below B
      expect(computeHealthGrade(0.39)).toBe('D'); // Just below C
      expect(computeHealthGrade(0.19)).toBe('E'); // Just below D
    });

    it('should handle extreme values', () => {
      expect(computeHealthGrade(1.0)).toBe('A'); // Perfect percentile
      expect(computeHealthGrade(0.0)).toBe('E'); // Worst percentile
    });
  });

  describe('Floating-Point Precision', () => {
    it('should handle floating-point precision edge cases', () => {
      // Test values very close to boundaries
      expect(computeHealthGrade(0.8000000001)).toBe('A');
      expect(computeHealthGrade(0.7999999999)).toBe('B');

      expect(computeHealthGrade(0.6000000001)).toBe('B');
      expect(computeHealthGrade(0.5999999999)).toBe('C');
    });

    it('should be consistent with repeated calculations', () => {
      const testPercentile = 0.75;

      const grade1 = computeHealthGrade(testPercentile);
      const grade2 = computeHealthGrade(testPercentile);
      const grade3 = computeHealthGrade(testPercentile);

      expect(grade1).toBe(grade2);
      expect(grade2).toBe(grade3);
    });
  });

  describe('Input Validation', () => {
    it('should handle invalid percentile ranges', () => {
      // Negative percentiles
      expect(() => computeHealthGrade(-0.1)).toThrow();
      expect(() => computeHealthGrade(-1.0)).toThrow();

      // Percentiles > 1.0
      expect(() => computeHealthGrade(1.1)).toThrow();
      expect(() => computeHealthGrade(2.0)).toThrow();
    });

    it('should handle edge case inputs', () => {
      // NaN should throw
      expect(() => computeHealthGrade(NaN)).toThrow();

      // Infinity should throw
      expect(() => computeHealthGrade(Infinity)).toThrow();
      expect(() => computeHealthGrade(-Infinity)).toThrow();
    });
  });

  describe('Mathematical Distribution', () => {
    it('should distribute grades evenly for uniform percentiles', () => {
      // Test 100 percentiles from 0 to 1
      const percentiles = Array.from({ length: 100 }, (_, i) => i / 99);
      const grades = percentiles.map((p) => computeHealthGrade(p));

      const distribution = {
        A: grades.filter((g) => g === 'A').length,
        B: grades.filter((g) => g === 'B').length,
        C: grades.filter((g) => g === 'C').length,
        D: grades.filter((g) => g === 'D').length,
        E: grades.filter((g) => g === 'E').length,
      };

      // Each grade should represent approximately 20% (±2% tolerance)
      Object.values(distribution).forEach((count) => {
        const percentage = count / 100;
        expect(percentage).toBeCloseTo(0.2, 1); // Within 10% relative error
      });
    });
  });

  describe('Integration Requirements', () => {
    it('should be a pure function (no side effects)', () => {
      const testPercentile = 0.75;

      // Function should not modify any external state
      const grade1 = computeHealthGrade(testPercentile);
      const grade2 = computeHealthGrade(testPercentile);

      expect(grade1).toBe(grade2);
    });

    it('should have deterministic output', () => {
      const testCases = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];

      testCases.forEach((percentile) => {
        const result1 = computeHealthGrade(percentile);
        const result2 = computeHealthGrade(percentile);
        expect(result1).toBe(result2);
      });
    });
  });
});

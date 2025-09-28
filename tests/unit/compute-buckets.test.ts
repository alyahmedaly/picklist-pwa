import { describe, test, expect } from 'vitest';
import {
  computeNetCarbsBucket,
  computeProteinBucket,
} from '../../src/data/transform/compute/computeNutritionalTags.ts';

/** T006: Unit test for macro-nutrient bucketing */

describe('Macro-Nutrient Bucketing', () => {
  describe('Net Carbs Bucketing', () => {
    test('very_low bucket: < 2g', () => {
      expect(computeNetCarbsBucket(0)).toBe('very_low');
      expect(computeNetCarbsBucket(1.9)).toBe('very_low');
      expect(computeNetCarbsBucket(1.5)).toBe('very_low');
      expect(computeNetCarbsBucket(0.1)).toBe('very_low');
    });

    test('low bucket: 2-5g', () => {
      expect(computeNetCarbsBucket(2)).toBe('low');
      expect(computeNetCarbsBucket(3.5)).toBe('low');
      expect(computeNetCarbsBucket(4.9)).toBe('low');
      expect(computeNetCarbsBucket(5)).toBe('low');
    });

    test('moderate bucket: 5-10g', () => {
      expect(computeNetCarbsBucket(5.1)).toBe('moderate');
      expect(computeNetCarbsBucket(7.5)).toBe('moderate');
      expect(computeNetCarbsBucket(9.9)).toBe('moderate');
      expect(computeNetCarbsBucket(10)).toBe('moderate');
    });

    test('high bucket: 10-20g', () => {
      expect(computeNetCarbsBucket(10.1)).toBe('high');
      expect(computeNetCarbsBucket(15)).toBe('high');
      expect(computeNetCarbsBucket(19.9)).toBe('high');
      expect(computeNetCarbsBucket(20)).toBe('high');
    });

    test('very_high bucket: > 20g', () => {
      expect(computeNetCarbsBucket(20.1)).toBe('very_high');
      expect(computeNetCarbsBucket(50)).toBe('very_high');
      expect(computeNetCarbsBucket(100)).toBe('very_high');
    });

    test('boundary conditions for net carbs', () => {
      // Test exact boundary values
      expect(computeNetCarbsBucket(2)).toBe('low');
      expect(computeNetCarbsBucket(5)).toBe('low');
      expect(computeNetCarbsBucket(10)).toBe('moderate');
      expect(computeNetCarbsBucket(20)).toBe('high');

      // Test just above boundaries
      expect(computeNetCarbsBucket(2.01)).toBe('low');
      expect(computeNetCarbsBucket(5.01)).toBe('moderate');
      expect(computeNetCarbsBucket(10.01)).toBe('high');
      expect(computeNetCarbsBucket(20.01)).toBe('very_high');
    });
  });

  describe('Protein Bucketing', () => {
    test('very_low bucket: < 5g', () => {
      expect(computeProteinBucket(0)).toBe('very_low');
      expect(computeProteinBucket(2.5)).toBe('very_low');
      expect(computeProteinBucket(4.9)).toBe('very_low');
    });

    test('low bucket: 5-10g', () => {
      expect(computeProteinBucket(5)).toBe('low');
      expect(computeProteinBucket(7.5)).toBe('low');
      expect(computeProteinBucket(10)).toBe('low');
    });

    test('moderate bucket: 10-20g', () => {
      expect(computeProteinBucket(10.1)).toBe('moderate');
      expect(computeProteinBucket(15)).toBe('moderate');
      expect(computeProteinBucket(20)).toBe('moderate');
    });

    test('high bucket: 20-30g', () => {
      expect(computeProteinBucket(20.1)).toBe('high');
      expect(computeProteinBucket(25)).toBe('high');
      expect(computeProteinBucket(30)).toBe('high');
    });

    test('very_high bucket: > 30g', () => {
      expect(computeProteinBucket(30.1)).toBe('very_high');
      expect(computeProteinBucket(50)).toBe('very_high');
      expect(computeProteinBucket(100)).toBe('very_high');
    });

    test('boundary conditions for protein', () => {
      // Test exact boundary values
      expect(computeProteinBucket(5)).toBe('low');
      expect(computeProteinBucket(10)).toBe('low');
      expect(computeProteinBucket(20)).toBe('moderate');
      expect(computeProteinBucket(30)).toBe('high');

      // Test just above boundaries
      expect(computeProteinBucket(5.01)).toBe('low');
      expect(computeProteinBucket(10.01)).toBe('moderate');
      expect(computeProteinBucket(20.01)).toBe('high');
      expect(computeProteinBucket(30.01)).toBe('very_high');
    });
  });

  describe('Invalid Input Handling', () => {
    test('negative values return appropriate bucket', () => {
      expect(computeNetCarbsBucket(-1)).toBe('very_low');
      expect(computeProteinBucket(-1)).toBe('very_low');
    });

    test('undefined values return undefined', () => {
      expect(computeNetCarbsBucket(undefined)).toBeUndefined();
      expect(computeProteinBucket(undefined)).toBeUndefined();
    });

    test('NaN values return undefined', () => {
      expect(computeNetCarbsBucket(NaN)).toBeUndefined();
      expect(computeProteinBucket(NaN)).toBeUndefined();
    });

    test('decimal inputs handled properly', () => {
      expect(computeNetCarbsBucket(1.99)).toBe('very_low');
      expect(computeNetCarbsBucket(2.01)).toBe('low');
      expect(computeProteinBucket(4.99)).toBe('very_low');
      expect(computeProteinBucket(5.01)).toBe('low');
    });
  });

  describe('Large Numbers', () => {
    test('very large values handled correctly', () => {
      expect(computeNetCarbsBucket(1000)).toBe('very_high');
      expect(computeProteinBucket(1000)).toBe('very_high');
    });

    test('very small positive values', () => {
      expect(computeNetCarbsBucket(0.001)).toBe('very_low');
      expect(computeProteinBucket(0.001)).toBe('very_low');
    });
  });
});

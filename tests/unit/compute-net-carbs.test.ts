import { describe, test, expect } from 'vitest';
import { computeNetCarbs } from '../../src/data/transform/compute/computeNutritionalTags.ts';

/** T005: Unit test for net carbs calculation with edge cases */

describe('Net Carbs Calculation', () => {
  test('basic net carbs calculation: carbs - fiber', () => {
    // Basic calculation: 20g carbs - 5g fiber = 15g net carbs
    expect(computeNetCarbs(20, 5)).toBe(15);

    // Another example: 30g carbs - 8g fiber = 22g net carbs
    expect(computeNetCarbs(30, 8)).toBe(22);

    // Zero fiber case: 25g carbs - 0g fiber = 25g net carbs
    expect(computeNetCarbs(25, 0)).toBe(25);
  });

  test('missing fiber: uses total carbs', () => {
    // When fiber is undefined, net carbs equals total carbs
    expect(computeNetCarbs(20, undefined)).toBe(20);
    expect(computeNetCarbs(15.5, undefined)).toBe(15.5);
  });

  test('missing carbs: returns undefined', () => {
    // When carbs is undefined, cannot calculate net carbs
    expect(computeNetCarbs(undefined, 5)).toBeUndefined();
    expect(computeNetCarbs(undefined, undefined)).toBeUndefined();
  });

  test('negative result: clamped to zero', () => {
    // When fiber exceeds carbs, clamp to 0 (can't have negative net carbs)
    expect(computeNetCarbs(3, 5)).toBe(0);
    expect(computeNetCarbs(2.5, 8)).toBe(0);
    expect(computeNetCarbs(0, 3)).toBe(0);
  });

  test('decimal precision handling', () => {
    // Test decimal calculations with proper precision
    expect(computeNetCarbs(12.7, 2.3)).toBe(10.4);
    expect(computeNetCarbs(8.9, 1.2)).toBe(7.7);
    expect(computeNetCarbs(15.33, 3.12)).toBe(12.21);

    // Test rounding to 1 decimal place (per contract)
    expect(computeNetCarbs(10.77, 2.34)).toBeCloseTo(8.43, 1);
  });

  test('edge cases: zero values and large numbers', () => {
    // Zero carbs
    expect(computeNetCarbs(0, 0)).toBe(0);
    expect(computeNetCarbs(0, 5)).toBe(0);

    // Very large numbers
    expect(computeNetCarbs(1000, 100)).toBe(900);
    expect(computeNetCarbs(500.5, 50.5)).toBe(450);

    // Very small numbers
    expect(computeNetCarbs(0.1, 0.05)).toBe(0.05);
    expect(computeNetCarbs(0.01, 0.001)).toBe(0.009);
  });

  test('invalid inputs handled gracefully', () => {
    // NaN inputs should return undefined
    expect(computeNetCarbs(NaN, 5)).toBeUndefined();
    expect(computeNetCarbs(10, NaN)).toBe(10); // NaN fiber treated as undefined
    expect(computeNetCarbs(NaN, NaN)).toBeUndefined();

    // Negative inputs (invalid nutritional data)
    expect(computeNetCarbs(-5, 2)).toBeUndefined(); // Negative carbs invalid
    expect(computeNetCarbs(10, -2)).toBe(10); // Negative fiber treated as 0
  });
});

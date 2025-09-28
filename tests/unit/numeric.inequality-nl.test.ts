import { describe, test, expect } from 'vitest';
import { parseUnits } from '../../src/data/transform/parseUnits.ts';

/** T012: Failing unit test for inequality numeric parsing */

describe('T012 Dutch inequality numeric parsing', () => {
  test('< 0,01 g parses to 0.01', () => {
    const result = parseUnits('< 0,01 g');
    expect(result?.amount).toBe(0.01); // will fail until implemented
    expect(result?.amountUnit).toBe('g');
  });

  test('< 0,5 ml parses to 0.5', () => {
    const result = parseUnits('< 0,5 ml');
    expect(result?.amount).toBe(0.5); // will fail until implemented
    expect(result?.amountUnit).toBe('ml');
  });

  test('≤ 1,5 g parses to 1.5', () => {
    const result = parseUnits('≤ 1,5 g');
    expect(result?.amount).toBe(1.5); // will fail until implemented
    expect(result?.amountUnit).toBe('g');
  });

  test('< 2,0 l converts to 2000 ml', () => {
    const result = parseUnits('< 2,0 l');
    expect(result?.amount).toBe(2000); // will fail until implemented
    expect(result?.amountUnit).toBe('ml');
  });

  test('regular numbers without inequality still work', () => {
    const result = parseUnits('1,5 g');
    expect(result?.amount).toBe(1.5);
    expect(result?.amountUnit).toBe('g');
  });

  test('multipack with inequality: 6 x < 0,33 l', () => {
    const result = parseUnits('6 x < 0,33 l');
    expect(result?.packCount).toBe(6);
    expect(result?.amount).toBe(330); // will fail until implemented (0.33 * 1000)
    expect(result?.amountUnit).toBe('ml');
  });
});

import { describe, test, expect } from 'vitest';
import { parseUnits } from '../../src/data/transform/parseUnits';

/** T008: Failing test for Unit parser (before implementation). */

describe('parseUnits (T008)', () => {
  test('single size simple "1 l" -> 1000 ml', () => {
    const u = parseUnits('1 l');
    expect(u).toEqual({ raw: '1 l', amount: 1000, amountUnit: 'ml' });
  });

  test('multipack with decimal comma "6 x 0,33 l"', () => {
    const u = parseUnits('6 x 0,33 l');
    expect(u).toEqual({
      raw: '6 x 0,33 l',
      packCount: 6,
      amount: 330,
      amountUnit: 'ml',
    });
  });

  test('alt language count-only "2 stuks" (Dutch for pieces) returns packCount only', () => {
    const u = parseUnits('2 stuks');
    expect(u).toEqual({ raw: '2 stuks', packCount: 2 });
  });

  test('whitespace noise and uppercase unit "  3  X   250 ML  "', () => {
    const u = parseUnits('  3  X   250 ML  ');
    expect(u).toEqual({
      raw: '  3  X   250 ML  ',
      packCount: 3,
      amount: 250,
      amountUnit: 'ml',
    });
  });
});

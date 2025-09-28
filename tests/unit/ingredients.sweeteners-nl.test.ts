import { describe, test, expect } from 'vitest';
import { parseIngredients } from '../../src/data/transform/parseIngredients.ts';

/** T009: Failing unit test for Dutch sweeteners detection */

describe('T009 Dutch sweeteners detection', () => {
  test('steviolglycosiden and zoetstof trigger artificialSweetenersFlag', () => {
    // Test steviolglycosiden (Dutch for steviol glycosides)
    const result1 = parseIngredients('water, suiker, zoetstof (steviolglycosiden), zout');
    expect(result1.flags.artificialSweetenersFlag).toBe(true); // will fail until implemented

    // Test zoetstof (Dutch for sweetener)
    const result2 = parseIngredients('ingrediënten: water, zoetstof, natuurlijke aroma');
    expect(result2.flags.artificialSweetenersFlag).toBe(true); // will fail until implemented

    // Test multiple Dutch sweeteners
    const result3 = parseIngredients('water, zoetstoffen (aspartaam, steviolglycosiden)');
    expect(result3.flags.artificialSweetenersFlag).toBe(true); // will fail until implemented

    // Control: regular ingredients should not trigger flag
    const result4 = parseIngredients('water, suiker, melk, tarwebloem');
    expect(result4.flags.artificialSweetenersFlag).toBe(false);
  });
});

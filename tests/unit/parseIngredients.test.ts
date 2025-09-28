import { describe, test, expect } from 'vitest';
import { parseIngredients } from '../../src/data/transform/parseIngredients';
import type { IngredientInfo } from '../../src/data/transform/types.ts';

/** T010: Failing test for Ingredients parser heuristics. */

describe('parseIngredients (T010)', () => {
  test('added sugar phrase sets addedSugarFlag', () => {
    const r = parseIngredients('INGREDIENTS: Whole oats, cane sugar, cocoa (5%), salt');
    expect(r.tokens).toEqual(['Whole oats', 'cane sugar', 'cocoa (5%)', 'salt']);
    expect(r.flags.addedSugarFlag).toBe(true);
    expect(r.flags.artificialSweetenersFlag).toBe(false);
  });

  test('unsweetened claim does not set addedSugarFlag', () => {
    const r = parseIngredients('Ingredients: roasted peanuts, salt, unsweetened');
    expect(r.flags.addedSugarFlag).toBe(false);
  });

  test('salt heuristic sets addedSaltFlag when salt present', () => {
    const r = parseIngredients('Ingredients: tomatoes, sea salt, basil');
    expect(r.flags.addedSaltFlag).toBe(true);
  });

  test('artificial sweeteners flagged (aspartame)', () => {
    const r = parseIngredients('Water, flavor, Aspartame (E951)');
    expect(r.flags.artificialSweetenersFlag).toBe(true);
  });

  test('parentheses respected and order preserved', () => {
    const r = parseIngredients('Sugar, cocoa powder (processed with alkali), natural flavor');
    expect(r.tokens).toEqual(['Sugar', 'cocoa powder (processed with alkali)', 'natural flavor']);
  });
});

/** T005: Enhanced structure tests - MUST FAIL before implementation */
describe('parseIngredients - enhanced structure (T005)', () => {
  test('should return structured IngredientInfo with core/additives separation', () => {
    const input = 'water, wheat flour, E300 (vitamin C), salt, E202 (potassium sorbate)';
    const result = parseIngredients(input);

    // This test MUST fail - parseIngredients currently returns ParsedIngredients, not IngredientInfo
    expect(result).toHaveProperty('ingredientInfo');
    expect((result as any).ingredientInfo).toMatchObject({
      core: ['water', 'wheat flour', 'salt'],
      additives: ['E300 (vitamin C)', 'E202 (potassium sorbate)'],
      statements: [],
      total: 5,
    } as IngredientInfo);
  });

  test('should separate core ingredients from E-number additives', () => {
    const input = 'tomatoes, onions, E330 (citric acid), garlic, E202';
    const result = parseIngredients(input);

    expect(result).toHaveProperty('ingredientInfo');
    expect((result as any).ingredientInfo.core).toEqual(['tomatoes', 'onions', 'garlic']);
    expect((result as any).ingredientInfo.additives).toEqual(['E330 (citric acid)', 'E202']);
    expect((result as any).ingredientInfo.total).toBe(5);
  });

  test('should include statements for added sugar/salt warnings', () => {
    const input = 'flour, sugar, salt. Waarvan toegevoegde suikers 5.2g per 100 gram';
    const result = parseIngredients(input);

    expect(result).toHaveProperty('ingredientInfo');
    expect((result as any).ingredientInfo.statements).toContain('Added sugars: 5.2g per 100g');
    expect((result as any).ingredientInfo.core).toContain('flour');
    expect((result as any).ingredientInfo.core).toContain('sugar');
    expect((result as any).ingredientInfo.core).toContain('salt');
  });

  test('should handle empty ingredients gracefully', () => {
    const result = parseIngredients('');

    expect(result).toHaveProperty('ingredientInfo');
    expect((result as any).ingredientInfo).toMatchObject({
      core: [],
      additives: [],
      statements: [],
      total: 0,
    } as IngredientInfo);
  });

  test('should count total ingredients correctly', () => {
    const input = 'water, flour, E300, E202, salt, sugar';
    const result = parseIngredients(input);

    expect(result).toHaveProperty('ingredientInfo');
    expect((result as any).ingredientInfo.total).toBe(6);
    expect((result as any).ingredientInfo.core).toHaveLength(4); // water, flour, salt, sugar
    expect((result as any).ingredientInfo.additives).toHaveLength(2); // E300, E202
  });
});

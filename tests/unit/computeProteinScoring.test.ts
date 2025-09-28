import { describe, test, expect } from 'vitest';
import type { ProteinScoring } from '../../src/data/transform/types';
import { computeProteinScoring } from '../../src/data/transform/compute/computeProteinScoring';

function run(input: {
  proteinPer100g?: number;
  caloriesPer100g?: number;
  unit?: string;
  category?: string;
}): ProteinScoring | undefined {
  // Convert test interface to implementation interface
  const nutrition = {
    protein: input.proteinPer100g,
    kcal: input.caloriesPer100g,
  };

  return computeProteinScoring({
    nutrition,
    unit: input.unit,
    category: input.category,
  });
}

describe('computeProteinScoring (T003 RED phase)', () => {
  // Density band tests (already some basic cases) + add explicit boundaries
  test('high protein low calorie product should score > 80', () => {
    const r = run({
      proteinPer100g: 25,
      caloriesPer100g: 120,
      unit: '100g',
      category: 'vlees',
    });
    expect(r).toBeDefined();
    expect(r!.proteinDensityScore).toBeGreaterThan(80);
  });
  test('moderate protein product should be between 40 and 80', () => {
    const r = run({
      proteinPer100g: 12,
      caloriesPer100g: 250,
      unit: '30g',
      category: 'brood',
    });
    expect(r).toBeDefined();
    expect(r!.proteinDensityScore).toBeGreaterThanOrEqual(40);
    expect(r!.proteinDensityScore).toBeLessThanOrEqual(80);
  });
  test('low protein product should be below 40', () => {
    const r = run({
      proteinPer100g: 2,
      caloriesPer100g: 300,
      unit: '100g',
      category: 'fruit',
    });
    expect(r).toBeDefined();
    expect(r!.proteinDensityScore).toBeLessThan(40);
  });
  test('zero protein yields zero score', () => {
    const r = run({ proteinPer100g: 0, caloriesPer100g: 50, unit: '100g' });
    expect(r).toBeDefined();
    expect(r!.proteinDensityScore).toBe(0);
  });
  test('target contribution computed from serving size (vlees 100g default)', () => {
    const r = run({
      proteinPer100g: 30,
      caloriesPer100g: 160,
      category: 'vlees',
      unit: '100g',
    });
    expect(r).toBeDefined();
    expect(r!.targetContribution).toBeGreaterThan(10); // ~17.6%
  });
  test('serving size estimation 30g bread slice adjusts target contribution', () => {
    const r = run({
      proteinPer100g: 10,
      caloriesPer100g: 250,
      category: 'brood',
      unit: '30g',
    });
    expect(r).toBeDefined();
    expect(r!.targetContribution).toBeLessThan(10);
  });
  test('handles missing nutrition gracefully (returns undefined)', () => {
    const r = run({ proteinPer100g: undefined, caloriesPer100g: undefined });
    expect(r).toBeUndefined();
  });

  // Target contribution calculations & serving size estimation
  test('170g target baseline: 34g serving should be ~20% contribution (rounded)', () => {
    const r = run({
      proteinPer100g: 34,
      caloriesPer100g: 150,
      unit: '100g',
      category: 'vlees',
    });
    expect(r).toBeDefined();
    expect(r!.targetContribution).toBeGreaterThan(18);
    expect(r!.targetContribution).toBeLessThan(25);
  });
  test('category default for zuivel (150g) adjusts target contribution upwards', () => {
    const r = run({
      proteinPer100g: 6,
      caloriesPer100g: 90,
      unit: '150g',
      category: 'zuivel',
    });
    expect(r).toBeDefined();
    // 6g per 100g → 9g per 150g serving → ~5.3%
    expect(r!.targetContribution).toBeGreaterThan(4);
    expect(r!.targetContribution).toBeLessThan(7);
  });
  test('bread slice 30g unit parsing yields smaller contribution than 100g', () => {
    const slice = run({
      proteinPer100g: 9,
      caloriesPer100g: 250,
      unit: '30g',
      category: 'brood',
    });
    const hundred = run({
      proteinPer100g: 9,
      caloriesPer100g: 250,
      unit: '100g',
      category: 'brood',
    });
    expect(slice).toBeDefined();
    expect(hundred).toBeDefined();
    expect(slice!.targetContribution).toBeLessThan(hundred!.targetContribution);
  });
  test('capped at 100% target contribution for very high protein powder', () => {
    const r = run({
      proteinPer100g: 95,
      caloriesPer100g: 380,
      unit: '100g',
      category: 'supplement',
    });
    expect(r).toBeDefined();
    expect(r!.targetContribution).toBeLessThanOrEqual(100);
  });

  // Edge / invalid data handling
  test('zero calories but non-zero protein handled (avoid division by zero)', () => {
    const r = run({ proteinPer100g: 10, caloriesPer100g: 0, unit: '100g' });
    // Expect either undefined or defined with safe zero/low score depending on implementation decision
    // RED expectation: we assert defined to force explicit handling
    expect(r).toBeDefined();
    expect(Number.isFinite(r!.proteinDensityScore)).toBe(true);
  });
  test('negative protein values produce undefined (invalid data)', () => {
    const r = run({ proteinPer100g: -5, caloriesPer100g: 120, unit: '100g' });
    expect(r).toBeUndefined();
  });
  test('extreme calories ( >1000 ) still yields bounded score 0-100', () => {
    const r = run({ proteinPer100g: 40, caloriesPer100g: 1200, unit: '100g' });
    expect(r).toBeDefined();
    expect(r!.proteinDensityScore).toBeGreaterThanOrEqual(0);
    expect(r!.proteinDensityScore).toBeLessThanOrEqual(100);
  });
  test('extreme high protein >50g handled without overflow', () => {
    const r = run({ proteinPer100g: 60, caloriesPer100g: 300, unit: '100g' });
    expect(r).toBeDefined();
    expect(r!.proteinDensityScore).toBeLessThanOrEqual(100);
  });

  // Mathematical validation (density formula expectation placeholders)
  test('protein density manual calculation matches score scaling placeholder', () => {
    const protein = 20;
    const kcal = 200; // density raw = (20/200)*100 = 10
    const r = run({
      proteinPer100g: protein,
      caloriesPer100g: kcal,
      unit: '100g',
    });
    expect(r).toBeDefined();
    // Placeholder: once percentile logic exists we can compare to expected mapping
    expect(r!.proteinContribution).toBeCloseTo(20, 1); // grams per 100g should echo back
  });
  test('rounding to one decimal place for target contribution (placeholder)', () => {
    const r = run({
      proteinPer100g: 17,
      caloriesPer100g: 160,
      unit: '100g',
      category: 'vlees',
    });
    expect(r).toBeDefined();
    // value ~ (17 / 170)*100 = 10.0% ; allow small rounding diff
    expect(Math.abs(r!.targetContribution - 10)).toBeLessThan(1.0);
  });

  // Fixture-like semantic samples for future refactors (labels only, no external file yet)
  const samples = [
    {
      name: 'chicken breast',
      protein: 31,
      kcal: 165,
      unit: '100g',
      category: 'vlees',
    },
    {
      name: 'whey powder',
      protein: 80,
      kcal: 400,
      unit: '30g',
      category: 'supplement',
    },
    {
      name: 'white bread',
      protein: 9,
      kcal: 265,
      unit: '30g',
      category: 'brood',
    },
    {
      name: 'olive oil',
      protein: 0,
      kcal: 884,
      unit: '15g',
      category: 'vetten',
    },
  ];
  test('sample set produces monotonically higher density score for more protein-dense items', () => {
    const results = samples.map((s) => ({
      s,
      r: run({
        proteinPer100g: s.protein,
        caloriesPer100g: s.kcal,
        unit: s.unit,
        category: s.category,
      }),
    }));
    const chicken = results.find((x) => x.s.name === 'chicken breast')!.r!;
    const bread = results.find((x) => x.s.name === 'white bread')!.r!;
    const oil = results.find((x) => x.s.name === 'olive oil')!.r!;
    expect(chicken.proteinDensityScore).toBeGreaterThan(bread.proteinDensityScore);
    expect(bread.proteinDensityScore).toBeGreaterThan(oil.proteinDensityScore);
  });
});

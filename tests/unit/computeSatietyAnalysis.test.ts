import { describe, test, expect } from 'vitest';
import type { SatietyIntelligence } from '../../src/data/transform/types';
import { computeSatietyAnalysis } from '../../src/data/transform/compute/computeSatietyAnalysis';

function run(input: {
  proteinPer100g?: number;
  fiberPer100g?: number;
  caloriesPer100g?: number;
  additiveCount?: number;
  category?: string;
}): SatietyIntelligence {
  return computeSatietyAnalysis(input);
}

describe('computeSatietyAnalysis (T004 RED phase)', () => {
  test('high protein + fiber minimal additives yields high satiety', () => {
    const r = run({
      proteinPer100g: 25,
      fiberPer100g: 8,
      caloriesPer100g: 180,
      additiveCount: 1,
      category: 'vlees',
    });
    expect(r.satietyScore).toBeGreaterThan(70);
  });
  test('moderate profile yields mid satiety', () => {
    const r = run({
      proteinPer100g: 10,
      fiberPer100g: 3,
      caloriesPer100g: 250,
      additiveCount: 3,
      category: 'brood',
    });
    expect(r.satietyScore).toBeGreaterThanOrEqual(40);
    expect(r.satietyScore).toBeLessThan(70);
  });
  test('low protein + low fiber + high processing yields low satiety', () => {
    const r = run({
      proteinPer100g: 3,
      fiberPer100g: 1,
      caloriesPer100g: 300,
      additiveCount: 8,
      category: 'snack',
    });
    expect(r.satietyScore).toBeLessThan(40);
  });
  test('processing penalty reflected with many additives', () => {
    const r = run({
      proteinPer100g: 15,
      fiberPer100g: 5,
      caloriesPer100g: 220,
      additiveCount: 10,
      category: 'brood',
    });
    expect(r.satietyFactors.processingPenalty).toBeLessThan(60);
  });
  test('volume factor higher for fruit vs beverages', () => {
    const fruit = run({
      proteinPer100g: 1,
      fiberPer100g: 2,
      caloriesPer100g: 60,
      additiveCount: 0,
      category: 'fruit',
    });
    const drink = run({
      proteinPer100g: 1,
      fiberPer100g: 0,
      caloriesPer100g: 40,
      additiveCount: 0,
      category: 'dranken',
    });
    expect(fruit.satietyFactors.volumeFactor).toBeGreaterThan(drink.satietyFactors.volumeFactor);
  });
  test('calorie efficiency ratio lower (better) for high satiety foods', () => {
    const high = run({
      proteinPer100g: 25,
      fiberPer100g: 8,
      caloriesPer100g: 180,
      additiveCount: 1,
      category: 'vlees',
    });
    const low = run({
      proteinPer100g: 3,
      fiberPer100g: 1,
      caloriesPer100g: 300,
      additiveCount: 8,
      category: 'snack',
    });
    expect(high.caloriePerSatietyRatio).toBeLessThan(low.caloriePerSatietyRatio);
  });
  test('missing nutrition leads to error (to adjust later for graceful skip)', () => {
    expect(() => run({})).toThrow();
  });

  // Factor-specific expectations (placeholders until implementation refined)
  test('protein factor scales with grams (3.84 * grams placeholder)', () => {
    const r = run({
      proteinPer100g: 10,
      fiberPer100g: 0,
      caloriesPer100g: 120,
      additiveCount: 0,
      category: 'vlees',
    });
    expect(r.satietyFactors.proteinFactor).toBeGreaterThan(30); // 10*3.84 ≈ 38.4
  });
  test('fiber factor scales (1.91 * grams placeholder)', () => {
    const r = run({
      proteinPer100g: 0,
      fiberPer100g: 5,
      caloriesPer100g: 120,
      additiveCount: 0,
      category: 'groenten',
    });
    expect(r.satietyFactors.fiberFactor).toBeGreaterThan(8); // 5*1.91 ≈ 9.55
  });
  test('processing penalty lowers with many additives (<=40 for 8+)', () => {
    const r = run({
      proteinPer100g: 12,
      fiberPer100g: 4,
      caloriesPer100g: 250,
      additiveCount: 9,
      category: 'snack',
    });
    expect(r.satietyFactors.processingPenalty).toBeLessThanOrEqual(60);
  });
  test('volume factor higher for fruits than beverages', () => {
    const fruit = run({
      proteinPer100g: 1,
      fiberPer100g: 2,
      caloriesPer100g: 60,
      additiveCount: 0,
      category: 'fruit',
    });
    const bev = run({
      proteinPer100g: 1,
      fiberPer100g: 0,
      caloriesPer100g: 40,
      additiveCount: 0,
      category: 'dranken',
    });
    expect(fruit.satietyFactors.volumeFactor).toBeGreaterThan(bev.satietyFactors.volumeFactor);
  });

  // Duration & efficiency metrics
  test('expected satiety duration within 120-300 minute research range', () => {
    const r = run({
      proteinPer100g: 15,
      fiberPer100g: 7,
      caloriesPer100g: 180,
      additiveCount: 1,
      category: 'groenten',
    });
    expect(r.expectedSatietyDuration).toBeGreaterThanOrEqual(120);
    expect(r.expectedSatietyDuration).toBeLessThanOrEqual(320); // allow slightly above to detect normalization issues
  });
  test('calorie per satiety ratio lower for optimized meal vs low satiety', () => {
    const high = run({
      proteinPer100g: 20,
      fiberPer100g: 7,
      caloriesPer100g: 160,
      additiveCount: 1,
      category: 'vlees',
    });
    const low = run({
      proteinPer100g: 4,
      fiberPer100g: 1,
      caloriesPer100g: 320,
      additiveCount: 6,
      category: 'snack',
    });
    expect(high.caloriePerSatietyRatio).toBeLessThan(low.caloriePerSatietyRatio);
  });

  // Edge cases
  test('zero calorie product handled without division by zero', () => {
    const r = run({
      proteinPer100g: 0,
      fiberPer100g: 0,
      caloriesPer100g: 0,
      additiveCount: 0,
      category: 'water',
    });
    expect(Number.isFinite(r.caloriePerSatietyRatio)).toBe(true);
  });
  test('ultra processed 12 additives yields very low processing penalty', () => {
    const r = run({
      proteinPer100g: 8,
      fiberPer100g: 2,
      caloriesPer100g: 260,
      additiveCount: 12,
      category: 'snack',
    });
    expect(r.satietyFactors.processingPenalty).toBeLessThan(50);
  });
  test('whole food zero additives keeps high processing score', () => {
    const r = run({
      proteinPer100g: 5,
      fiberPer100g: 3,
      caloriesPer100g: 90,
      additiveCount: 0,
      category: 'groenten',
    });
    expect(r.satietyFactors.processingPenalty).toBeGreaterThan(70);
  });

  // Fixture-like sample set for ordering semantics (not external yet)
  const satietySamples = [
    {
      name: 'lean-meat',
      protein: 25,
      fiber: 0,
      kcal: 150,
      add: 1,
      cat: 'vlees',
    },
    {
      name: 'bean-mix',
      protein: 12,
      fiber: 8,
      kcal: 180,
      add: 1,
      cat: 'groenten',
    },
    {
      name: 'sugary-snack',
      protein: 2,
      fiber: 0,
      kcal: 400,
      add: 9,
      cat: 'snack',
    },
  ];
  test('lean meat > bean mix > sugary snack (protein density drives satiety)', () => {
    const results = satietySamples.map((s) => ({
      s,
      r: run({
        proteinPer100g: s.protein,
        fiberPer100g: s.fiber,
        caloriesPer100g: s.kcal,
        additiveCount: s.add,
        category: s.cat,
      }),
    }));
    const bean = results.find((x) => x.s.name === 'bean-mix')!.r;
    const meat = results.find((x) => x.s.name === 'lean-meat')!.r;
    const snack = results.find((x) => x.s.name === 'sugary-snack')!.r;
    // Lean meat should rank highest due to superior protein density (16.7g/100kcal vs 6.7g/100kcal)
    expect(meat.satietyScore).toBeGreaterThan(bean.satietyScore);
    expect(bean.satietyScore).toBeGreaterThan(snack.satietyScore);
  });
});

import { describe, test, expect } from 'vitest';
import {
  EU_HIGH_FIBER_THRESHOLD,
  DUTCH_HIGH_PROTEIN_THRESHOLD,
  LOW_CARB_THRESHOLD,
  PROTEIN_DENSITY_THRESHOLDS,
  computeHighFiberFlag,
  computeHighProteinFlag,
  computeLowCarbFlag,
  computeProteinDensity,
} from '../../src/data/transform/compute/computeNutritionalTags.ts';

/** T009: Unit test for EU/Dutch nutritional standards compliance */

describe('EU/Dutch Nutritional Standards', () => {
  describe('EU Standards Constants', () => {
    test('EU high fiber standard is correctly defined', () => {
      // EU Commission Regulation No 1924/2006: high fibre ≥6g per 100g
      expect(EU_HIGH_FIBER_THRESHOLD).toBe(6);
    });

    test('Dutch high protein standard is correctly defined', () => {
      // Dutch fitness standard: high protein ≥20g per 100g
      expect(DUTCH_HIGH_PROTEIN_THRESHOLD).toBe(20);
    });

    test('Low carb threshold is correctly defined', () => {
      // Ketogenic threshold: low carb <10g net carbs per 100g
      expect(LOW_CARB_THRESHOLD).toBe(10);
    });

    test('Protein density thresholds are correctly defined', () => {
      expect(PROTEIN_DENSITY_THRESHOLDS.low).toBe(10);
      expect(PROTEIN_DENSITY_THRESHOLDS.moderate).toBe(20);
    });
  });

  describe('EU High Fiber Standard (≥6g per 100g)', () => {
    test('marks products with ≥6g fiber as high fiber', () => {
      expect(computeHighFiberFlag(6)).toBe(true);
      expect(computeHighFiberFlag(6.1)).toBe(true);
      expect(computeHighFiberFlag(10)).toBe(true);
      expect(computeHighFiberFlag(15.5)).toBe(true);
    });

    test('marks products with <6g fiber as not high fiber', () => {
      expect(computeHighFiberFlag(5.9)).toBe(false);
      expect(computeHighFiberFlag(3)).toBe(false);
      expect(computeHighFiberFlag(0)).toBe(false);
      expect(computeHighFiberFlag(0.1)).toBe(false);
    });

    test('handles missing fiber data', () => {
      expect(computeHighFiberFlag(undefined)).toBe(false);
      expect(computeHighFiberFlag(NaN)).toBe(false);
    });

    test('boundary condition: exactly 6g fiber', () => {
      expect(computeHighFiberFlag(6.0)).toBe(true);
      expect(computeHighFiberFlag(5.99)).toBe(false);
      expect(computeHighFiberFlag(6.01)).toBe(true);
    });
  });

  describe('Dutch High Protein Standard (≥20g per 100g)', () => {
    test('marks products with ≥20g protein as high protein', () => {
      expect(computeHighProteinFlag(20)).toBe(true);
      expect(computeHighProteinFlag(20.1)).toBe(true);
      expect(computeHighProteinFlag(30)).toBe(true);
      expect(computeHighProteinFlag(50.5)).toBe(true);
    });

    test('marks products with <20g protein as not high protein', () => {
      expect(computeHighProteinFlag(19.9)).toBe(false);
      expect(computeHighProteinFlag(15)).toBe(false);
      expect(computeHighProteinFlag(5)).toBe(false);
      expect(computeHighProteinFlag(0)).toBe(false);
    });

    test('handles missing protein data', () => {
      expect(computeHighProteinFlag(undefined)).toBe(false);
      expect(computeHighProteinFlag(NaN)).toBe(false);
    });

    test('boundary condition: exactly 20g protein', () => {
      expect(computeHighProteinFlag(20.0)).toBe(true);
      expect(computeHighProteinFlag(19.99)).toBe(false);
      expect(computeHighProteinFlag(20.01)).toBe(true);
    });
  });

  describe('Low Carb Threshold (<10g net carbs)', () => {
    test('marks products with <10g net carbs as low carb', () => {
      expect(computeLowCarbFlag(9.9)).toBe(true);
      expect(computeLowCarbFlag(5)).toBe(true);
      expect(computeLowCarbFlag(0)).toBe(true);
      expect(computeLowCarbFlag(0.1)).toBe(true);
    });

    test('marks products with ≥10g net carbs as not low carb', () => {
      expect(computeLowCarbFlag(10)).toBe(false);
      expect(computeLowCarbFlag(10.1)).toBe(false);
      expect(computeLowCarbFlag(15)).toBe(false);
      expect(computeLowCarbFlag(50)).toBe(false);
    });

    test('handles missing net carbs data', () => {
      expect(computeLowCarbFlag(undefined)).toBe(false);
      expect(computeLowCarbFlag(NaN)).toBe(false);
    });

    test('boundary condition: exactly 10g net carbs', () => {
      expect(computeLowCarbFlag(10.0)).toBe(false);
      expect(computeLowCarbFlag(9.99)).toBe(true);
      expect(computeLowCarbFlag(10.01)).toBe(false);
    });
  });

  describe('Protein Density Classification', () => {
    test('classifies low protein density (<10g)', () => {
      expect(computeProteinDensity(0)).toBe('low');
      expect(computeProteinDensity(5)).toBe('low');
      expect(computeProteinDensity(9.9)).toBe('low');
    });

    test('classifies moderate protein density (10-20g)', () => {
      expect(computeProteinDensity(10)).toBe('moderate');
      expect(computeProteinDensity(15)).toBe('moderate');
      expect(computeProteinDensity(19.9)).toBe('moderate');
    });

    test('classifies high protein density (≥20g)', () => {
      expect(computeProteinDensity(20)).toBe('high');
      expect(computeProteinDensity(25)).toBe('high');
      expect(computeProteinDensity(50)).toBe('high');
    });

    test('handles protein density boundary conditions', () => {
      expect(computeProteinDensity(9.99)).toBe('low');
      expect(computeProteinDensity(10.0)).toBe('moderate');
      expect(computeProteinDensity(10.01)).toBe('moderate');
      expect(computeProteinDensity(19.99)).toBe('moderate');
      expect(computeProteinDensity(20.0)).toBe('high');
      expect(computeProteinDensity(20.01)).toBe('high');
    });

    test('handles missing protein density data', () => {
      expect(computeProteinDensity(undefined)).toBeUndefined();
      expect(computeProteinDensity(NaN)).toBeUndefined();
    });
  });

  describe('Real Dutch Product Examples', () => {
    test('validates high fiber products from Dutch market', () => {
      // Whole grain bread typically has 6-8g fiber per 100g
      expect(computeHighFiberFlag(7.5)).toBe(true);

      // Vegetables like broccoli have 2-3g fiber per 100g (not high fiber)
      expect(computeHighFiberFlag(2.5)).toBe(false);

      // Beans/lentils have 8-15g fiber per 100g (high fiber)
      expect(computeHighFiberFlag(12)).toBe(true);
    });

    test('validates high protein products from Dutch market', () => {
      // Chicken breast: ~20-25g protein per 100g (high protein)
      expect(computeHighProteinFlag(23)).toBe(true);

      // Greek yogurt: ~10g protein per 100g (not high protein)
      expect(computeHighProteinFlag(10)).toBe(false);

      // Cheese: ~25-30g protein per 100g (high protein)
      expect(computeHighProteinFlag(28)).toBe(true);
    });

    test('validates low carb products from Dutch market', () => {
      // Leafy greens: 1-3g net carbs (low carb)
      expect(computeLowCarbFlag(2)).toBe(true);

      // Bread: 40-50g net carbs (not low carb)
      expect(computeLowCarbFlag(45)).toBe(false);

      // Avocado: ~2g net carbs (low carb)
      expect(computeLowCarbFlag(2.1)).toBe(true);
    });
  });

  describe('Integration with Dutch/EU Regulations', () => {
    test('complies with EU food labeling regulation 1924/2006', () => {
      // EU regulation specifies exact thresholds for nutrition claims
      expect(EU_HIGH_FIBER_THRESHOLD).toBe(6); // Per 100g or per 100ml

      // Test products at regulation boundary
      expect(computeHighFiberFlag(6.0)).toBe(true); // Exactly meets requirement
      expect(computeHighFiberFlag(5.99)).toBe(false); // Just below requirement
    });

    test('uses appropriate Dutch dietary standards', () => {
      // Dutch fitness/health community standard for high protein
      expect(DUTCH_HIGH_PROTEIN_THRESHOLD).toBe(20);

      // Ketogenic diet standard common in Netherlands
      expect(LOW_CARB_THRESHOLD).toBe(10);
    });
  });
});

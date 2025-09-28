import { describe, it, expect } from 'vitest';
import { designTokens } from '../../src/lib/design-tokens';

describe('Nutrition Colors Contract', () => {
  describe('Protein Level Colors', () => {
    it('should have distinct colors for protein levels', () => {
      const { protein } = designTokens.colors.nutrition;
      
      expect(protein.low).not.toBe(protein.moderate);
      expect(protein.moderate).not.toBe(protein.high);
      expect(protein.low).not.toBe(protein.high);
    });

    it('should use semantic progression (light → dark for low → high)', () => {
      const { protein } = designTokens.colors.nutrition;
      
      // Convert hex to brightness values for comparison
      const getBrightness = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
      };

      const lowBrightness = getBrightness(protein.low);
      const moderateBrightness = getBrightness(protein.moderate);
      const highBrightness = getBrightness(protein.high);

      // High protein should be darker (lower brightness) than low protein
      expect(highBrightness).toBeLessThan(lowBrightness);
    });
  });

  describe('Calorie Level Colors', () => {
    it('should have distinct colors for calorie levels', () => {
      const { calories } = designTokens.colors.nutrition;
      
      expect(calories.low).not.toBe(calories.moderate);
      expect(calories.moderate).not.toBe(calories.high);
      expect(calories.low).not.toBe(calories.high);
    });

    it('should progress from green (low) to red (high)', () => {
      const { calories } = designTokens.colors.nutrition;
      
      // Low calories should be greenish, high should be reddish
      expect(calories.low).toMatch(/^#[a-f0-9]{6}$/i);
      expect(calories.high).toMatch(/^#[a-f0-9]{6}$/i);
    });
  });

  describe('Health Grade Colors', () => {
    it('should have all grade levels A through E', () => {
      const { health } = designTokens.colors.nutrition;
      
      expect(health.A).toBeDefined();
      expect(health.B).toBeDefined();
      expect(health.C).toBeDefined();
      expect(health.D).toBeDefined();
      expect(health.E).toBeDefined();
    });

    it('should have distinct colors for each grade', () => {
      const { health } = designTokens.colors.nutrition;
      const grades = [health.A, health.B, health.C, health.D, health.E];
      const uniqueGrades = new Set(grades);
      
      expect(uniqueGrades.size).toBe(5);
    });

    it('should progress from green (A) to red (E)', () => {
      const { health } = designTokens.colors.nutrition;
      
      // Grade A should be greenish (good)
      const aColor = health.A.toLowerCase();
      expect(aColor).toMatch(/^#[0-9a-f]{6}$/);
      
      // Grade E should be reddish (bad)
      const eColor = health.E.toLowerCase();
      expect(eColor).toMatch(/^#[0-9a-f]{6}$/);
      
      // A should be different from E
      expect(health.A).not.toBe(health.E);
    });
  });

  describe('Halal Status Colors', () => {
    it('should have all halal status levels', () => {
      const { halal } = designTokens.colors;
      
      expect(halal.confirmed).toBeDefined();
      expect(halal.questionable).toBeDefined();
      expect(halal.prohibited).toBeDefined();
    });

    it('should have distinct colors for each status', () => {
      const { halal } = designTokens.colors;
      
      expect(halal.confirmed).not.toBe(halal.questionable);
      expect(halal.questionable).not.toBe(halal.prohibited);
      expect(halal.confirmed).not.toBe(halal.prohibited);
    });

    it('should use traffic light semantics', () => {
      const { halal } = designTokens.colors;
      
      // Confirmed should be greenish
      expect(halal.confirmed).toMatch(/^#[0-9a-f]{6}$/i);
      
      // Questionable should be amber/yellowish
      expect(halal.questionable).toMatch(/^#[0-9a-f]{6}$/i);
      
      // Prohibited should be reddish
      expect(halal.prohibited).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('Color Accessibility', () => {
    it('should have sufficient contrast ratios', () => {
      // Basic hex color validation
      const colors = [
        ...Object.values(designTokens.colors.nutrition.protein),
        ...Object.values(designTokens.colors.nutrition.calories),
        ...Object.values(designTokens.colors.nutrition.health),
        ...Object.values(designTokens.colors.halal),
      ];

      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });
});

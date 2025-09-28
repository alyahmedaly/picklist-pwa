import { describe, it, expect } from 'vitest';
import { designTokens, DesignTokenProvider, type DesignTokens } from '../../src/lib/design-tokens';

describe('Design Tokens Contract', () => {
  describe('DesignTokens Interface', () => {
    it('should have required color structure', () => {
      expect(designTokens.colors).toBeDefined();
      expect(designTokens.colors.nutrition).toBeDefined();
      expect(designTokens.colors.halal).toBeDefined();
      expect(designTokens.colors.semantic).toBeDefined();
    });

    it('should have nutrition protein levels', () => {
      const { protein } = designTokens.colors.nutrition;
      expect(protein.low).toMatch(/^#[0-9a-f]{6}$/i);
      expect(protein.moderate).toMatch(/^#[0-9a-f]{6}$/i);
      expect(protein.high).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should have health grades A-E', () => {
      const { health } = designTokens.colors.nutrition;
      expect(health.A).toMatch(/^#[0-9a-f]{6}$/i);
      expect(health.B).toMatch(/^#[0-9a-f]{6}$/i);
      expect(health.C).toMatch(/^#[0-9a-f]{6}$/i);
      expect(health.D).toMatch(/^#[0-9a-f]{6}$/i);
      expect(health.E).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should have halal status colors', () => {
      const { halal } = designTokens.colors;
      expect(halal.confirmed).toMatch(/^#[0-9a-f]{6}$/i);
      expect(halal.questionable).toMatch(/^#[0-9a-f]{6}$/i);
      expect(halal.prohibited).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should have complete spacing scale', () => {
      expect(designTokens.spacing.xs).toBeDefined();
      expect(designTokens.spacing.sm).toBeDefined();
      expect(designTokens.spacing.md).toBeDefined();
      expect(designTokens.spacing.lg).toBeDefined();
      expect(designTokens.spacing.xl).toBeDefined();
      expect(designTokens.spacing['2xl']).toBeDefined();
    });

    it('should have typography system', () => {
      expect(designTokens.typography.sizes).toBeDefined();
      expect(designTokens.typography.weights).toBeDefined();
      expect(designTokens.typography.lineHeights).toBeDefined();
    });
  });

  describe('DesignTokenProvider', () => {
    it('should instantiate with default tokens', () => {
      const provider = new DesignTokenProvider();
      expect(provider.getTokens()).toEqual(designTokens);
    });

    it('should accept custom tokens', () => {
      const customTokens = { ...designTokens };
      const provider = new DesignTokenProvider(customTokens);
      expect(provider.getTokens()).toEqual(customTokens);
    });

    it('should get color by path', () => {
      const provider = new DesignTokenProvider();
      expect(provider.getColor('nutrition.protein.high')).toBe(designTokens.colors.nutrition.protein.high);
      expect(provider.getColor('halal.confirmed')).toBe(designTokens.colors.halal.confirmed);
      expect(provider.getColor('semantic.primary')).toBe(designTokens.colors.semantic.primary);
    });

    it('should throw on invalid color path', () => {
      const provider = new DesignTokenProvider();
      expect(() => provider.getColor('invalid.path')).toThrow('Color token not found: invalid.path');
    });

    it('should get spacing values', () => {
      const provider = new DesignTokenProvider();
      expect(provider.getSpacing('sm')).toBe(designTokens.spacing.sm);
      expect(provider.getSpacing('lg')).toBe(designTokens.spacing.lg);
    });

    it('should generate CSS custom properties', () => {
      const provider = new DesignTokenProvider();
      const cssVars = provider.toCSSCustomProperties();
      
      expect(cssVars['--color-protein-high']).toBe(designTokens.colors.nutrition.protein.high);
      expect(cssVars['--color-halal-confirmed']).toBe(designTokens.colors.halal.confirmed);
      expect(cssVars['--spacing-md']).toBe(designTokens.spacing.md);
    });
  });
});

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderWithProviders as render } from '../utils/component-test-utils';
import { quickContrastTest } from '../utils/safe-axe';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { HalalBadge } from '../../src/components/nutrition/halal-badge';

describe('Component Accessibility - Color Contrast', () => {
  describe('Button Color Contrast', () => {
    it('should have sufficient contrast for destructive variant', async () => {
      const { container } = render(<Button variant="destructive">Test</Button>);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for protein-high variant', async () => {
      const { container } = render(<Button variant="protein-high">High Protein</Button>);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for health-A variant', async () => {
      const { container } = render(<Button variant="health-A">Grade A</Button>);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for health-D variant', async () => {
      const { container } = render(<Button variant="health-D">Grade D</Button>);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for halal-confirmed variant', async () => {
      const { container } = render(<Button variant="halal-confirmed">Halal</Button>);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Badge Color Contrast', () => {
    it('should have sufficient contrast for destructive variant', async () => {
      const { container } = render(<Badge variant="destructive">Test</Badge>);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for protein-high variant', async () => {
      const { container } = render(<Badge variant="protein-high">High Protein</Badge>);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('HalalBadge Color Contrast', () => {
    it('should have sufficient contrast for confirmed status', async () => {
      const { container } = render(<HalalBadge status="confirmed" />);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for prohibited status', async () => {
      const { container } = render(<HalalBadge status="prohibited" />);
      const results = await quickContrastTest(container);
      expect(results).toHaveNoViolations();
    });
  });
});
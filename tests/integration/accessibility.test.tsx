import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderWithProviders as render, axe, testAccessibility } from '../utils/component-test-utils';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { HalalBadge } from '../../src/components/nutrition/halal-badge';

describe('Component Accessibility Integration', () => {
  // Note: toHaveNoViolations matcher is added in tests/setup.ts

  describe('Base Components Accessibility', () => {
    it('Button should pass axe accessibility tests', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Button variants should pass axe accessibility tests', async () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

      for (const variant of variants) {
        const { container } = render(<Button variant={variant}>Test Button</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('Badge should pass axe accessibility tests', async () => {
      const { container } = render(<Badge>Test Badge</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Badge variants should pass axe accessibility tests', async () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

      for (const variant of variants) {
        const { container } = render(<Badge variant={variant}>Test Badge</Badge>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('Card should pass axe accessibility tests', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Nutrition Components Accessibility', () => {
    it('HalalBadge should pass axe accessibility tests', async () => {
      const { container } = render(<HalalBadge status="confirmed" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('HalalBadge variants should pass axe accessibility tests', async () => {
      const statuses = ['confirmed', 'questionable', 'prohibited', 'unknown'] as const;

      for (const status of statuses) {
        const { container } = render(<HalalBadge status={status} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('HalalBadge should have proper ARIA attributes', async () => {
      const { getByTestId } = render(
        <HalalBadge
          status="confirmed"
          data-testid="halal-badge"
        />
      );
      const badge = getByTestId('halal-badge');
      expect(badge).toHaveAttribute('aria-label');
      expect(badge).toHaveAttribute('data-status', 'confirmed');
    });
  });

  describe('Button Accessibility Contract', () => {
    it('should have proper focus management', async () => {
      const { getByRole } = render(<Button>Click me</Button>);
      const button = getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tabIndex).not.toBe(-1);
    });

    it('should be keyboard accessible', async () => {
      const { getByRole } = render(<Button>Click me</Button>);
      const button = getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should support disabled state properly', async () => {
      const { getByRole } = render(<Button disabled>Disabled Button</Button>);
      const button = getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('HalalBadge Accessibility Contract', () => {
    it('should provide clear status information', async () => {
      const { getByTestId } = render(
        <HalalBadge
          status="confirmed"
          data-testid="halal-badge"
        />
      );
      const badge = getByTestId('halal-badge');
      expect(badge).toHaveAttribute('aria-label');
      expect(badge.getAttribute('aria-label')).toContain('Halal status: confirmed');
    });

    it('should support interactive mode', async () => {
      const handleClick = () => {};
      const { getByTestId } = render(
        <HalalBadge
          status="confirmed"
          onClick={handleClick}
          data-testid="halal-badge"
        />
      );
      const badge = getByTestId('halal-badge');
      expect(badge).toHaveAttribute('role', 'button');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Color Contrast Accessibility', () => {
    it('should have sufficient color contrast for nutrition button variants', async () => {
      const nutritionVariants = ['protein-high', 'protein-moderate', 'protein-low'] as const;

      for (const variant of nutritionVariants) {
        const { container } = render(<Button variant={variant}>Test</Button>);
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      }
    });

    it('should have sufficient color contrast for health grade variants', async () => {
      const healthVariants = ['health-A', 'health-B', 'health-C', 'health-D', 'health-E'] as const;

      for (const variant of healthVariants) {
        const { container } = render(<Button variant={variant}>Grade {variant.split('-')[1]}</Button>);
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      }
    });

    it('should have sufficient color contrast for halal status variants', async () => {
      const halalVariants = ['halal-confirmed', 'halal-questionable', 'halal-prohibited'] as const;

      for (const variant of halalVariants) {
        const { container } = render(<Button variant={variant}>Halal Status</Button>);
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      }
    });

    it('should have sufficient color contrast for HalalBadge status colors', async () => {
      const statuses = ['confirmed', 'questionable', 'prohibited'] as const;

      for (const status of statuses) {
        const { container } = render(<HalalBadge status={status} />);
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true }
          }
        });
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Mobile Accessibility', () => {
    it('should support voice control on mobile', async () => {
      const { getByRole } = render(
        <Button aria-label="Add to cart">Add to cart</Button>
      );
      const button = getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add to cart');
    });

    it('should have proper touch target sizing', async () => {
      const { getByRole } = render(<Button>Touch Target</Button>);
      const button = getByRole('button');
      // Button component uses h-10 (40px) and has touch-target class for accessibility
      expect(button).toHaveClass('touch-target');
    });

    it('should support keyboard navigation', async () => {
      const { getByRole } = render(<Button>Keyboard Accessible</Button>);
      const button = getByRole('button');
      expect(button.tabIndex).not.toBe(-1);
    });
  });
});

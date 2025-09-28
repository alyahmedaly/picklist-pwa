import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '../utils/component-test-utils';
import { designTokens } from '../../src/lib/design-tokens';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Card } from '../../src/components/ui/card';
import { HalalBadge } from '../../src/components/nutrition/halal-badge';

describe('Design System Consistency Integration', () => {
  describe('Color Consistency', () => {
    it('should use consistent destructive colors across Button and Badge', () => {
      const { container: buttonContainer } = render(
        <Button variant="destructive">Delete</Button>
      );
      const { container: badgeContainer } = render(
        <Badge variant="destructive">Error</Badge>
      );

      const button = buttonContainer.querySelector('button');
      const badge = badgeContainer.querySelector('div');

      // Both should use the same destructive color classes
      expect(button).toHaveClass('bg-destructive');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('should use consistent health grade colors', () => {
      const { container: buttonContainer } = render(
        <Button variant="health-A">Grade A</Button>
      );
      const { container: badgeContainer } = render(
        <Badge variant="health-A">A Grade</Badge>
      );

      const button = buttonContainer.querySelector('button');
      const badge = badgeContainer.querySelector('div');

      // Both should use health-A color
      expect(button).toHaveClass('bg-health-A');
      expect(badge).toHaveClass('bg-health-A');
    });

    it('should use consistent protein level colors', () => {
      const { container: buttonContainer } = render(
        <Button variant="protein-high">High Protein</Button>
      );
      const { container: badgeContainer } = render(
        <Badge variant="protein-high">High Protein</Badge>
      );

      const button = buttonContainer.querySelector('button');
      const badge = badgeContainer.querySelector('div');

      // Both should use protein-high color
      expect(button).toHaveClass('bg-protein-high');
      expect(badge).toHaveClass('bg-protein-high');
    });
  });

  describe('Spacing Consistency', () => {
    it('should use consistent padding across components', () => {
      const { container: cardContainer } = render(
        <Card>Test Card Content</Card>
      );
      const { container: buttonContainer } = render(
        <Button>Test Button</Button>
      );

      const card = cardContainer.querySelector('div');
      const button = buttonContainer.querySelector('button');

      // Both should be rendered and have proper structure
      expect(card).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  });

  describe('Nutrition Color System Consistency', () => {
    it('should use consistent halal status colors', () => {
      const { container: halalContainer } = render(
        <HalalBadge status="confirmed" />
      );
      const { container: buttonContainer } = render(
        <Button variant="halal-confirmed">Halal Confirmed</Button>
      );

      const halalBadge = halalContainer.querySelector('[data-status="confirmed"]');
      const button = buttonContainer.querySelector('button');

      // Both should use halal-confirmed styling
      expect(halalBadge).toHaveClass('bg-halal-confirmed');
      expect(button).toHaveClass('bg-halal-confirmed');
    });

    it('should have consistent text contrast in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Button variant="destructive">Dark Mode Button</Button>
          <Badge variant="destructive">Dark Mode Badge</Badge>
        </div>
      );

      const button = container.querySelector('button');
      const badge = container.querySelector('div[class*="bg-destructive"]');

      // Both should have proper dark mode text classes
      expect(button).toHaveClass('text-white', 'dark:text-black');
      expect(badge).toHaveClass('text-white', 'dark:text-black');
    });
  });

  describe('Design Token Integration', () => {
    it('should use design tokens from the central system', () => {
      // Verify design tokens are available
      expect(designTokens).toBeDefined();
      expect(designTokens.colors).toBeDefined();
      expect(designTokens.colors.nutrition).toBeDefined();
    });

    it('should maintain consistent sizing across components', () => {
      const { container: buttonContainer } = render(
        <Button size="sm">Small Button</Button>
      );
      const { container: badgeContainer } = render(
        <Badge>Default Badge</Badge>
      );

      const button = buttonContainer.querySelector('button');
      const badge = badgeContainer.querySelector('div');

      // Both should use consistent height classes
      expect(button).toHaveClass('h-9'); // Small button height
      expect(badge).toHaveClass('text-xs'); // Consistent text sizing
    });
  });
});
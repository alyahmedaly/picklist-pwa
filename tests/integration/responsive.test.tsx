import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '../utils/component-test-utils';
import { mockViewport, mockViewports } from '../utils/component-test-utils';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Badge } from '../../src/components/ui/badge';
import { HalalBadge } from '../../src/components/nutrition/halal-badge';

describe('Component Responsive Integration', () => {
  describe('Base Components Responsiveness', () => {
    it('should render Button correctly on mobile viewport', () => {
      mockViewport('mobile');

      const { container } = render(<Button>Click me</Button>);
      const button = container.querySelector('button');

      expect(button).toBeInTheDocument();
      expect(button?.tabIndex).not.toBe(-1);
    });

    it('should render Card correctly on tablet viewport', () => {
      mockViewport('tablet');

      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      );

      const card = container.querySelector('div');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Nutrition Components Responsiveness', () => {
    it('should render HalalBadge correctly across viewports', () => {
      // Test mobile
      mockViewport('mobile');
      const { container: mobileContainer } = render(
        <HalalBadge status="confirmed" />
      );
      expect(mobileContainer.querySelector('[data-status="confirmed"]')).toBeInTheDocument();

      // Test desktop
      mockViewport('desktop');
      const { container: desktopContainer } = render(
        <HalalBadge status="confirmed" />
      );
      expect(desktopContainer.querySelector('[data-status="confirmed"]')).toBeInTheDocument();
    });

    it('should maintain readability on different screen sizes', () => {
      Object.keys(mockViewports).forEach((viewport) => {
        mockViewport(viewport as keyof typeof mockViewports);

        const { container } = render(
          <div>
            <Button>Test Button</Button>
            <Badge>Test Badge</Badge>
            <HalalBadge status="confirmed" />
          </div>
        );

        const button = container.querySelector('button');
        const badge = container.querySelector('div[class*="bg-primary"]');
        const halalBadge = container.querySelector('[data-status="confirmed"]');

        // All components should be rendered
        expect(button).toBeInTheDocument();
        expect(badge).toBeInTheDocument();
        expect(halalBadge).toBeInTheDocument();
      });
    });
  });

  describe('Touch Target Accessibility', () => {
    it('should have adequate touch targets on mobile', () => {
      mockViewport('mobile');

      const { container } = render(
        <div>
          <Button>Touch Target</Button>
          <Badge>Badge</Badge>
        </div>
      );

      const button = container.querySelector('button');

      // Button should have minimum touch target class
      expect(button).toHaveClass('touch-target');
      expect(button).toHaveClass('h-10'); // 40px height for touch targets
    });

    it('should support keyboard navigation on all viewports', () => {
      Object.keys(mockViewports).forEach((viewport) => {
        mockViewport(viewport as keyof typeof mockViewports);

        const { container } = render(<Button>Keyboard Accessible</Button>);
        const button = container.querySelector('button');

        expect(button?.tabIndex).not.toBe(-1);
      });
    });
  });

  describe('Layout Consistency', () => {
    it('should maintain consistent spacing across viewports', () => {
      const viewports = ['mobile', 'tablet', 'desktop'] as const;

      viewports.forEach(viewport => {
        mockViewport(viewport);

        const { container } = render(
          <Card>
            <CardContent>
              <Button>Action</Button>
              <Badge>Status</Badge>
            </CardContent>
          </Card>
        );

        const card = container.querySelector('div');
        const button = container.querySelector('button');
        const badge = container.querySelector('div[class*="bg-primary"]');

        // All components should maintain structure
        expect(card).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        expect(badge).toBeInTheDocument();
      });
    });

    it('should handle text overflow gracefully', () => {
      mockViewport('mobile');

      const { container } = render(
        <div>
          <Button>Very Long Button Text That Might Overflow</Button>
          <Badge>Long Badge Text</Badge>
        </div>
      );

      const button = container.querySelector('button');
      const badge = container.querySelector('div[class*="bg-primary"]');

      // Components should have proper text handling
      expect(button).toHaveClass('whitespace-nowrap');
      expect(badge).toBeInTheDocument();
    });
  });
});
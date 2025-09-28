/**
 * Category Index Responsive Design Integration Test
 *
 * Tests responsive behavior of CategoryIndexPage across different viewport sizes
 * with grid layout adaptation, touch interactions, and mobile optimization.
 *
 * CRITICAL: This test MUST FAIL before implementation exists.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryIndexPage } from '../../src/pages/CategoryIndexPage';
import type { CategoryWithMetrics } from '../../src/types/category-index';

// Mock fetch for category data loading
global.fetch = vi.fn();

// Mock matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Category data for responsive testing
const mockCategoryData: CategoryWithMetrics[] = [
  {
    name: 'Zuivel, eieren, boter',
    path: ['Zuivel, eieren, boter'],
    breadcrumbs: 'Zuivel, eieren, boter',
    depth: 1,
    productCount: 245,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: 85,
      averageProtein: 18.5,
      priceEfficiency: 0.35,
      recommendedFor: ['daily-protein', 'post-workout']
    }
  },
  {
    name: 'Vlees, vis, vegetarisch',
    path: ['Vlees, vis, vegetarisch'],
    breadcrumbs: 'Vlees, vis, vegetarisch',
    depth: 1,
    productCount: 189,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: 45,
      averageProtein: 25.2,
      priceEfficiency: 0.42,
      recommendedFor: ['daily-protein', 'training-day']
    }
  },
  {
    name: 'Bakkerij',
    path: ['Bakkerij'],
    breadcrumbs: 'Bakkerij',
    depth: 1,
    productCount: 78,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: 92,
      averageProtein: 8.1,
      priceEfficiency: 1.25,
      recommendedFor: ['rest-day']
    }
  },
  {
    name: 'Groente, fruit',
    path: ['Groente, fruit'],
    breadcrumbs: 'Groente, fruit',
    depth: 1,
    productCount: 156,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: 98,
      averageProtein: 2.3,
      priceEfficiency: 2.50,
      recommendedFor: []
    }
  }
];

describe('Category Index Responsive Design Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        categoryTree: mockCategoryData,
        metadata: {
          totalCategories: mockCategoryData.length,
          aliMetricsEnabled: true
        }
      })
    });
  });

  describe('Mobile Viewport (320px - 767px)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
      mockMatchMedia(true); // Mobile media query matches
    });

    it('displays categories in single column grid on mobile', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toBeInTheDocument();
        expect(categoryGrid).toHaveClass(/grid-cols-1/); // Single column on mobile
      });
    });

    it('uses compact category cards on mobile', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryCards = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should use compact variant for mobile
        categoryCards.forEach(card => {
          expect(card).toHaveClass(/compact/);
        });
      });
    });

    it('stacks search filters vertically on mobile', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const searchContainer = screen.getByLabelText(/search and filter categories/i);
        expect(searchContainer).toHaveClass(/flex-col/); // Vertical stacking
        expect(searchContainer).not.toHaveClass(/flex-row/);
      });
    });

    it('makes Ali metrics badges touch-friendly on mobile', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const halalBadges = screen.getAllByText(/halal/i);

        halalBadges.forEach(badge => {
          const badgeElement = badge.closest('span');
          // Should have minimum 44px touch target
          expect(badgeElement).toHaveClass(/min-h-11/); // 44px minimum
        });
      });
    });

    it('supports touch interactions on mobile category cards', async () => {
      const user = userEvent.setup();

      // Mock window.location for navigation testing
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });

      // Should support touch events
      expect(categoryButton).toHaveAttribute('tabIndex', '0');
      expect(categoryButton).toHaveClass(/cursor-pointer/);

      // Touch interaction should work
      await user.click(categoryButton);
      expect(window.location.href).toContain('/products');
    });

    it('optimizes search input for mobile keyboards', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search categories/i);

        // Should have mobile-optimized attributes
        expect(searchInput).toHaveAttribute('autocomplete', 'off');
        expect(searchInput).toHaveAttribute('autocapitalize', 'none');
        expect(searchInput).toHaveAttribute('spellcheck', 'false');
        expect(searchInput).toHaveClass(/text-base/); // Prevents zoom on iOS
      });
    });

    it('collapses Ali filter panel by default on mobile', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const filterPanel = screen.getByLabelText(/halal compliance/i).closest('[role="group"]');
        expect(filterPanel).toHaveClass(/hidden/); // Collapsed by default
      });

      // Should have expand button
      const expandFiltersButton = screen.getByRole('button', { name: /show.*filters/i });
      expect(expandFiltersButton).toBeInTheDocument();
    });

    it('expands Ali filter panel when expand button tapped', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const expandFiltersButton = screen.getByRole('button', { name: /show.*filters/i });
        expect(expandFiltersButton).toBeInTheDocument();
      });

      const expandFiltersButton = screen.getByRole('button', { name: /show.*filters/i });
      await user.click(expandFiltersButton);

      await waitFor(() => {
        const filterPanel = screen.getByLabelText(/halal compliance/i).closest('[role="group"]');
        expect(filterPanel).not.toHaveClass(/hidden/);
        expect(filterPanel).toBeVisible();
      });
    });
  });

  describe('Tablet Viewport (768px - 1023px)', () => {
    beforeEach(() => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      mockMatchMedia(false); // Mobile query doesn't match
    });

    it('displays categories in two-column grid on tablet', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toBeInTheDocument();
        expect(categoryGrid).toHaveClass(/grid-cols-2/); // Two columns on tablet
      });
    });

    it('uses detailed category cards on tablet', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryCards = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should use detailed variant for tablet
        categoryCards.forEach(card => {
          expect(card).toHaveClass(/detailed/);
        });
      });
    });

    it('displays search and filters in horizontal layout on tablet', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const searchContainer = screen.getByLabelText(/search and filter categories/i);
        expect(searchContainer).toHaveClass(/flex-row/); // Horizontal layout
        expect(searchContainer).not.toHaveClass(/flex-col/);
      });
    });

    it('shows Ali filter panel expanded by default on tablet', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const filterPanel = screen.getByLabelText(/halal compliance/i).closest('[role="group"]');
        expect(filterPanel).not.toHaveClass(/hidden/);
        expect(filterPanel).toBeVisible();
      });
    });

    it('optimizes touch targets for tablet interactions', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryButtons = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        categoryButtons.forEach(button => {
          // Should have comfortable touch targets
          expect(button).toHaveClass(/min-h-12/); // 48px minimum
        });
      });
    });
  });

  describe('Desktop Viewport (1024px+)', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });
      mockMatchMedia(false); // Mobile query doesn't match
    });

    it('displays categories in three-column grid on desktop', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toBeInTheDocument();
        expect(categoryGrid).toHaveClass(/grid-cols-3/); // Three columns on desktop
      });
    });

    it('uses detailed category cards with hover effects on desktop', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryCard = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
        expect(categoryCard).toHaveClass(/detailed/);
        expect(categoryCard).toHaveClass(/hover:shadow-lg/); // Hover effects
      });

      const categoryCard = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.hover(categoryCard);

      // Should show hover state
      expect(categoryCard).toHaveClass(/hover:shadow-lg/);
    });

    it('displays search and filters in optimized desktop layout', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const searchContainer = screen.getByLabelText(/search and filter categories/i);
        expect(searchContainer).toHaveClass(/flex-row/);
        expect(searchContainer).toHaveClass(/justify-between/); // Spread layout
      });
    });

    it('shows all Ali filter controls expanded on desktop', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/halal compliance/i)).toBeVisible();
        expect(screen.getByLabelText(/protein density/i)).toBeVisible();
        expect(screen.getByLabelText(/price efficiency/i)).toBeVisible();
        expect(screen.getByLabelText(/daily protein/i)).toBeVisible();
        expect(screen.getByLabelText(/post workout/i)).toBeVisible();
      });
    });

    it('supports mouse interactions with precise targeting', async () => {
      const user = userEvent.setup();

      // Mock window.location for navigation testing
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryCard = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });

      // Should support precise mouse interactions
      await user.hover(categoryCard);
      await user.click(categoryCard);

      expect(window.location.href).toContain('/products');

      // Should handle right-click for context menu
      await user.pointer({ keys: '[MouseRight]', target: categoryCard });
    });
  });

  describe('Large Desktop Viewport (1440px+)', () => {
    beforeEach(() => {
      // Mock large desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 900,
      });
    });

    it('displays categories in four-column grid on large desktop', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-4/); // Four columns on large desktop
      });
    });

    it('uses maximum content width with centered layout', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const mainContainer = screen.getByRole('main');
        expect(mainContainer).toHaveClass(/max-w-7xl/); // Maximum width constraint
        expect(mainContainer).toHaveClass(/mx-auto/); // Centered
      });
    });
  });

  describe('Viewport Transitions', () => {
    it('gracefully handles viewport size changes', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Start with mobile
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-1/);
      });

      // Switch to tablet
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-2/);
      });

      // Switch to desktop
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-3/);
      });
    });

    it('maintains Ali filter state during viewport transitions', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Apply filters on desktop
      Object.defineProperty(window, 'innerWidth', { value: 1024 });

      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      await waitFor(() => {
        expect(screen.getByText(/3.*of.*4.*categories/i)).toBeInTheDocument();
      });

      // Switch to mobile
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        // Filter state should be preserved
        expect(screen.getByText(/3.*of.*4.*categories/i)).toBeInTheDocument();

        // Grid should adapt to mobile
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-1/);
      });
    });
  });

  describe('Performance on Different Viewports', () => {
    it('maintains performance on mobile with virtual scrolling', async () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 500 }, (_, i) => ({
        ...mockCategoryData[0],
        name: `Category ${i + 1}`,
        path: [`Category ${i + 1}`],
        breadcrumbs: `Category ${i + 1}`,
      }));

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          categoryTree: largeDataset,
          metadata: { totalCategories: largeDataset.length }
        })
      });

      Object.defineProperty(window, 'innerWidth', { value: 375 });

      const startTime = performance.now();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const virtualGrid = screen.getByTestId('virtual-grid');
        expect(virtualGrid).toBeInTheDocument();

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Should render within performance budget even on mobile
        expect(renderTime).toBeLessThan(3000); // 3s budget for mobile
      });
    });

    it('optimizes image loading for different viewport densities', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryCards = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        categoryCards.forEach(card => {
          const images = card.querySelectorAll('img');
          images.forEach(img => {
            // Should have appropriate sizes for responsive images
            expect(img).toHaveAttribute('sizes');
            expect(img).toHaveAttribute('srcset');
          });
        });
      });
    });
  });

  describe('Accessibility Across Viewports', () => {
    it('maintains keyboard navigation on all viewport sizes', async () => {
      const user = userEvent.setup();

      // Test on mobile
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Should support keyboard navigation
      await user.tab();
      expect(screen.getByPlaceholderText(/search categories/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /sort/i })).toHaveFocus();
    });

    it('provides appropriate focus indicators on all viewports', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const focusableElements = screen.getAllByRole('button');

        focusableElements.forEach(element => {
          // Should have focus indicators
          expect(element).toHaveClass(/focus:outline/);
          expect(element).toHaveClass(/focus:ring/);
        });
      });
    });

    it('announces viewport changes to screen readers', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Switch viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        // Should announce layout change
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toHaveTextContent(/mobile.*layout/i);
      });
    });
  });

  describe('Touch and Gesture Support', () => {
    it('supports swipe gestures for category navigation on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryGrid = screen.getByRole('grid');

      // Should support touch events
      expect(categoryGrid).toHaveAttribute('touch-action', 'pan-y');
    });

    it('handles pinch-to-zoom appropriately', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        // Should allow user scaling for accessibility
        expect(viewport).toHaveAttribute('content', expect.stringContaining('user-scalable=yes'));
      });
    });

    it('provides haptic feedback on supported devices', async () => {
      const user = userEvent.setup();
      Object.defineProperty(window, 'innerWidth', { value: 375 });

      // Mock haptic feedback
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, 'vibrate', { value: mockVibrate });

      // Mock window.location for navigation testing
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // Should provide haptic feedback on touch devices
      expect(mockVibrate).toHaveBeenCalledWith(10); // Light tap feedback
    });
  });
});
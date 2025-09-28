/**
 * Category Display Integration Test
 *
 * Tests integration between CategoryCard and CategoryIndexPage components
 * with real Ali metrics data and display behavior.
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

// Real category data with Ali metrics (representative of production data)
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
      priceEfficiency: 2.50, // Poor protein efficiency
      recommendedFor: []
    }
  }
];

describe('Category Display Integration', () => {
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

  describe('CategoryCard Display Within CategoryIndexPage', () => {
    it('displays all category cards with Ali metrics in grid layout', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        // Check that all categories are displayed as cards
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Bakkerij')).toBeInTheDocument();
        expect(screen.getByText('Groente, fruit')).toBeInTheDocument();

        // Verify grid layout exists
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toBeInTheDocument();
      });
    });

    it('displays Ali metrics consistently across all category cards', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        // Check halal compliance percentages
        expect(screen.getByText(/85%.*halal/i)).toBeInTheDocument();
        expect(screen.getByText(/45%.*halal/i)).toBeInTheDocument();
        expect(screen.getByText(/92%.*halal/i)).toBeInTheDocument();
        expect(screen.getByText(/98%.*halal/i)).toBeInTheDocument();

        // Check protein densities
        expect(screen.getByText(/18\.5g.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/25\.2g.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/8\.1g.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/2\.3g.*protein/i)).toBeInTheDocument();

        // Check price efficiency values
        expect(screen.getByText(/€0\.35.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/€0\.42.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/€1\.25.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/€2\.50.*protein/i)).toBeInTheDocument();
      });
    });

    it('applies correct visual styling for Ali metrics thresholds', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        // High halal compliance (>80%) should be green
        const highHalalBadge = screen.getByText(/85%.*halal/i);
        expect(highHalalBadge.closest('[class*="green"]')).toBeInTheDocument();

        const veryHighHalalBadge = screen.getByText(/92%.*halal/i);
        expect(veryHighHalalBadge.closest('[class*="green"]')).toBeInTheDocument();

        // Medium halal compliance (50-80%) should be yellow
        const mediumHalalBadge = screen.getByText(/45%.*halal/i);
        expect(mediumHalalBadge.closest('[class*="yellow"]')).toBeInTheDocument();

        // High protein (>15g/100g) should be blue
        const highProteinBadge = screen.getByText(/25\.2g.*protein/i);
        expect(highProteinBadge.closest('[class*="blue"]')).toBeInTheDocument();

        // Good price efficiency (<€0.50/g) should be emerald
        const goodEfficiencyBadge = screen.getByText(/€0\.35.*protein/i);
        expect(goodEfficiencyBadge.closest('[class*="emerald"]')).toBeInTheDocument();
      });
    });

    it('displays Ali context recommendations consistently', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        // Check that context badges are displayed
        expect(screen.getByText(/daily.protein/i)).toBeInTheDocument();
        expect(screen.getByText(/post.workout/i)).toBeInTheDocument();
        expect(screen.getByText(/training.day/i)).toBeInTheDocument();
        expect(screen.getByText(/rest.day/i)).toBeInTheDocument();

        // Verify categories without recommendations don't show context badges
        const fruitVegCard = screen.getByText('Groente, fruit').closest('button');
        expect(fruitVegCard).not.toHaveTextContent(/daily.protein/i);
        expect(fruitVegCard).not.toHaveTextContent(/post.workout/i);
      });
    });
  });

  describe('CategoryCard Interaction Integration', () => {
    it('handles category card clicks with proper navigation', async () => {
      const user = userEvent.setup();

      // Mock window.location.href assignment
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // Should navigate to product list with category filter
      expect(window.location.href).toContain('/products');
      expect(window.location.href).toContain('category=Zuivel%2C%20eieren%2C%20boter');
    });

    it('supports keyboard navigation across category cards', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Tab through category cards
      await user.tab();
      await user.tab();
      await user.tab(); // Skip search and sort controls

      const firstCategoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      expect(firstCategoryButton).toHaveFocus();

      await user.tab();
      const secondCategoryButton = screen.getByRole('button', { name: /vlees.*vis.*vegetarisch/i });
      expect(secondCategoryButton).toHaveFocus();
    });

    it('provides accessible aria-labels for category cards with Ali metrics', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
        const ariaLabel = categoryButton.getAttribute('aria-label');

        expect(ariaLabel).toContain('Zuivel, eieren, boter');
        expect(ariaLabel).toContain('245 products');
        expect(ariaLabel).toContain('85% halal');
        expect(ariaLabel).toContain('18.5g protein');
        expect(ariaLabel).toContain('€0.35 protein efficiency');
      });
    });
  });

  describe('Ali Metrics Data Integrity', () => {
    it('handles missing Ali metrics gracefully without breaking display', async () => {
      const categoriesWithMissingMetrics = [
        {
          ...mockCategoryData[0],
          aliMetrics: {
            halalCompliance: 0,
            averageProtein: 0,
            priceEfficiency: 999,
            recommendedFor: []
          }
        }
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          categoryTree: categoriesWithMissingMetrics,
          metadata: { totalCategories: 1, aliMetricsEnabled: true }
        })
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText(/245.*products/i)).toBeInTheDocument();

        // Should show placeholder or "no data" state
        expect(screen.getByText(/no.*data/i)).toBeInTheDocument();
      });
    });

    it('displays accurate Ali metrics calculations across different categories', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        // Verify that different categories show different Ali metrics
        // This tests that the metrics are correctly calculated and not hardcoded

        // Dairy category - high protein, good halal compliance
        const dairyCard = screen.getByText('Zuivel, eieren, boter').closest('button');
        expect(dairyCard).toHaveTextContent(/85%.*halal/i);
        expect(dairyCard).toHaveTextContent(/18\.5g.*protein/i);

        // Meat category - highest protein, lower halal compliance
        const meatCard = screen.getByText('Vlees, vis, vegetarisch').closest('button');
        expect(meatCard).toHaveTextContent(/45%.*halal/i);
        expect(meatCard).toHaveTextContent(/25\.2g.*protein/i);

        // Fruit/veg category - highest halal, lowest protein
        const produceCard = screen.getByText('Groente, fruit').closest('button');
        expect(produceCard).toHaveTextContent(/98%.*halal/i);
        expect(produceCard).toHaveTextContent(/2\.3g.*protein/i);
      });
    });

    it('maintains Ali metrics display consistency during state changes', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/85%.*halal/i)).toBeInTheDocument();
      });

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        // Filtered results should still show Ali metrics
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText(/85%.*halal/i)).toBeInTheDocument();
        expect(screen.getByText(/18\.5g.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/€0\.35.*protein/i)).toBeInTheDocument();

        // Other categories should be hidden but Ali metrics should remain consistent
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration Requirements', () => {
    it('renders Ali metrics within performance budget', async () => {
      const startTime = performance.now();

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText(/85%.*halal/i)).toBeInTheDocument();

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Should render all Ali metrics within 2s budget
        expect(renderTime).toBeLessThan(2000);
      });
    });

    it('maintains smooth interaction during Ali metrics display', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Rapid interactions with Ali metrics display should remain responsive
      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });

      const startTime = performance.now();
      await user.hover(categoryButton);
      await user.unhover(categoryButton);
      const endTime = performance.now();

      const interactionTime = endTime - startTime;
      expect(interactionTime).toBeLessThan(100); // <100ms for smooth UX
    });
  });

  describe('Error Recovery Integration', () => {
    it('handles Ali metrics loading errors without breaking category display', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          categoryTree: mockCategoryData.map(cat => ({
            ...cat,
            aliMetrics: undefined // Simulate missing Ali metrics
          })),
          metadata: { totalCategories: mockCategoryData.length, aliMetricsEnabled: false }
        })
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        // Should still display categories without Ali metrics
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText(/245.*products/i)).toBeInTheDocument();

        // Should gracefully handle missing Ali metrics
        expect(screen.queryByText(/halal/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/protein/i)).not.toBeInTheDocument();
      });
    });

    it('recovers from Ali metrics calculation errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          categoryTree: [{
            ...mockCategoryData[0],
            aliMetrics: {
              halalCompliance: NaN,
              averageProtein: Infinity,
              priceEfficiency: -1,
              recommendedFor: null
            }
          }],
          metadata: { totalCategories: 1, aliMetricsEnabled: true }
        })
      });

      expect(() => {
        render(<CategoryIndexPage />);
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        // Should handle invalid metrics gracefully
        expect(screen.getByText(/no.*data/i)).toBeInTheDocument();
      });
    });
  });
});
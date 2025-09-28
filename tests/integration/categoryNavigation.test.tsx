/**
 * Category Navigation Integration Test
 *
 * Tests navigation flow from CategoryIndexPage to product list pages
 * with Ali filter preservation and URL parameter handling.
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

// Mock URLSearchParams for URL parameter testing
const mockURLSearchParams = {
  toString: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  has: vi.fn(),
  delete: vi.fn(),
};

// Category data for navigation testing
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
    name: 'Brood, gebak, granen',
    path: ['Bakkerij', 'Brood, gebak, granen'],
    breadcrumbs: 'Bakkerij > Brood, gebak, granen',
    depth: 2,
    productCount: 45,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: 88,
      averageProtein: 9.2,
      priceEfficiency: 1.15,
      recommendedFor: ['rest-day']
    }
  }
];

describe('Category Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location
    delete (window as any).location;
    window.location = {
      href: '',
      pathname: '/categories',
      search: '',
      assign: vi.fn(),
      replace: vi.fn(),
    } as any;

    // Mock URLSearchParams
    global.URLSearchParams = vi.fn(() => mockURLSearchParams) as any;

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

  describe('Basic Navigation Flow', () => {
    it('navigates to product list when category clicked', async () => {
      const user = userEvent.setup();
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

    it('handles subcategory navigation with proper breadcrumb encoding', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Brood, gebak, granen')).toBeInTheDocument();
      });

      const subcategoryButton = screen.getByRole('button', { name: /brood.*gebak.*granen/i });
      await user.click(subcategoryButton);

      // Should navigate with full category path
      expect(window.location.href).toContain('/products');
      expect(window.location.href).toContain('category=Bakkerij%2C%20Brood%2C%20gebak%2C%20granen');
    });

    it('navigates with Enter key for keyboard accessibility', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      categoryButton.focus();
      await user.keyboard('{Enter}');

      expect(window.location.href).toContain('/products');
      expect(window.location.href).toContain('category=Zuivel%2C%20eieren%2C%20boter');
    });

    it('navigates with Space key for keyboard accessibility', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /vlees.*vis.*vegetarisch/i });
      categoryButton.focus();
      await user.keyboard('{ }');

      expect(window.location.href).toContain('/products');
      expect(window.location.href).toContain('category=Vlees%2C%20vis%2C%20vegetarisch');
    });
  });

  describe('Ali Filter Preservation in Navigation', () => {
    it('preserves halal compliance filter in navigation URL', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Apply halal filter
      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      // Click category
      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // URL should include filter preferences
      expect(window.location.href).toContain('minHalalCompliance=80');
    });

    it('preserves protein density filter in navigation URL', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
      });

      // Apply protein filter
      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '20');

      // Click category
      const categoryButton = screen.getByRole('button', { name: /vlees.*vis.*vegetarisch/i });
      await user.click(categoryButton);

      // URL should include filter preferences
      expect(window.location.href).toContain('minProtein=20');
    });

    it('preserves price efficiency filter in navigation URL', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Apply price efficiency filter
      const efficiencySlider = screen.getByLabelText(/price efficiency/i);
      await user.clear(efficiencySlider);
      await user.type(efficiencySlider, '0.40');

      // Click category
      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // URL should include filter preferences
      expect(window.location.href).toContain('maxPricePerProtein=0.40');
    });

    it('preserves Ali context filters in navigation URL', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Apply context filters
      const dailyProteinCheckbox = screen.getByLabelText(/daily protein/i);
      await user.click(dailyProteinCheckbox);

      const postWorkoutCheckbox = screen.getByLabelText(/post workout/i);
      await user.click(postWorkoutCheckbox);

      // Click category
      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // URL should include context preferences
      expect(window.location.href).toContain('contexts=daily-protein%2Cpost-workout');
    });

    it('preserves multiple Ali filters simultaneously in navigation', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Apply multiple filters
      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '75');

      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '15');

      const dailyProteinCheckbox = screen.getByLabelText(/daily protein/i);
      await user.click(dailyProteinCheckbox);

      // Click category
      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // URL should include all filter preferences
      expect(window.location.href).toContain('minHalalCompliance=75');
      expect(window.location.href).toContain('minProtein=15');
      expect(window.location.href).toContain('contexts=daily-protein');
    });

    it('preserves search query in navigation URL', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Apply search
      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        expect(screen.getByText(/1.*of.*3.*categories/i)).toBeInTheDocument();
      });

      // Click category
      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // URL should include search query
      expect(window.location.href).toContain('searchQuery=zuivel');
    });
  });

  describe('URL Parameter Encoding', () => {
    it('properly encodes Dutch characters in category names', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // Should properly encode Dutch characters and spaces
      expect(window.location.href).toContain('category=Zuivel%2C%20eieren%2C%20boter');
    });

    it('properly encodes special characters in breadcrumb paths', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Brood, gebak, granen')).toBeInTheDocument();
      });

      const subcategoryButton = screen.getByRole('button', { name: /brood.*gebak.*granen/i });
      await user.click(subcategoryButton);

      // Should encode the full breadcrumb path with proper separators
      expect(window.location.href).toMatch(/category=.*Bakkerij.*Brood.*gebak.*granen/);
    });

    it('handles categories with apostrophes and special Dutch characters', async () => {
      const categoryWithSpecialChars = {
        ...mockCategoryData[0],
        name: "Koek's & snoepjes",
        breadcrumbs: "Koek's & snoepjes"
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          categoryTree: [categoryWithSpecialChars],
          metadata: { totalCategories: 1, aliMetricsEnabled: true }
        })
      });

      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText("Koek's & snoepjes")).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /koek.*snoepjes/i });
      await user.click(categoryButton);

      // Should properly encode special characters
      expect(window.location.href).toMatch(/category=.*Koek.*snoepjes/);
    });
  });

  describe('Back Navigation Support', () => {
    it('preserves category index state when returning from product list', async () => {
      const user = userEvent.setup();

      // Simulate returning from product list with preserved filters
      window.location.search = '?minHalalCompliance=80&searchQuery=zuivel';

      render(<CategoryIndexPage />);

      await waitFor(() => {
        // Should restore previous filter state
        expect(screen.getByDisplayValue('80')).toBeInTheDocument(); // halal slider
        expect(screen.getByDisplayValue('zuivel')).toBeInTheDocument(); // search input

        // Should show filtered results
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument();
      });
    });

    it('handles invalid URL parameters gracefully', async () => {
      // Simulate invalid URL parameters
      window.location.search = '?minHalalCompliance=invalid&minProtein=999&contexts=unknown';

      expect(() => {
        render(<CategoryIndexPage />);
      }).not.toThrow();

      await waitFor(() => {
        // Should show all categories with default filters
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Performance', () => {
    it('navigates within performance budget', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });

      const startTime = performance.now();
      await user.click(categoryButton);
      const endTime = performance.now();

      const navigationTime = endTime - startTime;
      expect(navigationTime).toBeLessThan(100); // <100ms for navigation
    });

    it('preserves filter state efficiently during navigation', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Apply multiple filters
      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '15');

      const startTime = performance.now();

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      const endTime = performance.now();

      const preservationTime = endTime - startTime;
      expect(preservationTime).toBeLessThan(150); // <150ms even with multiple filters
    });
  });

  describe('Error Handling in Navigation', () => {
    it('handles navigation errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock navigation error
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        assign: vi.fn(() => { throw new Error('Navigation failed'); }),
      } as any;

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });

      // Should not crash on navigation error
      expect(async () => {
        await user.click(categoryButton);
      }).not.toThrow();

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/navigation.*error/i)).toBeInTheDocument();
      });
    });

    it('provides fallback navigation when product list unavailable', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Mock unavailable product list
      window.location.href = '';

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      await user.click(categoryButton);

      // Should provide fallback or show appropriate message
      await waitFor(() => {
        expect(screen.getByText(/products.*unavailable/i) || screen.getByText(/try.*again/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility in Navigation', () => {
    it('announces navigation intent to screen readers', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });

      // Should have proper aria-label for navigation intent
      expect(categoryButton).toHaveAttribute('aria-label', expect.stringContaining('view products'));
    });

    it('provides skip links for keyboard navigation', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const skipLink = screen.getByText(/skip to categories/i);
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#category-grid');
      });
    });

    it('maintains focus management during navigation', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Tab to first category
      await user.tab();
      await user.tab();
      await user.tab(); // Skip search and sort controls

      const categoryButton = screen.getByRole('button', { name: /zuivel.*eieren.*boter/i });
      expect(categoryButton).toHaveFocus();

      // Navigation should preserve focus state for back navigation
      await user.click(categoryButton);

      // Focus should be managed appropriately
      expect(document.activeElement).toBeTruthy();
    });
  });
});
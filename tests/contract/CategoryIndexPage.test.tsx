/**
 * CategoryIndexPage Component Contract Test
 *
 * TDD test for CategoryIndexPage component - MUST FAIL before implementation
 * Tests main page functionality, virtual scrolling, and data loading
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryIndexPage } from '../../src/pages/CategoryIndexPage';
import type { CategoryWithMetrics } from '../../src/types/category-index';

// Mock fetch for data loading
global.fetch = vi.fn();

// Mock category data with Ali metrics
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
  }
];

// Create large dataset for virtual scrolling tests
const createLargeDataset = (count: number): CategoryWithMetrics[] => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Category ${i + 1}`,
    path: [`Category ${i + 1}`],
    breadcrumbs: `Category ${i + 1}`,
    depth: 1,
    productCount: Math.floor(Math.random() * 100) + 1,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: Math.floor(Math.random() * 100),
      averageProtein: Math.random() * 30,
      priceEfficiency: Math.random() * 2,
      recommendedFor: ['daily-protein']
    }
  }));
};

describe('CategoryIndexPage Component Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        categoryTree: mockCategoryData,
        metadata: {
          totalCategories: mockCategoryData.length
        }
      })
    });
  });

  describe('Data Loading - Contract Requirements', () => {
    it('loads category data from /category-tree.json on mount', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/category-tree.json');
      });
    });

    it('displays loading state while fetching data', () => {
      // Mock slow response
      (global.fetch as any).mockReturnValue(
        new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ categoryTree: mockCategoryData })
          }), 100);
        })
      );

      render(<CategoryIndexPage />);

      expect(screen.getByText(/loading categories/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays categories after successful data load', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Bakkerij')).toBeInTheDocument();
      });
    });

    it('handles data loading errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/error loading categories/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('retries data loading when retry button clicked', async () => {
      const user = userEvent.setup();

      // First call fails
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      // Second call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categoryTree: mockCategoryData })
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Category Display - Contract Requirements FR-001, FR-002', () => {
    it('displays all categories in grid/card layout', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toBeInTheDocument();

        // Check all categories are displayed
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Bakkerij')).toBeInTheDocument();
      });
    });

    it('shows product count for each category', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/245.*products?/i)).toBeInTheDocument();
        expect(screen.getByText(/189.*products?/i)).toBeInTheDocument();
        expect(screen.getByText(/78.*products?/i)).toBeInTheDocument();
      });
    });

    it('displays Ali metrics for each category when enabled', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        // Check halal compliance percentages
        expect(screen.getByText(/85%.*halal/i)).toBeInTheDocument();
        expect(screen.getByText(/45%.*halal/i)).toBeInTheDocument();
        expect(screen.getByText(/92%.*halal/i)).toBeInTheDocument();

        // Check protein density
        expect(screen.getByText(/18\.5g.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/25\.2g.*protein/i)).toBeInTheDocument();

        // Check price efficiency
        expect(screen.getByText(/€0\.35.*protein/i)).toBeInTheDocument();
        expect(screen.getByText(/€0\.42.*protein/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Integration - Contract Requirements FR-008, FR-009', () => {
    it('includes CategorySearch component', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search categories/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/halal compliance/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();
      });
    });

    it('filters categories based on search query', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument();
      });
    });

    it('filters categories by halal compliance', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
      });

      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument(); // 85%
        expect(screen.getByText('Bakkerij')).toBeInTheDocument(); // 92%
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument(); // 45%
      });
    });

    it('sorts categories by different criteria', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: /sort/i });
      await user.click(sortButton);

      const nameSort = screen.getByText(/name.*a-z/i);
      await user.click(nameSort);

      await waitFor(() => {
        const categories = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should be sorted alphabetically: Bakkerij, Vlees, Zuivel
        expect(categories[0]).toHaveTextContent('Bakkerij');
        expect(categories[1]).toHaveTextContent('Vlees, vis, vegetarisch');
        expect(categories[2]).toHaveTextContent('Zuivel, eieren, boter');
      });
    });

    it('updates result count when filters applied', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/3.*of.*3.*categories/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        expect(screen.getByText(/1.*of.*3.*categories/i)).toBeInTheDocument();
      });
    });
  });

  describe('Category Navigation - Contract Requirements FR-003', () => {
    it('navigates to product list when category clicked', async () => {
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

    it('preserves Ali filter preferences in navigation URL', async () => {
      const user = userEvent.setup();

      delete (window as any).location;
      window.location = { href: '' } as any;

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
  });

  describe('Virtual Scrolling - Contract Requirements Performance', () => {
    it('enables virtual scrolling for large datasets', async () => {
      const largeDataset = createLargeDataset(500);

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          categoryTree: largeDataset,
          metadata: { totalCategories: largeDataset.length }
        })
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        const virtualGrid = screen.getByTestId('virtual-grid');
        expect(virtualGrid).toBeInTheDocument();

        // Should only render visible items (not all 500)
        const visibleItems = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );
        expect(visibleItems.length).toBeLessThan(100); // Virtual window size
      });
    });

    it('maintains smooth scrolling performance with large datasets', async () => {
      const largeDataset = createLargeDataset(1000);

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          categoryTree: largeDataset,
          metadata: { totalCategories: largeDataset.length }
        })
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        const virtualGrid = screen.getByTestId('virtual-grid');
        expect(virtualGrid).toBeInTheDocument();
      });

      // Simulate scrolling
      const scrollContainer = screen.getByTestId('virtual-grid');
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 1000 } });

      // Should still be responsive
      expect(scrollContainer.scrollTop).toBe(1000);
    });
  });

  describe('Responsive Design - Contract Requirements FR-012', () => {
    it('adjusts grid layout for mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-1/); // Single column on mobile
      });
    });

    it('adjusts grid layout for tablet viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-2/); // Two columns on tablet
      });
    });

    it('adjusts grid layout for desktop viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryGrid = screen.getByRole('grid');
        expect(categoryGrid).toHaveClass(/grid-cols-3/); // Three columns on desktop
      });
    });
  });

  describe('Accessibility - Contract Requirements', () => {
    it('provides proper page title and heading structure', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/category.*index/i);
        expect(document.title).toContain('Category Index');
      });
    });

    it('supports keyboard navigation throughout the page', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByPlaceholderText(/search categories/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /sort/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/halal compliance/i)).toHaveFocus();
    });

    it('announces page state changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toHaveTextContent(/1.*categories/i);
      });
    });

    it('provides skip links for keyboard users', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const skipLink = screen.getByText(/skip to categories/i);
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#category-grid');
      });
    });
  });

  describe('Performance Requirements - Contract Compliance', () => {
    it('loads page content within 2 second target', async () => {
      const startTime = performance.now();

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();

        const endTime = performance.now();
        const loadTime = endTime - startTime;

        expect(loadTime).toBeLessThan(2000);
      });
    });

    it('responds to search input within 100ms after debounce', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);

      const startTime = performance.now();
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        const endTime = performance.now();
        const responseTime = endTime - startTime - 300; // Subtract debounce time

        expect(responseTime).toBeLessThan(100);
        expect(screen.getByText(/1.*of.*3.*categories/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery - Contract Requirements', () => {
    it('handles network timeouts gracefully', async () => {
      (global.fetch as any).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
      );

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/error loading categories/i)).toBeInTheDocument();
        expect(screen.getByText(/timeout/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles invalid JSON responses gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/error loading categories/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid.*data/i)).toBeInTheDocument();
      });
    });

    it('provides fallback content when categories cannot be loaded', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText(/browse categories/i)).toBeInTheDocument();
        expect(screen.getByText(/explore.*nutrition/i)).toBeInTheDocument();
      });
    });
  });
});
/**
 * Search and Filter Integration Test
 *
 * Tests integration between CategorySearch and CategoryIndexPage components
 * with search functionality, Ali filter criteria, and Dutch language support.
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

// Comprehensive category data for search and filter testing
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
  },
  {
    name: 'Koek, snoep, chocolade',
    path: ['Koek, snoep, chocolade'],
    breadcrumbs: 'Koek, snoep, chocolade',
    depth: 1,
    productCount: 123,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: 15, // Low halal compliance
      averageProtein: 5.8,
      priceEfficiency: 3.20, // Poor efficiency
      recommendedFor: []
    }
  },
  {
    name: 'Vleeswaren',
    path: ['Vleeswaren'],
    breadcrumbs: 'Vleeswaren',
    depth: 1,
    productCount: 67,
    children: [],
    isExpanded: false,
    isSelected: false,
    isVisible: true,
    aliMetrics: {
      halalCompliance: 25, // Low halal compliance
      averageProtein: 22.1, // High protein
      priceEfficiency: 0.28, // Good efficiency
      recommendedFor: ['daily-protein', 'budget']
    }
  }
];

describe('Search and Filter Integration', () => {
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

  describe('Search Functionality Integration', () => {
    it('filters categories based on search query in real time', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        // Should show only matching category
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument();
        expect(screen.queryByText('Bakkerij')).not.toBeInTheDocument();

        // Should update result count
        expect(screen.getByText(/1.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('supports Dutch character normalization in search', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Koek, snoep, chocolade')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'koek');

      await waitFor(() => {
        expect(screen.getByText('Koek, snoep, chocolade')).toBeInTheDocument();
        expect(screen.queryByText('Zuivel, eieren, boter')).not.toBeInTheDocument();
      });
    });

    it('handles partial word matches in Dutch category names', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Vleeswaren')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'vlees');

      await waitFor(() => {
        // Should match both categories containing "vlees"
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Vleeswaren')).toBeInTheDocument();
        expect(screen.queryByText('Zuivel, eieren, boter')).not.toBeInTheDocument();

        // Should update result count
        expect(screen.getByText(/2.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('debounces search input to avoid excessive filtering', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);

      // Type rapidly
      await user.type(searchInput, 'zuiv');

      // Should not filter immediately
      expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();

      // Wait for debounce
      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument();
      }, { timeout: 400 });
    });

    it('clears search results when search is cleared', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'zuivel');

      await waitFor(() => {
        expect(screen.getByText(/1.*of.*6.*categories/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      await waitFor(() => {
        // Should show all categories again
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Bakkerij')).toBeInTheDocument();
        expect(screen.getByText(/6.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });
  });

  describe('Ali Filter Integration', () => {
    it('filters categories by halal compliance threshold', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Koek, snoep, chocolade')).toBeInTheDocument();
      });

      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      await waitFor(() => {
        // Should show only categories with ≥80% halal compliance
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument(); // 85%
        expect(screen.getByText('Bakkerij')).toBeInTheDocument(); // 92%
        expect(screen.getByText('Groente, fruit')).toBeInTheDocument(); // 98%

        // Should hide categories with <80% halal compliance
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument(); // 45%
        expect(screen.queryByText('Koek, snoep, chocolade')).not.toBeInTheDocument(); // 15%
        expect(screen.queryByText('Vleeswaren')).not.toBeInTheDocument(); // 25%

        // Should update result count
        expect(screen.getByText(/3.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('filters categories by minimum protein density', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Groente, fruit')).toBeInTheDocument();
      });

      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '15');

      await waitFor(() => {
        // Should show only categories with ≥15g protein per 100g
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument(); // 18.5g
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument(); // 25.2g
        expect(screen.getByText('Vleeswaren')).toBeInTheDocument(); // 22.1g

        // Should hide categories with <15g protein
        expect(screen.queryByText('Bakkerij')).not.toBeInTheDocument(); // 8.1g
        expect(screen.queryByText('Groente, fruit')).not.toBeInTheDocument(); // 2.3g
        expect(screen.queryByText('Koek, snoep, chocolade')).not.toBeInTheDocument(); // 5.8g

        // Should update result count
        expect(screen.getByText(/3.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('filters categories by price efficiency threshold', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Koek, snoep, chocolade')).toBeInTheDocument();
      });

      const efficiencySlider = screen.getByLabelText(/price efficiency/i);
      await user.clear(efficiencySlider);
      await user.type(efficiencySlider, '0.50');

      await waitFor(() => {
        // Should show only categories with ≤€0.50 per gram protein
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument(); // €0.35
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument(); // €0.42
        expect(screen.getByText('Vleeswaren')).toBeInTheDocument(); // €0.28

        // Should hide categories with >€0.50 per gram protein
        expect(screen.queryByText('Bakkerij')).not.toBeInTheDocument(); // €1.25
        expect(screen.queryByText('Groente, fruit')).not.toBeInTheDocument(); // €2.50
        expect(screen.queryByText('Koek, snoep, chocolade')).not.toBeInTheDocument(); // €3.20

        // Should update result count
        expect(screen.getByText(/3.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('filters categories by Ali context recommendations', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Bakkerij')).toBeInTheDocument();
      });

      const dailyProteinCheckbox = screen.getByLabelText(/daily protein/i);
      await user.click(dailyProteinCheckbox);

      await waitFor(() => {
        // Should show only categories recommended for daily protein
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Vleeswaren')).toBeInTheDocument();

        // Should hide categories not recommended for daily protein
        expect(screen.queryByText('Bakkerij')).not.toBeInTheDocument();
        expect(screen.queryByText('Groente, fruit')).not.toBeInTheDocument();
        expect(screen.queryByText('Koek, snoep, chocolade')).not.toBeInTheDocument();

        // Should update result count
        expect(screen.getByText(/3.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('combines multiple Ali filters with AND logic', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Vleeswaren')).toBeInTheDocument();
      });

      // Apply halal compliance filter (≥80%)
      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      // Apply protein density filter (≥15g)
      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '15');

      await waitFor(() => {
        // Should show only categories meeting BOTH criteria
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument(); // 85% halal, 18.5g protein

        // Should hide categories that don't meet both criteria
        expect(screen.queryByText('Vlees, vis, vegetarisch')).not.toBeInTheDocument(); // 45% halal (fails)
        expect(screen.queryByText('Vleeswaren')).not.toBeInTheDocument(); // 25% halal (fails)
        expect(screen.queryByText('Bakkerij')).not.toBeInTheDocument(); // 8.1g protein (fails)
        expect(screen.queryByText('Groente, fruit')).not.toBeInTheDocument(); // 2.3g protein (fails)

        // Should update result count
        expect(screen.getByText(/1.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sorting Integration', () => {
    it('sorts categories by product count descending by default', async () => {
      render(<CategoryIndexPage />);

      await waitFor(() => {
        const categoryButtons = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should be sorted by product count descending
        expect(categoryButtons[0]).toHaveTextContent('Zuivel, eieren, boter'); // 245
        expect(categoryButtons[1]).toHaveTextContent('Vlees, vis, vegetarisch'); // 189
        expect(categoryButtons[2]).toHaveTextContent('Groente, fruit'); // 156
        expect(categoryButtons[3]).toHaveTextContent('Koek, snoep, chocolade'); // 123
      });
    });

    it('sorts categories alphabetically when name sort selected', async () => {
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
        const categoryButtons = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should be sorted alphabetically
        expect(categoryButtons[0]).toHaveTextContent('Bakkerij');
        expect(categoryButtons[1]).toHaveTextContent('Groente, fruit');
        expect(categoryButtons[2]).toHaveTextContent('Koek, snoep, chocolade');
        expect(categoryButtons[3]).toHaveTextContent('Vlees, vis, vegetarisch');
        expect(categoryButtons[4]).toHaveTextContent('Vleeswaren');
        expect(categoryButtons[5]).toHaveTextContent('Zuivel, eieren, boter');
      });
    });

    it('sorts categories by protein density when protein sort selected', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: /sort/i });
      await user.click(sortButton);

      const proteinSort = screen.getByText(/protein.*highest/i);
      await user.click(proteinSort);

      await waitFor(() => {
        const categoryButtons = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should be sorted by protein descending
        expect(categoryButtons[0]).toHaveTextContent('Vlees, vis, vegetarisch'); // 25.2g
        expect(categoryButtons[1]).toHaveTextContent('Vleeswaren'); // 22.1g
        expect(categoryButtons[2]).toHaveTextContent('Zuivel, eieren, boter'); // 18.5g
        expect(categoryButtons[3]).toHaveTextContent('Bakkerij'); // 8.1g
      });
    });

    it('sorts categories by halal compliance when halal sort selected', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Groente, fruit')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: /sort/i });
      await user.click(sortButton);

      const halalSort = screen.getByText(/halal.*compliance/i);
      await user.click(halalSort);

      await waitFor(() => {
        const categoryButtons = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should be sorted by halal compliance descending
        expect(categoryButtons[0]).toHaveTextContent('Groente, fruit'); // 98%
        expect(categoryButtons[1]).toHaveTextContent('Bakkerij'); // 92%
        expect(categoryButtons[2]).toHaveTextContent('Zuivel, eieren, boter'); // 85%
        expect(categoryButtons[3]).toHaveTextContent('Vlees, vis, vegetarisch'); // 45%
      });
    });
  });

  describe('Search and Filter Combination', () => {
    it('applies search filter and Ali filters simultaneously', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Vleeswaren')).toBeInTheDocument();
      });

      // Apply search for "vlees"
      const searchInput = screen.getByPlaceholderText(/search categories/i);
      await user.type(searchInput, 'vlees');

      await waitFor(() => {
        expect(screen.getByText(/2.*of.*6.*categories/i)).toBeInTheDocument();
      });

      // Apply halal compliance filter
      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '40');

      await waitFor(() => {
        // Should show only "vlees" categories with ≥40% halal compliance
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument(); // 45%
        expect(screen.queryByText('Vleeswaren')).not.toBeInTheDocument(); // 25%

        // Should update result count
        expect(screen.getByText(/1.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('maintains sort order when search and filters are applied', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      // Change sort to protein descending
      const sortButton = screen.getByRole('button', { name: /sort/i });
      await user.click(sortButton);
      const proteinSort = screen.getByText(/protein.*highest/i);
      await user.click(proteinSort);

      // Apply protein filter
      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '15');

      await waitFor(() => {
        const categoryButtons = screen.getAllByRole('button').filter(btn =>
          btn.textContent?.includes('products')
        );

        // Should maintain protein sort order for filtered results
        expect(categoryButtons[0]).toHaveTextContent('Vlees, vis, vegetarisch'); // 25.2g
        expect(categoryButtons[1]).toHaveTextContent('Vleeswaren'); // 22.1g
        expect(categoryButtons[2]).toHaveTextContent('Zuivel, eieren, boter'); // 18.5g
      });
    });
  });

  describe('Clear All Functionality', () => {
    it('clears all active filters when clear all button clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Koek, snoep, chocolade')).toBeInTheDocument();
      });

      // Apply multiple filters
      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '15');

      await waitFor(() => {
        expect(screen.getByText(/1.*of.*6.*categories/i)).toBeInTheDocument();
      });

      // Clear all filters
      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearAllButton);

      await waitFor(() => {
        // Should show all categories again
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
        expect(screen.getByText('Vlees, vis, vegetarisch')).toBeInTheDocument();
        expect(screen.getByText('Koek, snoep, chocolade')).toBeInTheDocument();
        expect(screen.getByText(/6.*of.*6.*categories/i)).toBeInTheDocument();

        // Filter inputs should be reset
        expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // halal slider
        expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // protein slider
      });
    });
  });

  describe('Performance Requirements', () => {
    it('responds to search input within performance budget', async () => {
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

        expect(responseTime).toBeLessThan(100); // <100ms response time
        expect(screen.getByText(/1.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });

    it('maintains smooth filtering with Ali metrics', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      });

      const halalSlider = screen.getByLabelText(/halal compliance/i);

      const startTime = performance.now();
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      await waitFor(() => {
        const endTime = performance.now();
        const filterTime = endTime - startTime;

        expect(filterTime).toBeLessThan(200); // <200ms for smooth filtering
        expect(screen.getByText(/3.*of.*6.*categories/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('announces search result changes to screen readers', async () => {
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

    it('announces filter result changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<CategoryIndexPage />);

      await waitFor(() => {
        expect(screen.getByText('Koek, snoep, chocolade')).toBeInTheDocument();
      });

      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      await waitFor(() => {
        const statusRegion = screen.getByRole('status');
        expect(statusRegion).toHaveTextContent(/3.*categories/i);
      });
    });
  });
});
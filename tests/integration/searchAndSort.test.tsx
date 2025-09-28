/**
 * Search and Sort Integration Test
 *
 * Integration test for search functionality and sort options with large datasets
 * Tests end-to-end search filtering, sort operations, and combined search+sort scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Homepage } from '../../src/components/homepage/Homepage';
import type { FilterCategory } from '../../src/types/homepage';

// Mock fetch for realistic product data
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock realistic product dataset with searchable content
const generateSearchableProducts = (count: number, filterId: string) => {
  const proteinSources = ['chicken', 'beef', 'fish', 'whey', 'protein', 'yogurt', 'milk', 'eggs'];
  const brands = ['Oikos', 'Danone', 'Fresh Valley', 'Premium Protein', 'Basic Nutrition', 'Natural', 'Organic', 'Elite'];
  const descriptors = ['premium', 'organic', 'natural', 'high', 'low', 'fat-free', 'sugar-free', 'extra'];

  return Array.from({ length: count }, (_, index) => {
    const proteinSource = proteinSources[index % proteinSources.length];
    const brand = brands[index % brands.length];
    const descriptor = descriptors[index % descriptors.length];

    return {
      id: `${filterId}-${index}`,
      name: `${descriptor} ${proteinSource} ${index % 3 === 0 ? 'powder' : index % 3 === 1 ? 'bar' : 'drink'}`,
      brand: brand,
      price: 2.99 + (index * 0.1), // €2.99 to €52.89
      currency: '€',
      nutrition: {
        protein: 5 + (index % 35), // 5-40g protein
        carbs: 2 + (index % 48), // 2-50g carbs
        fat: 0.5 + (index % 20), // 0.5-20.5g fat
        calories: 80 + (index % 220) // 80-300 calories
      },
      categoryHealthGrade: (['A', 'B', 'C', 'D', 'E'] as const)[index % 5],
      categoryHealthScore: 15 + (index % 85), // 15-100 score
      globalHealthGrade: (['A', 'B', 'C', 'D', 'E'] as const)[(index + 2) % 5],
      globalHealthScore: 10 + (index % 90),
      isHalal: index % 5 === 0, // 20% halal

      // Context-specific data
      contextScore: 25 + (index % 75),
      contextLabel: index % 4 === 0 ? 'High Protein' :
                   index % 4 === 1 ? 'Good Value' :
                   index % 4 === 2 ? 'Premium' : 'Budget',
      targetContribution: index % 6 === 0 ? `${3 + (index % 25)}% of daily target` : undefined,

      // Additional searchable fields
      ingredients: `${proteinSource}, water, natural flavors`,
      description: `${descriptor} ${proteinSource} product with excellent nutritional profile`,

      // Virtual scrolling
      displayHeight: 120,
      isVisible: false
    };
  });
};

const mockFilterCategories: FilterCategory[] = [
  {
    id: 'daily-protein',
    name: 'Daily Protein',
    description: 'High-protein foods for daily nutrition goals',
    coverage: 5000,
    isActive: true,
    dataFile: '/filtered-ali-daily-protein.jsonl',
    targetProtein: 150,
    context: 'daily'
  },
  {
    id: 'post-workout',
    name: 'Post-Workout',
    description: 'Fast carbs + protein for recovery',
    coverage: 3000,
    isActive: false,
    dataFile: '/filtered-ali-post-workout.jsonl',
    targetProtein: 30,
    context: 'post-workout'
  }
];

describe.skip('Search and Sort Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Mock product data responses
    mockFetch.mockImplementation((url: string) => {
      const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];

      if (filterId) {
        const products = generateSearchableProducts(1000, filterId); // 1k products for testing
        const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');

        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(jsonlContent)
        });
      }

      if (url.includes('-stats.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ totalRows: 1000 })
        });
      }

      return Promise.resolve({
        ok: false,
        status: 404
      });
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Search Functionality', () => {
    it('filters products by name search', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('result-count')).toHaveTextContent('1,000 products');
      }, { timeout: 5000 });

      // Search for "chicken"
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'chicken');

      // Advance debounce timer
      vi.advanceTimersByTime(300);

      // Should filter results
      await waitFor(() => {
        const resultCount = screen.getByTestId('result-count');
        const count = parseInt(resultCount.textContent?.split(' ')[0] || '0');

        // Should have fewer results (products containing "chicken")
        expect(count).toBeLessThan(1000);
        expect(count).toBeGreaterThan(0);
      });

      // Should highlight matching products
      expect(screen.getByTestId('highlighted-term')).toHaveTextContent('chicken');
    });

    it('searches across multiple fields (name and brand)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Search for brand name "Oikos"
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Oikos');

      vi.advanceTimersByTime(300);

      // Should find products from Oikos brand
      await waitFor(() => {
        const resultCount = screen.getByTestId('result-count');
        const count = parseInt(resultCount.textContent?.split(' ')[0] || '0');

        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(1000);
      });

      // Should highlight brand name
      expect(screen.getByText('Oikos')).toBeInTheDocument();
    });

    it('handles multi-word search queries', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Search for "premium protein"
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'premium protein');

      vi.advanceTimersByTime(300);

      // Should find products containing both words
      await waitFor(() => {
        const resultCount = screen.getByTestId('result-count');
        const count = parseInt(resultCount.textContent?.split(' ')[0] || '0');

        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(1000);
      });

      // Should highlight both terms
      expect(screen.getByTestId('highlighted-term')).toBeInTheDocument();
    });

    it('provides instant search with debounced API calls', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      const searchInput = screen.getByTestId('search-input');

      // Type rapidly
      await user.type(searchInput, 'c');
      await user.type(searchInput, 'h');
      await user.type(searchInput, 'i');
      await user.type(searchInput, 'c');
      await user.type(searchInput, 'k');

      // Should not trigger search immediately
      expect(screen.getByTestId('result-count')).toHaveTextContent('1,000 products');

      // Advance debounce
      vi.advanceTimersByTime(300);

      // Should now show filtered results
      await waitFor(() => {
        const resultCount = screen.getByTestId('result-count');
        const count = parseInt(resultCount.textContent?.split(' ')[0] || '0');
        expect(count).toBeLessThan(1000);
      });
    });

    it('clears search results when input is cleared', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      const searchInput = screen.getByTestId('search-input');

      // Search for something
      await user.type(searchInput, 'chicken');
      vi.advanceTimersByTime(300);

      // Verify filtered results
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeLessThan(1000);
      });

      // Clear search
      await user.clear(searchInput);
      vi.advanceTimersByTime(300);

      // Should return to full results
      await waitFor(() => {
        expect(screen.getByTestId('result-count')).toHaveTextContent('1,000 products');
      });
    });
  });

  describe('Sort Functionality', () => {
    it('sorts products by protein content (descending)', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Get initial first product protein content
      const initialFirstProduct = screen.getAllByTestId(/^product-item-/)[0];
      const initialProteinText = initialFirstProduct.textContent?.match(/(\d+)g protein/)?.[1];
      const initialProtein = parseInt(initialProteinText || '0');

      // Change sort to protein descending
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'protein-desc' } });

      // Wait for sort to apply
      await waitFor(() => {
        const newFirstProduct = screen.getAllByTestId(/^product-item-/)[0];
        const newProteinText = newFirstProduct.textContent?.match(/(\d+)g protein/)?.[1];
        const newProtein = parseInt(newProteinText || '0');

        // Should be sorted by protein (highest first)
        expect(newProtein).toBeGreaterThanOrEqual(initialProtein);
      });
    });

    it('sorts products by price (ascending)', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Change sort to price ascending
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      // Wait for sort to apply
      await waitFor(() => {
        const productItems = screen.getAllByTestId(/^product-item-/);

        // Get prices from first few products
        const prices = productItems.slice(0, 3).map(item => {
          const priceText = item.textContent?.match(/€(\d+\.\d+)/)?.[1];
          return parseFloat(priceText || '0');
        });

        // Should be in ascending order
        expect(prices[0]).toBeLessThanOrEqual(prices[1]);
        expect(prices[1]).toBeLessThanOrEqual(prices[2]);
      });
    });

    it('sorts products by health grade', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Change sort to health grade
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'health-grade' } });

      // Wait for sort to apply
      await waitFor(() => {
        const firstProduct = screen.getAllByTestId(/^product-item-/)[0];
        const healthGrade = firstProduct.querySelector('[data-testid="health-grade-badge"]')?.textContent;

        // Should start with better grades (A, B)
        expect(['A', 'B']).toContain(healthGrade);
      });
    });

    it('sorts products by calories (ascending)', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Change sort to calories ascending
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'calories-asc' } });

      // Wait for sort to apply
      await waitFor(() => {
        const productItems = screen.getAllByTestId(/^product-item-/);

        // Get calories from first few products
        const calories = productItems.slice(0, 3).map(item => {
          const calorieText = item.textContent?.match(/(\d+) cal/)?.[1];
          return parseInt(calorieText || '0');
        });

        // Should be in ascending order
        expect(calories[0]).toBeLessThanOrEqual(calories[1]);
        expect(calories[1]).toBeLessThanOrEqual(calories[2]);
      });
    });

    it('sorts products alphabetically by name', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Change sort to name
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'name' } });

      // Wait for sort to apply
      await waitFor(() => {
        const productItems = screen.getAllByTestId(/^product-item-/);

        // Get product names
        const names = productItems.slice(0, 3).map(item => {
          const nameElement = item.querySelector('h3, [data-testid*="product-name"]');
          return nameElement?.textContent || '';
        });

        // Should be in alphabetical order
        expect(names[0].localeCompare(names[1])).toBeLessThanOrEqual(0);
        expect(names[1].localeCompare(names[2])).toBeLessThanOrEqual(0);
      });
    });
  });

  describe('Combined Search and Sort', () => {
    it('maintains search results when changing sort order', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Search for "protein"
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'protein');
      vi.advanceTimersByTime(300);

      // Wait for search results
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeLessThan(1000);
        expect(count).toBeGreaterThan(0);
      });

      const searchedCount = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');

      // Change sort order
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      // Should maintain same search results count
      await waitFor(() => {
        const newCount = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(newCount).toBe(searchedCount);
      });

      // Should still highlight search terms
      expect(screen.getByTestId('highlighted-term')).toHaveTextContent('protein');
    });

    it('sorts filtered search results correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Search for "chicken" (should give us a subset)
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'chicken');
      vi.advanceTimersByTime(300);

      // Wait for search results
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(1000);
      });

      // Sort by protein descending within search results
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'protein-desc' } });

      // Wait for sort to apply
      await waitFor(() => {
        const productItems = screen.getAllByTestId(/^product-item-/);

        // All visible products should contain "chicken" and be sorted by protein
        productItems.slice(0, 3).forEach(item => {
          expect(item.textContent).toMatch(/chicken/i);
        });

        // Get protein values
        const proteins = productItems.slice(0, 3).map(item => {
          const proteinText = item.textContent?.match(/(\d+)g protein/)?.[1];
          return parseInt(proteinText || '0');
        });

        // Should be in descending order
        expect(proteins[0]).toBeGreaterThanOrEqual(proteins[1]);
        expect(proteins[1]).toBeGreaterThanOrEqual(proteins[2]);
      });
    });

    it('applies new search to sorted results', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // First, sort by price
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      await waitFor(() => {
        expect(sortSelect.value).toBe('price-asc');
      });

      // Then search for "premium"
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'premium');
      vi.advanceTimersByTime(300);

      // Should apply search to sorted results
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(1000);

        // Results should contain "premium" and be sorted by price
        const productItems = screen.getAllByTestId(/^product-item-/);
        productItems.slice(0, 2).forEach(item => {
          expect(item.textContent).toMatch(/premium/i);
        });
      });
    });

    it('handles rapid search and sort changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      const searchInput = screen.getByTestId('search-input');
      const sortSelect = screen.getByTestId('sort-select');

      // Rapid changes
      await user.type(searchInput, 'protein');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
      await user.clear(searchInput);
      await user.type(searchInput, 'chicken');
      fireEvent.change(sortSelect, { target: { value: 'protein-desc' } });

      // Advance all timers
      vi.advanceTimersByTime(500);

      // Should settle on final state
      await waitFor(() => {
        expect(searchInput.value).toBe('chicken');
        expect(sortSelect.value).toBe('protein-desc');

        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(1000);
      });
    });
  });

  describe('Cross-Filter Search and Sort', () => {
    it('maintains search and sort when switching filters', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Apply search and sort
      const searchInput = screen.getByTestId('search-input');
      const sortSelect = screen.getByTestId('sort-select');

      await user.type(searchInput, 'protein');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
      vi.advanceTimersByTime(300);

      // Verify applied
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeLessThan(1000);
      });

      // Switch filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Wait for new filter data
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should maintain search and sort settings
      expect(searchInput.value).toBe('protein');
      expect(sortSelect.value).toBe('price-asc');

      // Should apply to new filter data
      const newCount = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
      expect(newCount).toBeGreaterThan(0);
      expect(newCount).toBeLessThan(1000); // Should be filtered
    });

    it('compares search results across different filters', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load (Daily Protein)
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Search for "whey" in Daily Protein filter
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'whey');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeGreaterThan(0);
      });

      const dailyProteinWheyCount = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');

      // Switch to Post-Workout filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should maintain "whey" search
      expect(searchInput.value).toBe('whey');

      const postWorkoutWheyCount = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');

      // Both filters should have whey products, but potentially different counts
      expect(dailyProteinWheyCount).toBeGreaterThan(0);
      expect(postWorkoutWheyCount).toBeGreaterThan(0);
    });
  });

  describe('Performance with Search and Sort', () => {
    it('handles search and sort with large datasets efficiently', async () => {
      // Mock larger dataset
      mockFetch.mockImplementation((url: string) => {
        const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];

        if (filterId) {
          const products = generateSearchableProducts(5000, filterId); // 5k products
          const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');

          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(jsonlContent)
          });
        }

        return Promise.resolve({ ok: false, status: 404 });
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for large dataset load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('result-count')).toHaveTextContent('5,000 products');
      }, { timeout: 10000 });

      const startTime = Date.now();

      // Apply search and sort to large dataset
      const searchInput = screen.getByTestId('search-input');
      const sortSelect = screen.getByTestId('sort-select');

      await user.type(searchInput, 'protein');
      fireEvent.change(sortSelect, { target: { value: 'protein-desc' } });
      vi.advanceTimersByTime(300);

      // Should complete within reasonable time
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeLessThan(5000);
        expect(count).toBeGreaterThan(0);
      }, { timeout: 3000 });

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('debounces search with sort operations', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      const searchInput = screen.getByTestId('search-input');

      // Rapid typing
      await user.type(searchInput, 'c');
      await user.type(searchInput, 'h');
      await user.type(searchInput, 'i');
      await user.type(searchInput, 'c');
      await user.type(searchInput, 'k');
      await user.type(searchInput, 'e');
      await user.type(searchInput, 'n');

      // Should not search until debounce completes
      expect(screen.getByTestId('result-count')).toHaveTextContent('1,000 products');

      // Complete debounce
      vi.advanceTimersByTime(300);

      // Should now show search results
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeLessThan(1000);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty search results gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Search for something that won't exist
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'xyzveryunlikelyproductname');
      vi.advanceTimersByTime(300);

      // Should show zero results gracefully
      await waitFor(() => {
        expect(screen.getByTestId('result-count')).toHaveTextContent('0 products');
      });

      // Should show empty state message
      expect(screen.getByTestId('product-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Search with special characters
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'fat-free');
      vi.advanceTimersByTime(300);

      // Should handle hyphenated terms
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeGreaterThan(0);
      });
    });

    it('recovers from search/sort errors', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Mock occasional search failures
      let searchAttempts = 0;
      const originalImplementation = mockFetch.getMockImplementation();

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('search') || searchAttempts === 0) {
          searchAttempts++;
          if (searchAttempts === 1) {
            return Promise.reject(new Error('Search service temporarily unavailable'));
          }
        }
        return originalImplementation!(url);
      });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Try to search (might fail first time)
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'chicken');
      vi.advanceTimersByTime(300);

      // Should eventually work (retry mechanism)
      await waitFor(() => {
        const count = parseInt(screen.getByTestId('result-count').textContent?.split(' ')[0] || '0');
        expect(count).toBeLessThan(1000);
      }, { timeout: 5000 });
    });
  });
});
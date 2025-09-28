/**
 * Homepage Component Contract Test
 *
 * TDD test for Homepage component - MUST FAIL before implementation
 * Tests main homepage integration with FilterCard, SearchControls, and ProductList
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Homepage } from '../../src/components/homepage/Homepage';
import type { FilterCategory } from '../../src/types/homepage';

// Mock the child components
vi.mock('../../src/components/homepage/FilterCard', () => ({
  FilterCard: ({ category, isActive, onClick }: any) => (
    <button
      data-testid={`filter-card-${category.id}`}
      onClick={() => onClick(category)}
      className={isActive ? 'active' : ''}
    >
      {category.name} ({category.coverage} products)
    </button>
  )
}));

vi.mock('../../src/components/homepage/SearchControls', () => ({
  SearchControls: ({ searchQuery, onSearchChange, sortBy, onSortChange, resultCount }: any) => (
    <div data-testid="search-controls">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
      />
      <select
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value, 'desc')}
      >
        <option value="protein-desc">Protein (High to Low)</option>
        <option value="price-asc">Price (Low to High)</option>
      </select>
      <span data-testid="result-count">{resultCount} products</span>
    </div>
  )
}));

vi.mock('../../src/components/homepage/ProductList', () => ({
  ProductList: ({ products, loading }: any) => (
    <div data-testid="product-list">
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : (
        <div data-testid="product-count">{products.length} products loaded</div>
      )}
    </div>
  )
}));

// Mock data loading utilities
vi.mock('../../src/lib/homepage/filterCategoryLoader', () => ({
  loadAllCategories: vi.fn(),
  getDefaultCategory: vi.fn(),
  loadProductsForCategory: vi.fn()
}));

vi.mock('../../src/lib/homepage/productTransformer', () => ({
  batchTransformProducts: vi.fn(),
  filterProductsBySearch: vi.fn(),
  sortProducts: vi.fn()
}));

// Test data
const mockCategories: FilterCategory[] = [
  {
    id: 'daily-protein',
    name: 'Daily Protein',
    description: 'High-protein foods for daily nutrition goals',
    coverage: 11379,
    isActive: true,
    dataFile: '/filtered-ali-daily-protein.jsonl',
    targetProtein: 150,
    context: 'daily'
  },
  {
    id: 'post-workout',
    name: 'Post-Workout',
    description: 'Fast carbs + protein for recovery',
    coverage: 8942,
    isActive: false,
    dataFile: '/filtered-ali-post-workout.jsonl',
    targetProtein: 30,
    context: 'post-workout'
  },
  {
    id: 'cutting',
    name: 'Cutting',
    description: 'High satiety, low calorie density foods',
    coverage: 7856,
    isActive: false,
    dataFile: '/filtered-ali-cutting.jsonl',
    context: 'fat-loss'
  }
];

const mockDefaultCategory = mockCategories[0];

describe.skip('Homepage Component Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mocks
    const { loadAllCategories, getDefaultCategory, loadProductsForCategory } =
      require('../../src/lib/homepage/filterCategoryLoader');
    const { batchTransformProducts, filterProductsBySearch, sortProducts } =
      require('../../src/lib/homepage/productTransformer');

    loadAllCategories.mockResolvedValue(mockCategories);
    getDefaultCategory.mockReturnValue(mockDefaultCategory);
    loadProductsForCategory.mockResolvedValue({
      products: Array(50).fill(null).map((_, i) => ({ id: `product-${i}`, name: `Product ${i}` })),
      category: mockDefaultCategory,
      loadTime: 150,
      fromCache: false
    });
    batchTransformProducts.mockReturnValue(
      Array(50).fill(null).map((_, i) => ({ id: `product-${i}`, name: `Product ${i}` }))
    );
    filterProductsBySearch.mockImplementation((products) => products);
    sortProducts.mockImplementation((products) => products);
  });

  describe('Initial Rendering', () => {
    it('renders with provided initial categories', async () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Should render all filter categories
      expect(screen.getByTestId('filter-card-daily-protein')).toBeInTheDocument();
      expect(screen.getByTestId('filter-card-post-workout')).toBeInTheDocument();
      expect(screen.getByTestId('filter-card-cutting')).toBeInTheDocument();

      // Should show default category as active
      expect(screen.getByTestId('filter-card-daily-protein')).toHaveClass('active');
    });

    it('loads and displays search controls', async () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      expect(screen.getByTestId('search-controls')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('sort-select')).toBeInTheDocument();
    });

    it('loads and displays product list', async () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('product-list')).toBeInTheDocument();
      });
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
          className="custom-homepage"
        />
      );

      expect(container.firstChild).toHaveClass('custom-homepage');
    });

    it('shows loading state initially', () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Filter Category Navigation', () => {
    it('switches active filter when category is clicked', async () => {
      const { loadProductsForCategory } = require('../../src/lib/homepage/filterCategoryLoader');

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Click on Post-Workout filter
      const postWorkoutFilter = screen.getByTestId('filter-card-post-workout');
      fireEvent.click(postWorkoutFilter);

      // Should load products for new category
      await waitFor(() => {
        expect(loadProductsForCategory).toHaveBeenCalledWith('post-workout');
      });

      // Should update active state
      expect(postWorkoutFilter).toHaveClass('active');
      expect(screen.getByTestId('filter-card-daily-protein')).not.toHaveClass('active');
    });

    it('shows loading state during filter switch', async () => {
      const { loadProductsForCategory } = require('../../src/lib/homepage/filterCategoryLoader');

      // Mock delayed response
      loadProductsForCategory.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          products: [],
          category: mockCategories[1],
          loadTime: 300,
          fromCache: false
        }), 100))
      );

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Click filter to trigger loading
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Should show loading state
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('updates product count when switching filters', async () => {
      const { loadProductsForCategory } = require('../../src/lib/homepage/filterCategoryLoader');

      // Mock different product counts
      loadProductsForCategory
        .mockResolvedValueOnce({
          products: Array(50).fill(null).map((_, i) => ({ id: `product-${i}` })),
          category: mockDefaultCategory,
          loadTime: 150,
          fromCache: false
        })
        .mockResolvedValueOnce({
          products: Array(25).fill(null).map((_, i) => ({ id: `pw-product-${i}` })),
          category: mockCategories[1],
          loadTime: 120,
          fromCache: false
        });

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial data
      await waitFor(() => {
        expect(screen.getByTestId('result-count')).toHaveTextContent('50 products');
      });

      // Switch filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Should update count
      await waitFor(() => {
        expect(screen.getByTestId('result-count')).toHaveTextContent('25 products');
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters products when search query changes', async () => {
      const { filterProductsBySearch } = require('../../src/lib/homepage/productTransformer');
      const user = userEvent.setup();

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'chicken');

      await waitFor(() => {
        expect(filterProductsBySearch).toHaveBeenCalledWith(
          expect.any(Array),
          'chicken'
        );
      });
    });

    it('maintains search query when switching filters', async () => {
      const user = userEvent.setup();

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Add search query
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'protein');

      // Switch filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Search query should persist
      await waitFor(() => {
        expect(searchInput).toHaveValue('protein');
      });
    });

    it('updates result count based on search results', async () => {
      const { filterProductsBySearch } = require('../../src/lib/homepage/productTransformer');
      const user = userEvent.setup();

      // Mock filtered results
      filterProductsBySearch.mockReturnValue(Array(15).fill({}));

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('result-count')).toHaveTextContent('50 products');
      });

      // Search
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'chicken');

      await waitFor(() => {
        expect(screen.getByTestId('result-count')).toHaveTextContent('15 products');
      });
    });
  });

  describe('Sort Functionality', () => {
    it('sorts products when sort option changes', async () => {
      const { sortProducts } = require('../../src/lib/homepage/productTransformer');

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Change sort
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      await waitFor(() => {
        expect(sortProducts).toHaveBeenCalledWith(
          expect.any(Array),
          'price-asc',
          'desc'
        );
      });
    });

    it('maintains sort option when switching filters', async () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Change sort
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      // Switch filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Sort should persist
      await waitFor(() => {
        expect(sortSelect).toHaveValue('price-asc');
      });
    });
  });

  describe('State Management', () => {
    it('manages homepage state correctly', async () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Should start with default state
      expect(screen.getByTestId('filter-card-daily-protein')).toHaveClass('active');

      // Wait for data load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Should show loaded products
      expect(screen.getByTestId('product-count')).toHaveTextContent('50 products loaded');
    });

    it('handles state updates atomically', async () => {
      const user = userEvent.setup();

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Make multiple rapid changes
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'protein');

      fireEvent.change(screen.getByTestId('sort-select'), { target: { value: 'price-asc' } });

      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Should handle all updates correctly
      await waitFor(() => {
        expect(screen.getByTestId('filter-card-post-workout')).toHaveClass('active');
        expect(searchInput).toHaveValue('protein');
        expect(screen.getByTestId('sort-select')).toHaveValue('price-asc');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles filter loading errors gracefully', async () => {
      const { loadProductsForCategory } = require('../../src/lib/homepage/filterCategoryLoader');

      // Mock error
      loadProductsForCategory.mockRejectedValue(new Error('Network error'));

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('provides retry functionality on error', async () => {
      const { loadProductsForCategory } = require('../../src/lib/homepage/filterCategoryLoader');

      // Mock error then success
      loadProductsForCategory
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          products: Array(25).fill({}),
          category: mockDefaultCategory,
          loadTime: 200,
          fromCache: false
        });

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByTestId('retry-button'));

      // Should recover
      await waitFor(() => {
        expect(screen.getByTestId('product-count')).toHaveTextContent('25 products loaded');
      });
    });

    it('handles malformed data gracefully', async () => {
      const { loadProductsForCategory } = require('../../src/lib/homepage/filterCategoryLoader');
      const { batchTransformProducts } = require('../../src/lib/homepage/productTransformer');

      // Mock invalid data
      loadProductsForCategory.mockResolvedValue({
        products: [null, undefined, { invalid: 'data' }],
        category: mockDefaultCategory,
        loadTime: 100,
        fromCache: false
      });

      // Mock transformer filtering out invalid data
      batchTransformProducts.mockReturnValue([]);

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByTestId('product-count')).toHaveTextContent('0 products loaded');
      });
    });
  });

  describe('Performance', () => {
    it('debounces search input', async () => {
      const { filterProductsBySearch } = require('../../src/lib/homepage/productTransformer');
      const user = userEvent.setup();

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Type rapidly
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'chicken breast protein');

      // Should debounce calls
      await waitFor(() => {
        expect(filterProductsBySearch).toHaveBeenCalledTimes(1);
      });
    });

    it('caches filter data to improve performance', async () => {
      const { loadProductsForCategory } = require('../../src/lib/homepage/filterCategoryLoader');

      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch to another filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch back to original filter
      fireEvent.click(screen.getByTestId('filter-card-daily-protein'));

      // Should use cached data (faster load)
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA landmarks', () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /filter categories/i })).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
    });

    it('announces state changes to screen readers', async () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // Should have live regions for announcements
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Should announce filter change
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent(/post-workout filter active/i);
      });
    });

    it('supports keyboard navigation between sections', () => {
      render(
        <Homepage
          initialCategories={mockCategories}
          defaultCategory={mockDefaultCategory}
        />
      );

      // All interactive elements should be keyboard accessible
      const filterCards = screen.getAllByRole('button');
      const searchInput = screen.getByTestId('search-input');
      const sortSelect = screen.getByTestId('sort-select');

      filterCards.forEach(card => {
        expect(card).toHaveAttribute('tabIndex');
      });

      expect(searchInput).toHaveAttribute('tabIndex');
      expect(sortSelect).toHaveAttribute('tabIndex');
    });
  });
});
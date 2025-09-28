/**
 * Filter Navigation Integration Test
 *
 * Integration test for navigation between Ali's 6 filter categories
 * Tests end-to-end filter switching with real data loading and state management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Homepage } from '../../src/components/homepage/Homepage';
import type { FilterCategory } from '../../src/types/homepage';

// Mock fetch for JSONL file loading
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Ali's 6 filter categories with real data structure
const mockFilterCategories: FilterCategory[] = [
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
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'Cost-effective protein sources',
    coverage: 9234,
    isActive: false,
    dataFile: '/filtered-ali-budget.jsonl',
    context: 'budget'
  },
  {
    id: 'training-day',
    name: 'Training Day',
    description: 'Carb-enhanced foods for training days',
    coverage: 6758,
    isActive: false,
    dataFile: '/filtered-ali-training-day.jsonl',
    context: 'training'
  },
  {
    id: 'rest-day',
    name: 'Rest Day',
    description: 'Lower carb options for rest days',
    coverage: 5892,
    isActive: false,
    dataFile: '/filtered-ali-rest-day.jsonl',
    context: 'rest'
  }
];

// Mock product data for each filter
const generateMockProductsForFilter = (filterId: string, count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${filterId}-product-${index}`,
    name: `${filterId.charAt(0).toUpperCase() + filterId.slice(1)} Product ${index}`,
    brand: `Brand ${index % 5}`,
    price: 5.99 + (index * 0.25),
    currency: '€',
    nutrition: {
      protein: 15 + (index % 25),
      carbs: filterId === 'training-day' ? 45 + (index % 20) : 10 + (index % 15),
      fat: 5 + (index % 8),
      calories: 200 + (index % 150)
    },
    categoryHealthGrade: (['A', 'B', 'C', 'D', 'E'] as const)[index % 5],
    categoryHealthScore: 60 + (index % 40),
    isHalal: index % 3 === 0,
    // Context-specific scoring based on filter type
    ...(filterId === 'post-workout' && {
      postWorkoutOptimization: {
        recoveryScore: 75 + (index % 25)
      }
    }),
    ...(filterId === 'cutting' && {
      fatLossCompatibility: {
        satiationEfficiency: 70 + (index % 30)
      }
    }),
    ...(filterId === 'training-day' && {
      enhancedCalorieEfficiency: {
        overallScore: 80 + (index % 20)
      }
    })
  }));
};

describe.skip('Filter Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful JSONL responses for all filters
    mockFetch.mockImplementation((url: string) => {
      const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];

      if (filterId) {
        const products = generateMockProductsForFilter(filterId, 50);
        const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');

        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(jsonlContent),
          json: () => Promise.resolve(products)
        });
      }

      // Mock stats files
      if (url.includes('-stats.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ totalRows: Math.floor(Math.random() * 10000) + 5000 })
        });
      }

      return Promise.resolve({
        ok: false,
        status: 404
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Filter Load', () => {
    it('loads default Daily Protein filter on homepage mount', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Should show Daily Protein as active
      expect(screen.getByTestId('filter-card-daily-protein')).toHaveClass('active');

      // Should load products for daily protein filter
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/filtered-ali-daily-protein.jsonl');
      }, { timeout: 3000 });

      // Should display products
      await waitFor(() => {
        expect(screen.getByTestId('product-count')).toHaveTextContent('50 products loaded');
      });
    });

    it('displays all 6 Ali filter categories', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // All 6 filter cards should be present
      expect(screen.getByTestId('filter-card-daily-protein')).toBeInTheDocument();
      expect(screen.getByTestId('filter-card-post-workout')).toBeInTheDocument();
      expect(screen.getByTestId('filter-card-cutting')).toBeInTheDocument();
      expect(screen.getByTestId('filter-card-budget')).toBeInTheDocument();
      expect(screen.getByTestId('filter-card-training-day')).toBeInTheDocument();
      expect(screen.getByTestId('filter-card-rest-day')).toBeInTheDocument();
    });

    it('shows correct coverage statistics for each filter', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Should display coverage for each filter
      expect(screen.getByText('Daily Protein (11,379 products)')).toBeInTheDocument();
      expect(screen.getByText('Post-Workout (8,942 products)')).toBeInTheDocument();
      expect(screen.getByText('Cutting (7,856 products)')).toBeInTheDocument();
      expect(screen.getByText('Budget (9,234 products)')).toBeInTheDocument();
      expect(screen.getByText('Training Day (6,758 products)')).toBeInTheDocument();
      expect(screen.getByText('Rest Day (5,892 products)')).toBeInTheDocument();
    });
  });

  describe('Filter Switching', () => {
    it('switches from Daily Protein to Post-Workout filter', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Click Post-Workout filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Should show loading state
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Should load Post-Workout products
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/filtered-ali-post-workout.jsonl');
      });

      // Should update active state
      await waitFor(() => {
        expect(screen.getByTestId('filter-card-post-workout')).toHaveClass('active');
        expect(screen.getByTestId('filter-card-daily-protein')).not.toHaveClass('active');
      });

      // Should display new products
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('product-count')).toHaveTextContent('50 products loaded');
      });
    });

    it('switches between all 6 filters sequentially', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const filterSequence = [
        'post-workout',
        'cutting',
        'budget',
        'training-day',
        'rest-day',
        'daily-protein'
      ];

      for (const filterId of filterSequence) {
        // Click filter
        fireEvent.click(screen.getByTestId(`filter-card-${filterId}`));

        // Wait for load
        await waitFor(() => {
          expect(screen.getByTestId(`filter-card-${filterId}`)).toHaveClass('active');
        });

        // Verify products loaded
        await waitFor(() => {
          expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
          expect(screen.getByTestId('product-count')).toHaveTextContent('50 products loaded');
        });

        // Verify correct data file was loaded
        expect(mockFetch).toHaveBeenCalledWith(`/filtered-ali-${filterId}.jsonl`);
      }
    });

    it('maintains filter state during rapid navigation', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Rapid filter switching
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));
      fireEvent.click(screen.getByTestId('filter-card-cutting'));
      fireEvent.click(screen.getByTestId('filter-card-budget'));

      // Should end up with budget filter active
      await waitFor(() => {
        expect(screen.getByTestId('filter-card-budget')).toHaveClass('active');
      });

      // Should have loaded budget products
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/filtered-ali-budget.jsonl');
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Context-Specific Data Loading', () => {
    it('loads Post-Workout specific data with recovery scoring', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch to Post-Workout
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Verify post-workout context data is available
      const productCards = screen.getAllByTestId(/^product-item-/);
      expect(productCards.length).toBeGreaterThan(0);

      // Context-specific elements should be present
      expect(screen.getByText(/Fast Recovery|Balanced Recovery/)).toBeInTheDocument();
    });

    it('loads Cutting filter with satiety optimization data', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch to Cutting
      fireEvent.click(screen.getByTestId('filter-card-cutting'));

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Verify cutting context data
      expect(screen.getByText(/Low Cal|Very Low Cal/)).toBeInTheDocument();
    });

    it('loads Training Day filter with enhanced carb content', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch to Training Day
      fireEvent.click(screen.getByTestId('filter-card-training-day'));

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Verify training day context shows higher carb content
      expect(screen.getByText(/High Carb|Moderate Carb/)).toBeInTheDocument();
    });
  });

  describe('Performance and Caching', () => {
    it('caches filter data for faster subsequent loads', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch to Post-Workout (first time)
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch back to Daily Protein
      fireEvent.click(screen.getByTestId('filter-card-daily-protein'));
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Switch back to Post-Workout (should be cached)
      const initialFetchCount = mockFetch.mock.calls.length;
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Should load faster (from cache) - no additional fetch
      await waitFor(() => {
        expect(screen.getByTestId('filter-card-post-workout')).toHaveClass('active');
      });

      // Fetch count should not increase significantly (maybe just stats calls)
      expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(initialFetchCount + 1);
    });

    it('preloads adjacent filter categories', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load and some preloading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should have preloaded adjacent filters (Post-Workout is next to Daily Protein)
      expect(mockFetch).toHaveBeenCalledWith('/filtered-ali-post-workout.jsonl');
    });

    it('handles large dataset filter switching efficiently', async () => {
      // Mock larger datasets
      mockFetch.mockImplementation((url: string) => {
        const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];

        if (filterId) {
          const products = generateMockProductsForFilter(filterId, 500); // Larger dataset
          const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');

          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(jsonlContent)
          });
        }

        return Promise.resolve({ ok: false, status: 404 });
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

      // Switch filters with large datasets
      fireEvent.click(screen.getByTestId('filter-card-cutting'));

      // Should handle efficiently
      await waitFor(() => {
        expect(screen.getByTestId('product-count')).toHaveTextContent('500 products loaded');
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling', () => {
    it('handles filter data loading failures gracefully', async () => {
      // Mock network failure for Post-Workout filter
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('post-workout')) {
          return Promise.reject(new Error('Network error'));
        }

        // Other filters work normally
        const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];
        if (filterId) {
          const products = generateMockProductsForFilter(filterId, 50);
          const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(jsonlContent)
          });
        }

        return Promise.resolve({ ok: false, status: 404 });
      });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load (should succeed)
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Try to switch to Post-Workout (should fail)
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Should provide retry option
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('recovers from error when retrying failed filter load', async () => {
      let failCount = 0;
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('post-workout')) {
          failCount++;
          if (failCount === 1) {
            return Promise.reject(new Error('Network error'));
          }
          // Succeed on retry
          const products = generateMockProductsForFilter('post-workout', 50);
          const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(jsonlContent)
          });
        }

        const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];
        if (filterId) {
          const products = generateMockProductsForFilter(filterId, 50);
          const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(jsonlContent)
          });
        }

        return Promise.resolve({ ok: false, status: 404 });
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
      });

      // Switch to Post-Workout (will fail first time)
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Wait for error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click retry
      fireEvent.click(screen.getByTestId('retry-button'));

      // Should recover and load successfully
      await waitFor(() => {
        expect(screen.getByTestId('filter-card-post-workout')).toHaveClass('active');
        expect(screen.getByTestId('product-count')).toHaveTextContent('50 products loaded');
      });
    });

    it('maintains stable state when multiple filters fail', async () => {
      // Mock failures for multiple filters
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('post-workout') || url.includes('cutting')) {
          return Promise.reject(new Error('Network error'));
        }

        const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];
        if (filterId) {
          const products = generateMockProductsForFilter(filterId, 50);
          const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(jsonlContent)
          });
        }

        return Promise.resolve({ ok: false, status: 404 });
      });

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load (Daily Protein should work)
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Try failing filters
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('filter-card-cutting'));
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Switch to working filter (Budget)
      fireEvent.click(screen.getByTestId('filter-card-budget'));

      // Should recover and work
      await waitFor(() => {
        expect(screen.getByTestId('filter-card-budget')).toHaveClass('active');
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });
});
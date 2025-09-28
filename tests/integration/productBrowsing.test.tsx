/**
 * Product Browsing Integration Test
 *
 * Integration test for browsing through 11k+ products with virtual scrolling
 * Tests end-to-end product display, virtual scrolling performance, and user interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Homepage } from '../../src/components/homepage/Homepage';
import type { FilterCategory } from '../../src/types/homepage';

// Mock fetch for large dataset simulation
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock intersection observer for virtual scrolling
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
global.IntersectionObserver = mockIntersectionObserver;

// Mock window.requestAnimationFrame for smooth scrolling
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));

// Generate large product dataset (simulating 11k+ products)
const generateLargeProductDataset = (count: number, filterId: string) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${filterId}-${index}`,
    name: `Product ${index} - ${filterId}`,
    brand: `Brand ${index % 50}`, // 50 different brands
    price: 2.99 + (index * 0.05), // Realistic price range
    currency: '€',
    nutrition: {
      protein: 5 + (index % 30), // 5-35g protein range
      carbs: 10 + (index % 40), // 10-50g carbs
      fat: 1 + (index % 15), // 1-16g fat
      calories: 100 + (index % 200) // 100-300 calories
    },
    categoryHealthGrade: (['A', 'B', 'C', 'D', 'E'] as const)[index % 5],
    categoryHealthScore: 20 + (index % 80), // 20-100 health score
    globalHealthGrade: (['A', 'B', 'C', 'D', 'E'] as const)[(index + 1) % 5],
    globalHealthScore: 15 + (index % 85),
    isHalal: index % 4 === 0, // 25% halal products

    // Context-specific scoring
    contextScore: 30 + (index % 70),
    contextLabel: index % 3 === 0 ? 'High Protein' : index % 3 === 1 ? 'Good Value' : 'Premium',
    targetContribution: index % 5 === 0 ? `${5 + (index % 20)}% of daily target` : undefined,

    // Additional realistic product data
    ingredients: `Ingredient ${(index % 10) + 1}, Ingredient ${(index % 8) + 2}, Ingredient ${(index % 6) + 3}`,
    allergens: index % 7 === 0 ? ['milk', 'soy'] : index % 11 === 0 ? ['gluten'] : [],
    packaging: index % 3 === 0 ? '500g' : index % 3 === 1 ? '1kg' : '250g',

    // Virtual scrolling optimization
    displayHeight: 120,
    isVisible: false
  }));
};

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
  }
];

describe.skip('Product Browsing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock large dataset responses
    mockFetch.mockImplementation((url: string) => {
      const filterId = url.match(/filtered-ali-([^.]+)\.jsonl/)?.[1];

      if (filterId) {
        // Simulate 11k+ products for daily-protein, smaller for others
        const count = filterId === 'daily-protein' ? 11379 : 8942;
        const products = generateLargeProductDataset(count, filterId);
        const jsonlContent = products.map(p => JSON.stringify(p)).join('\n');

        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(jsonlContent)
        });
      }

      if (url.includes('-stats.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ totalRows: 11379 })
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

  describe('Large Dataset Loading', () => {
    it('loads and displays 11k+ products efficiently', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Wait for large dataset to load
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/filtered-ali-daily-protein.jsonl');
      }, { timeout: 5000 });

      // Should complete loading
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('product-count')).toHaveTextContent('11,379 products loaded');
      }, { timeout: 10000 });
    });

    it('handles memory efficiently with large datasets', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should use virtual scrolling (limited DOM nodes)
      const productItems = screen.getAllByTestId(/^product-item-/);

      // Virtual scrolling should render only visible items (~20-50, not 11k+)
      expect(productItems.length).toBeLessThan(100);
      expect(productItems.length).toBeGreaterThan(10);
    });

    it('maintains consistent performance with 11k+ products', async () => {
      const startTime = Date.now();

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for full load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (< 5 seconds)
      expect(loadTime).toBeLessThan(5000);

      // UI should be responsive
      expect(screen.getByTestId('product-list-container')).toBeInTheDocument();
      expect(screen.getByTestId('search-controls')).toBeInTheDocument();
    });
  });

  describe('Virtual Scrolling Performance', () => {
    it('implements virtual scrolling for 11k+ products', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      const container = screen.getByTestId('product-list-container');

      // Should have virtual scrolling attributes
      expect(container).toHaveAttribute('data-virtual-scrolling', 'true');

      // Should calculate total height for 11k+ items
      const totalHeight = parseInt(container.style.height || '0');
      expect(totalHeight).toBe(11379 * 120); // 11k+ items * 120px height
    });

    it('updates visible items during scrolling', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      const container = screen.getByTestId('product-list-container');

      // Get initial visible items
      const initialItems = screen.getAllByTestId(/^product-item-/);
      const initialItemIds = initialItems.map(item => item.getAttribute('data-testid'));

      // Simulate scroll to middle of list
      fireEvent.scroll(container, {
        target: {
          scrollTop: 60000, // Scroll to middle of 11k+ items
          scrollHeight: 11379 * 120,
          clientHeight: 600
        }
      });

      // Wait for virtual scrolling to update
      await waitFor(() => {
        const newItems = screen.getAllByTestId(/^product-item-/);
        const newItemIds = newItems.map(item => item.getAttribute('data-testid'));

        // Should render different items after scrolling
        expect(newItemIds).not.toEqual(initialItemIds);
      }, { timeout: 3000 });
    });

    it('maintains smooth scrolling with 60fps performance', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      const container = screen.getByTestId('product-list-container');

      // Should have smooth scrolling CSS
      expect(container).toHaveClass('scroll-smooth');

      // Simulate multiple rapid scroll events
      const scrollEvents = Array.from({ length: 10 }, (_, i) => i * 1000);

      scrollEvents.forEach(scrollTop => {
        fireEvent.scroll(container, { target: { scrollTop } });
      });

      // Should handle all scroll events without blocking
      expect(container.scrollTop).toBeDefined();

      // requestAnimationFrame should be called for smooth updates
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('handles scroll to end of 11k+ products', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      const container = screen.getByTestId('product-list-container');
      const totalHeight = 11379 * 120;

      // Scroll to end
      fireEvent.scroll(container, {
        target: {
          scrollTop: totalHeight - 600, // Near end
          scrollHeight: totalHeight,
          clientHeight: 600
        }
      });

      // Should render items near the end
      await waitFor(() => {
        const visibleItems = screen.getAllByTestId(/^product-item-/);
        const lastItem = visibleItems[visibleItems.length - 1];

        // Should show items from near the end of dataset
        expect(lastItem).toBeInTheDocument();
      });
    });
  });

  describe('Product Display and Interaction', () => {
    it('displays comprehensive product information', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should display first product with all information
      expect(screen.getByText('Product 0 - daily-protein')).toBeInTheDocument();
      expect(screen.getByText('Brand 0')).toBeInTheDocument();
      expect(screen.getByText('€2.99')).toBeInTheDocument();
      expect(screen.getByText(/5g protein/)).toBeInTheDocument();
      expect(screen.getByText(/100 cal/)).toBeInTheDocument();
    });

    it('shows context-specific information for products', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should show context labels and target contributions
      expect(screen.getByText('High Protein')).toBeInTheDocument();
      expect(screen.getByText(/% of daily target/)).toBeInTheDocument();
    });

    it('displays health grades and scoring', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should show health grade badges
      const healthBadges = screen.getAllByTestId('health-grade-badge');
      expect(healthBadges.length).toBeGreaterThan(0);

      // Should show grades A-E
      const gradeTexts = healthBadges.map(badge => badge.textContent);
      expect(gradeTexts.some(grade => ['A', 'B', 'C', 'D', 'E'].includes(grade || ''))).toBe(true);
    });

    it('shows halal indicators appropriately', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should show halal indicators for appropriate products
      expect(screen.getByTestId('halal-indicator')).toBeInTheDocument();
      expect(screen.getByText('Halal')).toBeInTheDocument();
    });

    it('handles product selection interactions', async () => {
      const user = userEvent.setup();

      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should be able to interact with product cards
      const firstProduct = screen.getByTestId('product-item-daily-protein-0');
      expect(firstProduct).toBeInTheDocument();

      // Should be clickable
      await user.click(firstProduct);

      // Should have proper interaction state
      expect(firstProduct).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Data Consistency and Quality', () => {
    it('maintains data consistency across large dataset', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Scroll through dataset to verify consistency
      const container = screen.getByTestId('product-list-container');

      // Scroll to different positions
      const scrollPositions = [0, 10000, 30000, 60000, 100000];

      for (const scrollTop of scrollPositions) {
        fireEvent.scroll(container, { target: { scrollTop } });

        await waitFor(() => {
          const visibleItems = screen.getAllByTestId(/^product-item-/);

          // Should always have visible items
          expect(visibleItems.length).toBeGreaterThan(0);

          // Each item should have required data
          visibleItems.forEach(item => {
            expect(item).toBeInTheDocument();
            expect(item).toHaveAttribute('data-testid');
          });
        });
      }
    });

    it('validates product data integrity', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // All visible products should have valid data
      const productCards = screen.getAllByTestId(/^product-item-/);

      productCards.forEach(card => {
        // Should have product name
        expect(card).toHaveTextContent(/Product \d+/);

        // Should have brand
        expect(card).toHaveTextContent(/Brand \d+/);

        // Should have price
        expect(card).toHaveTextContent(/€\d+\.\d+/);

        // Should have nutrition info
        expect(card).toHaveTextContent(/\d+g protein/);
        expect(card).toHaveTextContent(/\d+ cal/);
      });
    });

    it('handles edge cases in product data', async () => {
      // Mock dataset with edge cases
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('daily-protein')) {
          const edgeCaseProducts = [
            // Product with minimal protein
            {
              id: 'edge-1',
              name: 'Low Protein Product',
              nutrition: { protein: 0, carbs: 50, fat: 20, calories: 300 },
              price: 0.99
            },
            // Product with very high protein
            {
              id: 'edge-2',
              name: 'Ultra High Protein Product',
              nutrition: { protein: 95, carbs: 0, fat: 1, calories: 400 },
              price: 49.99
            },
            // Product with unusual data
            {
              id: 'edge-3',
              name: 'Unusual Product',
              nutrition: { protein: 25.7, carbs: 12.3, fat: 8.9, calories: 201 },
              price: 15.47
            }
          ];

          const jsonlContent = edgeCaseProducts.map(p => JSON.stringify(p)).join('\n');
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

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should handle all edge cases gracefully
      expect(screen.getByText('Low Protein Product')).toBeInTheDocument();
      expect(screen.getByText('Ultra High Protein Product')).toBeInTheDocument();
      expect(screen.getByText('Unusual Product')).toBeInTheDocument();

      // Should display proper nutrition values
      expect(screen.getByText('0g protein')).toBeInTheDocument();
      expect(screen.getByText('95g protein')).toBeInTheDocument();
      expect(screen.getByText('25.7g protein')).toBeInTheDocument();
    });
  });

  describe('Cross-Filter Browsing', () => {
    it('maintains browsing context when switching filters', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for initial load (Daily Protein - 11k+ products)
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('product-count')).toHaveTextContent('11,379 products loaded');
      }, { timeout: 10000 });

      // Switch to Post-Workout filter
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      // Wait for new data load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('product-count')).toHaveTextContent('8,942 products loaded');
      }, { timeout: 10000 });

      // Should show different products with post-workout context
      expect(screen.getByText(/Product \d+ - post-workout/)).toBeInTheDocument();
    });

    it('compares product diversity across filters', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Load Daily Protein filter
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      const dailyProteinProducts = screen.getAllByTestId(/^product-item-daily-protein-/);
      const dailyProteinCount = dailyProteinProducts.length;

      // Switch to Post-Workout
      fireEvent.click(screen.getByTestId('filter-card-post-workout'));

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      const postWorkoutProducts = screen.getAllByTestId(/^product-item-post-workout-/);
      const postWorkoutCount = postWorkoutProducts.length;

      // Both filters should show products, but with different contexts
      expect(dailyProteinCount).toBeGreaterThan(0);
      expect(postWorkoutCount).toBeGreaterThan(0);

      // Product IDs should be different
      const dailyIds = dailyProteinProducts.map(p => p.getAttribute('data-testid'));
      const postWorkoutIds = postWorkoutProducts.map(p => p.getAttribute('data-testid'));

      expect(dailyIds).not.toEqual(postWorkoutIds);
    });
  });

  describe('Accessibility with Large Datasets', () => {
    it('maintains accessibility with 11k+ products', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestid('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should have proper ARIA attributes
      const container = screen.getByTestId('product-list-container');
      expect(container).toHaveAttribute('role', 'list');
      expect(container).toHaveAttribute('aria-label', 'Product list');

      // Should provide screen reader updates
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveTextContent('11,379 products');
    });

    it('supports keyboard navigation through virtual list', async () => {
      render(
        <Homepage
          initialCategories={mockFilterCategories}
          defaultCategory={mockFilterCategories[0]}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(screen.queryByTestid('loading')).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // First product should be keyboard accessible
      const firstProduct = screen.getByTestId('product-item-daily-protein-0');
      expect(firstProduct).toHaveAttribute('tabIndex', '0');

      // Should support arrow key navigation
      fireEvent.keyDown(firstProduct, { key: 'ArrowDown' });

      const secondProduct = screen.getByTestId('product-item-daily-protein-1');
      expect(secondProduct).toHaveFocus();
    });
  });
});
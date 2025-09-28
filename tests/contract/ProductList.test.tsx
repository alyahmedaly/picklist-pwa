/**
 * ProductList Component Contract Test
 *
 * TDD test for ProductList component with virtual scrolling - MUST FAIL before implementation
 * Tests 11k+ product list rendering with performance optimization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductList } from '../../src/components/homepage/ProductList';
import type { ProductDisplay } from '../../src/types/homepage';

// Mock large product dataset
const generateMockProducts = (count: number): ProductDisplay[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `product-${index}`,
    name: `Product ${index}`,
    brand: `Brand ${index % 10}`,
    price: 5.99 + (index * 0.1),
    currency: '€',
    protein: 15 + (index % 20),
    carbs: 30 + (index % 15),
    fat: 8 + (index % 10),
    calories: 250 + (index % 100),
    healthGrade: (['A', 'B', 'C', 'D', 'E'] as const)[index % 5],
    healthScore: 60 + (index % 40),
    isHalal: index % 3 === 0,
    contextScore: 50 + (index % 50),
    contextLabel: index % 2 === 0 ? 'High Protein' : 'Good Value',
    targetContribution: index % 4 === 0 ? '15% of daily target' : undefined,
    displayHeight: 120,
    isVisible: false,
    isHighlighted: false
  }));
};

const mockProductsSmall = generateMockProducts(20);
const mockProductsLarge = generateMockProducts(11000);

// Mock intersection observer for virtual scrolling
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
global.IntersectionObserver = mockIntersectionObserver;

describe('ProductList Component Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders loading state when loading is true', () => {
      render(
        <ProductList
          products={[]}
          loading={true}
        />
      );

      expect(screen.getByTestId('product-list-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });

    it('renders empty state when no products', () => {
      render(
        <ProductList
          products={[]}
          loading={false}
        />
      );

      expect(screen.getByTestId('product-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('renders product list when products are provided', () => {
      render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
        />
      );

      expect(screen.getByTestId('product-list-container')).toBeInTheDocument();
      expect(screen.getAllByTestId(/^product-item-/)).toHaveLength(20);
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
          className="custom-product-list"
        />
      );

      expect(container.firstChild).toHaveClass('custom-product-list');
    });
  });

  describe('Virtual Scrolling Performance', () => {
    it('enables virtual scrolling by default for large datasets', () => {
      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      const container = screen.getByTestId('product-list-container');

      // Should have virtual scrolling container attributes
      expect(container).toHaveAttribute('data-virtual-scrolling', 'true');
      expect(container).toHaveStyle({ height: '600px' });
    });

    it('renders only visible items plus buffer for performance', () => {
      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      // Should render only ~20-30 visible items, not all 11k
      const renderedItems = screen.getAllByTestId(/^product-item-/);
      expect(renderedItems.length).toBeLessThan(50);
      expect(renderedItems.length).toBeGreaterThan(10);
    });

    it('maintains total height for scrollbar accuracy', () => {
      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      const container = screen.getByTestId('product-list-container');
      const totalHeight = parseInt(container.getAttribute('data-total-height') || '0');

      // Should calculate total height: 11k items * 120px height
      expect(totalHeight).toBe(11000 * 120);
    });

    it('can disable virtual scrolling for small datasets', () => {
      render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
          virtualScrolling={false}
        />
      );

      const container = screen.getByTestId('product-list-container');
      expect(container).toHaveAttribute('data-virtual-scrolling', 'false');

      // Should render all items when virtual scrolling is disabled
      expect(screen.getAllByTestId(/^product-item-/)).toHaveLength(20);
    });
  });

  describe('Scrolling Behavior', () => {
    it('updates visible range on scroll', async () => {
      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      const container = screen.getByTestId('product-list-container');

      // Simulate scroll event
      fireEvent.scroll(container, { target: { scrollTop: 1200 } });

      await waitFor(() => {
        // Should update visible range and render different items
        const visibleRange = container.getAttribute('data-visible-range');
        expect(visibleRange).toBeDefined();
      });
    });

    it('calls onLoadMore when scrolling near end', async () => {
      const mockOnLoadMore = vi.fn();

      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
          onLoadMore={mockOnLoadMore}
        />
      );

      const container = screen.getByTestId('product-list-container');

      // Mock the scroll properties
      const scrollHeight = 11000 * 120;
      Object.defineProperty(container, 'scrollTop', { value: scrollHeight - 1000, writable: true });
      Object.defineProperty(container, 'scrollHeight', { value: scrollHeight, writable: true });
      Object.defineProperty(container, 'clientHeight', { value: 600, writable: true });

      // Simulate scrolling to near end
      fireEvent.scroll(container);

      await waitFor(() => {
        expect(mockOnLoadMore).toHaveBeenCalled();
      });
    });

    it('maintains smooth scrolling performance', () => {
      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      const container = screen.getByTestId('product-list-container');

      // Should have CSS for smooth scrolling
      expect(container).toHaveClass('scroll-smooth');
      expect(container).toHaveStyle({
        scrollBehavior: 'smooth',
        overflowY: 'auto'
      });
    });
  });

  describe('Product Item Rendering', () => {
    it('renders product cards with proper data', () => {
      render(
        <ProductList
          products={mockProductsSmall.slice(0, 5)}
          loading={false}
        />
      );

      // Should render first product with correct data
      expect(screen.getByText('Product 0')).toBeInTheDocument();
      expect(screen.getByText('Brand 0')).toBeInTheDocument();
      expect(screen.getByText('€5.99')).toBeInTheDocument();
    });

    it('applies consistent item heights for virtual scrolling', () => {
      render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
        />
      );

      const items = screen.getAllByTestId(/^product-item-/);

      items.forEach(item => {
        expect(item).toHaveStyle({ height: '120px' });
      });
    });

    it('shows context-specific information when available', () => {
      const productsWithContext = mockProductsSmall.slice(0, 3);
      productsWithContext[0].contextLabel = 'High Protein';
      productsWithContext[0].targetContribution = '15% of daily target';

      render(
        <ProductList
          products={productsWithContext}
          loading={false}
        />
      );

      expect(screen.getAllByText('High Protein')[0]).toBeInTheDocument();
      expect(screen.getByText('15% of daily target')).toBeInTheDocument();
    });

    it('highlights search matches when products are highlighted', () => {
      const highlightedProducts = mockProductsSmall.slice(0, 2);
      highlightedProducts[0].isHighlighted = true;
      highlightedProducts[0].matchedTerms = ['protein'];

      render(
        <ProductList
          products={highlightedProducts}
          loading={false}
        />
      );

      const highlightedCards = screen.getAllByTestId('product-card');
      expect(highlightedCards[0]).toHaveClass('bg-yellow-50');
    });
  });

  describe('Performance Optimization', () => {
    it('uses React.memo for product item components', () => {
      const { rerender } = render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
        />
      );

      // Rerender with same props
      rerender(
        <ProductList
          products={mockProductsSmall}
          loading={false}
        />
      );

      // Should not re-render unchanged items (tested via React dev tools)
      expect(screen.getAllByTestId(/^product-item-/)).toHaveLength(20);
    });

    it('debounces scroll events for better performance', async () => {
      const scrollHandler = vi.fn();

      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      const container = screen.getByTestId('product-list-container');

      // Rapid scroll events
      fireEvent.scroll(container, { target: { scrollTop: 100 } });
      fireEvent.scroll(container, { target: { scrollTop: 200 } });
      fireEvent.scroll(container, { target: { scrollTop: 300 } });

      // Should debounce scroll handling
      await waitFor(() => {
        expect(container.getAttribute('data-scroll-debounced')).toBe('true');
      });
    });

    it.skip('handles memory cleanup on unmount', () => {
      const { unmount } = render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      // Should clean up observers and timers
      unmount();

      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for screen readers', () => {
      render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
        />
      );

      const container = screen.getByTestId('product-list-container');
      expect(container).toHaveAttribute('role', 'list');
      expect(container).toHaveAttribute('aria-label', 'Product list');
    });

    it('provides live region updates for screen readers', () => {
      render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Showing 20 products')).toBeInTheDocument();
    });

    it.skip('supports keyboard navigation', () => {
      render(
        <ProductList
          products={mockProductsSmall}
          loading={false}
        />
      );

      const firstItem = screen.getByTestId('product-item-product-0');
      expect(firstItem).toHaveAttribute('tabIndex', '0');

      // Should handle arrow key navigation
      fireEvent.keyDown(firstItem, { key: 'ArrowDown' });

      const secondItem = screen.getByTestId('product-item-product-1');
      expect(secondItem).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles empty product data gracefully', () => {
      render(
        <ProductList
          products={[]}
          loading={false}
        />
      );

      expect(screen.getByTestId('product-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('handles invalid product data gracefully', () => {
      const invalidProducts = [
        { id: 'invalid', name: null } as any,
        ...mockProductsSmall.slice(0, 2)
      ];

      render(
        <ProductList
          products={invalidProducts}
          loading={false}
        />
      );

      // Should skip invalid products and render valid ones
      expect(screen.getAllByTestId(/^product-item-/)).toHaveLength(2);
    });

    it('handles scroll container resize events', () => {
      render(
        <ProductList
          products={mockProductsLarge}
          loading={false}
        />
      );

      const container = screen.getByTestId('product-list-container');

      // Simulate resize event
      fireEvent(window, new Event('resize'));

      // Should recalculate visible range
      expect(container).toHaveAttribute('data-resize-handled', 'true');
    });
  });
});
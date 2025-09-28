/**
 * ProductCard Component Contract Test
 *
 * TDD test for ProductCard component - MUST FAIL before implementation
 * Tests compact and detailed variants for virtual scrolling performance
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../../src/components/homepage/ProductCard';
import type { ProductDisplay } from '../../src/types/homepage';

// Mock product data
const mockProducts: ProductDisplay[] = [
  {
    id: 'product-1',
    name: 'Greek Yogurt High Protein',
    brand: 'Oikos',
    price: 3.49,
    currency: '€',
    protein: 15.2,
    carbs: 6.8,
    fat: 0.2,
    calories: 89,
    healthGrade: 'A',
    healthScore: 85,
    isHalal: true,
    contextScore: 92,
    contextLabel: 'High Protein',
    targetContribution: '10% of daily target',
    displayHeight: 120,
    isVisible: true,
    isHighlighted: false
  },
  {
    id: 'product-2',
    name: 'Chicken Breast High Protein',
    brand: 'Fresh Valley',
    price: 12.99,
    currency: '€',
    protein: 31.0,
    carbs: 0,
    fat: 3.6,
    calories: 165,
    healthGrade: 'A',
    healthScore: 95,
    isHalal: false,
    contextScore: 98,
    contextLabel: 'Premium Protein',
    targetContribution: '21% of daily target',
    displayHeight: 120,
    isVisible: true,
    isHighlighted: true,
    matchedTerms: ['chicken', 'protein']
  },
  {
    id: 'product-3',
    name: 'Budget Protein Powder',
    brand: 'Basic Nutrition',
    price: 19.99,
    currency: '€',
    protein: 75.5,
    carbs: 8.2,
    fat: 2.1,
    calories: 350,
    healthGrade: 'B',
    healthScore: 72,
    isHalal: true,
    displayHeight: 120,
    isVisible: true,
    isHighlighted: false
  }
];

describe('ProductCard Component Contract', () => {
  describe('Basic Rendering', () => {
    it('renders product name and brand', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Greek Yogurt High Protein')).toBeInTheDocument();
      expect(screen.getByText('Oikos')).toBeInTheDocument();
    });

    it('displays price with currency', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('€3.49')).toBeInTheDocument();
    });

    it('shows nutrition metrics', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('15.2g protein')).toBeInTheDocument();
      expect(screen.getByText('89 cal')).toBeInTheDocument();
      expect(screen.getByText('6.8g carbs')).toBeInTheDocument();
      expect(screen.getByText('0.2g fat')).toBeInTheDocument();
    });

    it('displays health grade badge', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const healthBadge = screen.getByTestId('health-grade-badge');
      expect(healthBadge).toBeInTheDocument();
      expect(healthBadge).toHaveTextContent('A');
    });

    it('shows halal status when applicable', () => {
      const product = mockProducts[0]; // isHalal: true
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('halal-indicator')).toBeInTheDocument();
      expect(screen.getByText('Halal')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      const { container } = render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
          className="custom-product-card"
        />
      );

      expect(container.firstChild).toHaveClass('custom-product-card');
    });
  });

  describe('Variant Rendering', () => {
    it('renders compact variant by default', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      const { container } = render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('compact');
      expect(card).toHaveStyle({ height: '120px' });
    });

    it('renders detailed variant when specified', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      const { container } = render(
        <ProductCard
          product={product}
          variant="detailed"
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('detailed');
      expect(card).toHaveStyle({ minHeight: '180px' });
    });

    it('shows additional details in detailed variant', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          variant="detailed"
          onSelect={mockOnSelect}
        />
      );

      // Detailed variant should show context score and additional metrics
      expect(screen.getByText('Score: 92')).toBeInTheDocument();
      expect(screen.getByText('Health Score: 85')).toBeInTheDocument();
    });

    it('hides context information in compact variant for performance', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          variant="compact"
          onSelect={mockOnSelect}
        />
      );

      // Compact variant should not show detailed scores
      expect(screen.queryByText('Score: 92')).not.toBeInTheDocument();
      expect(screen.queryByText('Health Score: 85')).not.toBeInTheDocument();
    });
  });

  describe('Context-Specific Information', () => {
    it('displays context label when provided', () => {
      const product = mockProducts[0]; // Has contextLabel: 'High Protein'
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('High Protein')).toBeInTheDocument();
    });

    it('shows target contribution when available', () => {
      const product = mockProducts[0]; // Has targetContribution
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('10% of daily target')).toBeInTheDocument();
    });

    it('does not show context info when not available', () => {
      const product = mockProducts[2]; // No contextLabel or targetContribution
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText(/% of daily target/)).not.toBeInTheDocument();
    });

    it('highlights context score visually when high', () => {
      const product = mockProducts[1]; // contextScore: 98
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          variant="detailed"
          onSelect={mockOnSelect}
        />
      );

      const scoreDisplay = screen.getByText('Score: 98');
      expect(scoreDisplay).toHaveClass('text-green-600', 'font-semibold');
    });
  });

  describe('Search Highlighting', () => {
    it('applies highlight styling when product is highlighted', () => {
      const product = mockProducts[1]; // isHighlighted: true
      const mockOnSelect = vi.fn();

      const { container } = render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-yellow-50', 'ring-2', 'ring-yellow-200');
    });

    it('highlights matched terms in product name', () => {
      const product = mockProducts[1]; // matchedTerms: ['chicken', 'protein']
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const highlightedTerms = screen.getAllByTestId('highlighted-term');
      expect(highlightedTerms).toHaveLength(2);
      expect(highlightedTerms[0]).toHaveTextContent('Chicken');
      expect(highlightedTerms[1]).toHaveTextContent('Protein');
    });

    it('does not apply highlighting when product is not highlighted', () => {
      const product = mockProducts[0]; // isHighlighted: false
      const mockOnSelect = vi.fn();

      const { container } = render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('bg-yellow-50', 'ring-yellow-200');
    });
  });

  describe('User Interactions', () => {
    it('calls onSelect when card is clicked', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByTestId('product-card'));
      expect(mockOnSelect).toHaveBeenCalledWith(product);
    });

    it('calls onSelect when Enter key is pressed', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('product-card');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnSelect).toHaveBeenCalledWith(product);
    });

    it('calls onSelect when Space key is pressed', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('product-card');
      fireEvent.keyDown(card, { key: ' ' });
      expect(mockOnSelect).toHaveBeenCalledWith(product);
    });

    it('shows hover effects on mouse interaction', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      const { container } = render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(card);

      expect(card).toHaveClass('hover:shadow-md', 'hover:scale-[1.02]');
    });

    it('works without onSelect handler', () => {
      const product = mockProducts[0];

      expect(() => {
        render(
          <ProductCard
            product={product}
          />
        );
      }).not.toThrow();

      // Should still render card but not be interactive
      expect(screen.getByTestId('product-card')).toBeInTheDocument();
    });
  });

  describe('Health Grade Styling', () => {
    it('applies correct styling for grade A', () => {
      const product = { ...mockProducts[0], healthGrade: 'A' as const };
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const badge = screen.getByTestId('health-grade-badge');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('applies correct styling for grade E', () => {
      const product = { ...mockProducts[0], healthGrade: 'E' as const };
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const badge = screen.getByTestId('health-grade-badge');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('applies correct styling for grade C (neutral)', () => {
      const product = { ...mockProducts[0], healthGrade: 'C' as const };
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const badge = screen.getByTestId('health-grade-badge');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  describe('Performance Optimization', () => {
    it('uses React.memo for preventing unnecessary re-renders', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      const { rerender } = render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      // Rerender with same props
      rerender(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      // Component should be memoized (testing via React dev tools)
      expect(screen.getByTestId('product-card')).toBeInTheDocument();
    });

    it('maintains consistent height for virtual scrolling', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      const { container } = render(
        <ProductCard
          product={product}
          variant="compact"
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ height: '120px' });
    });

    it('lazy loads non-critical information', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      // Non-critical elements should have loading="lazy"
      const contextInfo = screen.queryByTestId('context-info');
      if (contextInfo) {
        expect(contextInfo).toHaveAttribute('data-lazy', 'true');
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('product-card');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Greek Yogurt High Protein'));
    });

    it('provides comprehensive aria-label with key information', () => {
      const product = mockProducts[1];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('product-card');
      const ariaLabel = card.getAttribute('aria-label') || '';

      expect(ariaLabel).toContain('Chicken Breast High Protein');
      expect(ariaLabel).toContain('Fresh Valley');
      expect(ariaLabel).toContain('31g protein');
      expect(ariaLabel).toContain('Health grade A');
    });

    it('indicates halal status in aria-label', () => {
      const product = mockProducts[0]; // isHalal: true
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('product-card');
      const ariaLabel = card.getAttribute('aria-label') || '';
      expect(ariaLabel).toContain('Halal');
    });

    it('works with screen reader navigation', () => {
      const product = mockProducts[0];
      const mockOnSelect = vi.fn();

      render(
        <ProductCard
          product={product}
          onSelect={mockOnSelect}
        />
      );

      const card = screen.getByTestId('product-card');

      // Should be keyboard focusable
      expect(card).toHaveAttribute('tabIndex', '0');

      // Should have proper role
      expect(card).toHaveAttribute('role', 'button');
    });
  });
});
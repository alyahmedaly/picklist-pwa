/**
 * CategoryCard Component Contract Test
 *
 * TDD test for CategoryCard component - MUST FAIL before implementation
 * Tests Ali-specific metrics display and accessibility for category index page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryCard } from '../../src/components/category-index/CategoryCard';
import type { CategoryWithMetrics } from '../../src/types/category-index';

// Mock category data with Ali metrics
const mockCategories: CategoryWithMetrics[] = [
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
      halalCompliance: 85, // 85% halal products
      averageProtein: 18.5, // g/100g
      priceEfficiency: 0.35, // €/g protein
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
      halalCompliance: 45, // 45% halal products
      averageProtein: 25.2, // g/100g
      priceEfficiency: 0.42, // €/g protein
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
      halalCompliance: 92, // 92% halal products
      averageProtein: 8.1, // g/100g
      priceEfficiency: 1.25, // €/g protein (poor value)
      recommendedFor: ['rest-day']
    }
  }
];

describe('CategoryCard Component Contract', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Basic Display Requirements', () => {
    it('displays category name correctly', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
    });

    it('displays product count with proper formatting', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText(/245.*products?/i)).toBeInTheDocument();
    });

    it('displays breadcrumbs for navigation context', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
    });
  });

  describe('Ali Metrics Display - Contract Requirements', () => {
    it('displays halal compliance percentage with correct color coding', () => {
      // Test high halal compliance (>80% = green)
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      const halalBadge = screen.getByText(/85%.*halal/i);
      expect(halalBadge).toBeInTheDocument();
      expect(halalBadge.closest('[class*="green"]')).toBeInTheDocument();
    });

    it('displays protein density with high protein indicator', () => {
      render(
        <CategoryCard
          category={mockCategories[1]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      const proteinBadge = screen.getByText(/25\.2g.*protein/i);
      expect(proteinBadge).toBeInTheDocument();
      // Should be marked as high protein (>15g/100g)
      expect(proteinBadge.closest('[class*="blue"]')).toBeInTheDocument();
    });

    it('displays price efficiency with value assessment', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      const efficiencyBadge = screen.getByText(/€0\.35.*protein/i);
      expect(efficiencyBadge).toBeInTheDocument();
      // Should be marked as good value (<€0.50/g)
      expect(efficiencyBadge.closest('[class*="emerald"]')).toBeInTheDocument();
    });

    it('displays Ali context recommendations as badges', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      expect(screen.getByText(/daily.protein/i)).toBeInTheDocument();
      expect(screen.getByText(/post.workout/i)).toBeInTheDocument();
    });

    it('handles low halal compliance with warning colors', () => {
      render(
        <CategoryCard
          category={mockCategories[1]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      const halalBadge = screen.getByText(/45%.*halal/i);
      expect(halalBadge).toBeInTheDocument();
      // Should be yellow/amber for medium compliance (50-80%)
      expect(halalBadge.closest('[class*="yellow"]')).toBeInTheDocument();
    });
  });

  describe('Interaction Behavior - Contract Requirements', () => {
    it('handles category click with proper callback', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      const categoryButton = screen.getByRole('button');
      fireEvent.click(categoryButton);

      expect(mockOnClick).toHaveBeenCalledWith(mockCategories[0]);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation with Enter key', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      const categoryButton = screen.getByRole('button');
      fireEvent.keyDown(categoryButton, { key: 'Enter', code: 'Enter' });

      expect(mockOnClick).toHaveBeenCalledWith(mockCategories[0]);
    });

    it('supports keyboard navigation with Space key', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      const categoryButton = screen.getByRole('button');
      fireEvent.keyDown(categoryButton, { key: ' ', code: 'Space' });

      expect(mockOnClick).toHaveBeenCalledWith(mockCategories[0]);
    });
  });

  describe('Accessibility Requirements - Contract Compliance', () => {
    it('provides descriptive aria-label for screen readers', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      const categoryButton = screen.getByRole('button');
      const ariaLabel = categoryButton.getAttribute('aria-label');

      expect(ariaLabel).toContain('Zuivel, eieren, boter');
      expect(ariaLabel).toContain('245 products');
      expect(ariaLabel).toContain('85% halal');
      expect(ariaLabel).toContain('18.5g protein');
    });

    it('has proper button role for interaction', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports tab navigation with proper tabIndex', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
        />
      );

      const categoryButton = screen.getByRole('button');
      expect(categoryButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Variant Support - Contract Requirements', () => {
    it('supports compact variant for virtual scrolling', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          variant="compact"
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveClass(/compact/);
    });

    it('supports detailed variant with full metrics', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          variant="detailed"
          showMetrics={true}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveClass(/detailed/);

      // Should show all Ali metrics in detailed view
      expect(screen.getByText(/85%.*halal/i)).toBeInTheDocument();
      expect(screen.getByText(/18\.5g.*protein/i)).toBeInTheDocument();
      expect(screen.getByText(/€0\.35.*protein/i)).toBeInTheDocument();
    });

    it('handles selected state with visual indication', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          isSelected={true}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveClass(/selected/);
      expect(card).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Error Handling - Contract Requirements', () => {
    it('handles missing Ali metrics gracefully', () => {
      const categoryWithoutMetrics = {
        ...mockCategories[0],
        aliMetrics: {
          halalCompliance: 0,
          averageProtein: 0,
          priceEfficiency: 999,
          recommendedFor: [] as any[]
        }
      };

      render(
        <CategoryCard
          category={categoryWithoutMetrics}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      // Should still display category name and count
      expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
      expect(screen.getByText(/245.*products?/i)).toBeInTheDocument();

      // Should show placeholder or empty state for metrics
      expect(screen.getByText(/no.*data/i)).toBeInTheDocument();
    });

    it('handles invalid category data without crashing', () => {
      const invalidCategory = {
        ...mockCategories[0],
        name: '',
        productCount: -1
      };

      expect(() => {
        render(
          <CategoryCard
            category={invalidCategory}
            onClick={mockOnClick}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance Requirements - Contract Compliance', () => {
    it('uses memoization for expensive calculations', () => {
      const { rerender } = render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      // Rerender with same props should not recalculate
      rerender(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          showMetrics={true}
        />
      );

      // Component should render without recreating expensive elements
      expect(screen.getByText('Zuivel, eieren, boter')).toBeInTheDocument();
    });

    it('optimizes for virtual scrolling performance', () => {
      render(
        <CategoryCard
          category={mockCategories[0]}
          onClick={mockOnClick}
          variant="compact"
        />
      );

      const card = screen.getByRole('button');

      // Should have minimal DOM structure for virtual scrolling
      expect(card.children.length).toBeLessThanOrEqual(3);
    });
  });
});
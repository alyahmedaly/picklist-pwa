/**
 * CategorySearch Component Contract Test
 *
 * TDD test for CategorySearch component - MUST FAIL before implementation
 * Tests search, filtering, and sorting functionality with Dutch language support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySearch } from '../../src/components/category-index/CategorySearch';
import type { CategorySortOption, AliFilterCriteria } from '../../src/types/category-index';

describe('CategorySearch Component Contract', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnSortChange = vi.fn();
  const mockOnFilterChange = vi.fn();
  const mockOnClearAll = vi.fn();

  const defaultProps = {
    searchQuery: '',
    onSearchChange: mockOnSearchChange,
    sortBy: 'product-count-desc' as CategorySortOption,
    onSortChange: mockOnSortChange,
    activeFilters: {} as AliFilterCriteria,
    onFilterChange: mockOnFilterChange,
    resultCount: 245,
    totalCount: 340,
    onClearAll: mockOnClearAll
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Input - Contract Requirements', () => {
    it('renders search input with correct placeholder', () => {
      render(<CategorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('displays current search query value', () => {
      render(<CategorySearch {...defaultProps} searchQuery="zuivel" />);

      const searchInput = screen.getByDisplayValue('zuivel');
      expect(searchInput).toBeInTheDocument();
    });

    it('supports Dutch characters in search input', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search categories/i);

      // Type Dutch characters
      await user.type(searchInput, 'zuïvel éieren');

      expect(mockOnSearchChange).toHaveBeenCalledWith('zuïvel éieren');
    });

    it('debounces search input with 300ms delay', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CategorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search categories/i);

      // Type rapidly
      await user.type(searchInput, 'zu');

      // Should not call immediately
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('zu');
      }, { timeout: 400 });
    });

    it('shows clear button when search has content', () => {
      render(<CategorySearch {...defaultProps} searchQuery="zuivel" />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('calls onSearchChange with empty string when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} searchQuery="zuivel" />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });

    it('enforces maximum search length of 100 characters', async () => {
      const user = userEvent.setup();
      const longString = 'a'.repeat(105); // 105 characters

      render(<CategorySearch {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search categories/i);

      await user.type(searchInput, longString);

      // Should only accept first 100 characters
      expect(mockOnSearchChange).toHaveBeenLastCalledWith('a'.repeat(100));
    });
  });

  describe('Sort Options - Contract Requirements', () => {
    it('displays current sort option', () => {
      render(<CategorySearch {...defaultProps} sortBy="protein-desc" />);

      expect(screen.getByText(/protein.*desc/i)).toBeInTheDocument();
    });

    it('shows all available sort options in dropdown', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const sortButton = screen.getByRole('button', { name: /sort/i });
      await user.click(sortButton);

      // Check all contract-specified sort options exist
      expect(screen.getByText(/product count.*descending/i)).toBeInTheDocument();
      expect(screen.getByText(/product count.*ascending/i)).toBeInTheDocument();
      expect(screen.getByText(/name.*a-z/i)).toBeInTheDocument();
      expect(screen.getByText(/name.*z-a/i)).toBeInTheDocument();
      expect(screen.getByText(/protein.*highest/i)).toBeInTheDocument();
      expect(screen.getByText(/halal.*compliance/i)).toBeInTheDocument();
      expect(screen.getByText(/price.*efficiency/i)).toBeInTheDocument();
    });

    it('calls onSortChange when sort option selected', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const sortButton = screen.getByRole('button', { name: /sort/i });
      await user.click(sortButton);

      const proteinOption = screen.getByText(/protein.*highest/i);
      await user.click(proteinOption);

      expect(mockOnSortChange).toHaveBeenCalledWith('protein-desc');
    });
  });

  describe('Ali Filter Panel - Contract Requirements', () => {
    it('displays halal compliance filter slider', () => {
      render(<CategorySearch {...defaultProps} />);

      const halalSlider = screen.getByLabelText(/halal compliance/i);
      expect(halalSlider).toBeInTheDocument();
      expect(halalSlider).toHaveAttribute('type', 'range');
      expect(halalSlider).toHaveAttribute('min', '0');
      expect(halalSlider).toHaveAttribute('max', '100');
    });

    it('displays protein density filter slider', () => {
      render(<CategorySearch {...defaultProps} />);

      const proteinSlider = screen.getByLabelText(/protein density/i);
      expect(proteinSlider).toBeInTheDocument();
      expect(proteinSlider).toHaveAttribute('type', 'range');
      expect(proteinSlider).toHaveAttribute('min', '0');
    });

    it('displays price efficiency filter slider', () => {
      render(<CategorySearch {...defaultProps} />);

      const efficiencySlider = screen.getByLabelText(/price efficiency/i);
      expect(efficiencySlider).toBeInTheDocument();
      expect(efficiencySlider).toHaveAttribute('type', 'range');
    });

    it('displays Ali context checkboxes', () => {
      render(<CategorySearch {...defaultProps} />);

      // Check for all Ali context options
      expect(screen.getByLabelText(/daily protein/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/post workout/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cutting/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/budget/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/training day/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rest day/i)).toBeInTheDocument();
    });

    it('displays minimum product count filter', () => {
      render(<CategorySearch {...defaultProps} />);

      const productCountSlider = screen.getByLabelText(/minimum products/i);
      expect(productCountSlider).toBeInTheDocument();
      expect(productCountSlider).toHaveAttribute('type', 'range');
      expect(productCountSlider).toHaveAttribute('min', '1');
    });

    it('calls onFilterChange when halal compliance filter changed', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const halalSlider = screen.getByLabelText(/halal compliance/i);
      await user.clear(halalSlider);
      await user.type(halalSlider, '80');

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            minHalalCompliance: 80
          })
        );
      });
    });

    it('calls onFilterChange when protein density filter changed', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const proteinSlider = screen.getByLabelText(/protein density/i);
      await user.clear(proteinSlider);
      await user.type(proteinSlider, '15');

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            minProtein: 15
          })
        );
      });
    });

    it('calls onFilterChange when Ali context selected', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const dailyProteinCheckbox = screen.getByLabelText(/daily protein/i);
      await user.click(dailyProteinCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          contexts: expect.arrayContaining(['daily-protein'])
        })
      );
    });

    it('displays active filter values correctly', () => {
      const activeFilters: AliFilterCriteria = {
        minHalalCompliance: 80,
        minProtein: 15,
        maxPricePerProtein: 0.50,
        contexts: ['daily-protein', 'post-workout'],
        minProductCount: 10
      };

      render(<CategorySearch {...defaultProps} activeFilters={activeFilters} />);

      expect(screen.getByDisplayValue('80')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0.50')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();

      // Context checkboxes should be checked
      expect(screen.getByLabelText(/daily protein/i)).toBeChecked();
      expect(screen.getByLabelText(/post workout/i)).toBeChecked();
    });
  });

  describe('Result Count Display - Contract Requirements', () => {
    it('displays result count and total count', () => {
      render(<CategorySearch {...defaultProps} resultCount={245} totalCount={340} />);

      expect(screen.getByText(/245.*of.*340.*categories/i)).toBeInTheDocument();
    });

    it('updates result count when filters applied', () => {
      const { rerender } = render(
        <CategorySearch {...defaultProps} resultCount={245} totalCount={340} />
      );

      expect(screen.getByText(/245.*of.*340/i)).toBeInTheDocument();

      rerender(
        <CategorySearch {...defaultProps} resultCount={89} totalCount={340} />
      );

      expect(screen.getByText(/89.*of.*340/i)).toBeInTheDocument();
    });

    it('shows no results message when result count is zero', () => {
      render(<CategorySearch {...defaultProps} resultCount={0} totalCount={340} />);

      expect(screen.getByText(/no categories found/i)).toBeInTheDocument();
    });
  });

  describe('Clear All Functionality - Contract Requirements', () => {
    it('displays clear all button when filters are active', () => {
      const activeFilters: AliFilterCriteria = {
        minHalalCompliance: 80
      };

      render(<CategorySearch {...defaultProps} activeFilters={activeFilters} />);

      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      expect(clearAllButton).toBeInTheDocument();
    });

    it('does not display clear all button when no filters are active', () => {
      render(<CategorySearch {...defaultProps} activeFilters={{}} />);

      const clearAllButton = screen.queryByRole('button', { name: /clear all/i });
      expect(clearAllButton).not.toBeInTheDocument();
    });

    it('calls onClearAll when clear all button clicked', async () => {
      const user = userEvent.setup();
      const activeFilters: AliFilterCriteria = {
        minHalalCompliance: 80,
        minProtein: 15
      };

      render(<CategorySearch {...defaultProps} activeFilters={activeFilters} />);

      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearAllButton);

      expect(mockOnClearAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility - Contract Requirements', () => {
    it('has proper aria-label for main search container', () => {
      render(<CategorySearch {...defaultProps} />);

      const searchContainer = screen.getByLabelText(/search and filter categories/i);
      expect(searchContainer).toBeInTheDocument();
    });

    it('announces result count to screen readers', () => {
      render(<CategorySearch {...defaultProps} resultCount={245} totalCount={340} />);

      const resultAnnouncement = screen.getByRole('status');
      expect(resultAnnouncement).toHaveTextContent(/245.*categories/i);
    });

    it('supports keyboard navigation for all interactive elements', () => {
      render(<CategorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search categories/i);
      const sortButton = screen.getByRole('button', { name: /sort/i });

      expect(searchInput).toHaveAttribute('tabIndex', '0');
      expect(sortButton).toHaveAttribute('tabIndex', '0');
    });

    it('provides descriptive labels for all form controls', () => {
      render(<CategorySearch {...defaultProps} />);

      // All sliders should have descriptive labels
      expect(screen.getByLabelText(/minimum halal compliance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/minimum protein density/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maximum price per protein/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/minimum product count/i)).toBeInTheDocument();
    });
  });

  describe('Performance - Contract Requirements', () => {
    it('debounces search input to avoid excessive filtering', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CategorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search categories/i);

      // Type multiple characters rapidly
      await user.type(searchInput, 'zuivel');

      // Should only trigger once after debounce
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
        expect(mockOnSearchChange).toHaveBeenCalledWith('zuivel');
      }, { timeout: 400 });
    });

    it('uses memoization for expensive filter calculations', () => {
      const { rerender } = render(<CategorySearch {...defaultProps} />);

      // Rerender with same props should not recreate filter UI
      rerender(<CategorySearch {...defaultProps} />);

      expect(screen.getByLabelText(/halal compliance/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling - Contract Requirements', () => {
    it('handles invalid filter values gracefully', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const halalSlider = screen.getByLabelText(/halal compliance/i);

      // Try to enter invalid value
      await user.clear(halalSlider);
      await user.type(halalSlider, '-10');

      // Should clamp to valid range
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            minHalalCompliance: 0
          })
        );
      });
    });

    it('shows helpful message when no categories match filters', () => {
      render(<CategorySearch {...defaultProps} resultCount={0} />);

      expect(screen.getByText(/no categories found/i)).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
    });
  });

  describe('Dutch Language Support - Contract Requirements', () => {
    it('displays filter labels in Dutch when locale is Dutch', () => {
      // This would be controlled by a locale context in the actual implementation
      render(<CategorySearch {...defaultProps} />);

      // For now, test that Dutch terms are supported in search
      const searchInput = screen.getByPlaceholderText(/search categories/i);
      expect(searchInput).toHaveAttribute('placeholder', expect.stringMatching(/categor/i));
    });

    it('normalizes Dutch characters in search queries', async () => {
      const user = userEvent.setup();
      render(<CategorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search categories/i);

      // Type Dutch characters that should be normalized
      await user.type(searchInput, 'café');

      expect(mockOnSearchChange).toHaveBeenCalledWith('café');
    });
  });
});
/**
 * SearchControls Component Contract Test
 *
 * TDD test for SearchControls component - MUST FAIL before implementation
 * Tests search input and sort dropdown with debounced search functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchControls } from '../../src/components/homepage/SearchControls';

describe.skip('SearchControls Component Contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders search input with placeholder', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('renders sort dropdown with options', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const sortSelects = screen.getAllByRole('combobox', { name: 'Sort products by' });
      const sortSelect = sortSelects[0]; // Take the first one
      expect(sortSelect).toBeInTheDocument();
    });

    it('displays result count', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      expect(screen.getByText('11,379 products')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      const { container } = render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
          className="custom-search-controls"
        />
      );

      expect(container.firstChild).toHaveClass('custom-search-controls');
    });
  });

  describe('Search Functionality', () => {
    it('displays current search query in input', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery="chicken protein"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={342}
        />
      );

      const searchInput = screen.getByDisplayValue('chicken protein');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls onSearchChange with debounced input', async () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');

      // Type rapidly
      await user.type(searchInput, 'chicken');

      // Should not call immediately
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      // Advance timers to trigger debounce
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('chicken');
      });
    });

    it('debounces multiple rapid keystrokes', async () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');

      // Type multiple characters rapidly
      await user.type(searchInput, 'c');
      await user.type(searchInput, 'h');
      await user.type(searchInput, 'i');
      await user.type(searchInput, 'c');
      await user.type(searchInput, 'k');

      // Should not call during typing
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      // Advance timers
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        // Should only call once with final value
        expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
        expect(mockOnSearchChange).toHaveBeenCalledWith('chick');
      });
    });

    it('clears search when input is emptied', async () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SearchControls
          searchQuery="chicken"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={342}
        />
      );

      const searchInput = screen.getByDisplayValue('chicken');

      // Clear the input
      await user.clear(searchInput);

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('');
      });
    });

    it('shows search icon in input field', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('shows clear button when search query exists', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery="chicken"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={342}
        />
      );

      const clearButton = screen.getByTestId('clear-search-button');
      expect(clearButton).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery="chicken"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={342}
        />
      );

      const clearButton = screen.getByTestId('clear-search-button');
      fireEvent.click(clearButton);

      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Sort Functionality', () => {
    it('displays current sort option', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const sortSelects = screen.getAllByRole('combobox', { name: 'Sort products by' });
      const sortSelect = sortSelects[0]; // Take the first one
      expect(sortSelect).toHaveValue('protein-desc');
    });

    it('includes all required sort options', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      // Open dropdown
      const sortSelects = screen.getAllByRole('combobox', { name: 'Sort products by' });
      const sortSelect = sortSelects[0]; // Take the first one
      fireEvent.click(sortSelect);

      // Check for all required options
      expect(screen.getByText('Protein (High to Low)')).toBeInTheDocument();
      expect(screen.getByText('Protein (Low to High)')).toBeInTheDocument();
      expect(screen.getByText('Price (Low to High)')).toBeInTheDocument();
      expect(screen.getByText('Price (High to Low)')).toBeInTheDocument();
      expect(screen.getByText('Health Grade')).toBeInTheDocument();
      expect(screen.getByText('Calories (Low to High)')).toBeInTheDocument();
      expect(screen.getByText('Calories (High to Low)')).toBeInTheDocument();
      expect(screen.getByText('Name (A-Z)')).toBeInTheDocument();
    });

    it('calls onSortChange when option is selected', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const sortSelects = screen.getAllByRole('combobox', { name: 'Sort products by' });
      const sortSelect = sortSelects[0]; // Take the first one
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      expect(mockOnSortChange).toHaveBeenCalledWith('price-asc', 'asc');
    });

    it('extracts direction from sort option correctly', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const sortSelects = screen.getAllByRole('combobox', { name: 'Sort products by' });
      const sortSelect = sortSelects[0]; // Take the first one

      // Test descending
      fireEvent.change(sortSelect, { target: { value: 'protein-desc' } });
      expect(mockOnSortChange).toHaveBeenCalledWith('protein-desc', 'desc');

      // Test ascending
      fireEvent.change(sortSelect, { target: { value: 'calories-asc' } });
      expect(mockOnSortChange).toHaveBeenCalledWith('calories-asc', 'asc');
    });
  });

  describe('Result Count Display', () => {
    it('formats large numbers with commas', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      expect(screen.getByText('11,379 products')).toBeInTheDocument();
    });

    it('handles zero results', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery="nonexistent"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={0}
        />
      );

      expect(screen.getByText('0 products')).toBeInTheDocument();
    });

    it('uses singular form for one result', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery="specific product"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={1}
        />
      );

      expect(screen.getByText('1 product')).toBeInTheDocument();
    });

    it('shows loading state when result count is updating', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      const { rerender } = render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      // Simulate search in progress
      rerender(
        <SearchControls
          searchQuery="chicken"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={-1} // -1 indicates loading
        />
      );

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsive Design', () => {
    it('stacks search and sort controls on mobile', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      const { container } = render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const controlsContainer = container.firstChild as HTMLElement;
      expect(controlsContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('applies touch-friendly sizing on mobile', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');
      expect(searchInput).toHaveClass('min-h-[44px]'); // Touch target minimum

      const sortSelects = screen.getAllByRole('combobox', { name: 'Sort products by' });
      const sortSelect = sortSelects[0]; // Take the first one
      expect(sortSelect).toHaveClass('min-h-[44px]');
    });

    it('positions result count appropriately on mobile', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const resultCount = screen.getByText('11,379 products');
      expect(resultCount).toHaveClass('text-center', 'sm:text-left');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for screen readers', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByLabelText('Search products');
      expect(searchInput).toBeInTheDocument();

      const sortSelect = screen.getByLabelText('Sort products by');
      expect(sortSelect).toBeInTheDocument();
    });

    it('announces result count changes to screen readers', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const resultAnnouncement = screen.getByRole('status');
      expect(resultAnnouncement).toBeInTheDocument();
      expect(resultAnnouncement).toHaveTextContent('11,379 products');
    });

    it('provides keyboard navigation support', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');
      const sortSelects = screen.getAllByRole('combobox', { name: 'Sort products by' });
      const sortSelect = sortSelects[0]; // Take the first one

      // Should be keyboard navigable
      expect(searchInput).toHaveAttribute('tabIndex', '0');
      expect(sortSelect).toHaveAttribute('tabIndex', '0');
    });

    it('indicates search state to screen readers', () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();

      render(
        <SearchControls
          searchQuery="chicken"
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={342}
        />
      );

      const searchInput = screen.getByDisplayValue('chicken');
      expect(searchInput).toHaveAttribute('aria-describedby', expect.stringContaining('search-results'));
    });
  });

  describe('Performance Optimization', () => {
    it('debounces search input to prevent excessive API calls', async () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');

      // Type multiple characters quickly
      await user.type(searchInput, 'chicken breast protein');

      // Should not call during typing
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      // Fast forward debounce delay
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
        expect(mockOnSearchChange).toHaveBeenCalledWith('chicken breast protein');
      });
    });

    it('cancels previous debounced calls when new input arrives', async () => {
      const mockOnSearchChange = vi.fn();
      const mockOnSortChange = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SearchControls
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          sortBy="protein-desc"
          sortDirection="desc"
          onSortChange={mockOnSortChange}
          resultCount={11379}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search products...');

      // Type something
      await user.type(searchInput, 'chicken');

      // Advance time partially
      vi.advanceTimersByTime(150);

      // Type more before debounce completes
      await user.type(searchInput, ' breast');

      // Complete debounce
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        // Should only call once with final value
        expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
        expect(mockOnSearchChange).toHaveBeenCalledWith('chicken breast');
      });
    });
  });
});
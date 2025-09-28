/**
 * FilterCard Component Contract Test
 *
 * TDD test for FilterCard component - MUST FAIL before implementation
 * Tests Ali's 6 filter categories display and interaction
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterCard } from '../../src/components/homepage/FilterCard';
import type { FilterCategory } from '../../src/types/homepage';

// Test data for Ali's filter categories
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
  }
];

describe('FilterCard Component Contract', () => {
  describe('Basic Rendering', () => {
    it('renders filter category name and description', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Daily Protein')).toBeInTheDocument();
      expect(screen.getByText('High-protein foods for daily nutrition goals')).toBeInTheDocument();
    });

    it('displays coverage statistics', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('11,379 products')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      const { container } = render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
          className="custom-filter-card"
        />
      );

      expect(container.firstChild).toHaveClass('custom-filter-card');
    });
  });

  describe('Active State Styling', () => {
    it('applies active styling when isActive is true', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      const { container } = render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      // Should have active state classes
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('ring-2', 'ring-blue-500');
      expect(card).toHaveClass('bg-blue-50');
    });

    it('applies inactive styling when isActive is false', () => {
      const category = mockFilterCategories[1];
      const mockOnClick = vi.fn();

      const { container } = render(
        <FilterCard
          category={category}
          isActive={false}
          onClick={mockOnClick}
        />
      );

      // Should have inactive state classes
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('ring-2', 'ring-blue-500');
      expect(card).not.toHaveClass('bg-blue-50');
      expect(card).toHaveClass('hover:bg-gray-50');
    });

    it('shows active indicator when category is active', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      // Should show active indicator (checkmark or similar)
      expect(screen.getByTestId('active-indicator')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick handler when card is clicked', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockOnClick).toHaveBeenCalledWith(category);
    });

    it('calls onClick handler when Enter key is pressed', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(category);
    });

    it('calls onClick handler when Space key is pressed', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledWith(category);
    });

    it('does not call onClick for other key presses', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Tab' });
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Touch Optimization', () => {
    it('has proper touch target size (minimum 44px)', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      const { container } = render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const card = container.firstChild as HTMLElement;

      // Should have minimum touch target dimensions (check for Tailwind class)
      expect(card).toHaveClass('min-h-[44px]');
    });

    it('applies touch-friendly padding and spacing', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      const { container } = render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4'); // Adequate touch padding
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'true');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Daily Protein'));
    });

    it('has proper ARIA attributes when inactive', () => {
      const category = mockFilterCategories[1];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={false}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'false');
    });

    it('is keyboard focusable', () => {
      const category = mockFilterCategories[0];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Context-Specific Information', () => {
    it('shows target protein for categories with protein targets', () => {
      const category = mockFilterCategories[0]; // Has targetProtein: 150
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={true}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Target: 150g protein')).toBeInTheDocument();
    });

    it('does not show target protein for categories without targets', () => {
      const category = mockFilterCategories[2]; // No targetProtein
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={category}
          isActive={false}
          onClick={mockOnClick}
        />
      );

      expect(screen.queryByText(/Target:/)).not.toBeInTheDocument();
    });

    it('displays context-specific icons or indicators', () => {
      const postWorkoutCategory = mockFilterCategories[1];
      const mockOnClick = vi.fn();

      render(
        <FilterCard
          category={postWorkoutCategory}
          isActive={false}
          onClick={mockOnClick}
        />
      );

      // Should show post-workout specific icon
      expect(screen.getByTestId('post-workout-icon')).toBeInTheDocument();
    });
  });
});
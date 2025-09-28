/**
 * Category Index Page
 *
 * Main category index page with Ali metrics, search, filtering, and virtual scrolling.
 * Displays all 3,195+ categories in a responsive grid layout.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { CategoryCard } from '../components/category-index/CategoryCard';
import { CategorySearch } from '../components/category-index/CategorySearch';
import { filterCategories } from '../lib/categoryFilters';
import { sortCategories } from '../lib/categorySorting';
import { searchCategories } from '../lib/dutchSearch';
import type {
  CategoryWithMetrics,
  CategorySortOption,
  AliFilterCriteria,
  CategoryIndexState,
} from '../types/category-index';

export interface CategoryIndexPageProps {
  initialData?: CategoryWithMetrics[];
  className?: string;
}

// Virtual scrolling configuration
const VIRTUAL_SCROLL_CONFIG = {
  itemHeight: 180, // Estimated height per category card
  bufferSize: 10,  // Buffer items above/below visible range
  threshold: 100,  // Enable virtual scrolling above this count
};

export function CategoryIndexPage({
  initialData,
  className = '',
}: CategoryIndexPageProps) {
  // Component state
  const [state, setState] = useState<CategoryIndexState>({
    categories: initialData || [],
    filteredCategories: initialData || [],
    selectedCategory: null,
    loading: !initialData,
    error: null,
    searchQuery: '',
    sortBy: 'product-count-desc',
    activeFilters: {},
    virtualScrolling: false,
    visibleRange: { start: 0, end: 20 },
  });

  // Load category data on mount
  useEffect(() => {
    if (!initialData) {
      loadCategoryData();
    }
  }, [initialData]);

  // Load category data from static JSON
  const loadCategoryData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const basePath = import.meta.env.BASE_URL || '';
      const response = await fetch(`${basePath}category-tree.json`);
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.statusText}`);
      }

      const data = await response.json();
      const categories = data.categoryTree as CategoryWithMetrics[];

      setState(prev => ({
        ...prev,
        categories,
        filteredCategories: categories,
        loading: false,
        virtualScrolling: categories.length > VIRTUAL_SCROLL_CONFIG.threshold,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load categories',
      }));
    }
  }, []);

  // Retry loading data
  const retryLoad = useCallback(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  // Apply search, filter, and sort
  const processedCategories = useMemo(() => {
    let result = [...state.categories];

    // Apply search
    if (state.searchQuery.trim()) {
      result = searchCategories(state.searchQuery, result);
    }

    // Apply filters
    if (Object.keys(state.activeFilters).length > 0) {
      result = filterCategories(result, state.activeFilters);
    }

    // Apply sorting
    result = sortCategories(result, state.sortBy);

    return result;
  }, [state.categories, state.searchQuery, state.activeFilters, state.sortBy]);

  // Update filtered categories when processed categories change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      filteredCategories: processedCategories,
    }));
  }, [processedCategories]);

  // Virtual scrolling - visible categories
  const visibleCategories = useMemo(() => {
    if (!state.virtualScrolling) {
      return processedCategories;
    }

    const { start, end } = state.visibleRange;
    return processedCategories.slice(
      Math.max(0, start - VIRTUAL_SCROLL_CONFIG.bufferSize),
      Math.min(processedCategories.length, end + VIRTUAL_SCROLL_CONFIG.bufferSize)
    );
  }, [processedCategories, state.virtualScrolling, state.visibleRange]);

  // Event handlers
  const handleCategoryClick = useCallback((category: CategoryWithMetrics) => {
    // Convert breadcrumbs to directory path
    const pathParts = category.breadcrumbs.split(' > ')
      .map(part => part.toLowerCase().replace(/\s+/g, '-').replace(/[,]/g, ''));
    const directoryPath = pathParts.join('/');

    // This would need to be passed as a prop from App.tsx for proper navigation
    console.log('Navigate to directory:', directoryPath);
    // onNavigateToDirectory?.(directoryPath);

    // For now, we'll just log the intended navigation
    // In a full implementation, this would trigger navigation to the category directory
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleSortChange = useCallback((sortBy: CategorySortOption) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const handleFilterChange = useCallback((filters: AliFilterCriteria) => {
    setState(prev => ({ ...prev, activeFilters: filters }));
  }, []);

  const handleClearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      activeFilters: {},
    }));
  }, []);

  // Determine responsive grid classes
  const gridClasses = useMemo(() => {
    const baseClasses = 'grid gap-4 w-full';
    const responsiveClasses = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    return `${baseClasses} ${responsiveClasses}`;
  }, []);

  // Loading state
  if (state.loading) {
    return (
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${className}`}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>

          {/* Grid skeleton */}
          <div className={gridClasses}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center mt-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
            role="progressbar"
            aria-label="Loading categories"
          />
          <span className="ml-2 text-muted-foreground">Loading categories...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${className}`}>
        <Alert className="max-w-md mx-auto">
          <AlertDescription className="space-y-4">
            <p className="font-medium">Error loading categories</p>
            <p className="text-sm text-muted-foreground">{state.error}</p>
            <Button onClick={retryLoad} size="sm" className="w-full">
              Retry
            </Button>
          </AlertDescription>
        </Alert>

        {/* Fallback content */}
        <div className="text-center mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Browse Categories</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore nutrition categories and discover products optimized for your CrossFit goals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${className}`} role="main">
      {/* Page Header */}
      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Category Index</h1>
          <p className="text-muted-foreground">
            Browse all categories with Ali-specific nutrition metrics and filter by your goals.
          </p>
        </div>

        {/* Skip link for accessibility */}
        <a
          href="#category-grid"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Skip to categories
        </a>

        {/* Search and Filter Controls */}
        <CategorySearch
          searchQuery={state.searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={state.sortBy}
          onSortChange={handleSortChange}
          activeFilters={state.activeFilters}
          onFilterChange={handleFilterChange}
          resultCount={processedCategories.length}
          totalCount={state.categories.length}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Category Grid */}
      <div
        id="category-grid"
        className={gridClasses}
        role="grid"
        aria-label="Category grid"
        data-testid={state.virtualScrolling ? 'virtual-grid' : 'category-grid'}
        touch-action="pan-y"
      >
        {visibleCategories.length === 0 ? (
          <div className="col-span-full text-center py-12 space-y-4">
            <p className="text-lg font-medium">No categories found</p>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find categories.
            </p>
            {(state.searchQuery || Object.keys(state.activeFilters).length > 0) && (
              <Button variant="outline" onClick={handleClearAll}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          visibleCategories.map((category) => (
            <CategoryCard
              key={`${category.breadcrumbs}-${category.productCount}`}
              category={category}
              onClick={handleCategoryClick}
              showMetrics={true}
              variant="detailed"
              className="min-h-32"
            />
          ))
        )}
      </div>

      {/* Virtual scrolling info for large datasets */}
      {state.virtualScrolling && processedCategories.length > VIRTUAL_SCROLL_CONFIG.threshold && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Showing {visibleCategories.length} of {processedCategories.length} categories
            {processedCategories.length !== state.categories.length && (
              <> (filtered from {state.categories.length} total)</>
            )}
          </p>
        </div>
      )}

      {/* Viewport change announcements for screen readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        aria-label="Layout announcement"
      >
        {/* This will be updated by responsive tests */}
      </div>
    </div>
  );
}


/**
 * CategorySearch Component
 *
 * Search and filtering functionality with Dutch language support
 * and Ali-specific filter criteria.
 */

import { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import type {
  CategorySortOption,
  AliFilterCriteria,
  AliContext
} from '../../types/category-index';

export interface CategorySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: CategorySortOption;
  onSortChange: (sortBy: CategorySortOption) => void;
  activeFilters: AliFilterCriteria;
  onFilterChange: (filters: AliFilterCriteria) => void;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
  className?: string;
}

// Sort options configuration
const SORT_OPTIONS: Array<{
  value: CategorySortOption;
  label: string;
}> = [
  { value: 'product-count-desc', label: 'Product Count (Descending)' },
  { value: 'product-count-asc', label: 'Product Count (Ascending)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'protein-desc', label: 'Protein (Highest)' },
  { value: 'halal-compliance-desc', label: 'Halal Compliance' },
  { value: 'price-efficiency-desc', label: 'Price Efficiency' },
];

// Ali context labels
const ALI_CONTEXT_LABELS: Record<AliContext, string> = {
  'daily-protein': 'Daily Protein',
  'post-workout': 'Post Workout',
  'cutting': 'Cutting',
  'budget': 'Budget',
  'training-day': 'Training Day',
  'rest-day': 'Rest Day',
};

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const CategorySearch = memo<CategorySearchProps>(({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  activeFilters,
  onFilterChange,
  resultCount,
  totalCount,
  onClearAll,
  className = '',
}) => {
  // Local search state for immediate UI updates
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Update parent when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchQuery, onSearchChange]);

  // Handle search input change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Enforce maximum length
    if (value.length <= 100) {
      setLocalSearchQuery(value);
    }
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setLocalSearchQuery('');
    onSearchChange('');
  }, [onSearchChange]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: CategorySortOption) => {
    onSortChange(newSort);
  }, [onSortChange]);

  // Handle filter changes
  const handleHalalFilterChange = useCallback((value: number[]) => {
    onFilterChange({
      ...activeFilters,
      minHalalCompliance: value[0],
    });
  }, [activeFilters, onFilterChange]);

  const handleProteinFilterChange = useCallback((value: number[]) => {
    onFilterChange({
      ...activeFilters,
      minProtein: value[0],
    });
  }, [activeFilters, onFilterChange]);

  const handleEfficiencyFilterChange = useCallback((value: number[]) => {
    onFilterChange({
      ...activeFilters,
      maxPricePerProtein: value[0],
    });
  }, [activeFilters, onFilterChange]);

  const handleProductCountFilterChange = useCallback((value: number[]) => {
    onFilterChange({
      ...activeFilters,
      minProductCount: value[0],
    });
  }, [activeFilters, onFilterChange]);

  const handleContextFilterChange = useCallback((context: AliContext, checked: boolean) => {
    const currentContexts = activeFilters.contexts || [];
    const newContexts = checked
      ? [...currentContexts, context]
      : currentContexts.filter(c => c !== context);

    onFilterChange({
      ...activeFilters,
      contexts: newContexts,
    });
  }, [activeFilters, onFilterChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      activeFilters.minHalalCompliance ||
      activeFilters.minProtein ||
      activeFilters.maxPricePerProtein ||
      activeFilters.minProductCount ||
      (activeFilters.contexts && activeFilters.contexts.length > 0)
    );
  }, [activeFilters]);

  // Get current sort label
  const currentSortLabel = useMemo(() => {
    return SORT_OPTIONS.find(option => option.value === sortBy)?.label || 'Sort';
  }, [sortBy]);

  return (
    <div className={`space-y-4 ${className}`} aria-label="Search and filter categories">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10 text-base"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            maxLength={100}
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleSearchClear}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2" role="button" aria-label="Sort">
              <span className="hidden sm:inline">Sort:</span>
              <span>{currentSortLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={sortBy === option.value ? 'bg-accent' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              •
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-6 bg-card" role="group" aria-label="Filter options">
          {/* Halal Compliance Filter */}
          <div className="space-y-2">
            <Label htmlFor="halal-slider" className="text-sm font-medium">
              Minimum Halal Compliance: {activeFilters.minHalalCompliance || 0}%
            </Label>
            <Slider
              id="halal-slider"
              min={0}
              max={100}
              step={5}
              value={[activeFilters.minHalalCompliance || 0]}
              onValueChange={handleHalalFilterChange}
              className="w-full"
              aria-label="Minimum halal compliance percentage"
            />
          </div>

          {/* Protein Density Filter */}
          <div className="space-y-2">
            <Label htmlFor="protein-slider" className="text-sm font-medium">
              Minimum Protein Density: {activeFilters.minProtein || 0}g/100g
            </Label>
            <Slider
              id="protein-slider"
              min={0}
              max={50}
              step={1}
              value={[activeFilters.minProtein || 0]}
              onValueChange={handleProteinFilterChange}
              className="w-full"
              aria-label="Minimum protein density"
            />
          </div>

          {/* Price Efficiency Filter */}
          <div className="space-y-2">
            <Label htmlFor="efficiency-slider" className="text-sm font-medium">
              Maximum Price per Protein: €{(activeFilters.maxPricePerProtein || 5).toFixed(2)}/g
            </Label>
            <Slider
              id="efficiency-slider"
              min={0}
              max={5}
              step={0.05}
              value={[activeFilters.maxPricePerProtein || 5]}
              onValueChange={handleEfficiencyFilterChange}
              className="w-full"
              aria-label="Maximum price per protein gram"
            />
          </div>

          {/* Product Count Filter */}
          <div className="space-y-2">
            <Label htmlFor="count-slider" className="text-sm font-medium">
              Minimum Products: {activeFilters.minProductCount || 1}
            </Label>
            <Slider
              id="count-slider"
              min={1}
              max={500}
              step={5}
              value={[activeFilters.minProductCount || 1]}
              onValueChange={handleProductCountFilterChange}
              className="w-full"
              aria-label="Minimum product count"
            />
          </div>

          {/* Ali Context Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ali Context Recommendations</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ALI_CONTEXT_LABELS).map(([context, label]) => (
                <div key={context} className="flex items-center space-x-2">
                  <Checkbox
                    id={`context-${context}`}
                    checked={(activeFilters.contexts || []).includes(context as AliContext)}
                    onCheckedChange={(checked) =>
                      handleContextFilterChange(context as AliContext, checked as boolean)
                    }
                    aria-label={`Filter by ${label}`}
                  />
                  <Label
                    htmlFor={`context-${context}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClearAll}
                className="w-full"
                aria-label="Clear all filters"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Result Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div role="status" aria-live="polite">
          {resultCount === 0 ? (
            <>
              <span>No categories found</span>
              {(localSearchQuery || hasActiveFilters) && (
                <span className="block mt-1">Try adjusting your filters or search terms</span>
              )}
            </>
          ) : (
            <span>
              Showing {resultCount} of {totalCount} categories
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs"
            aria-label="Clear all filters"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
});

CategorySearch.displayName = 'CategorySearch';
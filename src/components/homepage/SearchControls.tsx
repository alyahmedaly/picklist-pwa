/**
 * SearchControls Component
 *
 * Search input and sort dropdown with debounced search functionality
 * Mobile-optimized layout with accessibility support
 */

import React, { useState, useEffect, useDeferredValue, memo, useCallback, startTransition } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { SearchControlsProps } from '../../types/homepage';
import { Search, X } from 'lucide-react';
import { SORT_OPTIONS, debounce } from '../../lib/homepage/searchEngine';

export const SearchControls: React.FC<SearchControlsProps> = memo(({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  className = ''
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const deferredSearchQuery = useDeferredValue(localSearchQuery);

  // Debounced search handler
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => {
      onSearchChange(query);
    }, 300),
    [onSearchChange]
  );

  // Handle search input changes with concurrent features
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    // Use startTransition for non-urgent UI updates
    startTransition(() => {
      setLocalSearchQuery(query);
    });
  }, []);

  // Apply debounced search when deferred value changes
  useEffect(() => {
    debouncedSearch(deferredSearchQuery);
  }, [deferredSearchQuery, debouncedSearch]);

  // Sync external search query changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle sort changes with concurrent features
  const handleSortChange = useCallback((value: string) => {
    const sortOption = SORT_OPTIONS.find(option => option.value === value);
    if (sortOption) {
      startTransition(() => {
        onSortChange(sortOption.value, sortOption.direction);
      });
    }
  }, [onSortChange]);

  // Clear search with concurrent features
  const handleClearSearch = useCallback(() => {
    startTransition(() => {
      setLocalSearchQuery('');
      onSearchChange('');
    });
  }, [onSearchChange]);

  // Format result count
  const formatResultCount = (count: number): string => {
    if (count === -1) return 'Searching...';
    if (count === 0) return '0 products';
    if (count === 1) return '1 product';
    return `${count.toLocaleString()} products`;
  };

  // Get current sort option for display
  const currentSortOption = SORT_OPTIONS.find(option => option.value === sortBy);

  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-md order-1 sm:order-1">
        <div className="relative">
          <Search
            data-testid="search-icon"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search products..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10 min-h-[44px]"
            aria-label="Search products"
            aria-describedby="search-results"
          />
          {localSearchQuery && (
            <Button
              data-testid="clear-search-button"
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="w-full sm:w-auto sm:min-w-[200px] order-2 sm:order-2">
        <Select
          value={sortBy}
          onValueChange={handleSortChange}
        >
          <SelectTrigger
            className="min-h-[44px]"
            aria-label="Sort products by"
          >
            <SelectValue placeholder="Sort by">
              {currentSortOption?.label || 'Sort by'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result Count */}
      <div
        className="text-center sm:text-left text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-[120px] order-3 sm:order-3 py-2 sm:py-0"
        role="status"
        aria-live="polite"
        id="search-results"
      >
        {formatResultCount(resultCount)}
      </div>
    </div>
  );
});

export default SearchControls;
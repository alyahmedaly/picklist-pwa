/**
 * CategoryTreeControls Component
 *
 * Search and view controls for category tree
 * Follows constitutional principle VII: Component composition with early returns
 */

import React from 'react';
import { Search, LayoutList, TreePine, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CategoryTreeView, CategoryTreeSort, CategoryTreeStats } from '../../types/category-tree';

interface CategoryTreeControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  view: CategoryTreeView;
  onViewChange: (view: CategoryTreeView) => void;
  sortBy: CategoryTreeSort;
  onSortChange: (sort: CategoryTreeSort) => void;
  showProductCounts: boolean;
  onToggleProductCounts: () => void;
  showEmptyCategories: boolean;
  onToggleEmptyCategories: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  stats: CategoryTreeStats;
  className?: string;
}

export function CategoryTreeControls({
  searchQuery,
  onSearchChange,
  view,
  onViewChange,
  sortBy,
  onSortChange,
  showProductCounts,
  onToggleProductCounts,
  showEmptyCategories,
  onToggleEmptyCategories,
  onExpandAll,
  onCollapseAll,
  stats,
  className,
}: CategoryTreeControlsProps) {
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={handleSearchInput}
          className="pl-10 pr-4"
          aria-label="Search categories"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            ×
          </Button>
        )}
      </div>

      {/* Stats and controls row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Category stats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="tabular-nums">
            {stats.totalCategories} categories
          </Badge>
          <Badge variant="outline" className="tabular-nums">
            {stats.totalProducts} products
          </Badge>
          {stats.maxDepth > 0 && (
            <Badge variant="outline" className="tabular-nums">
              {stats.maxDepth} levels deep
            </Badge>
          )}
        </div>

        {/* View controls */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={view === 'tree' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none border-r"
              onClick={() => onViewChange('tree')}
              aria-label="Tree view"
            >
              <TreePine className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => onViewChange('list')}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>

          {/* Expand/collapse controls (tree view only) */}
          {view === 'tree' && (
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-r-none border-r"
                onClick={onExpandAll}
                aria-label="Expand all"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-l-none"
                onClick={onCollapseAll}
                aria-label="Collapse all"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sort and display options */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium">
            Sort by:
          </label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger id="sort-select" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="product-count-desc">Most products</SelectItem>
              <SelectItem value="product-count-asc">Least products</SelectItem>
              <SelectItem value="depth-asc">Shallowest first</SelectItem>
              <SelectItem value="depth-desc">Deepest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Display options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showProductCounts}
              onChange={onToggleProductCounts}
              className="rounded border-input"
            />
            Show product counts
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showEmptyCategories}
              onChange={onToggleEmptyCategories}
              className="rounded border-input"
            />
            Show empty categories
          </label>
        </div>
      </div>

      {/* Search results indicator */}
      {searchQuery && (
        <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-md">
          <div className="text-sm">
            <span className="font-medium">
              Showing categories matching "{searchQuery}"
            </span>
            {stats.mostPopularCategory.productCount > 0 && (
              <span className="text-muted-foreground ml-2">
                • Most popular: {stats.mostPopularCategory.name} ({stats.mostPopularCategory.productCount} products)
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={clearSearch}>
            Clear filter
          </Button>
        </div>
      )}
    </div>
  );
}
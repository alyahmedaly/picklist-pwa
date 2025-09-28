/**
 * CategoryTree Component
 *
 * Main category tree visualization with tree and list views
 * Follows constitutional principle VII: Component composition with early returns
 */

import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { CategoryNode } from './CategoryNode';
import { CategoryBreadcrumb } from './CategoryBreadcrumb';
import { CategoryTreeControls } from './CategoryTreeControls';
import {
  filterCategories,
  sortCategories,
  calculateCategoryStats,
  toggleNodeExpansion,
  expandToDepth,
  flattenCategoryTree,
} from '../../lib/category-tree-utils';
import type {
  CategoryTreeProps,
  CategoryNode as CategoryNodeType,
  CategoryTreeView,
  CategoryTreeSort,
} from '../../types/category-tree';

export function CategoryTree({
  categories,
  selectedCategory,
  onCategorySelect,
  view = 'tree',
  sortBy = 'product-count-desc',
  showProductCounts = true,
  showEmptyCategories = true,
  collapsedByDefault = false,
  virtualScrolling = false,
  className,
}: CategoryTreeProps) {
  // Local state for UI interactions
  const [localView, setLocalView] = useState<CategoryTreeView>(view);
  const [localSortBy, setLocalSortBy] = useState<CategoryTreeSort>(sortBy);
  const [searchQuery, setSearchQuery] = useState('');
  const [localCategories, setLocalCategories] = useState(() =>
    collapsedByDefault ? categories : expandToDepth(categories, 2)
  );
  const [localShowProductCounts, setLocalShowProductCounts] = useState(showProductCounts);
  const [localShowEmptyCategories, setLocalShowEmptyCategories] = useState(showEmptyCategories);

  // Early return: Loading state
  if (!categories || categories.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Computed values
  const filteredAndSortedCategories = useMemo(() => {
    let processed = localCategories;

    // Apply search filter
    if (searchQuery.trim()) {
      processed = filterCategories(processed, searchQuery);
    }

    // Apply sorting
    processed = sortCategories(processed, localSortBy);

    return processed;
  }, [localCategories, searchQuery, localSortBy]);

  const flatCategories = useMemo(() => {
    return flattenCategoryTree(filteredAndSortedCategories);
  }, [filteredAndSortedCategories]);

  const stats = useMemo(() => {
    return calculateCategoryStats(filteredAndSortedCategories);
  }, [filteredAndSortedCategories]);

  // Event handlers
  const handleCategorySelect = (category: CategoryNodeType) => {
    onCategorySelect(category);
  };

  const handleNodeToggle = (node: CategoryNodeType) => {
    setLocalCategories(prev => toggleNodeExpansion(prev, node.path));
  };

  const handleExpandAll = () => {
    setLocalCategories(prev => expandToDepth(prev, 10)); // Expand all levels
  };

  const handleCollapseAll = () => {
    setLocalCategories(prev =>
      prev.map(cat => ({
        ...cat,
        isExpanded: false,
        children: cat.children.map(child => ({ ...child, isExpanded: false })),
      }))
    );
  };

  const handleBreadcrumbNavigate = (category: CategoryNodeType) => {
    onCategorySelect(category);
  };

  // Early return: No results after filtering
  if (searchQuery && filteredAndSortedCategories.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <CategoryTreeControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          view={localView}
          onViewChange={setLocalView}
          sortBy={localSortBy}
          onSortChange={setLocalSortBy}
          showProductCounts={localShowProductCounts}
          onToggleProductCounts={() => setLocalShowProductCounts(prev => !prev)}
          showEmptyCategories={localShowEmptyCategories}
          onToggleEmptyCategories={() => setLocalShowEmptyCategories(prev => !prev)}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          stats={stats}
        />

        <Alert>
          <AlertDescription>
            No categories found matching "{searchQuery}". Try a different search term or clear the filter.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn('category-tree space-y-4', className)} role="tree" aria-label="Category tree">
      {/* Controls */}
      <CategoryTreeControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        view={localView}
        onViewChange={setLocalView}
        sortBy={localSortBy}
        onSortChange={setLocalSortBy}
        showProductCounts={localShowProductCounts}
        onToggleProductCounts={() => setLocalShowProductCounts(prev => !prev)}
        showEmptyCategories={localShowEmptyCategories}
        onToggleEmptyCategories={() => setLocalShowEmptyCategories(prev => !prev)}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        stats={stats}
      />

      {/* Breadcrumb (if category selected) */}
      {selectedCategory && (
        <CategoryBreadcrumb
          category={selectedCategory}
          onNavigate={handleBreadcrumbNavigate}
        />
      )}

      {/* Tree view */}
      {localView === 'tree' && (
        <div
          className={cn(
            'category-tree-view border rounded-lg bg-card',
            virtualScrolling && 'max-h-96 overflow-auto'
          )}
        >
          {filteredAndSortedCategories.map((category) => (
            <CategoryNode
              key={category.breadcrumbs}
              node={category}
              isSelected={selectedCategory?.breadcrumbs === category.breadcrumbs}
              onSelect={handleCategorySelect}
              onToggle={handleNodeToggle}
              showProductCounts={localShowProductCounts}
              showEmptyCategories={localShowEmptyCategories}
              depth={0}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {localView === 'list' && (
        <div
          className={cn(
            'category-list-view border rounded-lg bg-card',
            virtualScrolling && 'max-h-96 overflow-auto'
          )}
        >
          {flatCategories
            .filter(cat => localShowEmptyCategories || cat.productCount > 0)
            .map((category) => (
              <div
                key={category.fullPath}
                className={cn(
                  'flex items-center justify-between p-3 hover:bg-accent/50 cursor-pointer border-b last:border-b-0',
                  selectedCategory?.breadcrumbs === category.fullPath && 'bg-accent'
                )}
                onClick={() => {
                  // Find the full CategoryNode for this flat category
                  const findNode = (nodes: CategoryNodeType[]): CategoryNodeType | null => {
                    for (const node of nodes) {
                      if (node.breadcrumbs === category.fullPath) return node;
                      const found = findNode(node.children);
                      if (found) return found;
                    }
                    return null;
                  };
                  const node = findNode(filteredAndSortedCategories);
                  if (node) handleCategorySelect(node);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{category.name}</div>
                  <div className="text-sm text-muted-foreground truncate" title={category.breadcrumbs}>
                    {category.breadcrumbs}
                  </div>
                </div>
                {localShowProductCounts && category.productCount > 0 && (
                  <div className="flex-shrink-0 ml-4">
                    <span className="text-sm font-medium tabular-nums">
                      {category.productCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
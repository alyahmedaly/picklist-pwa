/**
 * CategoryBreadcrumb Component
 *
 * Breadcrumb navigation for category hierarchy
 * Follows constitutional principle VII: Component composition with early returns
 */

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { getCategoryAncestors } from '../../lib/category-tree-utils';
import type { CategoryBreadcrumbProps } from '../../types/category-tree';

export function CategoryBreadcrumb({
  category,
  onNavigate,
  maxItems = 5,
  className,
}: CategoryBreadcrumbProps) {
  const ancestors = getCategoryAncestors(category);
  const allItems = [...ancestors, category];

  // Early return: No breadcrumb for root level
  if (allItems.length <= 1) {
    return null;
  }

  // Truncate if too many items
  const displayItems = allItems.length > maxItems
    ? [
        allItems[0], // Always show root
        { name: '...', path: [], breadcrumbs: '...', depth: 0, productCount: 0, children: [], isExpanded: false, isSelected: false, isVisible: true }, // Ellipsis indicator
        ...allItems.slice(-maxItems + 2), // Show last few items
      ]
    : allItems;

  return (
    <nav
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
      aria-label="Category breadcrumb"
    >
      {/* Home icon for root */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 hover:text-foreground"
        onClick={() => onNavigate(allItems[0])}
        aria-label="Navigate to root category"
      >
        <Home className="h-3 w-3" />
      </Button>

      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isEllipsis = item.name === '...';

        return (
          <React.Fragment key={item.breadcrumbs || `ellipsis-${index}`}>
            {/* Separator */}
            {index > 0 && (
              <ChevronRight className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            )}

            {/* Breadcrumb item */}
            {isEllipsis ? (
              <span className="px-2 py-1 text-muted-foreground/60" aria-hidden="true">
                ...
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 font-normal truncate max-w-32',
                  isLast
                    ? 'text-foreground hover:text-foreground cursor-default'
                    : 'hover:text-foreground'
                )}
                onClick={() => !isLast && onNavigate(item)}
                disabled={isLast}
                title={item.breadcrumbs}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.name}
              </Button>
            )}
          </React.Fragment>
        );
      })}

      {/* Product count for current category */}
      {category.productCount > 0 && (
        <>
          <span className="text-muted-foreground/60" aria-hidden="true">•</span>
          <span className="text-xs font-medium tabular-nums">
            {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
          </span>
        </>
      )}
    </nav>
  );
}
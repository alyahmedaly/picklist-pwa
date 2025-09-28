/**
 * CategoryNode Component
 *
 * Individual category node with expand/collapse functionality
 * Follows constitutional principle VII: Component composition with early returns
 */

import React from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { CategoryNodeProps } from '../../types/category-tree';

export function CategoryNode({
  node,
  isSelected,
  onSelect,
  onToggle,
  showProductCounts,
  showEmptyCategories,
  depth = 0,
  className,
}: CategoryNodeProps) {
  // Early return: Don't render empty categories if configured to hide them
  if (!showEmptyCategories && node.productCount === 0) {
    return null;
  }

  const hasChildren = node.children.length > 0;
  const indentLevel = Math.min(depth, 6); // Max 6 levels for readability

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node);
    }
  };

  const handleSelect = () => {
    onSelect(node);
  };

  return (
    <div className={cn('category-node', className)}>
      {/* Current node */}
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 hover:bg-accent/50 cursor-pointer transition-colors',
          'border-l-2 border-transparent',
          isSelected && 'bg-accent border-l-primary',
          `ml-${indentLevel * 4}` // Dynamic indentation
        )}
        onClick={handleSelect}
        role="treeitem"
        aria-expanded={hasChildren ? node.isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
          if (e.key === 'ArrowRight' && hasChildren && !node.isExpanded) {
            e.preventDefault();
            onToggle(node);
          }
          if (e.key === 'ArrowLeft' && hasChildren && node.isExpanded) {
            e.preventDefault();
            onToggle(node);
          }
        }}
      >
        {/* Expand/collapse button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 hover:bg-transparent"
          onClick={handleToggle}
          disabled={!hasChildren}
          aria-label={hasChildren ? (node.isExpanded ? 'Collapse' : 'Expand') : undefined}
        >
          {hasChildren ? (
            node.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" /> // Spacer for alignment
          )}
        </Button>

        {/* Category icon */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            node.isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="h-4 w-4 rounded-sm bg-muted-foreground/20" />
          )}
        </div>

        {/* Category name */}
        <span
          className={cn(
            'flex-1 text-sm font-medium truncate',
            isSelected && 'text-primary',
            depth === 0 && 'text-base font-semibold',
            depth >= 3 && 'text-xs text-muted-foreground'
          )}
          title={node.breadcrumbs}
        >
          {node.name}
        </span>

        {/* Product count badge */}
        {showProductCounts && node.productCount > 0 && (
          <Badge
            variant={node.productCount > 100 ? 'default' : 'secondary'}
            className="text-xs tabular-nums"
            title={`${node.productCount} products`}
          >
            {node.productCount > 999 ? '999+' : node.productCount}
          </Badge>
        )}
      </div>

      {/* Children (recursive) */}
      {hasChildren && node.isExpanded && (
        <div className="category-children" role="group">
          {node.children.map((child) => (
            <CategoryNode
              key={child.breadcrumbs}
              node={child}
              isSelected={isSelected && child.breadcrumbs === node.breadcrumbs}
              onSelect={onSelect}
              onToggle={onToggle}
              showProductCounts={showProductCounts}
              showEmptyCategories={showEmptyCategories}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
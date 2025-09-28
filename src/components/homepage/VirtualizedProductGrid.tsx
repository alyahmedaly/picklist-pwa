/**
 * VirtualizedProductGrid Component
 *
 * Grid-based virtual scrolling for large product datasets using @tanstack/react-virtual
 * Supports responsive breakpoints with dynamic column calculations
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProductCard } from './ProductCard';
import type { Product } from '@picklist/types';
import { cn } from '../../lib/utils';

interface VirtualizedProductGridProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

// Responsive breakpoints for column calculations
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Column counts for different screen sizes
const COLUMN_CONFIG = {
  base: 1,    // < 640px
  sm: 1,      // >= 640px
  md: 2,      // >= 768px
  lg: 3,      // >= 1024px
  xl: 4,      // >= 1280px
} as const;

// Item heights for different variants
const ITEM_HEIGHTS = {
  compact: 350,
  detailed: 400,
  minimal: 280,
} as const;

export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  onProductSelect,
  className = '',
  variant = 'detailed',
  enableVirtualization = true,
  virtualizationThreshold = 100,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Determine if virtualization should be enabled
  const shouldVirtualize = enableVirtualization && products.length >= virtualizationThreshold;

  // Calculate current number of columns based on container width
  const columnCount = useMemo(() => {
    if (!isClient) return COLUMN_CONFIG.base;

    // If container width detection failed, use window width as fallback
    let width = containerWidth;
    if (width === 0 && typeof window !== 'undefined') {
      width = window.innerWidth - 300; // Account for padding/margins
    }

    // Default to 3 columns for reasonable width if all detection fails
    if (width === 0) return 3;

    if (width >= BREAKPOINTS.xl) return COLUMN_CONFIG.xl;
    if (width >= BREAKPOINTS.lg) return COLUMN_CONFIG.lg;
    if (width >= BREAKPOINTS.md) return COLUMN_CONFIG.md;
    if (width >= BREAKPOINTS.sm) return COLUMN_CONFIG.sm;
    return COLUMN_CONFIG.base;
  }, [containerWidth, isClient]);

  // Calculate row count based on products and columns
  const rowCount = Math.ceil(products.length / columnCount);

  // Get item height based on variant
  const itemHeight = ITEM_HEIGHTS[variant];

  // Handle container resize to update column count
  useEffect(() => {
    setIsClient(true);

    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    };

    // Initial width calculation with delay to ensure DOM is ready
    const initialUpdate = () => {
      updateWidth();
      // Fallback: try again after a brief delay if width is still 0
      if (containerRef.current && containerRef.current.offsetWidth === 0) {
        setTimeout(updateWidth, 100);
      }
    };

    initialUpdate();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize virtualizer for rows
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? rowCount : 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => itemHeight + 16, // Add gap
    overscan: 5,
    measureElement:
      typeof window !== 'undefined' && 'ResizeObserver' in window
        ? (el) => el.getBoundingClientRect().height
        : undefined,
  });

  // Get products for a specific row
  const getRowProducts = (rowIndex: number): Product[] => {
    const startIndex = rowIndex * columnCount;
    const endIndex = Math.min(startIndex + columnCount, products.length);
    return products.slice(startIndex, endIndex);
  };

  // Render grid items for virtualized mode
  const renderVirtualizedGrid = () => {
    const virtualItems = virtualizer.getVirtualItems();

    return (
      <div
        className="relative w-full"
        style={{
          height: virtualizer.getTotalSize(),
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowProducts = getRowProducts(virtualRow.index);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                }}
              >
                {rowProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={variant}
                    onSelect={onProductSelect}
                    className="w-full"
                  />
                ))}
                {/* Fill empty columns in last row */}
                {rowProducts.length < columnCount &&
                  Array.from({ length: columnCount - rowProducts.length }).map((_, index) => (
                    <div key={`empty-${virtualRow.index}-${index}`} />
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render standard grid for non-virtualized mode
  const renderStandardGrid = () => (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          onSelect={onProductSelect}
          className="w-full"
        />
      ))}
    </div>
  );

  // Loading state
  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>

      {/* Virtualized or standard grid container */}
      <div
        ref={containerRef}
        className={cn(
          'w-full',
          shouldVirtualize && 'overflow-auto scroll-smooth',
        )}
        style={{
          height: shouldVirtualize ? '80vh' : 'auto',
        }}
      >
        {shouldVirtualize ? renderVirtualizedGrid() : renderStandardGrid()}
      </div>

    </div>
  );
};

export default VirtualizedProductGrid;
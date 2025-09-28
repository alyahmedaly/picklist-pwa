/**
 * ProductList Component
 *
 * Virtual scrolling product list for 11k+ products with performance optimization
 * Uses custom virtual scrolling implementation with Intersection Observer
 */

import React, { useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { useVirtualScrolling } from '../../lib/homepage/useVirtualScrolling';
import type { ProductListProps } from '../../types/homepage';
import { Loader2 } from 'lucide-react';
import { ProductGrid } from '../layout/grid';

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  onLoadMore,
  virtualScrolling = true,
  className = ''
}) => {
  // Virtual scrolling configuration
  const {
    containerRef,
    visibleItems,
    visibleRange,
    totalHeight,
    isScrolling
  } = useVirtualScrolling({
    items: products,
    itemHeight: 350,
    containerHeight: 600,
    overscan: 3,
    enabled: virtualScrolling && products.length > 50
  });

  // Handle load more functionality
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Trigger load more when scrolled to 80% of content
    if (scrollPercentage > 0.8) {
      onLoadMore();
    }
  }, [onLoadMore]);

  // Set up load more scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, onLoadMore]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div
        data-testid="product-list-loading"
        className="flex items-center justify-center h-64"
      >
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div
        data-testid="product-list-empty"
        className="flex flex-col items-center justify-center h-64 text-gray-500"
      >
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No products found</div>
          <div className="text-sm">Try adjusting your search or filter criteria</div>
        </div>
      </div>
    );
  }

  // Render product items for virtual scrolling
  const renderVirtualItems = () => {
    return visibleItems.map((product, index) => {
      // Handle invalid product data
      if (!product || !product.id || !product.name || product.price == null) {
        console.warn('Invalid product data:', product);
        return null;
      }

      const actualIndex = visibleRange.start + index;

      return (
        <div
          key={product.id}
          data-testid={`product-item-${product.id}`}
          className="w-full"
          tabIndex={0}
          style={{
            position: 'absolute',
            top: `${product.offsetTop || actualIndex * 350}px`,
            left: 0,
            right: 0,
            height: 'auto'
          }}
        >
          <ProductCard
            product={product}
            variant="compact"
            className="w-full"
          />
        </div>
      );
    }).filter(Boolean);
  };

  // Render product items for grid layout
  const renderGridItems = () => {
    return products.map((product) => {
      // Handle invalid product data
      if (!product || !product.id || !product.name || product.price == null) {
        console.warn('Invalid product data:', product);
        return null;
      }

      return (
        <ProductCard
          key={product.id}
          data-testid={`product-item-${product.id}`}
          product={product}
          variant="compact"
          tabIndex={0}
        />
      );
    }).filter(Boolean);
  };

  // Container classes
  const containerClasses = `
    relative w-full
    ${virtualScrolling && products.length > 50 ? 'scroll-smooth' : ''}
    ${className}
  `;

  return (
    <div className={containerClasses}>
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Showing {products.length} products
      </div>

      {/* Virtual scrolling container */}
      <div
        ref={containerRef}
        data-testid="product-list-container"
        role="list"
        aria-label="Product list"
        className={`relative ${virtualScrolling && products.length > 50 ? 'scroll-smooth' : ''}`}
        data-virtual-scrolling={virtualScrolling && products.length > 50}
        data-visible-range={`${visibleRange.start}-${visibleRange.end}`}
        data-total-height={totalHeight}
        style={
          virtualScrolling && products.length > 50
            ? {
                height: '600px',
                overflowY: 'auto',
                scrollBehavior: 'smooth'
              }
            : {}
        }
      >
        {/* Virtual scrolling content wrapper */}
        {virtualScrolling && products.length > 50 ? (
          <div
            className="relative w-full"
            style={{ height: `${totalHeight}px` }}
          >
            {renderVirtualItems()}
          </div>
        ) : (
          <ProductGrid gap="md" className="p-4">
            {renderGridItems()}
          </ProductGrid>
        )}

        {/* Loading indicator for load more */}
        {loading && products.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Loading more products...</span>
          </div>
        )}
      </div>

      {/* Performance info for debugging */}
      {process.env.NODE_ENV === 'development' && virtualScrolling && (
        <div className="text-xs text-gray-400 mt-2">
          Virtual scrolling: {visibleItems.length}/{products.length} items rendered
          {isScrolling && ' (scrolling)'}
        </div>
      )}
    </div>
  );
};

export default ProductList;
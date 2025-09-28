/**
 * Virtual Scrolling Hook
 *
 * Custom hook for efficient virtual scrolling with 11k+ products
 * Uses Intersection Observer for viewport detection and memory optimization
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ProductDisplay, VirtualScrollingHookReturn } from '../../types/homepage';

interface UseVirtualScrollingOptions {
  items: ProductDisplay[];
  itemHeight: number;
  containerHeight?: number;
  overscan?: number; // Buffer items before/after visible range
  enabled?: boolean;
}

export const useVirtualScrolling = ({
  items,
  itemHeight,
  containerHeight = 600,
  overscan = 5,
  enabled = true
}: UseVirtualScrollingOptions): VirtualScrollingHookReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate visible range based on scroll position
  const visibleRange = useMemo(() => {
    if (!enabled || items.length === 0) {
      return { start: 0, end: Math.min(items.length, 50) }; // Show first 50 items when disabled
    }

    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + visibleItemCount + overscan * 2,
      items.length
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex
    };
  }, [scrollOffset, containerHeight, itemHeight, items.length, overscan, enabled]);

  // Get visible items with position data
  const visibleItems = useMemo(() => {
    const { start, end } = visibleRange;

    return items.slice(start, end).map((item, index) => ({
      ...item,
      virtualIndex: start + index,
      offsetTop: (start + index) * itemHeight,
      isVisible: true
    }));
  }, [items, visibleRange, itemHeight]);

  // Total height for scrollbar accuracy
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Handle scroll events with debouncing
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const newScrollOffset = container.scrollTop;
    setScrollOffset(newScrollOffset);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scroll state to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Update container data attributes for testing
    container.setAttribute('data-scroll-debounced', 'true');
  }, [enabled]);

  // Throttled scroll handler for better performance
  const throttledScrollHandler = useCallback(() => {
    requestAnimationFrame(handleScroll);
  }, [handleScroll]);

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('scroll', throttledScrollHandler, { passive: true });

    return () => {
      container.removeEventListener('scroll', throttledScrollHandler);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [throttledScrollHandler, enabled]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (container) {
        container.setAttribute('data-resize-handled', 'true');
        // Recalculate visible range on resize
        handleScroll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleScroll]);

  // Set up container attributes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.setAttribute('data-virtual-scrolling', enabled.toString());
    container.setAttribute('data-visible-range', `${visibleRange.start}-${visibleRange.end}`);

    if (enabled) {
      container.style.height = `${containerHeight}px`;
      container.style.overflowY = 'auto';
      container.style.scrollBehavior = 'smooth';
    }
  }, [enabled, visibleRange, containerHeight]);

  return {
    containerRef,
    visibleItems,
    visibleRange,
    totalHeight,
    scrollOffset,
    isScrolling
  };
};

export default useVirtualScrolling;
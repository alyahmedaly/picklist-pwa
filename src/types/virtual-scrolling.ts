/**
 * Virtual Scrolling Type Definitions
 *
 * Types for virtual scrolling with dynamic heights and expansion support.
 * Handles performance optimization and scroll position management.
 */

import type { CategoryWithMetrics } from './category-index';

// Core virtual scrolling interfaces
export interface VisibleRange {
  startIndex: number;
  endIndex: number;
  startOffset: number;    // Pixel offset from top
  endOffset: number;      // Pixel offset from top
  overscan: {
    before: number;       // Items to render before visible range
    after: number;        // Items to render after visible range
  };
}

export interface VirtualScrollItem {
  id: string;
  index: number;
  data: CategoryWithMetrics;
  isExpanded: boolean;
  estimatedHeight: number;
  measuredHeight?: number;
  isVisible: boolean;
  renderOffset: number;    // Y position in virtual space
}

export interface ScrollPositionChange {
  itemId: string;
  previousHeight: number;
  newHeight: number;
  position: 'before' | 'at' | 'after';  // Relative to current scroll position
}

// Height measurement
export interface HeightMeasurement {
  itemId: string;
  height: number;
  width: number;
  timestamp: number;
  isExpanded: boolean;
  subcategoryCount?: number;
  measurementDuration: number;  // Time taken to measure in ms
}

export interface MeasurementPerformanceMetrics {
  totalMeasurements: number;
  averageMeasurementTime: number;
  slowestMeasurements: Array<{
    itemId: string;
    duration: number;
    timestamp: number;
  }>;
  cacheHitRate: number;
  estimationAccuracy: {
    collapsed: number;    // Percentage accuracy for collapsed items
    expanded: number;     // Percentage accuracy for expanded items
  };
}

// Scroll position management
export interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
  containerHeight: number;
  totalHeight: number;
  timestamp: number;
}

// Dynamic virtual scrolling state
export interface DynamicVirtualScrollState {
  itemHeights: Map<string, number>;        // Measured heights for each category
  estimatedItemHeight: number;             // Base height estimate for collapsed items
  expandedItemHeight: number;              // Average height estimate for expanded items
  visibleRange: {
    start: number;
    end: number;
    startOffset: number;                   // Pixel offset to visible start
    endOffset: number;                     // Pixel offset to visible end
  };
  totalHeight: number;                     // Total scrollable height
  needsRemeasurement: boolean;             // Whether heights need recalculation
}

// Performance optimization
export interface VirtualScrollPerformanceReport {
  scrolling: {
    averageFrameTime: number;
    droppedFrames: number;
    scrollVelocity: {
      average: number;
      peak: number;
    };
  };
  rendering: {
    averageRenderTime: number;
    itemsRendered: {
      average: number;
      peak: number;
    };
    rerenderRate: number;
  };
  memory: {
    heightCacheSize: number;
    cacheHitRate: number;
    memoryUsage: number;
  };
  expansion: {
    expansionImpactOnScroll: number;  // Average frame time increase during expansion
    heightPredictionAccuracy: number;
  };
}

// Configuration
export interface VirtualScrollConfig {
  // Basic settings
  itemHeight: number;              // Default item height
  overscan: number;                // Items to render outside visible area
  bufferSize: number;              // Buffer for smooth scrolling

  // Expansion-specific settings
  expandedItemHeightMultiplier: number;  // Multiplier for expanded items
  maxExpandedItemHeight: number;         // Maximum height for expanded items
  expansionAnimationDuration: number;    // Duration of expand/collapse animation

  // Performance settings
  measurementDebounce: number;     // Debounce time for height measurements
  scrollDebounce: number;          // Debounce time for scroll events
  maxCacheEntries: number;         // Maximum cached height measurements
  cacheExpiryMs: number;           // Cache expiry time

  // Adaptive settings
  adaptiveOverscan: boolean;       // Adjust overscan based on scroll velocity
  adaptiveBuffering: boolean;      // Adjust buffer based on performance
  enableGarbageCollection: boolean; // Enable automatic cache cleanup

  // Debug settings
  enablePerformanceMonitoring: boolean;
  enableDebugVisualization: boolean;
  logPerformanceWarnings: boolean;
}

// Error handling
export class VirtualScrollError extends Error {
  constructor(
    message: string,
    public readonly code: VirtualScrollErrorCode,
    public readonly itemId?: string,
    public readonly scrollPosition?: ScrollPosition
  ) {
    super(message);
    this.name = 'VirtualScrollError';
  }
}

export type VirtualScrollErrorCode =
  | 'MEASUREMENT_FAILED'
  | 'SCROLL_POSITION_INVALID'
  | 'ITEM_NOT_FOUND'
  | 'HEIGHT_CALCULATION_ERROR'
  | 'ANIMATION_INTERRUPTED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'PERFORMANCE_DEGRADED';

// React hook interface
export interface UseVirtualScrollReturn {
  // State
  visibleItems: VirtualScrollItem[];
  totalHeight: number;
  scrollPosition: ScrollPosition;
  isScrolling: boolean;
  performanceMetrics: VirtualScrollPerformanceReport;

  // Actions
  scrollToItem: (itemId: string, position?: 'start' | 'center' | 'end') => Promise<void>;
  measureItem: (itemId: string) => Promise<number>;
  invalidateHeights: (itemIds?: string[]) => void;
  updateConfig: (config: Partial<VirtualScrollConfig>) => void;

  // Event handlers (to be attached to DOM elements)
  scrollHandler: (event: Event) => void;
  resizeHandler: () => void;
  itemRef: (itemId: string) => (element: HTMLElement | null) => void;

  // Utilities
  getItemPosition: (itemId: string) => number | null;
  isItemVisible: (itemId: string) => boolean;
}

// Integration with CategoryCard expansion
export interface CategoryCardVirtualScrollBridge {
  onCategoryExpansion: (categoryPath: string, subcategoryCount: number) => Promise<void>;
  onCategoryCollapse: (categoryPath: string) => Promise<void>;
  calculateExpandedCardHeight: (subcategoryCount: number, level: number) => number;
  scrollToSearchResult: (categoryPath: string, highlightDuration?: number) => Promise<void>;
  ensureSearchResultsVisible: (categoryPaths: string[]) => Promise<void>;
  coordinateWithExpansionState: (expansionChanges: Array<{
    categoryPath: string;
    isExpanded: boolean;
    subcategoryCount: number;
  }>) => Promise<void>;
  announceScrollPositionToScreenReader: (position: ScrollPosition) => void;
  ensureKeyboardNavigationVisible: (focusedCategoryPath: string) => Promise<void>;
}

// Default configuration
export const VIRTUAL_SCROLL_DEFAULTS: Required<VirtualScrollConfig> = {
  itemHeight: 180,
  overscan: 5,
  bufferSize: 10,
  expandedItemHeightMultiplier: 2.5,
  maxExpandedItemHeight: 800,
  expansionAnimationDuration: 200,
  measurementDebounce: 16,
  scrollDebounce: 16,
  maxCacheEntries: 1000,
  cacheExpiryMs: 300000,
  adaptiveOverscan: true,
  adaptiveBuffering: true,
  enableGarbageCollection: true,
  enablePerformanceMonitoring: true,
  enableDebugVisualization: false,
  logPerformanceWarnings: true
};

// Performance thresholds
export const VIRTUAL_SCROLL_PERFORMANCE_THRESHOLDS = {
  maxFrameTime: 16,                        // 60fps target
  maxRenderTime: 10,                       // Maximum render time per frame
  maxMeasurementTime: 5,                   // Maximum measurement time
  minCacheHitRate: 0.8,                    // Minimum cache hit rate
  maxMemoryUsage: 50 * 1024 * 1024,        // 50MB maximum memory usage
  maxDroppedFrames: 3,                     // Maximum consecutive dropped frames
  maxScrollVelocity: 2000,                 // Maximum scroll velocity (px/s)
  heightPredictionAccuracyThreshold: 0.9   // Minimum height prediction accuracy
};

// Keyboard navigation state for virtual scrolling
export interface KeyboardNavigationState {
  focusedPath: string | null;             // Currently focused category path
  navigationMode: 'tree' | 'search';      // Current navigation context
  lastKeyPressed: string | null;          // Last navigation key
  keyboardActive: boolean;                // Whether keyboard navigation is active
}

// ARIA attributes for virtual scroll items
export interface VirtualScrollAriaProps {
  role: 'tree' | 'treeitem' | 'group';
  'aria-expanded'?: boolean;               // For expandable items
  'aria-level'?: number;                   // Tree depth level
  'aria-setsize'?: number;                 // Number of items in group
  'aria-posinset'?: number;                // Position in group
  'aria-label'?: string;                   // Accessible name
  'aria-labelledby'?: string;              // Reference to labeling element
}
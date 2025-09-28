/**
 * Virtual Scrolling Integration Contract
 *
 * Defines the contract for integrating expandable CategoryCard components
 * with virtual scrolling, including dynamic height management and performance optimization.
 */

// Core virtual scrolling interface for expandable items
export interface VirtualScrollExpandableAPI {
  // Height management
  measureItemHeight(itemId: string): Promise<number>;
  estimateItemHeight(itemId: string, isExpanded: boolean): number;
  updateHeightCache(itemId: string, height: number): void;
  invalidateHeightCache(itemId?: string): void;

  // Visible range calculation
  calculateVisibleRange(
    scrollTop: number,
    containerHeight: number,
    itemHeights: Map<string, number>
  ): VisibleRange;

  // Scroll position management
  maintainScrollPosition(changes: ScrollPositionChange[]): Promise<void>;
  scrollToItem(itemId: string, position?: 'start' | 'center' | 'end'): Promise<void>;

  // Performance optimization
  shouldRenderItem(itemId: string, visibleRange: VisibleRange): boolean;
  optimizeRenderList(items: VirtualScrollItem[], visibleRange: VisibleRange): VirtualScrollItem[];

  // Event handling
  onScroll(scrollTop: number): void;
  onResize(containerHeight: number): void;
  onItemExpansionChange(itemId: string, wasExpanded: boolean, isExpanded: boolean): void;
}

// Data structures
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

// Height measurement interface
export interface HeightMeasurementAPI {
  // Measurement operations
  measureElement(element: HTMLElement): HeightMeasurement;
  measureElementAsync(element: HTMLElement): Promise<HeightMeasurement>;
  scheduleMeasurement(itemId: string, element: HTMLElement): void;

  // Height estimation
  estimateCollapsedHeight(): number;
  estimateExpandedHeight(subcategoryCount: number): number;
  estimateTreeHeight(category: CategoryWithMetrics, maxDepth: number): number;

  // Cache management
  getCachedHeight(itemId: string): number | null;
  setCachedHeight(itemId: string, height: number, timestamp?: number): void;
  clearExpiredCacheEntries(maxAgeMs: number): void;

  // Performance monitoring
  getAverageHeight(itemType: 'collapsed' | 'expanded'): number;
  getHeightVariance(): number;
  getMeasurementPerformance(): MeasurementPerformanceMetrics;
}

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
export interface ScrollPositionManager {
  // Position tracking
  getCurrentScrollPosition(): ScrollPosition;
  setScrollPosition(position: ScrollPosition): Promise<void>;
  saveScrollPosition(key: string): void;
  restoreScrollPosition(key: string): Promise<boolean>;

  // Position calculation
  calculateItemPosition(itemId: string): number;
  calculateScrollOffsetForChanges(changes: ScrollPositionChange[]): number;
  findItemAtPosition(scrollTop: number): { itemId: string; offset: number } | null;

  // Smooth scrolling
  smoothScrollToItem(
    itemId: string,
    options?: {
      position?: 'start' | 'center' | 'end';
      duration?: number;
      easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    }
  ): Promise<void>;

  animateScrollTo(targetScrollTop: number, duration: number): Promise<void>;
}

export interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
  containerHeight: number;
  totalHeight: number;
  timestamp: number;
}

// Performance optimization interface
export interface VirtualScrollPerformanceOptimizer {
  // Rendering optimization
  shouldRenderOffscreen(itemId: string, distance: number): boolean;
  calculateOptimalOverscan(
    scrollVelocity: number,
    averageItemHeight: number
  ): { before: number; after: number };

  // Memory management
  optimizeMemoryUsage(): void;
  garbageCollectUnusedHeights(): void;
  limitCacheSize(maxEntries: number): void;

  // Performance monitoring
  recordScrollPerformance(frameTime: number): void;
  recordRenderPerformance(itemCount: number, renderTime: number): void;
  getPerformanceReport(): VirtualScrollPerformanceReport;

  // Adaptive optimization
  adaptToDeviceCapabilities(): VirtualScrollConfig;
  adjustForBatteryLevel(batteryLevel?: number): VirtualScrollConfig;
}

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

// Configuration interface
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

// Event handling interface
export interface VirtualScrollEventHandler {
  // Scroll events
  onScrollStart(scrollPosition: ScrollPosition): void;
  onScrollEnd(scrollPosition: ScrollPosition): void;
  onScrollVelocityChange(velocity: number): void;

  // Item events
  onItemEnterViewport(itemId: string): void;
  onItemExitViewport(itemId: string): void;
  onItemHeightChange(itemId: string, oldHeight: number, newHeight: number): void;

  // Performance events
  onPerformanceWarning(warning: {
    type: 'SLOW_SCROLL' | 'DROPPED_FRAMES' | 'MEMORY_USAGE' | 'MEASUREMENT_SLOW';
    message: string;
    metrics: Partial<VirtualScrollPerformanceReport>;
  }): void;

  // Error events
  onScrollError(error: VirtualScrollError): void;
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
export interface UseVirtualScrollHook {
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

// Testing interface
export interface VirtualScrollTestAPI {
  // Mock setup
  setContainerSize(width: number, height: number): void;
  setScrollPosition(scrollTop: number): void;
  setItemHeights(heights: Record<string, number>): void;

  // Simulation
  simulateScroll(targetScrollTop: number, duration?: number): Promise<void>;
  simulateResize(newHeight: number): Promise<void>;
  simulateExpansion(itemId: string, newHeight: number): Promise<void>;

  // Assertions
  assertVisibleRange(expectedStart: number, expectedEnd: number): void;
  assertScrollPosition(expectedScrollTop: number, tolerance?: number): void;
  assertPerformanceWithinLimits(limits: {
    maxFrameTime?: number;
    maxRenderTime?: number;
    minCacheHitRate?: number;
  }): void;

  // Utilities
  generateMockItems(count: number, options?: {
    expandedIndices?: number[];
    heightVariation?: number;
  }): VirtualScrollItem[];

  measureTestPerformance(operation: () => Promise<void>): Promise<{
    duration: number;
    memoryUsage: number;
    frameRate: number;
  }>;
}

// Integration with CategoryCard expansion
export interface CategoryCardVirtualScrollBridge {
  // Expansion integration
  onCategoryExpansion(categoryPath: string, subcategoryCount: number): Promise<void>;
  onCategoryCollapse(categoryPath: string): Promise<void>;
  calculateExpandedCardHeight(subcategoryCount: number, level: number): number;

  // Search integration
  scrollToSearchResult(categoryPath: string, highlightDuration?: number): Promise<void>;
  ensureSearchResultsVisible(categoryPaths: string[]): Promise<void>;

  // Performance coordination
  coordinateWithExpansionState(expansionChanges: Array<{
    categoryPath: string;
    isExpanded: boolean;
    subcategoryCount: number;
  }>): Promise<void>;

  // Accessibility integration
  announceScrollPositionToScreenReader(position: ScrollPosition): void;
  ensureKeyboardNavigationVisible(focusedCategoryPath: string): Promise<void>;
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
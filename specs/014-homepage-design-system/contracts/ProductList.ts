/**
 * ProductList Component Contract
 *
 * Virtual scrolling container for 11k+ product lists with search and sort capabilities.
 * Optimized for mobile performance with efficient rendering and memory usage.
 */

export interface ProductDisplay {
  id: string;
  name: string;
  category: string;
  proteinPer100g: number;
  pricePerEuro: number;
  dailyTargetContribution: string;
  halalStatus: 'confirmed' | 'check-needed';
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  contextScore?: number;
  contextLabel?: string;
  imageUrl?: string;
  isHighlighted: boolean;
}

export interface ProductListProps {
  products: ProductDisplay[];
  loading: boolean;
  error: string | null;
  onProductClick?: (product: ProductDisplay) => void;
  virtualScrolling?: VirtualScrollConfig;
  searchQuery?: string;
  sortBy?: SortOption;
  sortDirection?: 'asc' | 'desc';
  className?: string;
}

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export type SortOption = 'protein' | 'price' | 'health-score' | 'relevance';

// Virtual scrolling state management
export interface VirtualScrollState {
  scrollOffset: number;
  visibleRange: { start: number; end: number };
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

// Component behavior contracts
export interface ProductListBehavior {
  // Virtual scrolling
  calculateVisibleRange(scrollOffset: number): { start: number; end: number };
  updateScrollPosition(offset: number): void;
  getItemHeight(index: number): number;

  // Performance optimization
  shouldRenderItem(index: number): boolean;
  recycleItemComponent(index: number): React.ReactElement;

  // Search and filtering
  filterProducts(products: ProductDisplay[], query: string): ProductDisplay[];
  sortProducts(products: ProductDisplay[], sortBy: SortOption, direction: 'asc' | 'desc'): ProductDisplay[];

  // Error handling
  renderEmptyState(): React.ReactElement;
  renderErrorState(error: string): React.ReactElement;
  renderLoadingState(): React.ReactElement;
}

// Performance monitoring
export interface ProductListPerformance {
  trackRenderTime(itemCount: number, duration: number): void;
  trackScrollPerformance(fps: number, dropped: number): void;
  trackMemoryUsage(heapUsed: number): void;
  getPerformanceMetrics(): {
    averageRenderTime: number;
    scrollFPS: number;
    memoryEfficiency: number;
  };
}
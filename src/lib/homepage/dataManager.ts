/**
 * Data Manager
 *
 * Comprehensive data management layer that coordinates between filter category loader,
 * product transformer, and caching mechanisms for optimal performance with large datasets
 */

import type {
  FilterCategory,
  ProductDisplay,
  DataLoadResult,
  PerformanceMetrics
} from '../../types/homepage';
import {
  loadAllCategories,
  loadProductsForCategory,
  getDefaultCategory,
  findCategoryById,
  getAdjacentCategories
} from './filterCategoryLoader';
import {
  batchTransformProducts,
  filterProductsBySearch,
  sortProducts
} from './productTransformer';

// Cache configuration
const CACHE_CONFIG = {
  maxEntries: 10, // Maximum cached categories
  maxAge: 5 * 60 * 1000, // 5 minutes
  preloadAdjacent: true, // Preload adjacent categories
  enableMemoryCleanup: true
};

// Cache entry interface
interface CacheEntry {
  data: ProductDisplay[];
  timestamp: number;
  loadTime: number;
  hits: number;
  category: FilterCategory;
}

// Performance tracking
interface PerformanceTracker {
  cacheHits: number;
  cacheMisses: number;
  totalLoadTime: number;
  averageTransformTime: number;
  memoryUsage: number;
  lastCleanup: number;
}

// Data manager class for centralized data operations
export class DataManager {
  private cache = new Map<string, CacheEntry>();
  private performance: PerformanceTracker = {
    cacheHits: 0,
    cacheMisses: 0,
    totalLoadTime: 0,
    averageTransformTime: 0,
    memoryUsage: 0,
    lastCleanup: Date.now()
  };
  private preloadQueue = new Set<string>();
  private loadingPromises = new Map<string, Promise<ProductDisplay[]>>();

  /**
   * Load and transform products for a category with caching
   */
  async loadCategoryProducts(categoryId: string): Promise<ProductDisplay[]> {
    const startTime = performance.now();

    // Check cache first
    const cached = this.getCachedData(categoryId);
    if (cached) {
      this.performance.cacheHits++;
      cached.hits++;
      return cached.data;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(categoryId);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new loading promise
    const loadPromise = this.performCategoryLoad(categoryId, startTime);
    this.loadingPromises.set(categoryId, loadPromise);

    try {
      const result = await loadPromise;
      this.loadingPromises.delete(categoryId);
      return result;
    } catch (error) {
      this.loadingPromises.delete(categoryId);
      throw error;
    }
  }

  /**
   * Perform the actual category loading and transformation
   */
  private async performCategoryLoad(
    categoryId: string,
    startTime: number
  ): Promise<ProductDisplay[]> {
    this.performance.cacheMisses++;

    try {
      // Load raw product data
      const loadResult = await loadProductsForCategory(categoryId);

      // Transform products for display
      const transformStartTime = performance.now();
      const displayProducts = batchTransformProducts(
        loadResult.products,
        loadResult.category
      );
      const transformTime = performance.now() - transformStartTime;

      // Update performance metrics
      const totalLoadTime = performance.now() - startTime;
      this.performance.totalLoadTime += totalLoadTime;
      this.performance.averageTransformTime =
        (this.performance.averageTransformTime + transformTime) / 2;

      // Cache the results
      this.setCachedData(categoryId, {
        data: displayProducts,
        timestamp: Date.now(),
        loadTime: totalLoadTime,
        hits: 1,
        category: loadResult.category
      });

      // Schedule adjacent category preloading
      if (CACHE_CONFIG.preloadAdjacent) {
        this.scheduleAdjacentPreload(categoryId);
      }

      // Clean up cache if needed
      this.performCacheCleanup();

      return displayProducts;
    } catch (error) {
      console.error(`Failed to load category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Search and sort products with performance optimization
   */
  async searchAndSortProducts(
    categoryId: string,
    searchQuery: string = '',
    sortBy: string = 'protein-desc',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Promise<ProductDisplay[]> {
    const startTime = performance.now();

    // Load category products (from cache if available)
    let products = await this.loadCategoryProducts(categoryId);

    // Apply search filter if query provided
    if (searchQuery.trim()) {
      const searchStartTime = performance.now();
      products = filterProductsBySearch(products, searchQuery);
      const searchTime = performance.now() - searchStartTime;

      // Log search performance for monitoring
      if (searchTime > 100) {
        console.warn(`Slow search operation: ${searchTime}ms for "${searchQuery}"`);
      }
    }

    // Apply sorting
    const sortStartTime = performance.now();
    products = sortProducts(products, sortBy, sortDirection);
    const sortTime = performance.now() - sortStartTime;

    const totalTime = performance.now() - startTime;

    // Log performance for monitoring
    if (totalTime > 500) {
      console.warn(`Slow search and sort operation: ${totalTime}ms`);
    }

    return products;
  }

  /**
   * Preload adjacent categories for better UX
   */
  private scheduleAdjacentPreload(currentCategoryId: string): void {
    const adjacentIds = getAdjacentCategories(currentCategoryId);

    adjacentIds.forEach(categoryId => {
      if (!this.cache.has(categoryId) && !this.preloadQueue.has(categoryId)) {
        this.preloadQueue.add(categoryId);

        // Preload with low priority (setTimeout to not block main thread)
        setTimeout(() => {
          this.preloadCategory(categoryId);
        }, 100);
      }
    });
  }

  /**
   * Preload a category in background
   */
  private async preloadCategory(categoryId: string): Promise<void> {
    try {
      this.preloadQueue.delete(categoryId);

      // Only preload if not already cached or loading
      if (!this.cache.has(categoryId) && !this.loadingPromises.has(categoryId)) {
        await this.loadCategoryProducts(categoryId);
        console.debug(`Preloaded category: ${categoryId}`);
      }
    } catch (error) {
      console.debug(`Failed to preload category ${categoryId}:`, error);
    }
  }

  /**
   * Get cached data if valid
   */
  private getCachedData(categoryId: string): CacheEntry | null {
    const entry = this.cache.get(categoryId);

    if (!entry) return null;

    // Check if cache entry is still valid
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_CONFIG.maxAge) {
      this.cache.delete(categoryId);
      return null;
    }

    return entry;
  }

  /**
   * Set cached data with cleanup
   */
  private setCachedData(categoryId: string, entry: CacheEntry): void {
    this.cache.set(categoryId, entry);

    // Enforce cache size limit
    if (this.cache.size > CACHE_CONFIG.maxEntries) {
      this.evictLeastUsedEntries();
    }
  }

  /**
   * Evict least recently used cache entries
   */
  private evictLeastUsedEntries(): void {
    const entries = Array.from(this.cache.entries());

    // Sort by hits (ascending) then by timestamp (ascending)
    entries.sort(([, a], [, b]) => {
      if (a.hits !== b.hits) {
        return a.hits - b.hits;
      }
      return a.timestamp - b.timestamp;
    });

    // Remove oldest/least used entries
    const toRemove = entries.slice(0, Math.ceil(CACHE_CONFIG.maxEntries * 0.3));
    toRemove.forEach(([categoryId]) => {
      this.cache.delete(categoryId);
    });

    console.debug(`Evicted ${toRemove.length} cache entries`);
  }

  /**
   * Perform cache cleanup based on memory usage
   */
  private performCacheCleanup(): void {
    if (!CACHE_CONFIG.enableMemoryCleanup) return;

    const now = Date.now();
    const timeSinceLastCleanup = now - this.performance.lastCleanup;

    // Only run cleanup every 30 seconds
    if (timeSinceLastCleanup < 30000) return;

    this.performance.lastCleanup = now;

    // Estimate memory usage (rough calculation)
    let estimatedMemory = 0;
    this.cache.forEach(entry => {
      estimatedMemory += entry.data.length * 200; // ~200 bytes per product estimate
    });

    this.performance.memoryUsage = estimatedMemory;

    // If memory usage is high, be more aggressive with cleanup
    if (estimatedMemory > 50 * 1024 * 1024) { // 50MB threshold
      console.warn(`High memory usage detected: ${(estimatedMemory / 1024 / 1024).toFixed(1)}MB`);
      this.evictLeastUsedEntries();
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const cacheHitRate = this.performance.cacheHits + this.performance.cacheMisses > 0
      ? (this.performance.cacheHits / (this.performance.cacheHits + this.performance.cacheMisses)) * 100
      : 0;

    return {
      filterLoadTime: this.performance.totalLoadTime / Math.max(this.performance.cacheMisses, 1),
      searchTime: 0, // Updated during search operations
      renderTime: 0, // Would be updated by components
      memoryUsage: this.performance.memoryUsage,
      scrollFps: 60, // Would be updated by virtual scrolling
      cacheHitRate,
      cacheSize: this.cache.size,
      totalCacheHits: this.performance.cacheHits,
      totalCacheMisses: this.performance.cacheMisses,
      averageTransformTime: this.performance.averageTransformTime
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    this.preloadQueue.clear();
    this.loadingPromises.clear();

    // Reset performance metrics
    this.performance = {
      cacheHits: 0,
      cacheMisses: 0,
      totalLoadTime: 0,
      averageTransformTime: 0,
      memoryUsage: 0,
      lastCleanup: Date.now()
    };

    console.debug('Data manager cache cleared');
  }

  /**
   * Warm up cache with initial categories
   */
  async warmupCache(categoryIds: string[] = []): Promise<void> {
    if (categoryIds.length === 0) {
      // Default warmup: load default category and first few categories
      const categories = await loadAllCategories();
      categoryIds = categories.slice(0, 3).map(cat => cat.id);
    }

    const warmupPromises = categoryIds.map(categoryId =>
      this.loadCategoryProducts(categoryId).catch(error => {
        console.warn(`Failed to warmup category ${categoryId}:`, error);
      })
    );

    await Promise.allSettled(warmupPromises);
    console.debug(`Cache warmed up with ${categoryIds.length} categories`);
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { categoryId: string; hits: number; age: number; size: number }[] {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([categoryId, entry]) => ({
      categoryId,
      hits: entry.hits,
      age: now - entry.timestamp,
      size: entry.data.length
    }));
  }
}

// Create singleton instance
export const dataManager = new DataManager();

// Extended PerformanceMetrics interface with cache metrics
declare module '../../types/homepage' {
  interface PerformanceMetrics {
    cacheHitRate?: number;
    cacheSize?: number;
    totalCacheHits?: number;
    totalCacheMisses?: number;
    averageTransformTime?: number;
  }
}

// Convenience functions for direct usage
export async function loadCategoryData(categoryId: string): Promise<ProductDisplay[]> {
  return dataManager.loadCategoryProducts(categoryId);
}

export async function searchProducts(
  categoryId: string,
  searchQuery: string,
  sortBy: string = 'protein-desc',
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<ProductDisplay[]> {
  return dataManager.searchAndSortProducts(categoryId, searchQuery, sortBy, sortDirection);
}

export function getDataManagerMetrics(): PerformanceMetrics {
  return dataManager.getPerformanceMetrics();
}

export async function initializeDataManager(warmupCategories?: string[]): Promise<void> {
  await dataManager.warmupCache(warmupCategories);
}

export function clearDataManagerCache(): void {
  dataManager.clearCache();
}
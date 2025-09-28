/**
 * Performance Monitor
 *
 * Comprehensive performance monitoring utilities for homepage components
 * with real-time tracking, bottleneck detection, and optimization insights
 */

import type { PerformanceMetrics } from '../../types/homepage';

// Performance thresholds for warnings
const PERFORMANCE_THRESHOLDS = {
  renderTime: 16, // 60fps target
  filterLoadTime: 1000, // 1s warning threshold
  searchTime: 150, // 150ms search warning
  scrollFps: 55, // FPS warning threshold
  memoryUsage: 100 * 1024 * 1024, // 100MB warning
  cacheHitRate: 70, // 70% minimum cache hit rate
} as const;

// Performance event types
type PerformanceEventType =
  | 'component-render'
  | 'filter-load'
  | 'search-operation'
  | 'sort-operation'
  | 'virtual-scroll'
  | 'cache-operation'
  | 'user-interaction';

interface PerformanceEvent {
  type: PerformanceEventType;
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

interface PerformanceWarning {
  type: 'render' | 'load' | 'memory' | 'cache' | 'scroll';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  suggestions: string[];
}

interface RenderProfile {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  maxRenderTime: number;
  renderWarnings: number;
}

// Global performance state
class PerformanceMonitor {
  private events: PerformanceEvent[] = [];
  private warnings: PerformanceWarning[] = [];
  private renderProfiles = new Map<string, RenderProfile>();
  private frameTimestamps: number[] = [];
  private startTime = performance.now();
  private enabled = process.env.NODE_ENV === 'development';
  private maxEvents = 1000; // Limit memory usage

  constructor() {
    if (this.enabled) {
      this.initializeFrameRateMonitoring();
      this.initializeMemoryMonitoring();
    }
  }

  /**
   * Record a performance event
   */
  recordEvent(
    type: PerformanceEventType,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const event: PerformanceEvent = {
      type,
      timestamp: performance.now(),
      duration,
      metadata
    };

    this.events.push(event);

    // Limit memory usage
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents / 2);
    }

    // Check for performance warnings
    this.checkPerformanceThresholds(event);
  }

  /**
   * Start timing an operation
   */
  startTiming(label: string): () => void {
    if (!this.enabled) return () => {};

    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      const type = this.getEventTypeFromLabel(label);
      this.recordEvent(type, duration, { label });
    };
  }

  /**
   * Record component render performance
   */
  recordRender(componentName: string, renderTime: number): void {
    if (!this.enabled) return;

    let profile = this.renderProfiles.get(componentName);

    if (!profile) {
      profile = {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        maxRenderTime: 0,
        renderWarnings: 0
      };
      this.renderProfiles.set(componentName, profile);
    }

    profile.renderCount++;
    profile.totalRenderTime += renderTime;
    profile.averageRenderTime = profile.totalRenderTime / profile.renderCount;
    profile.lastRenderTime = renderTime;
    profile.maxRenderTime = Math.max(profile.maxRenderTime, renderTime);

    // Check for render performance issues
    if (renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
      profile.renderWarnings++;
      this.addWarning('render',
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
        renderTime,
        PERFORMANCE_THRESHOLDS.renderTime,
        ['Consider using React.memo', 'Check for expensive calculations', 'Optimize re-renders']
      );
    }

    this.recordEvent('component-render', renderTime, { componentName });
  }

  /**
   * Record virtual scrolling performance
   */
  recordScrollPerformance(fps: number, visibleItems: number, totalItems: number): void {
    if (!this.enabled) return;

    this.recordEvent('virtual-scroll', 0, { fps, visibleItems, totalItems });

    if (fps < PERFORMANCE_THRESHOLDS.scrollFps) {
      this.addWarning('scroll',
        `Low scrolling FPS detected: ${fps.toFixed(1)} FPS`,
        fps,
        PERFORMANCE_THRESHOLDS.scrollFps,
        ['Reduce item complexity', 'Increase overscan buffer', 'Check for memory leaks']
      );
    }
  }

  /**
   * Record search performance
   */
  recordSearchPerformance(searchTime: number, resultCount: number, query: string): void {
    if (!this.enabled) return;

    this.recordEvent('search-operation', searchTime, {
      resultCount,
      queryLength: query.length,
      hasResults: resultCount > 0
    });

    if (searchTime > PERFORMANCE_THRESHOLDS.searchTime) {
      this.addWarning('load',
        `Slow search operation: ${searchTime.toFixed(2)}ms for "${query}"`,
        searchTime,
        PERFORMANCE_THRESHOLDS.searchTime,
        ['Implement search debouncing', 'Add search indexing', 'Use virtualization']
      );
    }
  }

  /**
   * Record filter load performance
   */
  recordFilterLoad(loadTime: number, productCount: number, fromCache: boolean): void {
    if (!this.enabled) return;

    this.recordEvent('filter-load', loadTime, { productCount, fromCache });

    if (loadTime > PERFORMANCE_THRESHOLDS.filterLoadTime && !fromCache) {
      this.addWarning('load',
        `Slow filter load: ${loadTime.toFixed(2)}ms for ${productCount} products`,
        loadTime,
        PERFORMANCE_THRESHOLDS.filterLoadTime,
        ['Implement progressive loading', 'Add data compression', 'Optimize network requests']
      );
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics & {
    warnings: PerformanceWarning[];
    renderProfiles: RenderProfile[];
    recentEvents: PerformanceEvent[];
    uptime: number;
  } {
    const now = performance.now();
    const recentEvents = this.events.filter(e => now - e.timestamp < 30000); // Last 30s

    // Calculate averages from recent events
    const renderEvents = recentEvents.filter(e => e.type === 'component-render');
    const loadEvents = recentEvents.filter(e => e.type === 'filter-load');
    const searchEvents = recentEvents.filter(e => e.type === 'search-operation');

    const avgRenderTime = renderEvents.length > 0
      ? renderEvents.reduce((sum, e) => sum + e.duration, 0) / renderEvents.length
      : 0;

    const avgLoadTime = loadEvents.length > 0
      ? loadEvents.reduce((sum, e) => sum + e.duration, 0) / loadEvents.length
      : 0;

    const avgSearchTime = searchEvents.length > 0
      ? searchEvents.reduce((sum, e) => sum + e.duration, 0) / searchEvents.length
      : 0;

    // Get current memory usage estimate
    const memoryUsage = this.estimateMemoryUsage();

    return {
      filterLoadTime: avgLoadTime,
      searchTime: avgSearchTime,
      renderTime: avgRenderTime,
      memoryUsage,
      scrollFps: this.getCurrentFPS(),
      warnings: [...this.warnings].reverse(), // Most recent first
      renderProfiles: Array.from(this.renderProfiles.values()),
      recentEvents: recentEvents.slice(-50), // Last 50 events
      uptime: now - this.startTime
    };
  }

  /**
   * Get performance insights and recommendations
   */
  getInsights(): {
    bottlenecks: string[];
    recommendations: string[];
    score: number;
  } {
    const metrics = this.getMetrics();
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    // Analyze render performance
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
      bottlenecks.push(`Slow component rendering (${metrics.renderTime.toFixed(2)}ms)`);
      recommendations.push('Optimize component re-renders with React.memo');
    }

    // Analyze load performance
    if (metrics.filterLoadTime > PERFORMANCE_THRESHOLDS.filterLoadTime) {
      bottlenecks.push(`Slow data loading (${metrics.filterLoadTime.toFixed(2)}ms)`);
      recommendations.push('Implement progressive loading and caching');
    }

    // Analyze memory usage
    if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) {
      bottlenecks.push(`High memory usage (${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB)`);
      recommendations.push('Implement data cleanup and garbage collection');
    }

    // Analyze scroll performance
    if (metrics.scrollFps < PERFORMANCE_THRESHOLDS.scrollFps) {
      bottlenecks.push(`Low scrolling FPS (${metrics.scrollFps})`);
      recommendations.push('Optimize virtual scrolling implementation');
    }

    // Calculate overall performance score (0-100)
    let score = 100;
    score -= Math.min(30, (metrics.renderTime / PERFORMANCE_THRESHOLDS.renderTime - 1) * 20);
    score -= Math.min(25, (metrics.filterLoadTime / PERFORMANCE_THRESHOLDS.filterLoadTime - 1) * 15);
    score -= Math.min(20, Math.max(0, (PERFORMANCE_THRESHOLDS.scrollFps - metrics.scrollFps) / 10 * 20));
    score -= Math.min(15, (metrics.memoryUsage / PERFORMANCE_THRESHOLDS.memoryUsage - 1) * 10);
    score -= Math.min(10, metrics.warnings.length * 2);

    return {
      bottlenecks,
      recommendations,
      score: Math.max(0, Math.round(score))
    };
  }

  /**
   * Clear performance data
   */
  clear(): void {
    this.events = [];
    this.warnings = [];
    this.renderProfiles.clear();
    this.frameTimestamps = [];
    this.startTime = performance.now();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // Private methods

  private getEventTypeFromLabel(label: string): PerformanceEventType {
    if (label.includes('render')) return 'component-render';
    if (label.includes('filter') || label.includes('load')) return 'filter-load';
    if (label.includes('search')) return 'search-operation';
    if (label.includes('sort')) return 'sort-operation';
    if (label.includes('scroll')) return 'virtual-scroll';
    if (label.includes('cache')) return 'cache-operation';
    return 'user-interaction';
  }

  private checkPerformanceThresholds(event: PerformanceEvent): void {
    switch (event.type) {
      case 'filter-load':
        if (event.duration > PERFORMANCE_THRESHOLDS.filterLoadTime) {
          this.addWarning('load',
            `Slow filter load: ${event.duration.toFixed(2)}ms`,
            event.duration,
            PERFORMANCE_THRESHOLDS.filterLoadTime,
            ['Check network conditions', 'Implement caching', 'Optimize data size']
          );
        }
        break;

      case 'search-operation':
        if (event.duration > PERFORMANCE_THRESHOLDS.searchTime) {
          this.addWarning('render',
            `Slow search: ${event.duration.toFixed(2)}ms`,
            event.duration,
            PERFORMANCE_THRESHOLDS.searchTime,
            ['Add search debouncing', 'Implement virtual scrolling']
          );
        }
        break;
    }
  }

  private addWarning(
    type: PerformanceWarning['type'],
    message: string,
    value: number,
    threshold: number,
    suggestions: string[]
  ): void {
    const warning: PerformanceWarning = {
      type,
      message,
      value,
      threshold,
      timestamp: performance.now(),
      suggestions
    };

    this.warnings.push(warning);

    // Limit warning history
    if (this.warnings.length > 100) {
      this.warnings = this.warnings.slice(-50);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance Monitor] ${message}`, { suggestions });
    }
  }

  private initializeFrameRateMonitoring(): void {
    const updateFrameRate = () => {
      this.frameTimestamps.push(performance.now());
      // Keep only last second of frames
      const oneSecondAgo = performance.now() - 1000;
      this.frameTimestamps = this.frameTimestamps.filter(t => t > oneSecondAgo);
      requestAnimationFrame(updateFrameRate);
    };

    requestAnimationFrame(updateFrameRate);
  }

  private initializeMemoryMonitoring(): void {
    // Monitor memory usage every 10 seconds
    setInterval(() => {
      const memoryUsage = this.estimateMemoryUsage();
      if (memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) {
        this.addWarning('memory',
          `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(1)}MB`,
          memoryUsage,
          PERFORMANCE_THRESHOLDS.memoryUsage,
          ['Clear unused data', 'Implement data pagination', 'Check for memory leaks']
        );
      }
    }, 10000);
  }

  private getCurrentFPS(): number {
    if (this.frameTimestamps.length < 2) return 60;
    return this.frameTimestamps.length;
  }

  private estimateMemoryUsage(): number {
    // Rough estimation based on stored data
    let size = 0;
    size += this.events.length * 100; // ~100 bytes per event
    size += this.warnings.length * 200; // ~200 bytes per warning
    size += this.renderProfiles.size * 150; // ~150 bytes per profile
    return size;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export function recordRender(componentName: string, renderTime: number): void {
  performanceMonitor.recordRender(componentName, renderTime);
}

export function recordFilterLoad(loadTime: number, productCount: number, fromCache: boolean): void {
  performanceMonitor.recordFilterLoad(loadTime, productCount, fromCache);
}

export function recordSearchPerformance(searchTime: number, resultCount: number, query: string): void {
  performanceMonitor.recordSearchPerformance(searchTime, resultCount, query);
}

export function recordScrollPerformance(fps: number, visibleItems: number, totalItems: number): void {
  performanceMonitor.recordScrollPerformance(fps, visibleItems, totalItems);
}

export function startTiming(label: string): () => void {
  return performanceMonitor.startTiming(label);
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return performanceMonitor.getMetrics();
}

export function getPerformanceInsights(): {
  bottlenecks: string[];
  recommendations: string[];
  score: number;
} {
  return performanceMonitor.getInsights();
}

export function clearPerformanceData(): void {
  performanceMonitor.clear();
}

// React hook for component performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const React = require('react');

  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      recordRender(componentName, renderTime);
    };
  });

  return {
    startTiming,
    recordEvent: performanceMonitor.recordEvent.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor)
  };
}
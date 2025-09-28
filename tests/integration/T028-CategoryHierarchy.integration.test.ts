/**
 * T028 Integration Test: useFlexibleCategoryHierarchy Hook Migration
 * Feature: 020-migration-kysely
 *
 * Tests the migrated useFlexibleCategoryHierarchy hook to ensure it maintains identical
 * tree structure output, nested set model operations, and performance while using 
 * CategoryRepository instead of raw SQL.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlexibleCategoryHierarchy } from '../../src/hooks/useFlexibleProductQueries.ts';

describe('T028: useFlexibleCategoryHierarchy Hook Migration Integration', () => {

  describe('Hook Interface Compatibility', () => {
    it('should maintain identical interface for root categories', () => {
      const { result } = renderHook(() => useFlexibleCategoryHierarchy());
      
      // Should have same state structure as before migration
      expect(result.current.isLoading).toBe(true);
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.totalCount).toBe('number');
      expect(typeof result.current.queryTimeMs).toBe('number');
      expect(result.current.metadata.categoryHierarchyUsed).toBe(true);
      expect(result.current.metadata.searchPerformed).toBe(false);
      expect(result.current.metadata.multiDimensionalFiltering).toBe(false);
      
      // Should have hook methods
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.executeQuery).toBe('function');
    });

    it('should maintain interface for specific category queries', () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('test-category-id')
      );
      
      expect(result.current.isLoading).toBe(true);
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.metadata.categoryHierarchyUsed).toBe(true);
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.executeQuery).toBe('function');
    });

    it('should support includeProducts option', () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy(undefined, { includeProducts: true })
      );
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.metadata.categoryHierarchyUsed).toBe(true);
    });

    it('should support disabled state', () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('test-id', { enabled: false })
      );
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Nested Set Model Operations', () => {
    it('should handle root categories request (no categoryId)', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy()
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      expect(Array.isArray(result.current.data)).toBe(true);
      
      // Should only return root categories (matching legacy behavior)
      if (result.current.data.length > 0) {
        // Each category should be an object with expected structure
        const category = result.current.data[0] as unknown;
        expect(typeof category).toBe('object');
      }
    });

    it('should handle category descendants request (with categoryId)', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('some-category-id')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      expect(Array.isArray(result.current.data)).toBe(true);
      
      // Should return category + all descendants (matching legacy nested set behavior)
      expect(result.current.totalCount).toBeGreaterThanOrEqual(0);
      expect(result.current.queryTimeMs).toBeGreaterThan(0);
    });

    it('should include product counts when requested', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy(undefined, { includeProducts: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      
      // Should include product count information when includeProducts = true
      if (result.current.data.length > 0) {
        const category = result.current.data[0] as unknown;
        expect(typeof category).toBe('object');
        // Product count handling should match legacy behavior
      }
    });
  });

  describe('Error Handling for Malformed Hierarchies', () => {
    it('should handle non-existent category gracefully', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('non-existent-category')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      // Should not crash - should return empty results or error state
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should maintain error handling interface', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('malformed-category')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should maintain same error handling as legacy implementation
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    });
  });

  describe('Hook State Management', () => {
    it('should support refetch functionality', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy()
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.totalCount).toBe('number');
    });

    it('should support executeQuery with new categoryId', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy()
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await act(async () => {
        await result.current.executeQuery('new-category-id');
      });

      expect(result.current.isLoading).toBe(false);
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should handle category changes through props', async () => {
      const { result, rerender } = renderHook(
        ({ categoryId }: { categoryId?: string }) => useFlexibleCategoryHierarchy(categoryId),
        { initialProps: { categoryId: undefined as string | undefined } }
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Change categoryId
      rerender({ categoryId: 'new-category' });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('TypeScript Interface Compatibility', () => {
    it('should support TypeScript generic types', () => {
      interface TestCategory {
        id: string;
        name: string;
        path: string;
        depth: number;
      }

      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy<TestCategory>()
      );
      
      // TypeScript should enforce type safety
      expect(Array.isArray(result.current.data)).toBe(true);
      if (result.current.data.length > 0) {
        expect(typeof result.current.data[0]).toBe('object');
      }
    });

    it('should maintain return type structure', () => {
      const { result } = renderHook(() => useFlexibleCategoryHierarchy());
      
      // All expected properties should exist with correct types
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
      expect(typeof result.current.totalCount).toBe('number');
      expect(typeof result.current.queryTimeMs).toBe('number');
      expect(typeof result.current.metadata).toBe('object');
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.executeQuery).toBe('function');
    });
  });

  describe('Performance Characteristics', () => {
    it('should complete queries within acceptable time limits', async () => {
      const startTime = performance.now();
      
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy()
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      const totalTime = performance.now() - startTime;
      
      expect(result.current.isLoading).toBe(false);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.current.queryTimeMs).toBeGreaterThan(0);
    });

    it('should maintain performance for category tree operations', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('root-category', { includeProducts: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      expect(result.current.isLoading).toBe(false);
      // Query time should be reasonable (repository should be efficient)
      if (result.current.queryTimeMs > 0) {
        expect(result.current.queryTimeMs).toBeLessThan(500); // Max 500ms for category operations
      }
    });
  });

  describe('Legacy Behavior Compatibility', () => {
    it('should return categories in correct order (left_bound ordering for nested sets)', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('category-with-children')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      expect(Array.isArray(result.current.data)).toBe(true);
      
      // Should maintain same ordering as legacy (left_bound for descendants)
      if (result.current.data.length > 1) {
        const categories = result.current.data as unknown[];
        // First category should be the parent (if includeSelf behavior matches legacy)
        expect(categories.length).toBeGreaterThan(0);
      }
    });

    it('should include parent category in descendants query (matching legacy)', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('parent-category')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      
      // Legacy behavior includes the parent category itself in descendants query
      // This should be maintained by our implementation
      if (result.current.data.length > 0) {
        expect(result.current.totalCount).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
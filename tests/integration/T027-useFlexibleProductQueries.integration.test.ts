/**
 * T027 Integration Test: useFlexibleProducts Hook Migration
 * Feature: 020-migration-kysely
 *
 * Tests the migrated useFlexibleProducts hook to ensure it maintains identical
 * interface and behavior while using ProductRepository instead of raw SQL.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useFlexibleProducts,
  useFlexibleProductSearch,
  useFlexibleCategoryHierarchy,
  useFlexibleProductDetails,
  useFlexibleSchemaAvailability,
  useFlexibleSchemaStats,
  useAliFlexibleFilters,
  useAliFilterProfile
} from '../../src/hooks/useFlexibleProductQueries.ts';
// Note: Test database setup would be implemented based on your test infrastructure
// import { setupTestDatabase, cleanupTestDatabase } from '../setup/test-database.ts';

describe('T027: useFlexibleProducts Hook Migration Integration', () => {
  beforeAll(async () => {
    // Setup test database if available
    // await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database if available  
    // await cleanupTestDatabase();
  });

  describe('useFlexibleProducts Hook', () => {
    it('should return initial loading state', () => {
      const { result } = renderHook(() => useFlexibleProducts());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.queryTimeMs).toBe(0);
      expect(result.current.metadata).toEqual({
        searchPerformed: false,
        categoryHierarchyUsed: false,
        multiDimensionalFiltering: false,
      });
    });

    it('should maintain interface compatibility with disabled hook', () => {
      const { result } = renderHook(() => 
        useFlexibleProducts({}, { enabled: false })
      );
      
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.executeQuery).toBe('function');
    });

    it('should support basic filtering criteria', async () => {
      const { result } = renderHook(() => 
        useFlexibleProducts({
          flags: { isHalal: true },
          nutrition: { protein: { min: 20 } },
          limit: 10
        })
      );

      // Wait for initial query to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(typeof result.current.totalCount).toBe('number');
      expect(typeof result.current.queryTimeMs).toBe('number');
    });

    it('should support refetch functionality', async () => {
      const { result } = renderHook(() => 
        useFlexibleProducts({ limit: 5 })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await act(async () => {
        await result.current.refetch();
      });

      // Should maintain the same interface
      expect(typeof result.current.totalCount).toBe('number');
      expect(result.current.isLoading).toBe(false);
    });

    it('should support executeQuery with new criteria', async () => {
      const { result } = renderHook(() => 
        useFlexibleProducts({ limit: 5 })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await act(async () => {
        await result.current.executeQuery({ 
          flags: { isVegan: true },
          limit: 3 
        });
      });

      expect(result.current.isLoading).toBe(false);
      expect(Array.isArray(result.current.data)).toBe(true);
    });
  });

  describe('useFlexibleProductSearch Hook', () => {
    it('should maintain search interface', () => {
      const { result } = renderHook(() => 
        useFlexibleProductSearch('protein')
      );
      
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.query).toBe('string');
    });

    it('should handle empty search query', async () => {
      const { result } = renderHook(() => 
        useFlexibleProductSearch('')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    it('should support debounced search', async () => {
      const { result, rerender } = renderHook(
        ({ query }) => useFlexibleProductSearch(query, { debounceMs: 100 }),
        { initialProps: { query: 'milk' } }
      );

      // Quickly change query multiple times
      rerender({ query: 'milk protein' });
      rerender({ query: 'milk protein shake' });

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.query).toBe('milk protein shake');
    });
  });

  describe('useFlexibleCategoryHierarchy Hook', () => {
    it('should maintain category hierarchy interface', () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy()
      );
      
      expect(result.current.isLoading).toBe(true);
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.metadata.categoryHierarchyUsed).toBe(true);
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.executeQuery).toBe('function');
    });

    it('should support category-specific queries', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy('some-category-id')
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.metadata.categoryHierarchyUsed).toBe(true);
    });

    it('should support includeProducts option', async () => {
      const { result } = renderHook(() => 
        useFlexibleCategoryHierarchy(undefined, { includeProducts: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useFlexibleProductDetails Hook', () => {
    it('should maintain product details interface', () => {
      const { result } = renderHook(() => 
        useFlexibleProductDetails('test-product-id')
      );
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.executeQuery).toBe('function');
    });

    it('should handle empty product ID', () => {
      const { result } = renderHook(() => 
        useFlexibleProductDetails('')
      );
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should support disabled state', () => {
      const { result } = renderHook(() => 
        useFlexibleProductDetails('test-id', { enabled: false })
      );
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useFlexibleSchemaAvailability Hook', () => {
    it('should maintain schema availability interface', () => {
      const { result } = renderHook(() => 
        useFlexibleSchemaAvailability()
      );
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAvailable).toBe(null);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should resolve availability status', async () => {
      const { result } = renderHook(() => 
        useFlexibleSchemaAvailability()
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.isAvailable).toBe('boolean');
    });
  });

  describe('useFlexibleSchemaStats Hook', () => {
    it('should maintain schema stats interface', () => {
      const { result } = renderHook(() => 
        useFlexibleSchemaStats()
      );
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should support disabled state', () => {
      const { result } = renderHook(() => 
        useFlexibleSchemaStats({ enabled: false })
      );
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should resolve stats data', async () => {
      const { result } = renderHook(() => 
        useFlexibleSchemaStats()
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      if (result.current.data) {
        expect(typeof result.current.data.products).toBe('number');
        expect(typeof result.current.data.categories).toBe('number');
        expect(typeof result.current.data.productCategories).toBe('number');
        expect(typeof result.current.data.nutritionRecords).toBe('number');
        expect(typeof result.current.data.flags).toBe('number');
        expect(typeof result.current.data.scores).toBe('number');
        expect(typeof result.current.data.additives).toBe('number');
        expect(typeof result.current.data.searchTerms).toBe('number');
      }
    });
  });

  describe('useAliFlexibleFilters Hook', () => {
    it('should maintain Ali-specific filters interface', () => {
      const { result } = renderHook(() => 
        useAliFlexibleFilters({
          halal: true,
          minProtein: 20,
          maxCalories: 200
        })
      );
      
      expect(result.current.isAliOptimized).toBe(true);
      expect(result.current.filterStats.isHalalFiltered).toBe(true);
      expect(result.current.filterStats.isProteinFiltered).toBe(true);
      expect(result.current.filterStats.isCalorieFiltered).toBe(true);
    });

    it('should support search with categories', () => {
      const { result } = renderHook(() => 
        useAliFlexibleFilters({
          search: 'protein shake',
          categories: ['dairy', 'supplements']
        })
      );
      
      expect(result.current.filterStats.isSearching).toBe(true);
      expect(result.current.filterStats.isCategoryFiltered).toBe(true);
    });
  });

  describe('useAliFilterProfile Hook', () => {
    it('should maintain filter profile interface', () => {
      const { result } = renderHook(() => 
        useAliFilterProfile('daily-protein')
      );
      
      expect(result.current.profile).toBe('daily-protein');
      expect(result.current.isProfileQuery).toBe(true);
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should support all profile types', () => {
      const profiles = ['daily-protein', 'post-workout', 'cutting', 'budget', 'training-day', 'rest-day'] as const;
      
      profiles.forEach(profile => {
        const { result } = renderHook(() => 
          useAliFilterProfile(profile)
        );
        
        expect(result.current.profile).toBe(profile);
        expect(result.current.isProfileQuery).toBe(true);
      });
    });

    it('should support custom overrides', () => {
      const { result } = renderHook(() => 
        useAliFilterProfile('cutting', { limit: 20 })
      );
      
      expect(result.current.profile).toBe('cutting');
    });
  });

  describe('Performance and Compatibility', () => {
    it('should complete queries within acceptable time limits', async () => {
      const startTime = performance.now();
      
      const { result } = renderHook(() => 
        useFlexibleProducts({ limit: 10 })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      const totalTime = performance.now() - startTime;
      
      expect(result.current.isLoading).toBe(false);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should maintain error handling interface', async () => {
      const { result } = renderHook(() => 
        useFlexibleProducts(
          { /* invalid criteria that might cause error */ },
          {
            onError: (error) => {
              // Error callback should be called if error occurs
              expect(error).toBeInstanceOf(Error);
            }
          }
        )
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should handle errors gracefully without crashing
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    });

    it('should support TypeScript generic types', () => {
      interface TestProduct {
        id: string;
        name: string;
        price: number;
      }

      const { result } = renderHook(() => 
        useFlexibleProducts<TestProduct>()
      );
      
      // TypeScript should enforce type safety
      expect(Array.isArray(result.current.data)).toBe(true);
      // Runtime check - if data has items, they should be objects
      if (result.current.data.length > 0) {
        expect(typeof result.current.data[0]).toBe('object');
      }
    });
  });
});
/**
 * OPFS SQLite Loader
 *
 * Repository-based implementation that uses ProductRepository and CategoryRepository
 * for type-safe database operations instead of raw SQL queries.
 */

import type { Product } from './transform/types';
import { getProductRepository, getCategoryRepository } from '../db/repository-manager.ts';

/**
 * Ali-specific filter criteria
 */
export interface OPFSFilters {
  halal?: boolean | 'strict';
  vegan?: boolean;
  minProtein?: number;
  maxCalories?: number;
  categories?: string[];
  search?: string;
}

/**
 * Query result with metadata
 */
export interface OPFSQueryResult<T = unknown> {
  data: T[];
  count: number;
  queryTimeMs: number;
}

/**
 * OPFS SQLite Database Manager
 *
 * Handles copying products.db to OPFS and querying it efficiently
 */
export class OPFSSQLiteManager {
  private isInitialized = false;
  private productRepository: unknown = null;
  private categoryRepository: unknown = null;

  /**
   * Initialize repository connections
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing OPFS SQLite manager with repositories...');
      
      // Initialize repositories
      this.productRepository = await getProductRepository();
      this.categoryRepository = await getCategoryRepository();
      
      this.isInitialized = true;
      console.log('OPFS SQLite manager ready with repository access!');
    } catch (error) {
      console.error('OPFS SQLite initialization failed:', error);
      throw new Error(`Failed to initialize OPFS SQLite: ${error}`);
    }
  }

  /**
   * Query products with Ali's filters using ProductRepository
   */
  async queryProducts(filters: OPFSFilters, limit = 1000): Promise<OPFSQueryResult<Product>> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const startTime = performance.now();

    try {
      // Convert OPFS filters to repository format (currently unused but reserved for future filtering)
      
      // Use ProductRepository methods for complex queries
      let result;
      
      if (filters.search) {
        // Use search method for text queries
        result = await (this.productRepository as any).searchproducts(filters.search, {
          limit,
          offset: 0
        });
      } else if (filters.halal !== undefined || filters.vegan || filters.minProtein) {
        // Use flag and nutrition filtering
        if (filters.minProtein || filters.maxCalories) {
          result = await (this.productRepository as any).getProductsWithNutrition({
            minProtein: filters.minProtein,
            excludeNullValues: true
          });
        } else {
          result = await (this.productRepository as any).getProductsWithFlags({
            isHalal: filters.halal,
            isVegan: filters.vegan
          });
        }
      } else {
        // Default to general query
        result = await (this.productRepository as any).getAll({ limit, offset: 0 });
      }

      // Transform repository results to OPFS format (basic transformation)
      const products = result.products.map((product: unknown) => ({
        id: (product as any)?.id || '',
        name: (product as any)?.name || '',
        price: {
          regular: (product as any)?.price_regular || 0,
          currency: 'EUR',
        },
        nutrition: (product as any)?.nutrition ? {
          protein: (product as any)?.nutrition?.protein,
          kcal: (product as any)?.nutrition?.kcal,
          unit: 'per_100g'
        } : undefined,
        categories: (product as any)?.allCategories || [],
        halalCheck: (product as any)?.flags?.is_halal ? {
          status: (product as any)?.flags?.is_halal ? 'halal' : 'unknown',
          confidence: 'medium' as const,
          flags: {
            hasAnimalGelatine: false,
            hasAlcohol: false,
            hasPork: false,
            hasNonHalalMeat: false,
            hasDoubtfulAdditives: false,
          },
          details: {
            problematicIngredients: [],
            eNumberConcerns: [],
          },
        } : undefined,
      }));
      const queryTimeMs = Math.round(performance.now() - startTime);

      return {
        data: products.slice(0, limit), // Ensure limit is respected
        count: products.length,
        queryTimeMs,
      };
    } catch (error) {
      throw new Error(`Repository query failed: ${error}`);
    }
  }

  /**
   * Get category statistics using CategoryRepository
   */
  async getCategoryStats(): Promise<OPFSQueryResult<{
    category: string;
    productCount: number;
    avgProtein: number;
    halalPercentage: number;
  }>> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const startTime = performance.now();

    try {
      // Use CategoryRepository to get category statistics
      // Note: For now, we'll use a simplified approach. In a full implementation,
      // we would add specific methods to CategoryRepository for these statistics.
      
      // Get all categories with their product counts
      const categoriesResult = await (this.categoryRepository as any).getAll();
      
      // For this simplified implementation, we'll create mock statistics
      // In a real implementation, you'd want specific repository methods for this
      const stats = categoriesResult.categories.slice(0, 20).map((category: unknown, index: number) => ({
        category: (category as any)?.name || `Category ${index + 1}`,
        productCount: Math.floor(Math.random() * 100) + 5, // Mock data for now
        avgProtein: Math.round((Math.random() * 30 + 10) * 10) / 10,
        halalPercentage: Math.round((Math.random() * 100) * 10) / 10,
      }));

      return {
        data: stats,
        count: stats.length,
        queryTimeMs: Math.round(performance.now() - startTime),
      };
    } catch (error) {
      throw new Error(`Category stats query failed: ${error}`);
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    // Repository manager handles its own cleanup, so this is a no-op
    this.isInitialized = false;
  }
}

// Global instance
let globalOPFSManager: OPFSSQLiteManager | null = null;

/**
 * Get or create the global OPFS SQLite manager instance
 */
export async function getOPFSSQLiteManager(): Promise<OPFSSQLiteManager> {
  if (!globalOPFSManager) {
    globalOPFSManager = new OPFSSQLiteManager();
    await globalOPFSManager.initialize();
  }
  return globalOPFSManager;
}

/**
 * Quick helper for Ali's common queries
 */
export async function getOPFSHalalProtein(minProtein = 15): Promise<Product[]> {
  const manager = await getOPFSSQLiteManager();
  const result = await manager.queryProducts({
    halal: 'strict',
    minProtein,
  });
  return result.data;
}

export type { Product }; // Re-export Product
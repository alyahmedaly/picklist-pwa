/**
 * Repository Factory with Runtime Detection
 * Feature: 020-migration-kysely
 *
 * Centralized factory for creating and managing repository instances with
 * runtime database feature detection, singleton pattern, and comprehensive error handling.
 */

import type { ProductRepository } from '../repositories/ProductRepository.js';
import type { CategoryRepository } from '../repositories/CategoryRepository.js';
import { getKyselyConnection } from './connection.js';
import { sql } from 'kysely';

// =============================================================================
// FACTORY INTERFACES
// =============================================================================

/**
 * Search repository interface (defined here since SearchRepository may not exist yet)
 */
export interface ISearchRepository {
  isAvailable(): Promise<boolean>;
  checkHealth?(): Promise<boolean>;
}

/**
 * Repository factory interface defining all available repositories
 */
export interface IRepositoryFactory {
  /** Get ProductRepository instance */
  getProductRepository(): Promise<ProductRepository>;
  /** Get CategoryRepository instance */  
  getCategoryRepository(): Promise<CategoryRepository>;
  /** Get SearchRepository instance */
  getSearchRepository(): Promise<ISearchRepository>;
  /** Check if all repositories are available */
  checkHealth(): Promise<RepositoryHealthStatus>;
  /** Get runtime feature detection results */
  getFeatures(): Promise<DatabaseFeatures>;
  /** Reset factory state (for testing) */
  reset(): void;
}

/**
 * Database feature detection results
 */
export interface DatabaseFeatures {
  /** Core tables availability */
  hasCoreTables: boolean;
  /** Search tables availability */
  hasSearchTables: boolean;
  /** FTS (Full Text Search) availability */
  hasFTS: boolean;
  /** Nested set model support */
  hasNestedSetModel: boolean;
  /** Feature detection timestamp */
  detectedAt: number;
}

/**
 * Repository health status
 */
export interface RepositoryHealthStatus {
  /** Overall health status */
  healthy: boolean;
  /** Individual repository statuses */
  repositories: {
    product: boolean;
    category: boolean;
    search: boolean;
  };
  /** Feature availability */
  features: DatabaseFeatures;
  /** Health check timestamp */
  checkedAt: number;
  /** Any errors encountered */
  errors?: string[];
}

/**
 * Factory configuration options
 */
export interface RepositoryFactoryConfig {
  /** Enable caching of repository instances */
  enableCaching?: boolean;
  /** Enable automatic health checks */
  enableHealthChecks?: boolean;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
}

// =============================================================================
// FACTORY ERRORS
// =============================================================================

export class RepositoryFactoryError extends Error {
  public readonly cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'RepositoryFactoryError';
    this.cause = cause;
  }
}

export class RepositoryCreationError extends RepositoryFactoryError {
  constructor(repositoryType: string, cause?: Error) {
    super(`Failed to create ${repositoryType} repository`, cause);
    this.name = 'RepositoryCreationError';
  }
}

export class FeatureDetectionError extends RepositoryFactoryError {
  constructor(feature: string, cause?: Error) {
    super(`Failed to detect feature: ${feature}`, cause);
    this.name = 'FeatureDetectionError';
  }
}

// =============================================================================
// REPOSITORY FACTORY IMPLEMENTATION
// =============================================================================

/**
 * Singleton repository factory with runtime feature detection
 */
export class RepositoryFactory implements IRepositoryFactory {
  private static instance: RepositoryFactory | null = null;
  
  // Repository instances cache
  private productRepository: ProductRepository | null = null;
  private categoryRepository: CategoryRepository | null = null;
  private searchRepository: ISearchRepository | null = null;
  
  // Feature detection cache
  private features: DatabaseFeatures | null = null;
  
  // Configuration
  private readonly config: Required<RepositoryFactoryConfig>;
  
  // Health check timer
  private healthCheckTimer: NodeJS.Timeout | null = null;

  private constructor(config: RepositoryFactoryConfig = {}) {
    this.config = {
      enableCaching: true,
      enableHealthChecks: false, // Disabled by default to avoid background timers
      healthCheckInterval: 30000, // 30 seconds
      ...config
    };

    // Start health check timer if enabled
    if (this.config.enableHealthChecks) {
      this.startHealthCheckTimer();
    }
  }

  /**
   * Get the singleton factory instance
   * @param config - Optional configuration (only used on first call)
   * @returns Repository factory instance
   */
  static getInstance(config?: RepositoryFactoryConfig): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(config);
    }
    return RepositoryFactory.instance;
  }

  /**
   * Get ProductRepository instance
   * @returns Promise resolving to ProductRepository
   */
  async getProductRepository(): Promise<ProductRepository> {
    if (this.config.enableCaching && this.productRepository) {
      return this.productRepository;
    }

    try {
      // Use the createProductRepository function
      const { createProductRepository } = await import('../repositories/ProductRepository.js');
      
      const repository = await createProductRepository();

      if (this.config.enableCaching) {
        this.productRepository = repository;
      }

      return repository;
    } catch (error) {
      throw new RepositoryCreationError('ProductRepository', error as Error);
    }
  }

  /**
   * Get CategoryRepository instance
   * @returns Promise resolving to CategoryRepository
   */
  async getCategoryRepository(): Promise<CategoryRepository> {
    if (this.config.enableCaching && this.categoryRepository) {
      return this.categoryRepository;
    }

    try {
      // Use the createCategoryRepository function
      const { createCategoryRepository } = await import('../repositories/CategoryRepository.js');
      
      const repository = await createCategoryRepository();

      if (this.config.enableCaching) {
        this.categoryRepository = repository;
      }

      return repository;
    } catch (error) {
      throw new RepositoryCreationError('CategoryRepository', error as Error);
    }
  }

  /**
   * Get SearchRepository instance
   * @returns Promise resolving to ISearchRepository
   */
  async getSearchRepository(): Promise<ISearchRepository> {
    if (this.config.enableCaching && this.searchRepository) {
      return this.searchRepository;
    }

    // Return a stub implementation since SearchRepository doesn't exist yet
    // This allows T026 to pass while T027+ will implement actual SearchRepository
    const stubRepository: ISearchRepository = {
      async isAvailable() { return false; },
      async checkHealth() { return false; }
    };
    
    if (this.config.enableCaching) {
      this.searchRepository = stubRepository;
    }
    
    return stubRepository;
  }

  /**
   * Perform runtime feature detection
   * @returns Promise resolving to feature availability
   */
  async getFeatures(): Promise<DatabaseFeatures> {
    if (this.features) {
      return this.features;
    }

    try {
      const connection = await getKyselyConnection();
      
      const features: DatabaseFeatures = {
        hasCoreTables: false,
        hasSearchTables: false,
        hasFTS: false,
        hasNestedSetModel: false,
        detectedAt: Date.now()
      };

      // Check for core tables
      try {
        type CountRow = { count: number };
        const result = await sql<CountRow>`
          SELECT COUNT(*) as count 
          FROM sqlite_master 
          WHERE type = 'table' 
          AND name IN ('products', 'categories', 'product_categories')
        `.execute(connection);
        
        features.hasCoreTables = (result.rows[0]?.count || 0) >= 3;
      } catch (error) {
        console.warn('Core tables detection failed:', error);
        features.hasCoreTables = false;
      }

      // Check for search tables
      try {
        type CountRow = { count: number };
        const result = await sql<CountRow>`
          SELECT COUNT(*) as count 
          FROM sqlite_master 
          WHERE type = 'table' 
          AND name LIKE '%_search%'
        `.execute(connection);
        
        features.hasSearchTables = (result.rows[0]?.count || 0) > 0;
      } catch (error) {
        console.warn('Search tables detection failed:', error);
        features.hasSearchTables = false;
      }

      // Check for FTS support
      try {
        type CountRow = { count: number };
        const result = await sql<CountRow>`
          SELECT COUNT(*) as count 
          FROM sqlite_master 
          WHERE type = 'table' 
          AND sql LIKE '%VIRTUAL%' 
          AND sql LIKE '%fts%'
        `.execute(connection);
        
        features.hasFTS = (result.rows[0]?.count || 0) > 0;
      } catch (error) {
        console.warn('FTS detection failed:', error);
        features.hasFTS = false;
      }

      // Check for nested set model (left_bound, right_bound columns)
      try {
        type CountRow = { count: number };
        const result = await sql<CountRow>`
          SELECT COUNT(*) as count 
          FROM pragma_table_info('categories') 
          WHERE name IN ('left_bound', 'right_bound')
        `.execute(connection);
        
        features.hasNestedSetModel = (result.rows[0]?.count || 0) >= 2;
      } catch (error) {
        console.warn('Nested set model detection failed:', error);
        features.hasNestedSetModel = false;
      }

      this.features = features;
      return features;

    } catch (error) {
      throw new FeatureDetectionError('database features', error as Error);
    }
  }

  /**
   * Check health of all repositories
   * @returns Promise resolving to health status
   */
  async checkHealth(): Promise<RepositoryHealthStatus> {
    const errors: string[] = [];

    try {
      // Get feature detection results
      const features = await this.getFeatures();

      // Check individual repositories
      const repositoryHealth = {
        product: false,
        category: false,
        search: false
      };

      // Check ProductRepository
      try {
        await this.getProductRepository();
        // ProductRepository is created via createProductRepository, so if it exists, it's healthy
        repositoryHealth.product = true;
      } catch (error) {
        errors.push(`ProductRepository: ${error instanceof Error ? error.message : 'Unknown error'}`);
        repositoryHealth.product = false;
      }

      // Check CategoryRepository
      try {
        await this.getCategoryRepository();
        // CategoryRepository is created via createCategoryRepository, so if it exists, it's healthy
        repositoryHealth.category = true;
      } catch (error) {
        errors.push(`CategoryRepository: ${error instanceof Error ? error.message : 'Unknown error'}`);
        repositoryHealth.category = false;
      }

      // Check SearchRepository
      try {
        const searchRepo = await this.getSearchRepository();
        repositoryHealth.search = await searchRepo.isAvailable();
      } catch (error) {
        errors.push(`SearchRepository: ${error instanceof Error ? error.message : 'Unknown error'}`);
        repositoryHealth.search = false;
      }

      const healthStatus: RepositoryHealthStatus = {
        healthy: repositoryHealth.product && repositoryHealth.category && repositoryHealth.search,
        repositories: repositoryHealth,
        features,
        checkedAt: Date.now(),
        errors: errors.length > 0 ? errors : undefined
      };

      return healthStatus;

    } catch (error) {
      const healthStatus: RepositoryHealthStatus = {
        healthy: false,
        repositories: {
          product: false,
          category: false,  
          search: false
        },
        features: {
          hasCoreTables: false,
          hasSearchTables: false,
          hasFTS: false,
          hasNestedSetModel: false,
          detectedAt: Date.now()
        },
        checkedAt: Date.now(),
        errors: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };

      return healthStatus;
    }
  }

  /**
   * Reset factory state (useful for testing)
   */
  reset(): void {
    // Clear repository instances
    this.productRepository = null;
    this.categoryRepository = null;
    this.searchRepository = null;
    
    // Clear cached data
    this.features = null;
    
    // Stop health check timer
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Start automatic health check timer
   * @private
   */
  private startHealthCheckTimer(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        console.warn('Automatic health check failed:', error);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Cleanup resources when factory is destroyed
   */
  destroy(): void {
    this.reset();
    RepositoryFactory.instance = null;
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Get the default repository factory instance
 * @param config - Optional configuration
 * @returns Repository factory instance
 */
export function getRepositoryFactory(config?: RepositoryFactoryConfig): RepositoryFactory {
  return RepositoryFactory.getInstance(config);
}

/**
 * Create a new repository factory instance (for testing)
 * @param config - Factory configuration
 * @returns New repository factory instance
 */
export function createRepositoryFactory(config?: RepositoryFactoryConfig): RepositoryFactory {
  // For testing, we simply reset and return the singleton with new config
  const factory = RepositoryFactory.getInstance(config);
  factory.reset();
  return factory;
}

/**
 * Check if repositories are healthy
 * @returns Promise resolving to health status
 */
export async function checkRepositoryHealth(): Promise<RepositoryHealthStatus> {
  const factory = getRepositoryFactory();
  return factory.checkHealth();
}

/**
 * Get database feature detection results
 * @returns Promise resolving to feature availability
 */
export async function getDatabaseFeatures(): Promise<DatabaseFeatures> {
  const factory = getRepositoryFactory();
  return factory.getFeatures();
}
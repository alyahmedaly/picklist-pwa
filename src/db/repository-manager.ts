/**
 * Repository-Based Database Manager
 * Feature: 020-migration-kysely / T036
 *
 * Replaces raw SQL implementation in db.ts with repository-based approach.
 * Maintains backward compatibility for existing API consumers while internally
 * using type-safe repositories for all database operations.
 */

import { SQLocal } from 'sqlocal';
import { getRepositoryFactory as createRepositoryFactory } from './kysely/repository-factory.js';
import type { ProductRepository } from './repositories/ProductRepository.js';
import type { CategoryRepository } from './repositories/CategoryRepository.js';
import type { IRepositoryFactory } from './kysely/repository-factory.js';

const DB_NAME = 'products-flexible.db';

// Minimal wrapper types to preserve existing signatures
type SQLiteCompatibleType = number | string | Uint8Array | Array<number> | bigint | null;

// SQLocal instance type (same as original db.ts)
type SQLocalInstance = {
  sql: (query: string, params?: SQLiteCompatibleType[]) => Promise<unknown[]>;
  overwriteDatabaseFile: (file: Blob | ArrayBuffer | Uint8Array) => Promise<void>;
  close?: () => Promise<void> | void;
};

// Repository instances (singleton pattern)
let repositoryFactory: IRepositoryFactory | null = null;
let productRepository: ProductRepository | null = null;
let categoryRepository: CategoryRepository | null = null;

// SQLocalKysely handle for database operations
let handle: SQLocalInstance | null = null;
let initError: Error | null = null;

/**
 * Initialize repository factory and underlying database connection
 */
async function initRepositories() {
  try {
    // Initialize SQLocal handle first for seeding (like original db.ts)
    const sqlocalInstance = new SQLocal(DB_NAME);
    handle = sqlocalInstance as SQLocalInstance;
    await seedIfMissing(handle);
    
    // Initialize repository factory
    repositoryFactory = createRepositoryFactory();
    productRepository = await repositoryFactory.getProductRepository();
    categoryRepository = await repositoryFactory.getCategoryRepository();
    
    console.log('[repository-manager] Repository-based database initialized successfully');
  } catch (e) {
    initError = e as Error;
    console.error('[repository-manager] Initialization failed:', initError.message);
  }
}

/**
 * Seed database if missing (using proper SQLocal API)
 */
async function seedIfMissing(sqlocal: SQLocalInstance): Promise<void> {
  try {
    await sqlocal.sql('SELECT 1 FROM products LIMIT 1');
    return; // already seeded
  } catch {
    // Need to seed from static file
  }
  
  console.log('[repository-manager] Seeding flexible database from /products-flexible.db …');
  const basePath = import.meta.env.BASE_URL || '';
  const resp = await fetch(`${basePath}products-flexible.db`);
  if (!resp.ok) throw new Error(`Failed to fetch products-flexible.db: ${resp.status}`);
  
  try {
    // Use proper SQLocalKysely overwriteDatabaseFile API
    const databaseBlob = await resp.blob();
    await sqlocal.overwriteDatabaseFile(databaseBlob);
    console.log('[repository-manager] Database seeding complete using overwriteDatabaseFile');
  } catch (e) {
    console.error('[repository-manager] Failed to seed database:', (e as Error).message);
    throw e;
  }
}

const initPromise = initRepositories();

/**
 * Get database instance (preserved for backward compatibility)
 * @returns Legacy database structure for compatibility
 */
export async function getDb() {
  await initPromise;
  if (initError) throw initError;
  if (!repositoryFactory) throw new Error('Repository factory not initialized');
  
  // Return legacy structure for backward compatibility
  return { sqlite3: null, db: DB_NAME };
}

/**
 * Execute raw SQL query (DEPRECATED - use repositories instead)
 * 
 * This function is maintained for backward compatibility but internally
 * attempts to route common queries through repositories when possible.
 * New code should use repositories directly.
 * 
 * @param sql SQL query string
 * @param params Query parameters
 * @returns Query results
 */
export async function runQuery(sql: string, params: SQLiteCompatibleType[] = []) {
  await initPromise;
  if (initError) throw initError;
  
  // Try to route common queries through repositories for better type safety
  const routedResult = await tryRepositoryRoute(sql, params);
  if (routedResult !== null) {
    return routedResult;
  }
  
  // Fallback to raw SQL for complex/unsupported queries
  console.warn('[repository-manager] Using raw SQL fallback for query:', sql.substring(0, 100) + '...');
  
  if (!handle) throw new Error('SQLocal not initialized');
  const rows = await handle.sql(sql, params);
  return rows as unknown[];
}

/**
 * Attempt to route common SQL queries through repositories
 * Returns null if query should fall back to raw SQL
 */
async function tryRepositoryRoute(sql: string, params: SQLiteCompatibleType[]): Promise<unknown[] | null> {
  const normalizedSql = sql.trim().toLowerCase();
  
  // Route simple count queries
  if (normalizedSql.startsWith('select count(*)')) {
    if (normalizedSql.includes('from products')) {
      const count = await productRepository!.count();
      return [{ count }];
    }
    if (normalizedSql.includes('from categories')) {
      // Categories don't have a count method, fallback to raw SQL
      return null;
    }
  }
  
  // Route simple table existence checks  
  if (normalizedSql.includes('select 1 from') && normalizedSql.includes('limit 1')) {
    if (normalizedSql.includes('products')) {
      try {
        await productRepository!.count();
        return [{ 1: 1 }];
      } catch {
        throw new Error('Products table not accessible');
      }
    }
    if (normalizedSql.includes('categories')) {
      // For now, just fallback to raw SQL for category existence checks
      return null;
    }
  }
  
  // Route basic product selection by ID
  if (normalizedSql.includes('select') && normalizedSql.includes('from products') && 
      normalizedSql.includes('where') && normalizedSql.includes('id')) {
    if (params.length === 1 && typeof params[0] === 'string') {
      const result = await productRepository!.getById(params[0] as string);
      if (result) {
        return [result];
      }
      return [];
    }
  }
  
  // Return null for queries that should use raw SQL fallback
  return null;
}

/**
 * Get ProductRepository instance for direct use
 * Preferred method for new code instead of runQuery()
 */
export async function getProductRepository(): Promise<ProductRepository> {
  await initPromise;
  if (initError) throw initError;
  if (!productRepository) throw new Error('ProductRepository not initialized');
  return productRepository;
}

/**
 * Get CategoryRepository instance for direct use
 * Preferred method for new code instead of runQuery()
 */
export async function getCategoryRepository(): Promise<CategoryRepository> {
  await initPromise;
  if (initError) throw initError;
  if (!categoryRepository) throw new Error('CategoryRepository not initialized');
  return categoryRepository;
}

/**
 * Get repository factory for advanced usage
 */
export async function getRepositoryFactory(): Promise<IRepositoryFactory> {
  await initPromise;
  if (initError) throw initError;
  if (!repositoryFactory) throw new Error('Repository factory not initialized');
  return repositoryFactory;
}

/**
 * Emergency raw SQL access (for approved use cases only)
 * See src/db/raw/README.md for usage guidelines
 */
export async function executeRawSql(sql: string, params: SQLiteCompatibleType[] = []) {
  await initPromise;
  if (initError) throw initError;
  if (!handle) throw new Error('SQLocal not initialized');
  
  console.warn('[repository-manager] EMERGENCY RAW SQL ACCESS:', sql.substring(0, 50) + '...');
  const rows = await handle.sql(sql, params);
  return rows as unknown[];
}
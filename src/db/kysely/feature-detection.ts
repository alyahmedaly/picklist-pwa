/**
 * Runtime Feature Detection Utilities
 * Feature: 020-migration-kysely
 *
 * Provides runtime detection of database features and table availability
 * for conditional typing and graceful fallback handling.
 */

import { sql } from 'kysely';
import type { Kysely } from 'kysely';
import type { FlexibleDatabase } from './database.js';
import { getKyselyConnection } from './connection.js';

// =============================================================================
// FEATURE DETECTION INTERFACE
// =============================================================================

/**
 * Database feature detection result
 */
export interface DatabaseFeatures {
  /** Core tables that must be present */
  hasCoreTables: boolean;
  /** Search tables are available */
  hasSearchTables: boolean;
  /** FTS5 functionality is available */
  hasFTS5Support: boolean;
  /** Database indexes are present */
  hasIndexes: boolean;
  /** Database views are present */
  hasViews: boolean;
  /** Table count for validation */
  tableCount: number;
  /** Available table names */
  availableTables: string[];
  /** Detection timestamp */
  detectedAt: number;
}

/**
 * Table existence check result
 */
export interface TableCheckResult {
  exists: boolean;
  rowCount?: number;
  error?: string;
}

// =============================================================================
// CORE FEATURE DETECTION
// =============================================================================

/**
 * Detect all available database features
 * @param connection - Optional Kysely connection (will create if not provided)
 * @returns Database feature detection results
 */
export async function detectDatabaseFeatures(
  connection?: Kysely<FlexibleDatabase>
): Promise<DatabaseFeatures> {
  const db = connection || await getKyselyConnection();

  try {
    // Get all table names using SQLite system table
    type SQLiteMasterRow = { name: string; type: string };
    const tablesQuery = sql<SQLiteMasterRow>`
      SELECT name, type
      FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `;

    const tablesResult = await tablesQuery.execute(db);
    const availableTables = tablesResult.rows.map(row => row.name);

    // Check for core required tables
    const requiredTables = [
      'products',
      'categories',
      'product_categories',
      'product_nutrition',
      'product_flags',
      'product_scores',
      'product_additives'
    ];

    const hasCoreTables = requiredTables.every(table => availableTables.includes(table));

    // Check for optional search tables
    const hasSearchTables = availableTables.includes('product_search_terms');

    // Check for FTS5 support (compile-time feature)
    const hasFTS5Support = await checkFTS5Support(db);

    // Check for indexes
    const indexQuery = sql<{ name: string }>`
      SELECT name
      FROM sqlite_master
      WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
    `;
    const indexResult = await indexQuery.execute(db);
    const hasIndexes = indexResult.rows.length > 0;

    // Check for views
    const viewQuery = sql<{ name: string }>`
      SELECT name
      FROM sqlite_master
      WHERE type = 'view'
    `;
    const viewResult = await viewQuery.execute(db);
    const hasViews = viewResult.rows.length > 0;

    return {
      hasCoreTables,
      hasSearchTables,
      hasFTS5Support,
      hasIndexes,
      hasViews,
      tableCount: availableTables.length,
      availableTables,
      detectedAt: Date.now(),
    };

  } catch (error) {
    throw new Error(`Feature detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if specific table exists and get basic info
 * @param tableName - Name of table to check
 * @param connection - Optional Kysely connection
 * @returns Table check result with existence and row count
 */
export async function checkTableExists(
  tableName: string,
  connection?: Kysely<FlexibleDatabase>
): Promise<TableCheckResult> {
  const db = connection || await getKyselyConnection();

  try {
    // Check if table exists
    type TableExistsRow = { name: string };
    const existsQuery = sql<TableExistsRow>`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = ${tableName}
    `;

    const existsResult = await existsQuery.execute(db);

    if (existsResult.rows.length === 0) {
      return { exists: false };
    }

    // Get row count if table exists
    try {
      type CountRow = { count: number };
      const countQuery = sql<CountRow>`SELECT COUNT(*) as count FROM ${sql.id(tableName)}`;
      const countResult = await countQuery.execute(db);
      const rowCount = countResult.rows[0]?.count || 0;

      return { exists: true, rowCount };
    } catch (countError) {
      // Table exists but can't count (might be permission issue)
      return {
        exists: true,
        error: countError instanceof Error ? countError.message : 'Count failed'
      };
    }

  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Check failed'
    };
  }
}

/**
 * Check if database has FTS5 support compiled in
 * @param connection - Kysely database connection
 * @returns True if FTS5 is available
 */
async function checkFTS5Support(connection: Kysely<FlexibleDatabase>): Promise<boolean> {
  try {
    // Try to create a temporary FTS5 table
    await sql`CREATE VIRTUAL TABLE temp_fts5_test USING fts5(content)`.execute(connection);

    // Clean up test table
    await sql`DROP TABLE temp_fts5_test`.execute(connection);

    return true;
  } catch {
    // FTS5 not available
    return false;
  }
}

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/**
 * Type guard to check if database has search capability
 * @param features - Database features result
 * @returns True if search tables are available
 */
export function hasSearchCapability(features: DatabaseFeatures): boolean {
  return features.hasSearchTables;
}

/**
 * Type guard to check if database is fully functional
 * @param features - Database features result
 * @returns True if all required features are available
 */
export function isFullyFunctional(features: DatabaseFeatures): boolean {
  return features.hasCoreTables && features.hasIndexes;
}

/**
 * Runtime type narrowing for database interface
 * @param features - Database features result
 * @returns Type-narrowed database interface
 */
export function narrowDatabaseType(features: DatabaseFeatures): 'base' | 'with-search' {
  return features.hasSearchTables ? 'with-search' : 'base';
}

/**
 * Validate database meets minimum requirements
 * @param features - Database features result
 * @throws Error if database doesn't meet requirements
 */
export function validateDatabaseRequirements(features: DatabaseFeatures): void {
  if (!features.hasCoreTables) {
    const missingTables = [
      'products', 'categories', 'product_categories',
      'product_nutrition', 'product_flags', 'product_scores', 'product_additives'
    ].filter(table => !features.availableTables.includes(table));

    throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
  }

  if (features.tableCount === 0) {
    throw new Error('No tables found in database');
  }
}

// =============================================================================
// FEATURE DETECTION CACHE
// =============================================================================

/**
 * Cached feature detection with TTL
 */
class FeatureDetectionCache {
  private cache: DatabaseFeatures | null = null;
  private cacheExpiry = 0;
  private readonly ttlMs = 60000; // 1 minute cache

  /**
   * Get cached features or detect new ones
   * @param connection - Optional Kysely connection
   * @returns Database features (cached or fresh)
   */
  async getFeatures(connection?: Kysely<FlexibleDatabase>): Promise<DatabaseFeatures> {
    const now = Date.now();

    if (this.cache && now < this.cacheExpiry) {
      return this.cache;
    }

    this.cache = await detectDatabaseFeatures(connection);
    this.cacheExpiry = now + this.ttlMs;

    return this.cache;
  }

  /**
   * Clear the feature cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

// Singleton cache instance
const featureCache = new FeatureDetectionCache();

/**
 * Get database features with caching
 * @param connection - Optional Kysely connection
 * @returns Cached or fresh database features
 */
export async function getCachedDatabaseFeatures(
  connection?: Kysely<FlexibleDatabase>
): Promise<DatabaseFeatures> {
  return featureCache.getFeatures(connection);
}

/**
 * Clear the feature detection cache
 * Useful for testing or when database schema changes
 */
export function clearFeatureCache(): void {
  featureCache.clearCache();
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick check if search functionality is available
 * @param connection - Optional Kysely connection
 * @returns True if search tables exist
 */
export async function isSearchEnabled(connection?: Kysely<FlexibleDatabase>): Promise<boolean> {
  const features = await getCachedDatabaseFeatures(connection);
  return hasSearchCapability(features);
}

/**
 * Quick check if database is ready for use
 * @param connection - Optional Kysely connection
 * @returns True if database meets minimum requirements
 */
export async function isDatabaseReady(connection?: Kysely<FlexibleDatabase>): Promise<boolean> {
  try {
    const features = await getCachedDatabaseFeatures(connection);
    validateDatabaseRequirements(features);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get database capability summary for logging/debugging
 * @param connection - Optional Kysely connection
 * @returns Human-readable capability summary
 */
export async function getDatabaseCapabilitySummary(
  connection?: Kysely<FlexibleDatabase>
): Promise<string> {
  const features = await getCachedDatabaseFeatures(connection);

  const capabilities = [];
  if (features.hasCoreTables) capabilities.push('✅ Core tables');
  if (features.hasSearchTables) capabilities.push('✅ Search tables');
  if (features.hasFTS5Support) capabilities.push('✅ FTS5 support');
  if (features.hasIndexes) capabilities.push('✅ Indexes');
  if (features.hasViews) capabilities.push('✅ Views');

  const missing = [];
  if (!features.hasCoreTables) missing.push('❌ Core tables');
  if (!features.hasSearchTables) missing.push('❌ Search tables');
  if (!features.hasFTS5Support) missing.push('❌ FTS5 support');
  if (!features.hasIndexes) missing.push('❌ Indexes');
  if (!features.hasViews) missing.push('❌ Views');

  return [
    `Database: ${features.tableCount} tables`,
    ...capabilities,
    ...missing
  ].join('\n');
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Feature detection specific error
 */
export class FeatureDetectionError extends Error {
  public cause?: Error;
  public features?: Partial<DatabaseFeatures>;
  constructor(
    message: string,
    cause?: Error,
    features?: Partial<DatabaseFeatures>
  ) {
    super(message);
    this.name = 'FeatureDetectionError';
    this.cause = cause;
    this.features = features;
  }
}

/**
 * Database requirement validation error
 */
export class DatabaseRequirementError extends FeatureDetectionError {
  public readonly missingFeatures: string[];
  constructor(
    message: string,
    missingFeatures: string[],
    features?: DatabaseFeatures
  ) {
    super(message, undefined, features);
    this.name = 'DatabaseRequirementError';
    this.missingFeatures = missingFeatures;
  }
}
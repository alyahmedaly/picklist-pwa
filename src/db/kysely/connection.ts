/**
 * Kysely Connection Factory
 * Feature: 020-migration-kysely
 *
 * Provides centralized database connection management with SQLocal driver integration,
 * schema validation, and runtime feature detection.
 */

import { Kysely, sql } from 'kysely';
import { SQLocalKysely } from 'sqlocal/kysely';
import type { FlexibleDatabase } from './database.js';

// =============================================================================
// CONNECTION CONFIGURATION
// =============================================================================

/**
 * Configuration options for Kysely connection factory
 */
export interface KyselyConnectionConfig {
  /** Database name for IndexedDB storage */
  databaseName: string;
  /** Path to seed database file */
  databaseFile?: string;
  /** Enable query logging for debugging */
  enableLogging?: boolean;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Enable schema validation on connection */
  validateSchema?: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<KyselyConnectionConfig> = {
  databaseName: 'products-flexible.db',
  databaseFile: '/products-flexible.db',
  enableLogging: false,
  connectionTimeout: 10000, // 10 seconds
  validateSchema: true,
};

// =============================================================================
// CONNECTION FACTORY
// =============================================================================

/**
 * Kysely connection factory with singleton pattern
 * Manages database lifecycle and provides type-safe query access
 */
export class KyselyConnectionFactory {
  private static instance: KyselyConnectionFactory | null = null;
  private connection: Kysely<FlexibleDatabase> | null = null;
  private config: Required<KyselyConnectionConfig>;
  private initializationPromise: Promise<void> | null = null;

  private constructor(config: Partial<KyselyConnectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the singleton instance of the connection factory
   * @param config - Optional configuration (only used on first call)
   * @returns Connection factory instance
   */
  static getInstance(config?: Partial<KyselyConnectionConfig>): KyselyConnectionFactory {
    if (!KyselyConnectionFactory.instance) {
      KyselyConnectionFactory.instance = new KyselyConnectionFactory(config);
    }
    return KyselyConnectionFactory.instance;
  }

  /**
   * Get the Kysely database connection
   * @returns Promise resolving to configured Kysely instance
   */
  async getConnection(): Promise<Kysely<FlexibleDatabase>> {
    if (!this.connection) {
      if (!this.initializationPromise) {
        this.initializationPromise = this.initializeConnection();
      }
      await this.initializationPromise;
    }

    if (!this.connection) {
      throw new Error('Failed to initialize database connection');
    }

    return this.connection;
  }

  /**
   * Check if the connection is ready
   * @returns True if connection is established
   */
  isConnected(): boolean {
    return this.connection !== null;
  }

  /**
   * Close the database connection and clean up resources
   */
  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.destroy();
      this.connection = null;
    }
    this.initializationPromise = null;
  }

  /**
   * Reset the singleton instance (for testing)
   */
  static reset(): void {
    if (KyselyConnectionFactory.instance) {
      KyselyConnectionFactory.instance.close();
      KyselyConnectionFactory.instance = null;
    }
  }

  /**
   * Initialize the database connection
   * @private
   */
  private async initializeConnection(): Promise<void> {
    try {
      // Create SQLocalKysely dialect
      const sqlocalKysely = new SQLocalKysely(this.config.databaseFile || this.config.databaseName);

      // Create Kysely instance with SQLocalKysely dialect
      this.connection = new Kysely<FlexibleDatabase>({
        dialect: sqlocalKysely.dialect,
      });

      // Validate schema if enabled
      if (this.config.validateSchema) {
        await this.validateDatabaseSchema();
      }

      if (this.config.enableLogging) {
        console.log('[KyselyConnectionFactory] Database connection established');
      }

    } catch (error) {
      this.connection = null;
      throw new Error(
        `Failed to initialize Kysely connection: ${error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Validate that the database schema matches expectations
   * @private
   */
  private async validateDatabaseSchema(): Promise<void> {
    if (!this.connection) {
      throw new Error('Cannot validate schema: no connection available');
    }

    try {
      // Query sqlite_master using a raw SQL builder to avoid polluting the
      // public FlexibleDatabase type with meta tables. We strongly type the
      // expected row shape instead of relying on 'any'.
      type SQLiteMasterRow = { name: string };
      // Using raw SQL through Kysely's sql template, then compiling explicitly.
      const rawQuery = sql<SQLiteMasterRow>`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`;
      const tablesResult = await rawQuery.execute(this.connection);
      const tableNames = tablesResult.rows.map(r => r.name);

      // Check required tables
      const requiredTables = [
        'products',
        'categories',
        'product_categories',
        'product_nutrition',
        'product_flags',
        'product_scores',
        'product_additives'
      ];

      const missingTables = requiredTables.filter(table => !tableNames.includes(table));
      if (missingTables.length > 0) {
        throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
      }

      // Check if search tables are available
      const hasSearchTables = tableNames.includes('product_search_terms');

      if (this.config.enableLogging) {
        console.log('[KyselyConnectionFactory] Schema validation passed');
        console.log(`  - Tables: ${tableNames.length}`);
        console.log(`  - Search enabled: ${hasSearchTables}`);
      }

    } catch (error) {
      throw new Error(
        `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Get a configured Kysely connection (convenience function)
 * @param config - Optional configuration
 * @returns Promise resolving to Kysely instance
 */
export async function getKyselyConnection(
  config?: Partial<KyselyConnectionConfig>
): Promise<Kysely<FlexibleDatabase>> {
  const factory = KyselyConnectionFactory.getInstance(config);
  return factory.getConnection();
}

/**
 * Check if database connection is ready
 * @returns True if connection is established
 */
export function isConnectionReady(): boolean {
  const factory = KyselyConnectionFactory.getInstance();
  return factory.isConnected();
}

/**
 * Close database connection and clean up
 */
export async function closeConnection(): Promise<void> {
  const factory = KyselyConnectionFactory.getInstance();
  await factory.close();
}

// =============================================================================
// CONNECTION HEALTH CHECK
// =============================================================================

/**
 * Perform a health check on the database connection
 * @returns Promise resolving to health check result
 */
export interface HealthCheckResult {
  isHealthy: boolean;
  connectionTime: number;
  tableCount: number;
  searchEnabled: boolean;
  error?: string;
}

/**
 * Check database connection health
 * @returns Health check result
 */
export async function checkConnectionHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const connection = await getKyselyConnection();

    // Test basic connectivity via sqlite_master (typed raw query)
    type SQLiteMasterRow = { name: string };
    const rawQuery = sql<SQLiteMasterRow>`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`;
    const tablesResult = await rawQuery.execute(connection);
    const tableNames = tablesResult.rows.map(r => r.name);
    const searchEnabled = tableNames.includes('product_search_terms');

    return {
      isHealthy: true,
      connectionTime: Date.now() - startTime,
      tableCount: tableNames.length,
      searchEnabled,
    };

  } catch (error) {
    return {
      isHealthy: false,
      connectionTime: Date.now() - startTime,
      tableCount: 0,
      searchEnabled: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Custom error class for connection-related errors
 */
export class KyselyConnectionError extends Error {
  readonly cause?: Error;
  readonly code?: string;
  constructor(message: string, cause?: Error, code?: string) {
    super(message);
    this.name = 'KyselyConnectionError';
    this.cause = cause;
    this.code = code;
  }
}

/**
 * Handle connection errors with appropriate context
 * @param error - Original error
 * @param context - Additional context information
 * @returns Wrapped connection error
 */
export function handleConnectionError(error: unknown, context: string): KyselyConnectionError {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new KyselyConnectionError(
    `Connection error in ${context}: ${message}`,
    error instanceof Error ? error : undefined
  );
}
/**
 * Base Repository Abstract Class
 * Feature: 020-migration-kysely
 *
 * Abstract base class providing common query patterns and functionality
 * for all repository implementations. Encapsulates Kysely connection management
 * and provides type-safe database operations.
 */

import type { Kysely, SelectQueryBuilder, OrderByDirectionExpression } from 'kysely';
import { sql } from 'kysely';
import type { FlexibleDatabase, QueryOptions, QueryResult } from '../kysely/database.js';
import { getKyselyConnection, KyselyConnectionError, handleConnectionError } from '../kysely/connection.js';

// =============================================================================
// BASE REPOSITORY INTERFACE
// =============================================================================

/**
 * Base repository interface defining common operations
 */
export interface IBaseRepository {
  /** Check if repository is available and functional */
  readonly isAvailable: boolean;
  /** Perform health check on repository */
  checkHealth(): Promise<boolean>;
}

// =============================================================================
// ABSTRACT BASE REPOSITORY
// =============================================================================

/**
 * Abstract base repository class with common query patterns
 * @template TTable - Table type for this repository
 * @template TKey - Primary key type (usually string)
 */
export abstract class BaseRepository implements IBaseRepository {
  protected connection: Kysely<FlexibleDatabase> | null = null;
  protected readonly tableName: string;
  protected isInitialized = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Check if repository is available
   */
  get isAvailable(): boolean {
    return this.isInitialized && this.connection !== null;
  }

  /**
   * Initialize the repository with database connection
   * @protected
   */
  protected async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Log initialization start
      this.logQuery('initialize', {
        operation: 'INIT',
        repositoryName: this.constructor.name,
        tableName: this.tableName
      });

      this.connection = await getKyselyConnection();
      this.isInitialized = true;

      // Log successful initialization
      this.logQuery('initialize completed', {
        repositoryName: this.constructor.name,
        tableName: this.tableName,
        isInitialized: this.isInitialized
      });
    } catch (error) {
      // Log initialization error
      this.logQuery('initialize failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        repositoryName: this.constructor.name,
        tableName: this.tableName
      });
      throw handleConnectionError(error, `${this.constructor.name} initialization`);
    }
  }

  /**
   * Get the database connection, initializing if necessary
   * @protected
   */
  protected async getConnection(): Promise<Kysely<FlexibleDatabase>> {
    if (!this.connection) {
      await this.initialize();
    }

    if (!this.connection) {
      throw new KyselyConnectionError(`No database connection available for ${this.constructor.name}`);
    }

    return this.connection;
  }

  /**
   * Perform health check on repository
   */
  async checkHealth(): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Log health check start
      this.logQuery('checkHealth', {
        operation: 'HEALTH_CHECK',
        tableName: this.tableName
      });

      const db = await this.getConnection();

      // Simple query to test connection - use raw SQL for table existence check
      type SQLiteMasterRow = { name: string };
      const result = await sql<SQLiteMasterRow>`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ${this.tableName} LIMIT 1`.
        execute(db);

      const queryTimeMs = Date.now() - startTime;
      const isHealthy = result.rows.length > 0;

      // Log health check completion
      this.logQuery('checkHealth completed', {
        isHealthy,
        tableExists: result.rows.length > 0,
        queryTimeMs
      });

      // Log performance for slow health checks
      this.logPerformance('checkHealth', queryTimeMs);

      return isHealthy;
    } catch (error) {
      const queryTimeMs = Date.now() - startTime;

      // Log health check error
      this.logQuery('checkHealth failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        queryTimeMs
      });

      console.warn(`Health check failed for ${this.constructor.name}:`, error);
      return false;
    }
  }

  // =============================================================================
  // COMMON QUERY PATTERNS
  // =============================================================================

  /**
   * Execute a timed query and return results with metadata
   * @protected
   */
  protected async executeWithTiming<T, TTable extends keyof FlexibleDatabase = keyof FlexibleDatabase>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, TTable, T>,
    metadata: {
      searchPerformed?: boolean;
      categoryHierarchyUsed?: boolean;
      multiDimensionalFiltering?: boolean;
      scoringContext?: string;
    } = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      // Log query execution start
      this.logQuery('executeWithTiming', {
        operation: 'SELECT',
        metadata,
        tableName: this.tableName
      });

      const data = await queryBuilder.execute();
      const queryTimeMs = Date.now() - startTime;

      // Log query performance
      this.logPerformance('executeWithTiming', queryTimeMs, data.length);

      // Log query completion
      this.logQuery('executeWithTiming completed', {
        resultCount: data.length,
        queryTimeMs,
        metadata
      });

      return {
        data,
        totalCount: data.length,
        queryTimeMs,
        metadata: {
          searchPerformed: false,
          categoryHierarchyUsed: false,
          multiDimensionalFiltering: false,
          ...metadata,
        },
      };
    } catch (error) {
      // Log query error
      this.logQuery('executeWithTiming failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        queryTimeMs: Date.now() - startTime,
        metadata
      });
      throw handleConnectionError(error, `Query execution in ${this.constructor.name}`);
    }
  }

  /**
   * Count total records matching query criteria
   * @protected
   */
  protected async countRecords<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow>
  ): Promise<number> {
    const startTime = Date.now();

    try {
      // Log count query start
      this.logQuery('countRecords', {
        operation: 'COUNT',
        tableName: this.tableName
      });

      const result = await queryBuilder.clearSelect()
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();

      const queryTimeMs = Date.now() - startTime;
      // Kysely returns count as string for SQLite; coerce safely
      const countVal = (result as unknown as { count?: string | number })?.count;
      const count = countVal === undefined ? 0 : Number(countVal);

      // Log count query completion
      this.logQuery('countRecords completed', {
        count,
        queryTimeMs
      });

      // Log performance for slow count queries
      this.logPerformance('countRecords', queryTimeMs);

      return count;
    } catch (error) {
      // Log count query error
      this.logQuery('countRecords failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        queryTimeMs: Date.now() - startTime
      });
      throw handleConnectionError(error, `Count query in ${this.constructor.name}`);
    }
  }

  /**
   * Apply pagination to query builder
   * @protected
   */
  protected applyPagination<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow>,
    options: QueryOptions
  ): SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow> {
    let query = queryBuilder;

    // Log pagination application
    this.logQuery('applyPagination', {
      limit: options.limit,
      offset: options.offset
    });

    if (options.limit !== undefined && options.limit > 0) {
      query = query.limit(options.limit);
    }

    if (options.offset !== undefined && options.offset > 0) {
      query = query.offset(options.offset);
    }

    return query;
  }

  /**
   * Apply sorting to query builder
   * @protected
   */
  protected applySorting<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow>,
    options: QueryOptions,
    validSortFields: string[] = []
  ): SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow> {
    if (!options.sortBy) return queryBuilder;

    // Log sorting application
    this.logQuery('applySorting', {
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      validFields: validSortFields
    });

    // Validate sort field if validation array is provided
    if (validSortFields.length > 0 && !validSortFields.includes(options.sortBy)) {
      const error = `Invalid sort field: ${options.sortBy}. Valid fields: ${validSortFields.join(', ')}`;
      this.logQuery('applySorting validation failed', { error });
      throw new Error(error);
    }

    const direction: OrderByDirectionExpression = options.sortOrder === 'desc' ? 'desc' : 'asc';
    // Use raw ordering expression to avoid over-constraining generic inference
  return queryBuilder.orderBy(sql.ref(options.sortBy), direction);
  }

  /**
   * Apply range filter to query builder
   * @protected
   */
  protected applyRangeFilter<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow>,
    field: string,
    range: { min?: number; max?: number }
  ): SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow> {
    // Log range filter application
    this.logQuery('applyRangeFilter', {
      field,
      min: range.min,
      max: range.max
    });

    let qb = queryBuilder;
    if (range.min !== undefined) {
      qb = qb.where(sql.ref(field), '>=', range.min);
    }
    if (range.max !== undefined) {
      qb = qb.where(sql.ref(field), '<=', range.max);
    }
    return qb;
  }

  /**
   * Apply IN filter to query builder
   * @protected
   */
  protected applyInFilter<TRow>(
    queryBuilder: SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow>,
    field: string,
    values: readonly (string | number)[]
  ): SelectQueryBuilder<FlexibleDatabase, keyof FlexibleDatabase, TRow> {
    // Log IN filter application
    this.logQuery('applyInFilter', {
      field,
      valueCount: values?.length || 0,
      values: values?.length <= 10 ? values : `${values?.length} values (truncated)`
    });

    if (!values || values.length === 0) return queryBuilder;
    return queryBuilder.where(sql.ref(field), 'in', values as unknown[]);
  }

  /**
   * Safe null handling for optional fields
   * @protected
   */
  protected handleNull<T>(value: T | null | undefined): T | null {
    return value === undefined ? null : value;
  }

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================

  /**
   * Handle repository-specific errors
   * @protected
   */
  protected handleError(error: unknown, operation: string): never {
    if (error instanceof KyselyConnectionError) {
      throw error;
    }

    throw handleConnectionError(error, `${operation} in ${this.constructor.name}`);
  }

  /**
   * Validate required parameters
   * @protected
   */
  protected validateRequired(value: unknown, paramName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${paramName} is required in ${this.constructor.name}`);
    }
  }

  /**
   * Validate parameter types
   * @protected
   */
  protected validateType(value: unknown, expectedType: string, paramName: string): void {
    if (typeof value !== expectedType) {
      throw new Error(
        `${paramName} must be of type ${expectedType}, got ${typeof value} in ${this.constructor.name}`
      );
    }
  }

  // =============================================================================
  // LOGGING AND DEBUGGING
  // =============================================================================

  /**
   * Log query information for debugging (optional)
   * @protected
   */
  protected logQuery(operation: string, params?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.constructor.name}] ${operation}`, params ? { params } : '');
    }
  }

  /**
   * Log performance information
   * @protected
   */
  protected logPerformance(operation: string, durationMs: number, recordCount?: number): void {
    if (process.env.NODE_ENV === 'development' && durationMs > 1000) {
      console.warn(
        `[${this.constructor.name}] Slow query detected: ${operation} took ${durationMs}ms` +
        (recordCount ? ` (${recordCount} records)` : '')
      );
    }
  }
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Common repository result types
 */
export type RepositoryResult<T> = T | null;
export type RepositoryResults<T> = T[];
export type RepositoryQueryResult<T> = QueryResult<T>;

/**
 * Repository error types
 */
export class RepositoryError extends Error {
  readonly repository: string;
  readonly operation: string;
  readonly cause?: Error;
  constructor(message: string, repository: string, operation: string, cause?: Error) {
    super(message);
    this.name = 'RepositoryError';
    this.repository = repository;
    this.operation = operation;
    this.cause = cause;
  }
}

/**
 * Repository validation error
 */
export class ValidationError extends RepositoryError {
  readonly field: string;
  constructor(message: string, repository: string, field: string, cause?: Error) {
    super(message, repository, 'validation', cause);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// =============================================================================
// REPOSITORY FACTORY HELPERS
// =============================================================================

/**
 * Repository configuration interface
 */
export interface RepositoryConfig {
  enableLogging?: boolean;
  queryTimeout?: number;
  cacheEnabled?: boolean;
}

/**
 * Default repository configuration
 */
export const DEFAULT_REPOSITORY_CONFIG: Required<RepositoryConfig> = {
  enableLogging: process.env.NODE_ENV === 'development',
  queryTimeout: 30000, // 30 seconds
  cacheEnabled: false,  // Caching disabled for read-only database
};
/**
 * Repository-Based Database Manager - DISABLED
 *
 * SQLite database functionality has been removed from this application.
 * This file provides stub implementations to prevent build errors.
 */

// Minimal wrapper types to preserve existing signatures
type SQLiteCompatibleType = number | string | Uint8Array | Array<number> | bigint | null;

const ERROR_MESSAGE = 'SQLite database functionality has been removed from this application';

/**
 * Get database instance (preserved for backward compatibility)
 * @returns Legacy database structure for compatibility
 */
export async function getDb() {
  throw new Error(ERROR_MESSAGE);
}

/**
 * Execute raw SQL query (DISABLED)
 * @param sql SQL query string
 * @param params Query parameters
 * @returns Query results
 */
export async function runQuery(sql: string, params: SQLiteCompatibleType[] = []) {
  throw new Error(ERROR_MESSAGE);
}

/**
 * Get ProductRepository instance for direct use (DISABLED)
 */
export async function getProductRepository() {
  throw new Error(ERROR_MESSAGE);
}

/**
 * Get CategoryRepository instance for direct use (DISABLED)
 */
export async function getCategoryRepository() {
  throw new Error(ERROR_MESSAGE);
}

/**
 * Get repository factory for advanced usage (DISABLED)
 */
export async function getRepositoryFactory() {
  throw new Error(ERROR_MESSAGE);
}

/**
 * Emergency raw SQL access (DISABLED)
 */
export async function executeRawSql(sql: string, params: SQLiteCompatibleType[] = []) {
  throw new Error(ERROR_MESSAGE);
}
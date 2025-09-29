// Database functionality has been removed
// This file provides stub implementations to prevent build errors

// Minimal wrapper types to preserve existing signatures
type SQLiteCompatibleType = number | string | Uint8Array | Array<number> | bigint | null;

export async function getDb() {
  throw new Error('SQLite database functionality has been removed from this application');
}

export async function runQuery(sql: string, params: SQLiteCompatibleType[] = []) {
  throw new Error('SQLite database functionality has been removed from this application');
}
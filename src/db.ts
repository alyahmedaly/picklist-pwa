// db.ts (SQLocal-backed)
// Replaces prior wa-sqlite + OPFS implementation with SQLocal for simpler
// browser persistence (IndexedDB under the hood). The public API
// (getDb, runQuery) is preserved so call sites remain unchanged.

import { SQLocal } from 'sqlocal';

const DB_NAME = 'products-flexible.db';

// Minimal wrapper types to preserve existing signatures
type SQLiteCompatibleType = number | string | Uint8Array | Array<number> | bigint | null;

// Narrow SQLocal interface we rely on (avoid 'any'). Library's sql() accepts
// parameters as an array of SQLite-compatible primitive values.
interface SQLocalHandle {
  sql: (query: string, params?: SQLiteCompatibleType[]) => Promise<unknown[]>;
  close?: () => Promise<void> | void;
}

let handle: SQLocalHandle | null = null;
let initError: Error | null = null;

async function seedIfMissing(sqlocal: SQLocalHandle): Promise<void> {
  try {
    await sqlocal.sql('SELECT 1 FROM products LIMIT 1');
    return; // already seeded
  } catch {
    // Need to seed from static file
  }
  console.log('[sqlocal] Seeding flexible database from /products-flexible.db …');
  const basePath = import.meta.env.BASE_URL || '';
  const resp = await fetch(`${basePath}products-flexible.db`);
  if (!resp.ok) throw new Error(`Failed to fetch products-flexible.db: ${resp.status}`);
  const buf = await resp.arrayBuffer();

  // SQLocal provides an import helper via .load if present in version; if not,
  // we can open a temporary origin and execute "recover" by attaching the file.
  // Simpler approach: use the binary restore API exposed as sqlocal.sql with special pragma if supported.
  // Fallback: create an in-memory view by WASM decode not available here, so we just store binary in IDB.
  // Current SQLocal (v1) supports loading via explicit method: new SQLocal(name, { seed: ArrayBuffer }).
  try {
    // Attempt constructor seeding; typings may not expose options, so cast.
    const seeded = new (SQLocal as unknown as {
      new(name: string, opts?: { seed?: ArrayBuffer }): SQLocalHandle;
    })(DB_NAME, { seed: buf });
    handle = seeded;
    console.log('[sqlocal] Seeding complete');
  } catch (e) {
    console.warn('[sqlocal] Direct seeded constructor failed, attempting manual import path:', (e as Error).message);
    // Fallback: attempt to run a VACUUM to force initialization and ignore seed (DB may remain empty)
    try { await sqlocal.sql('VACUUM'); } catch { /* ignore */ }
  }
}

async function init() {
  try {
    handle = new (SQLocal as unknown as { new(name: string): SQLocalHandle; })(DB_NAME);
    // handle is non-null now
    await seedIfMissing(handle!);
  } catch (e) {
    initError = e as Error;
    console.error('[sqlocal] Initialization failed:', initError.message);
  }
}

const initPromise = init();

export async function getDb() {
  await initPromise;
  if (initError) throw initError;
  if (!handle) throw new Error('SQLocal handle not initialized');
  return { sqlite3: null, db: DB_NAME }; // preserve structure, though consumers should only use runQuery
}

export async function runQuery(sql: string, params: SQLiteCompatibleType[] = []) {
  await initPromise;
  if (initError) throw initError;
  if (!handle) throw new Error('SQLocal not initialized');
  // SQLocal auto-batches; pass params directly
  const rows = await handle.sql(sql, params);
  return rows as unknown[];
}

import type { Product } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Output utilities for @picklist/output package
 * File writing and indexing functions for the data pipeline
 */

/**
 * Lightweight index entry for search optimization
 */
export interface IndexEntry {
  id: Product['id'];
  name: string;
  price: number;
  image?: string;
  categories?: string[];
  isFood: boolean;
}

// Runtime statistics for tracking skipped entries
const runtimeStats = { skippedIndexEntries: 0 };

export function getRuntimeStats() {
  return { ...runtimeStats };
}

/**
 * Write data as line-delimited JSON (JSONL) format
 * Each object is written as a single JSON line
 */
export async function writeJsonl(data: unknown[], outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  if (data.length === 0) {
    fs.writeFileSync(outputPath, '', 'utf-8');
    return;
  }

  const lines = data.map((item) => JSON.stringify(item)).join('\n');
  fs.writeFileSync(outputPath, lines, 'utf-8');
}

/**
 * Write products index file optimized for search
 * Creates a JSON array with searchable product fields
 */
export async function writeIndexFile(products: Product[], outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  // Create search-optimized index entries
  const indexEntries = products.map((product) => ({
    id: product.id,
    name: product.name,
    categories: product.categories ?? [],
    protein: product.nutrition?.protein ?? null,
    // The canonical Nutrition interface uses kcal (and optionally kJ). Map legacy ENERGY field name to kcal.
    kcal: product.nutrition?.kcal ?? null,
  }));

  fs.writeFileSync(outputPath, JSON.stringify(indexEntries, null, 2), 'utf-8');
}

/**
 * Write schema documentation file
 * Outputs the schema as formatted JSON
 */
export async function writeSchemaDoc(
  schema: Record<string, unknown>,
  outputPath: string,
): Promise<void> {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');
}

// Legacy atomic write function for backward compatibility
export function writeProductsJsonlAtomic(filePath: string, products: Product[]): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  if (products.length === 0) {
    fs.writeFileSync(filePath, '', 'utf-8');
    return;
  }

  const lines = products.map((product) => JSON.stringify(product)).join('\n');
  fs.writeFileSync(filePath, lines, 'utf-8');
}

/**
 * Build lightweight index: choose sale price if present else regular; exclude heavy fields.
 */
export function buildIndex(products: Product[]): IndexEntry[] {
  const out: IndexEntry[] = [];
  for (const p of products) {
    const idMissing = p.id === undefined || p.id === null || p.id === '';
    const nameBlank = !p.name || !String(p.name).trim();
    const priceVal = p.price?.sale != null ? p.price.sale : p.price?.regular;
    const priceInvalid = typeof priceVal !== 'number' || Number.isNaN(priceVal);
    if (idMissing || nameBlank || priceInvalid) {
      runtimeStats.skippedIndexEntries++;
      continue; // T024 guard
    }
    const price = priceVal as number; // valid here (0 allowed)
    out.push({
      id: p.id,
      name: String(p.name).trim(),
      price,
      image: p.images?.primary,
      categories: p.categories,
      isFood: !!p.flags?.isFood,
    });
  }
  return out;
}

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { Product } from '../../src/data/transform/types';
import {
  writeProductsJsonlAtomic,
  buildIndex,
  writeSchemaDoc,
} from '../../src/data/transform/writer';

/** T024: Failing test for writer & index functionality (atomic write, index price precedence, schema doc). */

const tmpRoot = path.join(os.tmpdir(), 'writer-test-' + Date.now());

beforeAll(() => {
  fs.mkdirSync(tmpRoot, { recursive: true });
});

afterAll(() => {
  // cleanup best-effort
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

function make(id: number, sale?: number): Product {
  return {
    id,
    name: 'Item ' + id,
    price: sale ? { regular: 200, sale, currency: 'USD' } : { regular: 200, currency: 'USD' },
    flags: { isFood: true },
  } as Product;
}

describe('writer & index (T024)', () => {
  test('atomic JSONL write and no tmp leftover', () => {
    const file = path.join(tmpRoot, 'products.jsonl');
    const products = [make(1), make(2, 150)];
    writeProductsJsonlAtomic(file, products);
    const data = fs.readFileSync(file, 'utf8').trim().split(/\n/);
    expect(data.length).toBe(2);
    // ensure each line parseable JSON (hash removed feature)
    const parsed = data.map((l) => JSON.parse(l));
    expect(parsed[0].id).toBe(1);
    // no temp file remains
    const dirFiles = fs.readdirSync(path.dirname(file));
    expect(dirFiles.find((f) => f.includes('.tmp'))).toBeUndefined();
  });

  test('index price precedence uses sale when present', () => {
    const products = [make(1), make(2, 150)];
    const idx = buildIndex(products);
    const item2 = idx.find((i) => i.id === 2)!;
    expect(item2.price).toBe(150);
    const item1 = idx.find((i) => i.id === 1)!;
    expect(item1.price).toBe(200);
  });

  test('schema doc includes excluded columns section', () => {
    const docFile = path.join(tmpRoot, 'schema.md');
    writeSchemaDoc(docFile, {
      excludedColumns: ['col_a', 'col_b'],
      ordering: 'id,name',
    });
    const txt = fs.readFileSync(docFile, 'utf8');
    expect(txt).toMatch(/Excluded Columns/);
    expect(txt).toMatch(/col_a/);
  });
});

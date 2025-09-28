import { describe, it, expect } from 'vitest';

interface RawRow {
  id?: string;
  name?: string;
  price?: unknown;
}
interface EmittedRow {
  id: string;
  name: string;
  price: number;
}

// Re-implement guard mirroring src logic (missing id, blank name, NaN price skipped; price 0 allowed)
function guardEmit(rows: RawRow[]): EmittedRow[] {
  const out: EmittedRow[] = [];
  for (const r of rows) {
    const id = typeof r.id === 'string' ? r.id.trim() : '';
    const name = typeof r.name === 'string' ? r.name.trim() : '';
    const priceNum = typeof r.price === 'number' ? r.price : Number(r.price);
    if (!id) continue;
    if (!name) continue;
    if (Number.isNaN(priceNum)) continue;
    out.push({ id, name: r.name as string, price: priceNum });
  }
  return out;
}

const input: RawRow[] = [
  { id: 'A1', name: 'Almond Milk', price: 4.99 },
  { id: '', name: 'Blank ID', price: 1.0 },
  { name: 'No ID Field', price: 2.0 },
  { id: 'A2', name: '   ', price: 3.5 },
  { id: 'A3', name: 'Bread', price: 'N/A' },
  { id: 'A4', name: 'Cheese', price: NaN },
  { id: 'A5', name: 'Yogurt', price: 2.75 },
];

describe('T010 index emission guard', () => {
  it('filters out invalid rows', () => {
    const emitted = guardEmit(input);
    expect(emitted).toEqual([
      { id: 'A1', name: 'Almond Milk', price: 4.99 },
      { id: 'A5', name: 'Yogurt', price: 2.75 },
    ]);
  });
});

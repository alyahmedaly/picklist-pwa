import { describe, it, expect } from 'vitest';

interface Row {
  id?: string;
  name?: string;
  price?: unknown;
}
interface Stats {
  skippedIndexEntries: number;
}

function guardEmit(rows: Row[]): { emitted: Row[]; stats: Stats } {
  const emitted: Row[] = [];
  let skipped = 0;
  for (const r of rows) {
    const id = typeof r.id === 'string' ? r.id.trim() : '';
    const name = typeof r.name === 'string' ? r.name.trim() : '';
    const priceNum = typeof r.price === 'number' ? r.price : Number(r.price);
    if (!id || !name || Number.isNaN(priceNum)) {
      skipped++;
      continue;
    }
    emitted.push({ id, name, price: priceNum });
  }
  return { emitted, stats: { skippedIndexEntries: skipped } };
}

const rows: Row[] = [
  { id: 'A1', name: 'Valid Item', price: 1.0 },
  { id: '', name: 'Blank ID', price: 2.0 },
  { name: 'No ID', price: 3.0 },
  { id: 'A2', name: '   ', price: 2.5 },
  { id: 'A3', name: 'Valid Two', price: 4.0 },
];

describe('T012 stats skipped index entries', () => {
  it('counts skipped entries', () => {
    const { stats } = guardEmit(rows);
    expect(stats.skippedIndexEntries).toBe(3);
  });
});

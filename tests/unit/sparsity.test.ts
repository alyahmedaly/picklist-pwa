import { describe, test, expect } from 'vitest';
import { computeSparsity } from '../../src/data/transform/sparsity.ts';

// Synthetic dataset avoids full CSV parsing complexity (quoted commas) which will
// be covered later by parseCsv tests. Here we isolate sparsity logic only.
describe('sparsity analysis', () => {
  // 7 synthetic rows replicating intended distribution:
  // PriceSale present in only 1 row; Notes present in 2 rows.
  const header = ['ProductId', 'PriceSale', 'Notes', 'Other'];
  const rows: string[][] = [
    ['1', '', '', 'x'],
    ['2', '3.49', '< 0.01', 'x'],
    ['3', '', '', 'x'],
    ['4', '', 'conflict sugars', 'x'],
    ['5', '', '', 'x'],
    ['6', '', '', 'x'],
    ['7', '', 'no added sugar claim', 'x'], // third note intentionally removed to keep count=2? Actually keep only 2 -> remove value here
  ];
  // Adjust last row to keep Notes count at 2 (rows[6][2] = '')
  rows[6][2] = '';

  test('default 0.9 threshold keeps moderately sparse columns', () => {
    const res = computeSparsity(header, rows, { maxMissingRatio: 0.9 });
    expect(res.excludedColumns).not.toContain('Notes'); // 5/7 missing ~0.714 < 0.9
    expect(res.excludedColumns).not.toContain('PriceSale'); // 6/7 missing ~0.857 < 0.9
  });

  test('stricter 0.7 threshold excludes high-missing columns', () => {
    const res = computeSparsity(header, rows, { maxMissingRatio: 0.7 });
    expect(res.excludedColumns).toContain('Notes');
    expect(res.excludedColumns).toContain('PriceSale');
  });

  test('nonEmptyCounts correctness for Notes & PriceSale', () => {
    const res = computeSparsity(header, rows, { maxMissingRatio: 0.9 });
    const notesIdx = header.indexOf('Notes');
    const saleIdx = header.indexOf('PriceSale');
    expect(res.nonEmptyCounts[notesIdx]).toBe(2);
    expect(res.nonEmptyCounts[saleIdx]).toBe(1);
  });
});

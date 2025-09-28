import { describe, test, expect } from 'vitest';
import { createStatsAccumulator } from '../../src/data/transform/stats';

/** T022: Failing stats test (accumulators, null rate ordering, drift codes) */

describe('stats accumulator (T022)', () => {
  test('counts and null rate ordering, drift placeholder', () => {
    const acc = createStatsAccumulator({ trackNullRates: true });

    acc.noteExcludedColumns(['col_x', 'col_y']);

    acc.ingestRow({ id: 1, a: 1, b: null, c: 'x' });
    acc.ingestRow({ id: 2, a: null, b: null, c: 'y' });
    acc.ingestRow({ id: 3, a: 5, b: 2, c: null });

    acc.recordMergedDuplicate();

    const summary = acc.finalize({
      baseline: { nullRates: { a: 0.2, b: 0.5, c: 0.1 } },
    });

    expect(summary.totalRows).toBe(3);
    expect(summary.mergedDuplicates).toBe(1);
    expect(summary.excludedColumns).toEqual(['col_x', 'col_y']);

    // Null rates we inserted: a nulls=1/3, b nulls=2/3, c nulls=1/3 -> ordering should be b first, then a/c (stable tie by key asc)
    expect(summary.nullRates[0].key).toBe('b');
    // ensure sorted descending by rate
    expect(summary.nullRates[0].rate).toBeGreaterThanOrEqual(summary.nullRates[1].rate);

    // Drift codes placeholder (implementation will compare vs baseline and produce codes)
    expect(Array.isArray(summary.driftCodes)).toBe(true);
  });
});

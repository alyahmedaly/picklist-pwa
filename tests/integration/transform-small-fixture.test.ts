import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// We will import runTransform once CLI implemented. For now expect failure if missing.
// The integration test asserts end-to-end deterministic behavior on small fixture.

let workDir: string;

function readLines(productsPath: string): string[] {
  const raw = readFileSync(productsPath, 'utf8').trim();
  if (!raw) return [];
  return raw.split('\n');
}

describe('T026 integration – CLI small fixture', () => {
  beforeAll(() => {
    workDir = mkdtempSync(join(tmpdir(), 'transform-int-'));
  });
  afterAll(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  test('end-to-end run produces deterministic artifacts', async () => {
    // Dynamic import to allow this test to fail before implementation.
    type RunTransform = (args: {
      input: string;
      outDir: string;
      log?: 'human' | 'json';
    }) => Promise<unknown>;
    let runTransform: RunTransform | undefined;
    try {
      // Expect this path to exist after implementing CLI.
      // It should export runTransform({ input, outDir, logMode?: 'json'|'human' })
      // returning stats summary.
      // Using relative path to src.
      const mod = await import('../../src/scripts/transform-data.ts');
      runTransform = mod.runTransform as RunTransform;
    } catch (e) {
      // Force failure signalling implementation missing.
      expect(e).toBeUndefined();
    }

    const input = 'tests/fixtures/sample-small.csv';

    const firstOut = join(workDir, 'run1');
    const secondOut = join(workDir, 'run2');

    // create output dirs lazily inside runTransform or ensure existence here
    if (!runTransform) throw new Error('runTransform not loaded');
    const stats1 = await runTransform({
      input,
      outDir: firstOut,
      log: 'human',
    });
    const stats2 = await runTransform({
      input,
      outDir: secondOut,
      log: 'human',
    });

    const expectedFiles = ['products.jsonl', 'products-index.json', 'stats.json', 'schema.md'];
    for (const dir of [firstOut, secondOut]) {
      for (const f of expectedFiles) {
        const p = join(dir, f);
        const st = statSync(p);
        expect(st.size).toBeGreaterThan(0); // file exists & has content
      }
    }

    // Determinism: entire products.jsonl identical across runs (hash feature removed)
    const lines1 = readLines(join(firstOut, 'products.jsonl'));
    const lines2 = readLines(join(secondOut, 'products.jsonl'));
    expect(lines1.length).toBeGreaterThan(0);
    expect(lines2).toEqual(lines1);

    // minimal stats shape assertions
    interface StatsShape {
      totalRows: number;
      mergedDuplicates: number;
      nullRates: unknown[];
    }
    const s1 = stats1 as StatsShape;
    const s2 = stats2 as StatsShape;
    expect(s1).toHaveProperty('totalRows');
    expect(s1).toHaveProperty('mergedDuplicates');
    expect(s1).toHaveProperty('nullRates');
    expect(Array.isArray(s1.nullRates)).toBe(true);
    expect(s2.totalRows).toEqual(s1.totalRows);
  });
});

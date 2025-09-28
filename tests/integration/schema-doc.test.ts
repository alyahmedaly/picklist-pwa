import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { runTransform } from '../../src/scripts/transform-data.ts';

describe('schema.md determinism', () => {
  test('schema doc sections and identical content', async () => {
    const base = mkdtempSync(join(tmpdir(), 'schema-test-'));
    const first = join(base, 'run1');
    const second = join(base, 'run2');
    await runTransform({
      input: 'tests/fixtures/sample-small.csv',
      outDir: first,
      log: 'human',
    });
    await runTransform({
      input: 'tests/fixtures/sample-small.csv',
      outDir: second,
      log: 'human',
    });
    const schema1Path = join(first, 'schema.md');
    const schema2Path = join(second, 'schema.md');
    expect(existsSync(schema1Path)).toBe(true);
    expect(existsSync(schema2Path)).toBe(true);
    const a = readFileSync(schema1Path, 'utf8');
    const b = readFileSync(schema2Path, 'utf8');
    expect(a).toContain('## Excluded Columns');
    expect(a).toContain('## Ordering');
    expect(b).toContain('## Excluded Columns');
    expect(b).toContain('## Ordering');
    expect(a).toBe(b);
    rmSync(base, { recursive: true, force: true });
  });
});

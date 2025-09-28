import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function readReadme(): string {
  const p = path.join(process.cwd(), 'README.md');
  return fs.readFileSync(p, 'utf8');
}

describe('T013 schema doc hygiene section', () => {
  it('contains Hygiene Features section with required bullet points', () => {
    const md = readReadme();
    // Section header updated after hash removal refactor
    expect(/#+\s+Hygiene Features/i.test(md)).toBe(true);
    // Core bullet anchors still documented
    expect(md).toMatch(/Placeholder Ingredient Filtering/i);
    expect(md).toMatch(/Allergen Normalization/i);
    // Omission normalization was removed; README notes its prior existence. Ensure note present.
    expect(md).toMatch(/removed alongside hashing/i);
  });
});

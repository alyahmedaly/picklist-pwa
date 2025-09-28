import { describe, test, expect } from 'vitest';
import { NAME_TO_ENUMBER_MAP } from '../src/product/parse/additive/eNumberDatabase.ts';

describe('NAME_TO_ENUMBER_MAP critical aliases', () => {
  test('contains gistextract -> E621', () => {
    expect(NAME_TO_ENUMBER_MAP.get('gistextract')).toBe('E621');
  });

  test('contains pektine/pectine -> E440', () => {
    expect(NAME_TO_ENUMBER_MAP.get('pectine')).toBe('E440');
    expect(NAME_TO_ENUMBER_MAP.get('pektine')).toBe('E440');
  });
});

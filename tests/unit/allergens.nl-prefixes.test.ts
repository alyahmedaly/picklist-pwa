import { describe, test, expect } from 'vitest';
import { parseAllergens } from '../../src/data/transform/parseAllergens.ts';

/** T010: Failing unit test for Dutch allergen prefixes */

describe('T010 Dutch allergen prefixes', () => {
  test('BEVAT: maps to contains array', () => {
    const result = parseAllergens('BEVAT: MELK, TARWE');
    expect(result.contains).toContain('milk'); // will fail until Dutch mapping implemented
    expect(result.contains).toContain('wheat'); // will fail until Dutch mapping implemented
    expect(result.mayContain).toEqual([]);
  });

  test('KAN SPOREN BEVATTEN VAN maps to mayContain array', () => {
    const result = parseAllergens('KAN SPOREN BEVATTEN VAN EI EN NOTEN');
    expect(result.mayContain).toContain('egg'); // will fail until Dutch mapping implemented
    expect(result.mayContain).toContain('tree nuts'); // will fail until Dutch mapping implemented
    expect(result.contains).toEqual([]);
  });

  test('mixed Dutch prefixes work correctly', () => {
    const result = parseAllergens('BEVAT: MELK, SOJA. KAN SPOREN BEVATTEN VAN NOTEN.');
    expect(result.contains).toContain('milk'); // will fail until implemented
    expect(result.contains).toContain('soy'); // will fail until implemented
    expect(result.mayContain).toContain('tree nuts'); // will fail until implemented
  });

  test('case insensitive Dutch prefixes', () => {
    const result = parseAllergens('Bevat: melk. Kan bevatten: sesam');
    expect(result.contains).toContain('milk'); // will fail until implemented
    expect(result.mayContain).toContain('sesame'); // will fail until implemented
  });
});

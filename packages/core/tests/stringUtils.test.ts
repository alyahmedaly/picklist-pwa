/**
 * Unit tests for string utilities from @picklist/core
 * Testing normalizeText, removePlaceholders, splitAndTrim, sanitizeForFilename functions
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  removePlaceholders,
  splitAndTrim,
  sanitizeForFilename,
} from '@picklist/core';

describe('normalizeText', () => {
  it('should trim whitespace and convert to lowercase', () => {
    expect(normalizeText('  Hello World  ')).toBe('hello world');
    expect(normalizeText('UPPERCASE')).toBe('uppercase');
    expect(normalizeText('  MiXeD CaSe  ')).toBe('mixed case');
  });

  it('should handle empty strings', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText('   ')).toBe('');
  });

  it('should handle special characters', () => {
    expect(normalizeText('  Café & Résumé  ')).toBe('café & résumé');
    expect(normalizeText('  123-456_789  ')).toBe('123-456_789');
  });
});

describe('removePlaceholders', () => {
  it('should remove common placeholder values', () => {
    expect(removePlaceholders('NA')).toBe('');
    expect(removePlaceholders('n/a')).toBe('');
    expect(removePlaceholders('N/A')).toBe('');
    expect(removePlaceholders('null')).toBe('');
    expect(removePlaceholders('undefined')).toBe('');
    expect(removePlaceholders('-')).toBe('');
    expect(removePlaceholders('')).toBe('');
  });

  it('should preserve valid content', () => {
    expect(removePlaceholders('Valid Content')).toBe('Valid Content');
    expect(removePlaceholders('  Valid Content  ')).toBe('Valid Content');
    expect(removePlaceholders('123')).toBe('123');
  });

  it('should handle whitespace variations', () => {
    expect(removePlaceholders('  NA  ')).toBe('');
    expect(removePlaceholders('\tN/A\n')).toBe('');
    expect(removePlaceholders(' null ')).toBe('');
  });

  it('should handle edge cases', () => {
    expect(removePlaceholders('0')).toBe('0'); // Zero is valid, not a placeholder
    expect(removePlaceholders('false')).toBe('false'); // Boolean string is valid
    expect(removePlaceholders('NaN')).toBe('NaN'); // NaN string is valid content
  });
});

describe('splitAndTrim', () => {
  it('should split by delimiter and trim elements', () => {
    expect(splitAndTrim('apple, banana, cherry', ',')).toEqual(['apple', 'banana', 'cherry']);
    expect(splitAndTrim('  apple  ,  banana  ,  cherry  ', ',')).toEqual([
      'apple',
      'banana',
      'cherry',
    ]);
  });

  it('should handle different delimiters', () => {
    expect(splitAndTrim('apple|banana|cherry', '|')).toEqual(['apple', 'banana', 'cherry']);
    expect(splitAndTrim('apple; banana; cherry', ';')).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should filter out empty elements', () => {
    expect(splitAndTrim('apple,, banana,, cherry', ',')).toEqual(['apple', 'banana', 'cherry']);
    expect(splitAndTrim('apple,   , banana', ',')).toEqual(['apple', 'banana']);
  });

  it('should handle empty or whitespace-only input', () => {
    expect(splitAndTrim('', ',')).toEqual([]);
    expect(splitAndTrim('   ', ',')).toEqual([]);
    expect(splitAndTrim(',,,', ',')).toEqual([]);
  });

  it('should handle single element', () => {
    expect(splitAndTrim('single', ',')).toEqual(['single']);
    expect(splitAndTrim('  single  ', ',')).toEqual(['single']);
  });
});

describe('sanitizeForFilename', () => {
  it('should remove invalid filename characters', () => {
    expect(sanitizeForFilename('file<>:"/\\|?*name')).toBe('filename');
    expect(sanitizeForFilename('document:version')).toBe('documentversion');
  });

  it('should replace spaces with hyphens', () => {
    expect(sanitizeForFilename('My Document Name')).toBe('my-document-name');
    expect(sanitizeForFilename('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('should collapse multiple hyphens', () => {
    expect(sanitizeForFilename('file---name')).toBe('file-name');
    expect(sanitizeForFilename('multiple----hyphens')).toBe('multiple-hyphens');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(sanitizeForFilename('-filename-')).toBe('filename');
    expect(sanitizeForFilename('---filename---')).toBe('filename');
  });

  it('should convert to lowercase', () => {
    expect(sanitizeForFilename('UPPERCASE')).toBe('uppercase');
    expect(sanitizeForFilename('MiXeD CaSe')).toBe('mixed-case');
  });

  it('should handle complex filenames', () => {
    expect(sanitizeForFilename('Product Data: 2024/Q1 (Version 1.0)')).toBe(
      'product-data-2024q1-(version-1.0)',
    );
    expect(sanitizeForFilename('  Report <Final> | "Best Version"  ')).toBe(
      'report-final-best-version',
    );
  });

  it('should handle edge cases', () => {
    expect(sanitizeForFilename('')).toBe('');
    expect(sanitizeForFilename('---')).toBe('');
    expect(sanitizeForFilename('   ')).toBe('');
    expect(sanitizeForFilename('a')).toBe('a');
  });
});

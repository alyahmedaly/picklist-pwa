import { readCSV, createRows } from '../parser.ts';
import { csvRowToRecord } from '../legacy.ts';
import type { NEVOEntry, NEVODatabase } from '@picklist/types';

/**
 * NEVO CSV Parser - Processes Dutch national nutrition database
 *
 * Converts NEVO2023_8.0.csv into structured TypeScript data with proper type conversion
 * and indexing for fast ingredient lookup and GI calculation.
 */

interface NEVORawData {
  'NEVO-code': string;
  'Voedingsmiddelnaam/Dutch food name': string;
  'Engelse naam/Food name': string;
  Voedingsmiddelgroep: string;
  'Food group': string;
  Synoniem: string;
  'CHO (g)': string;
  'SUGAR (g)': string;
  'STARCH (g)': string;
  'FIBT (g)': string;
  'ENERCC (kcal)': string;
  'PROT (g)': string;
  'FAT (g)': string;
}

/**
 * Parse NEVO CSV data into structured NEVOEntry objects
 */
export function parseNEVOData(csvText: string): NEVODatabase {
  console.log('🔍 Parsing NEVO database...');

  // Use existing parser infrastructure with pipe separator
  const parsed = readCSV(csvText, { separator: '|' });
  const rows = createRows(parsed.headers, parsed.matrix);

  // Convert to records for processing
  const records = rows.map((row) => csvRowToRecord(row));

  const entries: NEVOEntry[] = [];
  let skipped = 0;

  for (const record of records) {
    const raw = record as unknown as NEVORawData;

    // Skip entries missing essential data
    if (!raw['NEVO-code'] || !raw['Voedingsmiddelnaam/Dutch food name']) {
      skipped++;
      continue;
    }

    // Parse synonyms (semicolon separated)
    const synonyms = raw['Synoniem']
      ? raw['Synoniem']
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Convert nutritional values with safe parsing
    const entry: NEVOEntry = {
      code: raw['NEVO-code'],
      dutchName: raw['Voedingsmiddelnaam/Dutch food name'],
      englishName: raw['Engelse naam/Food name'] || '',
      foodGroup: raw['Voedingsmiddelgroep'] || '',
      foodGroupEn: raw['Food group'] || '',
      synonyms,

      // Nutritional data (per 100g)
      carbs: parseFloat(raw['CHO (g)']) || 0,
      sugars: parseFloat(raw['SUGAR (g)']) || 0,
      starch: parseFloat(raw['STARCH (g)']) || 0,
      fiber: parseFloat(raw['FIBT (g)']) || 0,
      calories: parseFloat(raw['ENERCC (kcal)']) || 0,
      protein: parseFloat(raw['PROT (g)']) || 0,
      fat: parseFloat(raw['FAT (g)']) || 0,
    };

    // Only include entries with some nutritional data
    if (entry.carbs > 0 || entry.protein > 0 || entry.fat > 0 || entry.calories > 0) {
      entries.push(entry);
    } else {
      skipped++;
    }
  }

  console.log(`✅ Parsed ${entries.length} NEVO entries (skipped ${skipped})`);

  // Build search indexes
  const nameIndex = buildNameIndex(entries);
  const groupIndex = buildGroupIndex(entries);

  return {
    entries,
    nameIndex,
    groupIndex,
    metadata: {
      version: 'NEVO2023_v8.0',
      totalEntries: entries.length,
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Build name-based search index for fast ingredient lookup
 */
function buildNameIndex(entries: NEVOEntry[]): Map<string, NEVOEntry[]> {
  const index = new Map<string, NEVOEntry[]>();

  for (const entry of entries) {
    const searchTerms = [entry.dutchName, entry.englishName, ...entry.synonyms].filter(Boolean);

    for (const term of searchTerms) {
      const normalized = normalizeForSearch(term);
      if (!index.has(normalized)) {
        index.set(normalized, []);
      }
      index.get(normalized)!.push(entry);
    }
  }

  return index;
}

/**
 * Build food group index for category-based estimation
 */
function buildGroupIndex(entries: NEVOEntry[]): Map<string, NEVOEntry[]> {
  const index = new Map<string, NEVOEntry[]>();

  for (const entry of entries) {
    const groups = [entry.foodGroup, entry.foodGroupEn].filter(Boolean);

    for (const group of groups) {
      const normalized = normalizeForSearch(group);
      if (!index.has(normalized)) {
        index.set(normalized, []);
      }
      index.get(normalized)!.push(entry);
    }
  }

  return index;
}

/**
 * Normalize text for search matching (lowercase, remove punctuation)
 */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Load NEVO database from CSV file
 */
export async function loadNEVODatabase(csvPath: string): Promise<NEVODatabase> {
  const fs = await import('fs/promises');
  const csvText = await fs.readFile(csvPath, 'utf-8');
  return parseNEVOData(csvText);
}

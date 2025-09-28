import type { FilteredProduct, FilterStatistics, OutputConfig } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'path';
import { generateFilterIndex } from './generateFilterIndex.ts';
import { writeProductsJsonlAtomic } from './writer.ts';

/**
 * Generates a single filtered output file with grouped directory structure.
 * Creates files in filtered/ali/ subdirectory without redundant prefixes.
 *
 * @param filterName - Name for the output files (e.g., 'daily-protein')
 * @param products - Filtered products
 * @param statistics - Filter statistics using existing type
 * @param config - Output configuration
 * @returns Generated file paths
 *
 * @example
 * ```typescript
 * const filePaths = await generateFilteredOutput(
 *   'daily-protein',
 *   filteredProducts,
 *   statistics,
 *   { outputDir: './out', generateIndex: true, generateStats: true, format: 'standard' }
 * );
 * // Creates: out/filtered/ali/daily-protein.jsonl
 * ```
 */


export async function generateFilteredOutput(
  filterName: string,
  products: FilteredProduct[],
  statistics: FilterStatistics,
  config: OutputConfig
): Promise<{
  jsonlPath: string;
  indexPath?: string;
  statsPath?: string;
}> {
  // Create grouped directory structure: filtered/ali/
  const filteredDir = path.join(config.outputDir, 'filtered', 'ali');
  fs.mkdirSync(filteredDir, { recursive: true });

  // Remove redundant prefixes since files are now in dedicated directory
  const baseName = filterName; // e.g., 'daily-protein' instead of 'filtered-ali-daily-protein'
  const jsonlPath = path.join(filteredDir, `${baseName}.jsonl`);

  // Write main JSONL file
  writeProductsJsonlAtomic(jsonlPath, products);

  const result: { jsonlPath: string; indexPath?: string; statsPath?: string; } = {
    jsonlPath,
  };

  // Generate index file if requested
  if (config.generateIndex) {
    const indexPath = path.join(filteredDir, `${baseName}-index.json`);
    const indexData = generateFilterIndex(products);

    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    result.indexPath = indexPath;
  }

  // Generate stats file if requested
  if (config.generateStats) {
    const statsPath = path.join(filteredDir, `${baseName}-stats.json`);

    fs.writeFileSync(statsPath, JSON.stringify(statistics, null, 2));
    result.statsPath = statsPath;
  }

  return result;
}

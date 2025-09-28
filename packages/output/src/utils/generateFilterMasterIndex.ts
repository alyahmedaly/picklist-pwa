import type { FilterOutput, FilterMasterIndex } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'path';
import { generateFilterDescription } from './generateFilterDescription.ts';
import { formatFilterDisplayName } from './formatFilterDisplayName.ts';

/**
 * Generates master filter index for discovering all available filtered outputs.
 * Creates overview at filtered/index.json with metadata about all filter types.
 *
 * @param filterOutputs - Array of generated filter outputs
 * @param baseFilterDir - Base filtered output directory
 * @returns Master filter index
 */


export function generateFilterMasterIndex(
  filterOutputs: FilterOutput[],
  baseFilterDir: string
): FilterMasterIndex {
  const filters = filterOutputs.map(output => {
    const displayName = formatFilterDisplayName(output.filterName);
    const description = generateFilterDescription(output.filterName, output.statistics);
    const coveragePercentage = output.statistics.originalCount > 0
      ? (output.statistics.filteredCount / output.statistics.originalCount) * 100
      : 0;

    return {
      name: output.filterName,
      displayName,
      description,
      productCount: output.statistics.filteredCount,
      coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      filePath: `ali/${output.filterName}.jsonl`,
      indexPath: `ali/${output.filterName}-index.json`,
      statsPath: `ali/${output.filterName}-stats.json`,
    };
  }).sort((a, b) => b.productCount - a.productCount);

  const totalUniqueProducts = new Set(
    filterOutputs.flatMap(output => output.products.map(p => p.id))
  ).size;

  const masterIndex: FilterMasterIndex = {
    filters,
    metadata: {
      totalFilters: filters.length,
      totalUniqueProducts,
      version: '1.0.0',
    },
  };

  // Write master index file
  const indexPath = path.join(baseFilterDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(masterIndex, null, 2));

  return masterIndex;
}

import { createFilter } from '@picklist/filter';
import type { Product, FilterCombination, OutputConfig, FilterOutput } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'path';
import { generateFilterMasterIndex } from './generateFilterMasterIndex.ts';
import { createFilterStatistics } from './createFilterStatistics.ts';
import { generateFilteredOutput } from './generateFilteredOutput.ts';

/**
 * Generates multiple filtered output files based on predefined combinations.
 *
 * @param products - Source products with scoring data
 * @param combinations - Filter combinations to generate
 * @param config - Output configuration
 * @returns Array of generated FilterOutput objects
 *
 * @example
 * ```typescript
 * const combinations = [
 *   { name: 'halal-protein', criteria: { halal: { strict: true }, protein: { minProteinPer100g: 20, targetDailyAmount: 170 } } },
 *   { name: 'halal-postworkout', criteria: { halal: { strict: true }, postWorkout: { minCarbProteinRatio: 2.0, maxCarbProteinRatio: 4.0, preferHighGI: true, recoveryWindow: 'immediate' } } }
 * ];
 *
 * const outputs = await generateMultipleOutputs(products, combinations, {
 *   outputDir: './out',
 *   generateIndex: true,
 *   generateStats: true,
 *   format: 'standard'
 * });
 * ```
 */


export async function generateMultipleOutputs(
  products: Product[],
  combinations: FilterCombination[],
  config: OutputConfig
): Promise<FilterOutput[]> {
  // Input validation
  if (!products) {
    throw new Error('Products array is required');
  }
  if (!combinations) {
    throw new Error('Filter combinations array is required');
  }
  if (!config?.outputDir) {
    throw new Error('Output directory is required');
  }

  // Ensure output directory and filtered subdirectory exist
  const filteredDir = path.join(config.outputDir, 'filtered');
  try {
    fs.mkdirSync(filteredDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create filtered directory: ${filteredDir}`);
  }

  const outputs: FilterOutput[] = [];

  for (const combination of combinations) {
    try {

      // Apply filter to get filtered products
      const filteredProducts = createFilter(products, combination.criteria);

      // Create statistics using existing FilterStatistics type
      const statistics = createFilterStatistics(
        products.length,
        filteredProducts,
        {} // exclusions - could be enhanced later
      );

      // Generate output files
      await generateFilteredOutput(
        combination.name,
        filteredProducts,
        statistics,
        config
      );

      // Create FilterOutput object
      const filterOutput: FilterOutput = {
        filterName: combination.name,
        products: filteredProducts,
        statistics,
        criteria: combination.criteria,
      };

      outputs.push(filterOutput);
    } catch (error) {
      console.error(`Failed to generate output for ${combination.name}:`, error);
      // Continue with other combinations instead of failing completely
    }
  }

  // Generate master filter index for discovery
  if (outputs.length > 0) {
    generateFilterMasterIndex(outputs, filteredDir);
  }

  return outputs;
}

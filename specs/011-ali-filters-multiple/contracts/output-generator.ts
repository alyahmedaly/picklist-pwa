/**
 * Multiple Output Generation Contract
 *
 * Generates separate JSONL files for different filter combinations
 * while maintaining compatibility with existing output structure.
 */

import type { FilteredProduct, FilterCriteria } from './filter-engine';

export interface FilterOutput {
  filterName: string;
  products: FilteredProduct[];
  statistics: FilterStatistics;
  criteria: FilterCriteria;
}

export interface FilterStatistics {
  totalProducts: number;
  filteredProducts: number;
  coveragePercentage: number;
  excludedReasons: Record<string, number>;
  dataQuality: DataQualityMetrics;
  filterSpecific: FilterSpecificStats;
}

export interface DataQualityMetrics {
  completeNutrition: number;
  completePricing: number;
  completeIngredients: number;
  completeScoring: number;
}

export interface FilterSpecificStats {
  halalCoverage?: number;
  proteinCoverage?: number;
  postWorkoutCoverage?: number;
  fatLossCoverage?: number;
}

export interface OutputConfig {
  outputDir: string;
  generateIndex: boolean;
  generateStats: boolean;
  format: 'standard' | 'ui';
}

/**
 * Generates multiple filtered output files based on predefined combinations.
 *
 * @param products - Source products with scoring data
 * @param combinations - Filter combinations to generate
 * @param config - Output configuration
 * @returns Array of generated file paths
 *
 * @example
 * ```typescript
 * const combinations = [
 *   { name: 'halal-protein', criteria: { halal: {...}, protein: {...} } },
 *   { name: 'halal-postworkout', criteria: { halal: {...}, postWorkout: {...} } }
 * ];
 *
 * const files = await generateMultipleOutputs(products, combinations, {
 *   outputDir: './out',
 *   generateIndex: true,
 *   generateStats: true,
 *   format: 'standard'
 * });
 * ```
 */
export async function generateMultipleOutputs(
  products: FilteredProduct[],
  combinations: Array<{ name: string; criteria: FilterCriteria }>,
  config: OutputConfig,
): Promise<string[]>;

/**
 * Generates a single filtered output file with associated index and stats.
 *
 * @param filterName - Name for the output files
 * @param products - Filtered products
 * @param statistics - Filter statistics
 * @param config - Output configuration
 * @returns Generated file paths
 */
export async function generateFilteredOutput(
  filterName: string,
  products: FilteredProduct[],
  statistics: FilterStatistics,
  config: OutputConfig,
): Promise<{
  jsonlPath: string;
  indexPath?: string;
  statsPath?: string;
}>;

/**
 * Creates filter statistics from filtered products and exclusion data.
 *
 * @param totalProducts - Total input products
 * @param filteredProducts - Products after filtering
 * @param exclusions - Exclusion reasons and counts
 * @returns Comprehensive filter statistics
 */
export function createFilterStatistics(
  totalProducts: number,
  filteredProducts: FilteredProduct[],
  exclusions: Record<string, number>,
): FilterStatistics;

/**
 * Generates lightweight index file for frontend consumption.
 *
 * @param products - Filtered products
 * @returns Index data optimized for search and display
 */
export function generateFilterIndex(products: FilteredProduct[]): Array<{
  id: string;
  name: string;
  price?: number;
  categories: string[];
  filterScore?: number;
  portionRecommendation?: PortionInfo;
}>;

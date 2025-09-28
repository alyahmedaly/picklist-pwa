/**
 * CLI Integration Contract
 *
 * Extends existing transform CLI with filtering capabilities.
 * Maintains backward compatibility while adding filter flags.
 */

import type { FilterCriteria } from './filter-engine';

export interface FilterCliOptions {
  // Filter selection
  filters?: string; // Comma-separated: "halal,protein,postworkout,fatloss,budget"

  // Halal options
  halalStrict?: boolean;
  halalExcludeAlcohol?: boolean;
  halalExcludeGelatine?: boolean;

  // Protein options
  proteinMin?: number; // Minimum protein per 100g
  proteinTarget?: number; // Daily protein target (default: 170g)
  proteinEfficiencyMin?: number; // Minimum efficiency score

  // Post-workout options
  postWorkoutMaxRatio?: number; // Max carb:protein ratio (default: 4.0)
  postWorkoutMinRatio?: number; // Min carb:protein ratio (default: 2.0)
  postWorkoutHighGI?: boolean; // Prefer high GI foods

  // Fat loss options
  fatLossMaxCalories?: number; // Max calories per 100g (default: 125)
  fatLossMinSatiety?: number; // Min satiety score
  fatLossHighVolume?: boolean; // Prefer high volume foods

  // Budget options
  budgetMaxPrice?: number; // Max price per 100g/ml (euros)
  budgetOptimizeProtein?: boolean; // Optimize protein per euro
  budgetMaxTotal?: number; // Max total daily budget

  // Context options
  trainingDay?: boolean; // Training vs rest day context
  mealTiming?: 'pre_workout' | 'post_workout' | 'general';
  avoidCombinations?: string; // Comma-separated: "tuna+rice,honey"

  // Output options
  filterStats?: boolean; // Generate detailed filter statistics
  generateFilteredOutputs?: boolean; // Generate separate filtered files
}

export interface ExtendedCliOptions extends FilterCliOptions {
  // Existing CLI options
  input: string;
  outDir: string;
  log?: 'human' | 'json';
  format?: 'standard' | 'ui';
}

/**
 * Parses CLI arguments into filter criteria.
 *
 * @param options - Parsed CLI options
 * @returns FilterCriteria object for filtering engine
 *
 * @example
 * ```bash
 * node transform-data.ts --input data.csv --outDir out \
 *   --filters halal,protein \
 *   --halal-strict \
 *   --protein-min 20 \
 *   --protein-target 170
 * ```
 */
export function parseFilterOptions(options: FilterCliOptions): FilterCriteria | null;

/**
 * Creates predefined filter combinations for Ali's common use cases.
 *
 * @param options - CLI options for customization
 * @returns Array of named filter combinations
 */
export function createAliFilterCombinations(
  options: FilterCliOptions,
): Array<{ name: string; criteria: FilterCriteria }>;

/**
 * Validates CLI filter options for conflicts and invalid values.
 *
 * @param options - CLI options to validate
 * @throws Error if options are invalid or conflicting
 */
export function validateCliFilterOptions(options: FilterCliOptions): void;

/**
 * Generates help text for filter-related CLI flags.
 *
 * @returns Help text describing all filter options
 */
export function getFilterHelpText(): string;

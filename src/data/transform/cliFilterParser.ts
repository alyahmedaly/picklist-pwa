/**
 * CLI Filter Parser for Ali's Filter System
 *
 * Converts CLI options to FilterCriteria for the filter engine.
 * Supports Ali's specific use cases with sensible defaults.
 */

import type {
  FilterCriteria,
  HalalFilterCriteria,
  ProteinFilterCriteria,
  PostWorkoutFilterCriteria,
  FatLossFilterCriteria,
  BudgetFilterCriteria,
  ContextFilterCriteria,
} from './types';
// Note: validateFilterCriteria removed - let filter engine handle validation

/**
 * CLI options for filter configuration.
 */
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
  generateCategoryOutputs?: boolean; // Generate category-specific product files
  generateSqlite?: boolean; // Generate SQLite database for wa-sqlite + OPFS

  // Flexible schema options (Feature 019)
  generateFlexibleSchema?: boolean; // Generate normalized SQLite database with flexible schema
  flexibleSchemaFile?: string; // Custom filename for flexible schema database
  flexibleSchemaValidate?: boolean; // Run comprehensive validation checks
  flexibleSchemaReport?: boolean; // Generate detailed normalization report
  flexibleSchemaOptimize?: boolean; // Optimize for query performance
  flexibleSchemaOnly?: boolean; // Generate only flexible schema, skip standard outputs
}

/**
 * Extended CLI options including existing transform options.
 */
export interface ExtendedCliOptions extends FilterCliOptions {
  // Existing CLI options
  input: string;
  outDir: string;
  log?: 'human' | 'json';
  format?: 'standard' | 'ui';
  generateCategoryTree?: boolean;
  cleanOutput?: boolean;
}

/**
 * Parses CLI arguments into filter criteria.
 *
 * @param options - Parsed CLI options
 * @returns FilterCriteria object for filtering engine, or null if no filters specified
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
export function parseFilterOptions(options: FilterCliOptions): FilterCriteria | null {
  if (!options || !options.filters) {
    return null;
  }

  // Parse which filters to enable
  const enabledFilters = options.filters.toLowerCase().split(',').map(f => f.trim());
  const criteria: FilterCriteria = {};

  // Check if any filters are valid
  const validFilters = ['halal', 'protein', 'postworkout', 'post-workout', 'fatloss', 'fat-loss', 'budget', 'context'];
  const hasValidFilters = enabledFilters.some(filter => validFilters.includes(filter));

  if (!hasValidFilters) {
    return null; // No valid filters found
  }

  // Parse halal filter
  if (enabledFilters.includes('halal')) {
    criteria.halal = parseHalalOptions(options);
  }

  // Parse protein filter
  if (enabledFilters.includes('protein')) {
    criteria.protein = parseProteinOptions(options);
  }

  // Parse post-workout filter
  if (enabledFilters.includes('postworkout') || enabledFilters.includes('post-workout')) {
    criteria.postWorkout = parsePostWorkoutOptions(options);
  }

  // Parse fat loss filter
  if (enabledFilters.includes('fatloss') || enabledFilters.includes('fat-loss')) {
    criteria.fatLoss = parseFatLossOptions(options);
  }

  // Parse budget filter
  if (enabledFilters.includes('budget')) {
    criteria.budget = parseBudgetOptions(options);
  }

  // Parse context filter (auto-enabled if context options are provided)
  if (enabledFilters.includes('context') || options.trainingDay !== undefined || options.mealTiming || options.avoidCombinations) {
    criteria.context = parseContextOptions(options);
  }

  // Don't validate here - let the filter engine handle validation
  // This allows for more graceful handling of edge cases
  return criteria;
}

/**
 * Creates predefined filter combinations for Ali's common use cases.
 *
 * @param options - CLI options for customization
 * @returns Array of named filter combinations
 */
export function createAliFilterCombinations(
  options: FilterCliOptions,
): Array<{ name: string; criteria: FilterCriteria }> {
  const combinations: Array<{ name: string; criteria: FilterCriteria }> = [];

  // Daily protein filter (halal + high protein)
  combinations.push({
    name: 'daily-protein',
    criteria: {
      halal: parseHalalOptions(options),
      protein: {
        min: options.proteinMin || 20,
        target: options.proteinTarget || 170,
        minEfficiency: options.proteinEfficiencyMin || 40,
      },
    },
  });

  // Post-workout recovery filter
  combinations.push({
    name: 'post-workout',
    criteria: {
      halal: parseHalalOptions(options),
      protein: {
        min: 15,
        target: options.proteinTarget || 170,
      },
      postWorkout: parsePostWorkoutOptions(options),
    },
  });

  // Cutting phase filter
  combinations.push({
    name: 'cutting',
    criteria: {
      halal: parseHalalOptions(options),
      protein: {
        min: options.proteinMin || 20,
        target: options.proteinTarget || 170,
      },
      fatLoss: parseFatLossOptions(options),
    },
  });

  // Budget-optimized filter
  if (options.budgetMaxPrice || options.budgetMaxTotal) {
    combinations.push({
      name: 'budget',
      criteria: {
        halal: parseHalalOptions(options),
        budget: parseBudgetOptions(options),
      },
    });
  }

  return combinations;
}

/**
 * Validates CLI filter options for conflicts and invalid values.
 *
 * @param options - CLI options to validate
 * @throws Error if options are invalid or conflicting
 */
export function validateCliFilterOptions(options: FilterCliOptions): void {
  // Validate numeric ranges
  if (options.proteinMin !== undefined && (options.proteinMin < 0 || options.proteinMin > 100)) {
    throw new Error('proteinMin must be between 0 and 100');
  }

  if (options.proteinTarget !== undefined && options.proteinTarget <= 0) {
    throw new Error('proteinTarget must be greater than 0');
  }

  if (options.proteinEfficiencyMin !== undefined && (options.proteinEfficiencyMin < 0 || options.proteinEfficiencyMin > 100)) {
    throw new Error('proteinEfficiencyMin must be between 0 and 100');
  }

  // Validate post-workout ratios
  if (options.postWorkoutMinRatio !== undefined && options.postWorkoutMinRatio <= 0) {
    throw new Error('postWorkoutMinRatio must be greater than 0');
  }

  if (options.postWorkoutMaxRatio !== undefined && options.postWorkoutMaxRatio <= 0) {
    throw new Error('postWorkoutMaxRatio must be greater than 0');
  }

  if (
    options.postWorkoutMinRatio !== undefined &&
    options.postWorkoutMaxRatio !== undefined &&
    options.postWorkoutMinRatio >= options.postWorkoutMaxRatio
  ) {
    throw new Error('postWorkoutMinRatio must be less than postWorkoutMaxRatio');
  }

  // Validate fat loss options
  if (options.fatLossMaxCalories !== undefined && options.fatLossMaxCalories <= 0) {
    throw new Error('fatLossMaxCalories must be greater than 0');
  }

  if (options.fatLossMinSatiety !== undefined && (options.fatLossMinSatiety < 0 || options.fatLossMinSatiety > 100)) {
    throw new Error('fatLossMinSatiety must be between 0 and 100');
  }

  // Validate budget options
  if (options.budgetMaxPrice !== undefined && options.budgetMaxPrice <= 0) {
    throw new Error('budgetMaxPrice must be greater than 0');
  }

  if (options.budgetMaxTotal !== undefined && options.budgetMaxTotal <= 0) {
    throw new Error('budgetMaxTotal must be greater than 0');
  }

  // Validate meal timing
  if (options.mealTiming && !['pre_workout', 'post_workout', 'general'].includes(options.mealTiming)) {
    throw new Error('mealTiming must be one of: pre_workout, post_workout, general');
  }
}

/**
 * Generates help text for filter-related CLI flags.
 *
 * @returns Help text describing all filter options
 */
export function getFilterHelpText(): string {
  return `
Filter Options:
  --filters <list>           Comma-separated filters: halal,protein,postworkout,fatloss,budget,context

Halal Options:
  --halal-strict             Enable strict halal requirements (default: true)
  --halal-exclude-alcohol    Exclude products with alcohol
  --halal-exclude-gelatine   Exclude products with gelatine

Protein Options:
  --protein-min <number>     Minimum protein per 100g (default: 20)
  --protein-target <number>  Daily protein target in grams (default: 170)
  --protein-efficiency-min <number>  Minimum efficiency score 0-100

Post-Workout Options:
  --post-workout-min-ratio <number>  Min carb:protein ratio (default: 2.0)
  --post-workout-max-ratio <number>  Max carb:protein ratio (default: 4.0)
  --post-workout-high-gi             Prefer high glycemic index foods

Fat Loss Options:
  --fat-loss-max-calories <number>   Max calories per 100g (default: 125)
  --fat-loss-min-satiety <number>    Min satiety score 0-100
  --fat-loss-high-volume             Prefer high volume foods

Budget Options:
  --budget-max-price <number>        Max price per 100g/ml in euros
  --budget-optimize-protein          Optimize protein per euro
  --budget-max-total <number>        Max total daily budget in euros

Context Options:
  --training-day                     Training day context (vs rest day)
  --meal-timing <timing>             Meal timing: pre_workout, post_workout, general
  --avoid-combinations <list>        Comma-separated combinations to avoid

Output Options:
  --filter-stats                     Generate detailed filter statistics
  --generate-filtered-outputs        Generate separate filtered JSONL files

Example:
  # Daily protein filtering for Ali
  --filters halal,protein --protein-target 170

  # Post-workout recovery
  --filters halal,protein,postworkout --post-workout-high-gi

  # Cutting phase
  --filters halal,protein,fatloss --fat-loss-max-calories 100
`;
}

// Helper functions for parsing individual filter types

function parseHalalOptions(options: FilterCliOptions): HalalFilterCriteria {
  return {
    strict: options.halalStrict !== false, // Default to true for Ali
    excludeAlcohol: options.halalExcludeAlcohol !== false, // Default to true
    excludeGelatine: options.halalExcludeGelatine !== false, // Default to true
  };
}

function parseProteinOptions(options: FilterCliOptions): ProteinFilterCriteria {
  return {
    min: options.proteinMin || 20,
    target: options.proteinTarget || 170, // Ali's target
    minEfficiency: options.proteinEfficiencyMin,
  };
}

function parsePostWorkoutOptions(options: FilterCliOptions): PostWorkoutFilterCriteria {
  return {
    minRatio: options.postWorkoutMinRatio || 2.0,
    maxRatio: options.postWorkoutMaxRatio || 4.0,
    preferHighGI: options.postWorkoutHighGI !== false, // Default to true for recovery
    recoveryWindow: 'immediate', // Ali's CrossFit training needs immediate recovery
  };
}

function parseFatLossOptions(options: FilterCliOptions): FatLossFilterCriteria {
  return {
    maxCalories: options.fatLossMaxCalories || 125,
    minSatiety: options.fatLossMinSatiety,
    preferHighVolume: options.fatLossHighVolume !== false, // Default to true for cutting
  };
}

function parseBudgetOptions(options: FilterCliOptions): BudgetFilterCriteria {
  return {
    maxPrice: options.budgetMaxPrice,
    optimizeProtein: options.budgetOptimizeProtein !== false, // Default to true for Ali
    maxTotal: options.budgetMaxTotal,
  };
}

function parseContextOptions(options: FilterCliOptions): ContextFilterCriteria {
  const avoidCombinations = options.avoidCombinations
    ? options.avoidCombinations.split(',').map(c => c.trim())
    : ['tuna+rice', 'honey']; // Ali's documented preferences

  return {
    trainingDay: options.trainingDay !== undefined ? options.trainingDay : true, // Explicit or default to training day for Ali
    targetCalories: 2000, // Ali's training day target
    targetCarbs: 220, // Ali's training day carbs
    mealTiming: options.mealTiming || 'general',
    avoidCombinations,
  };
}
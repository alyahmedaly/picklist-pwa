import type { FilterCombination, Product, FilterCriteria, OutputConfig } from '@picklist/types';

// Body Recomposition Scoring modules

// Filter integration
import { generateMultipleOutputs } from '@picklist/output';

// Flexible schema integration (T024)
import type { NormalizedProductData } from './normalizeProductData.ts';
import { generateNormalizationReport, normalizeProductData } from './normalizeProductData.ts';


/**
 * Get enhanced scoring statistics including personal health and body recomposition metrics
 */
export function getEnhancedScoringStatistics(products: Product[]): {
  totalProducts: number;
  halalAnalysisCoverage: number;
  proteinScoringCoverage: number;
  satietyScoringCoverage: number;
  postWorkoutScoringCoverage: number;
  fatLossScoringCoverage: number;
  calorieEfficiencyScoringCoverage: number;
  bodyCompositionContextCoverage: number;
  halalStatusDistribution: {
    halal: number;
    haram: number;
    questionable: number;
    unknown: number;
  };
  averageProteinScore: number | null;
  averageSatietyScore: number | null;
  averagePostWorkoutScore: number | null;
  averageFatLossScore: number | null;
  averageCalorieEfficiencyScore: number | null;
} {
  const totalProducts = products.length;

  // Calculate coverage metrics
  const halalProducts = products.filter((p) => p.halalCheck).length;
  const proteinProducts = products.filter((p) => p.proteinOptimization).length;
  const satietyProducts = products.filter((p) => p.satietyAnalysis).length;
  const postWorkoutProducts = products.filter((p) => p.postWorkoutOptimization).length;
  const fatLossProducts = products.filter((p) => p.fatLossCompatibility).length;
  const calorieEfficiencyProducts = products.filter((p) => p.enhancedCalorieEfficiency).length;
  const bodyCompositionContextProducts = products.filter((p) => p.bodyCompositionContext).length;

  const halalAnalysisCoverage = totalProducts > 0 ? (halalProducts / totalProducts) * 100 : 0;
  const proteinScoringCoverage = totalProducts > 0 ? (proteinProducts / totalProducts) * 100 : 0;
  const satietyScoringCoverage = totalProducts > 0 ? (satietyProducts / totalProducts) * 100 : 0;
  const postWorkoutScoringCoverage =
    totalProducts > 0 ? (postWorkoutProducts / totalProducts) * 100 : 0;
  const fatLossScoringCoverage = totalProducts > 0 ? (fatLossProducts / totalProducts) * 100 : 0;
  const calorieEfficiencyScoringCoverage =
    totalProducts > 0 ? (calorieEfficiencyProducts / totalProducts) * 100 : 0;
  const bodyCompositionContextCoverage =
    totalProducts > 0 ? (bodyCompositionContextProducts / totalProducts) * 100 : 0;

  // Calculate halal status distribution
  const halalStatuses = products
    .map((p) => p.halalCheck?.status)
    .filter(
      (status): status is 'halal' | 'haram' | 'questionable' | 'unknown' => status !== undefined,
    );

  const halalStatusDistribution = {
    halal: halalStatuses.filter((s) => s === 'halal').length,
    haram: halalStatuses.filter((s) => s === 'haram').length,
    questionable: halalStatuses.filter((s) => s === 'questionable').length,
    unknown: halalStatuses.filter((s) => s === 'unknown').length,
  };

  // Calculate average scores
  const proteinScores = products
    .map((p) => p.proteinOptimization?.proteinDensityScore)
    .filter((score): score is number => score !== undefined);

  const satietyScores = products
    .map((p) => p.satietyAnalysis?.satietyScore)
    .filter((score): score is number => score !== undefined);

  const postWorkoutScores = products
    .map((p) => p.postWorkoutOptimization?.postWorkoutScore)
    .filter((score): score is number => score !== undefined);

  const fatLossScores = products
    .map((p) => p.fatLossCompatibility?.fatLossScore)
    .filter((score): score is number => score !== undefined);

  const calorieEfficiencyScores = products
    .map((p) => p.enhancedCalorieEfficiency?.efficiencyScore)
    .filter((score): score is number => score !== undefined);

  const averageProteinScore =
    proteinScores.length > 0
      ? Math.round(
        (proteinScores.reduce((sum, score) => sum + score, 0) / proteinScores.length) * 10,
      ) / 10
      : null;

  const averageSatietyScore =
    satietyScores.length > 0
      ? Math.round(
        (satietyScores.reduce((sum, score) => sum + score, 0) / satietyScores.length) * 10,
      ) / 10
      : null;

  const averagePostWorkoutScore =
    postWorkoutScores.length > 0
      ? Math.round(
        (postWorkoutScores.reduce((sum, score) => sum + score, 0) / postWorkoutScores.length) *
        10,
      ) / 10
      : null;

  const averageFatLossScore =
    fatLossScores.length > 0
      ? Math.round(
        (fatLossScores.reduce((sum, score) => sum + score, 0) / fatLossScores.length) * 10,
      ) / 10
      : null;

  const averageCalorieEfficiencyScore =
    calorieEfficiencyScores.length > 0
      ? Math.round(
        (calorieEfficiencyScores.reduce((sum, score) => sum + score, 0) /
          calorieEfficiencyScores.length) *
        10,
      ) / 10
      : null;

  return {
    totalProducts,
    halalAnalysisCoverage: Math.round(halalAnalysisCoverage * 10) / 10,
    proteinScoringCoverage: Math.round(proteinScoringCoverage * 10) / 10,
    satietyScoringCoverage: Math.round(satietyScoringCoverage * 10) / 10,
    postWorkoutScoringCoverage: Math.round(postWorkoutScoringCoverage * 10) / 10,
    fatLossScoringCoverage: Math.round(fatLossScoringCoverage * 10) / 10,
    calorieEfficiencyScoringCoverage: Math.round(calorieEfficiencyScoringCoverage * 10) / 10,
    bodyCompositionContextCoverage: Math.round(bodyCompositionContextCoverage * 10) / 10,
    halalStatusDistribution,
    averageProteinScore,
    averageSatietyScore,
    averagePostWorkoutScore,
    averageFatLossScore,
    averageCalorieEfficiencyScore,
  };
}

/**
 * Enhanced scoring pipeline with post-processing filtering, output generation,
 * and flexible schema normalization support.
 * Integrates Ali's filter system as an optional post-processing step.
 *
 * @param products - Array of products to score and filter
 * @param filterCriteria - Optional filter criteria for post-processing
 * @param outputConfig - Optional configuration for filtered output generation
 * @param generateNormalizedData - Optional flag to generate normalized data for flexible schema
 * @returns Object containing scored products, optional filtered outputs, and optional normalized data
 *
 * @example
 * ```typescript
 * const { scoredProducts, filteredOutputs, normalizedData } = await enhanceWithFilteredOutputs(
 *   products,
 *   { halal: { strict: true }, protein: { min: 20, target: 170 } },
 *   { outputDir: './out', generateIndex: true, generateStats: true, format: 'standard' },
 *   true // Generate normalized data for flexible schema
 * );
 * ```
 */
export async function enhanceWithFilteredOutputs(
  products: Product[],
  filterCriteria?: FilterCriteria | null,
  outputConfig?: OutputConfig,
  generateNormalizedData?: boolean,
): Promise<{
  scoredProducts: Product[];
  filteredOutputs?: Array<{
    filterName: string;
    products: Product[];
    statistics: any;
    criteria: FilterCriteria;
  }>;
  normalizedData?: NormalizedProductData;
}> {

  // Pass 4: Generate normalized data for flexible schema if requested (T024)
  let normalizedData: NormalizedProductData | undefined;
  if (generateNormalizedData) {
    try {
      console.log('[flexible-schema] Generating normalized data from scored products...');
      normalizedData = normalizeProductData(products);


      const report = generateNormalizationReport(normalizedData);
      console.log('[flexible-schema] Normalization report:', report);

    } catch (error) {
      console.warn('[flexible-schema] Normalization failed, continuing without normalized data:', error);
    }
  }

  // Pass 5: Always generate Ali's filter profiles, plus any custom filters
  if (!outputConfig) {
    return { scoredProducts: products, normalizedData };
  }

  try {
    // Always include Ali's common filter combinations
    const combinations: FilterCombination[] = [];

    // Import Ali filter profiles for comprehensive coverage
    const { createAliFilterCombinations } = await import('./aliFilterProfiles.ts');
    const aliCombinations = createAliFilterCombinations();
    combinations.push(...aliCombinations);

    // Add custom filter if provided
    if (filterCriteria) {
      combinations.push({
        name: generateFilterName(filterCriteria),
        criteria: filterCriteria,
      });
    }

    // Generate filtered outputs using scored products
    const filteredOutputs = await generateMultipleOutputs(products, combinations, outputConfig);

    return { scoredProducts: products, filteredOutputs, normalizedData };
  } catch (error) {
    console.warn('Filter processing failed, continuing with scored products only:', error);
    return { scoredProducts: products, normalizedData };
  }
}

/**
 * Generates a descriptive name for filter criteria
 */
function generateFilterName(criteria: FilterCriteria): string {
  const parts: string[] = [];

  if (criteria.halal) parts.push('halal');
  if (criteria.protein) parts.push('protein');
  if (criteria.postWorkout) parts.push('postworkout');
  if (criteria.fatLoss) parts.push('fatloss');
  if (criteria.budget) parts.push('budget');
  if (criteria.context) parts.push('context');

  return parts.length > 0 ? parts.join('-') : 'filtered';
}

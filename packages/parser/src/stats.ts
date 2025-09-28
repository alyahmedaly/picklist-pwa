import type { Product } from '@picklist/types';

interface StatsAccumulatorOptions {
  trackNullRates?: boolean;
}

interface BaselineInput {
  nullRates?: Record<string, number>; // prior baseline rates (0..1)
}

export interface StatsSummary {
  totalRows: number;
  mergedDuplicates: number;
  excludedColumns: string[];
  nullRates: { key: string; rate: number; nulls: number; total: number }[]; // sorted desc
  driftCodes: string[]; // derived from baseline compare
  // Dutch localization counters
  dutchAllergenProducts: number;
  decimalCommaNormalizedCount: number;
  // Nutritional tags statistics
  nutritionalTagsComputed: number;
  highProteinProducts: number;
  veganProducts: number;
  glutenFreeProducts: number;
  lactoseFreeProducts: number;
  highFiberProducts: number;
  lowCarbProducts: number;
  netCarbsDistribution: {
    very_low: number;
    low: number;
    moderate: number;
    high: number;
    very_high: number;
  };
  // Additive analysis statistics
  additiveAnalysisComputed: number;
  productsWithAdditives: number;
  productsWithPreservatives: number;
  productsWithArtificialColors: number;
  productsWithChildWarnings: number;
  productsWithPKUWarnings: number;
  productsWithAllergenicAdditives: number;
  productsWithAnimalDerivedAdditives: number;
  organicCompatibleProducts: number;
  naturalAdditivesOnlyProducts: number;
  // Scoring distribution statistics
  scoringStats: {
    totalProducts: number;
    productsWithScores: number;
    scoringCoverage: number; // percentage (0-100)
    globalGradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
    };
    categoryGradeDistributions: Record<
      string,
      {
        A: number;
        B: number;
        C: number;
        D: number;
        E: number;
      }
    >;
    nutriScoreRange: { min: number; max: number } | null;
    healthScoreRange: { min: number; max: number } | null;
  };
  // Personal health extensions statistics
  personalHealthExtensions: {
    halalAnalysisComputed: number;
    halalStatusDistribution: {
      halal: number;
      haram: number;
      questionable: number;
      unknown: number;
    };
    halalFlagsDistribution: {
      hasAlcohol: number;
      hasPork: number;
      hasAnimalGelatine: number;
      hasNonHalalMeat: number;
      hasDoubtfulAdditives: number;
    };
    halalConfidenceDistribution: {
      high: number;
      medium: number;
      low: number;
    };
    proteinOptimizationComputed: number;
    proteinDensityScoreRange: { min: number; max: number } | null;
    highProteinDensityProducts: number; // score > 70
    satietyAnalysisComputed: number;
    satietyScoreRange: { min: number; max: number } | null;
    highSatietyProducts: number; // score > 70
    processingPenaltyDistribution: {
      minimal: number; // 85-100 (0-2 additives)
      moderate: number; // 60-84 (3-5 additives)
      high: number; // <60 (6+ additives)
    };
    // Body recomposition scoring statistics
    postWorkoutOptimizationComputed: number;
    postWorkoutScoreRange: { min: number; max: number } | null;
    fatLossCompatibilityComputed: number;
    fatLossScoreRange: { min: number; max: number } | null;
    enhancedCalorieEfficiencyComputed: number;
    calorieEfficiencyScoreRange: { min: number; max: number } | null;
    bodyCompositionContextComputed: number;
    bodyCompositionPhaseDistribution: {
      cutting: number;
      bulking: number;
      maintenance: number;
      recomposition: number;
    };
    mealTimingDistribution: {
      pre_workout: number;
      post_workout: number;
      general: number;
    };
  };
  foodProducts: number;
  nonFoodProducts: number;
}

interface FinalizeParams {
  baseline?: BaselineInput;
}

interface InternalCounter {
  nulls: number;
  total: number;
}

export interface StatsAccumulator {
  recordSkippedRow(message: string, csvRow: Record<string, unknown>): unknown;
  ingestRow(row: Record<string, unknown>): void;
  noteExcludedColumns(cols: string[]): void;
  recordMergedDuplicate(): void;
  incrementDutchAllergenProducts(): void;
  incrementDecimalCommaNormalized(): void;
  // Single method to process all product statistics at once
  processProducts(products: Product[]): void;
  finalize(params?: FinalizeParams): StatsSummary;
}

/** Create a stats accumulator capturing counts & null rates; drift detection is simple delta heuristics for now. */
export function createStatsAccumulator(opts: StatsAccumulatorOptions = {}): StatsAccumulator {
  let totalRows = 0;
  let mergedDuplicates = 0;
  let dutchAllergenProducts = 0;
  let decimalCommaNormalizedCount = 0;

  // All statistics initialized at once
  let nutritionalTagsComputed = 0;
  let highProteinProducts = 0;
  let veganProducts = 0;
  let glutenFreeProducts = 0;
  let lactoseFreeProducts = 0;
  let highFiberProducts = 0;
  let lowCarbProducts = 0;
  let foodProducts = 0;
  let nonFoodProducts = 0;

  const netCarbsDistribution = {
    very_low: 0,
    low: 0,
    moderate: 0,
    high: 0,
    very_high: 0,
  };

  let additiveAnalysisComputed = 0;
  let productsWithAdditives = 0;
  let productsWithPreservatives = 0;
  let productsWithArtificialColors = 0;
  let productsWithChildWarnings = 0;
  let productsWithPKUWarnings = 0;
  let productsWithAllergenicAdditives = 0;
  let productsWithAnimalDerivedAdditives = 0;
  let organicCompatibleProducts = 0;
  let naturalAdditivesOnlyProducts = 0;

  const scoringStats = {
    totalProducts: 0,
    productsWithScores: 0,
    scoringCoverage: 0,
    globalGradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    categoryGradeDistributions: {} as Record<
      string,
      { A: number; B: number; C: number; D: number; E: number }
    >,
    nutriScoreRange: null as { min: number; max: number } | null,
    healthScoreRange: null as { min: number; max: number } | null,
  };

  const personalHealthExtensions = {
    halalAnalysisComputed: 0,
    halalStatusDistribution: { halal: 0, haram: 0, questionable: 0, unknown: 0 },
    halalFlagsDistribution: {
      hasAlcohol: 0,
      hasPork: 0,
      hasAnimalGelatine: 0,
      hasNonHalalMeat: 0,
      hasDoubtfulAdditives: 0,
    },
    halalConfidenceDistribution: { high: 0, medium: 0, low: 0 },
    proteinOptimizationComputed: 0,
    proteinDensityScoreRange: null as { min: number; max: number } | null,
    highProteinDensityProducts: 0,
    satietyAnalysisComputed: 0,
    satietyScoreRange: null as { min: number; max: number } | null,
    highSatietyProducts: 0,
    processingPenaltyDistribution: { minimal: 0, moderate: 0, high: 0 },
    postWorkoutOptimizationComputed: 0,
    postWorkoutScoreRange: null as { min: number; max: number } | null,
    fatLossCompatibilityComputed: 0,
    fatLossScoreRange: null as { min: number; max: number } | null,
    enhancedCalorieEfficiencyComputed: 0,
    calorieEfficiencyScoreRange: null as { min: number; max: number } | null,
    bodyCompositionContextComputed: 0,
    bodyCompositionPhaseDistribution: { cutting: 0, bulking: 0, maintenance: 0, recomposition: 0 },
    mealTimingDistribution: { pre_workout: 0, post_workout: 0, general: 0 },
  };

  const excludedColumns: string[] = [];
  const counters: Record<string, InternalCounter> = {};
  const trackNull = !!opts.trackNullRates;

  function ensureCounter(k: string): InternalCounter {
    let c = counters[k];
    if (!c) {
      c = { nulls: 0, total: 0 };
      counters[k] = c;
    }
    return c;
  }

  function updateScoreRange(
    currentRange: { min: number; max: number } | null,
    newScore: number,
  ): { min: number; max: number } {
    if (currentRange === null) {
      return { min: newScore, max: newScore };
    }
    return {
      min: Math.min(currentRange.min, newScore),
      max: Math.max(currentRange.max, newScore),
    };
  }

  return {
    ingestRow(row) {
      totalRows++;
      if (trackNull) {
        for (const [k, v] of Object.entries(row)) {
          const c = ensureCounter(k);
          c.total++;
          if (v === null || v === undefined) c.nulls++;
        }
      }
    },
    recordSkippedRow(_message, _csvRow) {
      console.warn('Skipped row:', _message, _csvRow);
      return;
    },
    noteExcludedColumns(cols) {
      for (const c of cols) if (!excludedColumns.includes(c)) excludedColumns.push(c);
    },
    recordMergedDuplicate() {
      mergedDuplicates++;
    },
    incrementDutchAllergenProducts() {
      dutchAllergenProducts++;
    },
    incrementDecimalCommaNormalized() {
      decimalCommaNormalizedCount++;
    },

    // Single method that processes ALL product statistics in one loop
    processProducts(products: Product[]) {
      scoringStats.totalProducts = products.length;

      // Single loop through all products - O(n) performance
      for (const product of products) {
        // Food vs non-food classification based on flags.isFood
        if (product.flags?.isFood === true) {
          foodProducts++;
        } else {
          nonFoodProducts++;
        }

        // Nutritional tags processing
        if (product.nutritionalTags) {
          nutritionalTagsComputed++;

          if (product.nutritionalTags.highProtein === true) highProteinProducts++;
          if (product.nutritionalTags.vegan === true) veganProducts++;
          if (product.nutritionalTags.glutenFree === true) glutenFreeProducts++;
          if (product.nutritionalTags.lactoseFree === true) lactoseFreeProducts++;
          if (product.nutritionalTags.highFiber === true) highFiberProducts++;
          if (product.nutritionalTags.lowCarb === true) lowCarbProducts++;

          if (product.nutritionalTags.netCarbsBucket) {
            netCarbsDistribution[product.nutritionalTags.netCarbsBucket]++;
          }
        }

        // Additive analysis processing
        if (product.additiveInfo) {
          additiveAnalysisComputed++;

          if (product.additiveInfo.totalAdditives > 0) productsWithAdditives++;
          if (product.additiveInfo.preservatives?.length > 0) productsWithPreservatives++;
          if (product.additiveInfo.colors?.length > 0) productsWithArtificialColors++;
        }

        if (product.additiveFlags) {
          if (product.additiveFlags.requiresChildWarning === true) productsWithChildWarnings++;
          if (product.additiveFlags.requiresPKUWarning === true) productsWithPKUWarnings++;
          if (product.additiveFlags.containsAllergenicAdditives === true)
            productsWithAllergenicAdditives++;
          if (product.additiveFlags.hasAnimalDerivedAdditives === true)
            productsWithAnimalDerivedAdditives++;
          if (product.additiveFlags.organicCompatible === true) organicCompatibleProducts++;
          if (
            product.additiveFlags.allNaturalAdditives === true &&
            (product.additiveInfo?.totalAdditives ?? 0) > 0
          ) {
            naturalAdditivesOnlyProducts++;
          }
        }

        // Scoring statistics processing
        const hasScore =
          product.nutriScore !== undefined || product.globalHealthScore !== undefined;
        if (hasScore) scoringStats.productsWithScores++;

        if (product.globalHealthGrade) {
          scoringStats.globalGradeDistribution[product.globalHealthGrade]++;
        }

        if (product.categoryHealthGrade && product.categories && product.categories.length > 0) {
          const primaryCategory = product.categories[0];
          if (!scoringStats.categoryGradeDistributions[primaryCategory]) {
            scoringStats.categoryGradeDistributions[primaryCategory] = {
              A: 0,
              B: 0,
              C: 0,
              D: 0,
              E: 0,
            };
          }
          scoringStats.categoryGradeDistributions[primaryCategory][product.categoryHealthGrade]++;
        }

        if (product.nutriScore !== undefined) {
          scoringStats.nutriScoreRange = updateScoreRange(
            scoringStats.nutriScoreRange,
            product.nutriScore,
          );
        }

        if (product.globalHealthScore !== undefined) {
          scoringStats.healthScoreRange = updateScoreRange(
            scoringStats.healthScoreRange,
            product.globalHealthScore,
          );
        }

        // Halal analysis processing
        if (product.halalCheck) {
          personalHealthExtensions.halalAnalysisComputed++;
          personalHealthExtensions.halalStatusDistribution[product.halalCheck.status]++;
          personalHealthExtensions.halalConfidenceDistribution[product.halalCheck.confidence]++;

          const flags = product.halalCheck.flags;
          if (flags.hasAlcohol) personalHealthExtensions.halalFlagsDistribution.hasAlcohol++;
          if (flags.hasPork) personalHealthExtensions.halalFlagsDistribution.hasPork++;
          if (flags.hasAnimalGelatine)
            personalHealthExtensions.halalFlagsDistribution.hasAnimalGelatine++;
          if (flags.hasNonHalalMeat)
            personalHealthExtensions.halalFlagsDistribution.hasNonHalalMeat++;
          if (flags.hasDoubtfulAdditives)
            personalHealthExtensions.halalFlagsDistribution.hasDoubtfulAdditives++;
        }

        // Protein optimization processing
        if (product.proteinOptimization?.proteinDensityScore !== undefined) {
          personalHealthExtensions.proteinOptimizationComputed++;
          personalHealthExtensions.proteinDensityScoreRange = updateScoreRange(
            personalHealthExtensions.proteinDensityScoreRange,
            product.proteinOptimization.proteinDensityScore,
          );
          if (product.proteinOptimization.proteinDensityScore > 70) {
            personalHealthExtensions.highProteinDensityProducts++;
          }
        }

        // Satiety analysis processing
        if (product.satietyAnalysis?.satietyScore !== undefined) {
          personalHealthExtensions.satietyAnalysisComputed++;
          personalHealthExtensions.satietyScoreRange = updateScoreRange(
            personalHealthExtensions.satietyScoreRange,
            product.satietyAnalysis.satietyScore,
          );
          if (product.satietyAnalysis.satietyScore > 70) {
            personalHealthExtensions.highSatietyProducts++;
          }

          // Processing penalty distribution based on satietyFactors.processingPenalty
          const penalty = product.satietyAnalysis.satietyFactors?.processingPenalty;
          if (penalty !== undefined) {
            if (penalty >= 85) {
              personalHealthExtensions.processingPenaltyDistribution.minimal++;
            } else if (penalty >= 60) {
              personalHealthExtensions.processingPenaltyDistribution.moderate++;
            } else {
              personalHealthExtensions.processingPenaltyDistribution.high++;
            }
          }
        }

        // Body recomposition scoring processing
        if (product.postWorkoutOptimization?.postWorkoutScore !== undefined) {
          personalHealthExtensions.postWorkoutOptimizationComputed++;
          personalHealthExtensions.postWorkoutScoreRange = updateScoreRange(
            personalHealthExtensions.postWorkoutScoreRange,
            product.postWorkoutOptimization.postWorkoutScore,
          );
        }

        if (product.fatLossCompatibility?.fatLossScore !== undefined) {
          personalHealthExtensions.fatLossCompatibilityComputed++;
          personalHealthExtensions.fatLossScoreRange = updateScoreRange(
            personalHealthExtensions.fatLossScoreRange,
            product.fatLossCompatibility.fatLossScore,
          );
        }

        if (product.enhancedCalorieEfficiency?.efficiencyScore !== undefined) {
          personalHealthExtensions.enhancedCalorieEfficiencyComputed++;
          personalHealthExtensions.calorieEfficiencyScoreRange = updateScoreRange(
            personalHealthExtensions.calorieEfficiencyScoreRange,
            product.enhancedCalorieEfficiency.efficiencyScore,
          );
        }

        if (product.bodyCompositionContext) {
          personalHealthExtensions.bodyCompositionContextComputed++;
          personalHealthExtensions.bodyCompositionPhaseDistribution[
            product.bodyCompositionContext.bodyCompositionPhase
          ]++;
          personalHealthExtensions.mealTimingDistribution[
            product.bodyCompositionContext.mealTiming
          ]++;
        }
      }

      // Calculate scoring coverage percentage
      scoringStats.scoringCoverage =
        scoringStats.totalProducts > 0
          ? Math.round((scoringStats.productsWithScores / scoringStats.totalProducts) * 1000) / 10
          : 0;
    },

    finalize(params) {
      const nullRates: { key: string; rate: number; nulls: number; total: number }[] = [];
      if (trackNull) {
        for (const [k, c] of Object.entries(counters)) {
          if (c.total === 0) continue;
          nullRates.push({
            key: k,
            rate: c.nulls / c.total,
            nulls: c.nulls,
            total: c.total,
          });
        }
        nullRates.sort((a, b) => {
          if (b.rate !== a.rate) return b.rate - a.rate;
          return a.key.localeCompare(b.key);
        });
      }

      const driftCodes: string[] = [];
      if (params?.baseline?.nullRates) {
        const base = params.baseline.nullRates;
        const THRESH_UP = 0.15;
        const THRESH_DOWN = 0.3;
        for (const nr of nullRates) {
          const prev = base[nr.key];
          if (typeof prev === 'number') {
            const delta = nr.rate - prev;
            if (delta > THRESH_UP) {
              driftCodes.push(`NULL_RATE_UP_${nr.key}`);
            } else if (delta < -THRESH_DOWN) {
              driftCodes.push(`NULL_RATE_DOWN_${nr.key}`);
            }
          }
        }
      }

      return {
        totalRows,
        mergedDuplicates,
        excludedColumns: [...excludedColumns],
        nullRates,
        driftCodes,
        dutchAllergenProducts,
        decimalCommaNormalizedCount,
        nutritionalTagsComputed,
        highProteinProducts,
        veganProducts,
        glutenFreeProducts,
        lactoseFreeProducts,
        highFiberProducts,
        lowCarbProducts,
        netCarbsDistribution: { ...netCarbsDistribution },
        additiveAnalysisComputed,
        productsWithAdditives,
        productsWithPreservatives,
        productsWithArtificialColors,
        productsWithChildWarnings,
        productsWithPKUWarnings,
        productsWithAllergenicAdditives,
        productsWithAnimalDerivedAdditives,
        organicCompatibleProducts,
        naturalAdditivesOnlyProducts,
        scoringStats: {
          ...scoringStats,
          categoryGradeDistributions: { ...scoringStats.categoryGradeDistributions },
        },
        personalHealthExtensions: { ...personalHealthExtensions },
        foodProducts,
        nonFoodProducts,
      };
    },
  };
}

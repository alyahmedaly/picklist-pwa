/**
 * Contract: Satiety Intelligence Interface
 * Feature: 009-halal-and-protein
 * Purpose: Define types and validation rules for evidence-based satiety scoring
 */

export interface SatietyIntelligence {
  /** Overall satiety score (0-100, higher = more satiating per calorie) */
  satietyScore: number;

  /** Breakdown of satiety contributing factors */
  satietyFactors: {
    /** Protein contribution to satiety (0-100) */
    proteinFactor: number;
    /** Fiber contribution to satiety (0-100) */
    fiberFactor: number;
    /** Food volume/water contribution (0-100) */
    volumeFactor: number;
    /** Processing level penalty (0-100, lower = more processed) */
    processingPenalty: number;
  };

  /** Expected satiety duration in minutes per 100kcal */
  expectedSatietyDuration: number;

  /** Calorie efficiency for satiety (lower = more efficient) */
  caloriePerSatietyRatio: number;
}

export interface SatietyAnalysisInput {
  /** Protein content in grams per 100g */
  proteinPer100g: number;
  /** Fiber content in grams per 100g */
  fiberPer100g: number;
  /** Calories per 100g */
  caloriesPer100g: number;
  /** Number of E-numbers/additives for processing penalty */
  additiveCount: number;
  /** Product category for volume factor estimation */
  category?: string;
  /** Ingredient count for processing assessment */
  ingredientCount?: number;
}

export interface SatietyAnalysisResult {
  /** Satiety analysis data */
  analysis: SatietyIntelligence;
  /** Processing metadata */
  metadata: {
    /** Coefficients used in calculation */
    coefficients: {
      protein: number;
      fiber: number;
      volume: number;
      processing: number;
    };
    /** Research basis version */
    researchVersion: string;
  };
}

/**
 * Research-Based Coefficients (Holt et al. 1995 Satiety Index)
 */

export const SATIETY_COEFFICIENTS = {
  // Protein satiety coefficient per gram
  PROTEIN_COEFFICIENT: 3.84,
  // Fiber satiety coefficient per gram
  FIBER_COEFFICIENT: 1.91,
  // Volume factor multipliers by category
  VOLUME_FACTORS: {
    dranken: 0.8, // beverages
    zuivel: 1.2, // dairy
    fruit: 1.5, // fruits
    groenten: 1.3, // vegetables
    vlees: 2.0, // meat
    vis: 2.0, // fish
    brood: 1.0, // bread
    default: 1.0,
  },
  // Processing penalty thresholds
  PROCESSING_THRESHOLDS: {
    MINIMAL: 0, // 0-2 additives
    MODERATE: 3, // 3-5 additives
    HIGH: 6, // 6+ additives
  },
};

export const SATIETY_CONSTANTS = {
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  BASE_DURATION: 120, // minutes base satiety duration
  MAX_DURATION: 300, // minutes maximum satiety duration
  DECIMAL_PRECISION: 1,
};

/**
 * Validation Functions
 */

export function isValidSatietyScore(score: number): boolean {
  return (
    score >= SATIETY_CONSTANTS.MIN_SCORE &&
    score <= SATIETY_CONSTANTS.MAX_SCORE &&
    Number.isFinite(score)
  );
}

export function isValidSatietyDuration(duration: number): boolean {
  return duration > 0 && duration <= SATIETY_CONSTANTS.MAX_DURATION && Number.isFinite(duration);
}

export function isValidCalorieRatio(ratio: number): boolean {
  return ratio > 0 && Number.isFinite(ratio);
}

export function validateSatietyIntelligence(analysis: any): analysis is SatietyIntelligence {
  return (
    analysis &&
    typeof analysis === 'object' &&
    typeof analysis.satietyScore === 'number' &&
    isValidSatietyScore(analysis.satietyScore) &&
    typeof analysis.satietyFactors === 'object' &&
    typeof analysis.satietyFactors.proteinFactor === 'number' &&
    isValidSatietyScore(analysis.satietyFactors.proteinFactor) &&
    typeof analysis.satietyFactors.fiberFactor === 'number' &&
    isValidSatietyScore(analysis.satietyFactors.fiberFactor) &&
    typeof analysis.satietyFactors.volumeFactor === 'number' &&
    isValidSatietyScore(analysis.satietyFactors.volumeFactor) &&
    typeof analysis.satietyFactors.processingPenalty === 'number' &&
    isValidSatietyScore(analysis.satietyFactors.processingPenalty) &&
    typeof analysis.expectedSatietyDuration === 'number' &&
    isValidSatietyDuration(analysis.expectedSatietyDuration) &&
    typeof analysis.caloriePerSatietyRatio === 'number' &&
    isValidCalorieRatio(analysis.caloriePerSatietyRatio)
  );
}

/**
 * Calculation Functions
 */

export function calculateProteinSatietyFactor(proteinPer100g: number): number {
  const factor = proteinPer100g * SATIETY_COEFFICIENTS.PROTEIN_COEFFICIENT;
  return Math.min(factor, SATIETY_CONSTANTS.MAX_SCORE);
}

export function calculateFiberSatietyFactor(fiberPer100g: number): number {
  const factor = fiberPer100g * SATIETY_COEFFICIENTS.FIBER_COEFFICIENT;
  return Math.min(factor, SATIETY_CONSTANTS.MAX_SCORE);
}

export function calculateVolumeFactor(category?: string): number {
  const multiplier =
    category && SATIETY_COEFFICIENTS.VOLUME_FACTORS[category]
      ? SATIETY_COEFFICIENTS.VOLUME_FACTORS[category]
      : SATIETY_COEFFICIENTS.VOLUME_FACTORS.default;

  return Math.min(multiplier * 30, SATIETY_CONSTANTS.MAX_SCORE); // Scaled base score of 30
}

export function calculateProcessingPenalty(additiveCount: number): number {
  if (additiveCount <= SATIETY_COEFFICIENTS.PROCESSING_THRESHOLDS.MINIMAL) {
    return 90; // Minimal processing
  } else if (additiveCount <= SATIETY_COEFFICIENTS.PROCESSING_THRESHOLDS.MODERATE) {
    return 70; // Moderate processing
  } else {
    return 40; // High processing
  }
}

export function calculateSatietyDuration(satietyScore: number): number {
  const duration =
    SATIETY_CONSTANTS.BASE_DURATION +
    (satietyScore / 100) * (SATIETY_CONSTANTS.MAX_DURATION - SATIETY_CONSTANTS.BASE_DURATION);
  return Math.round(duration);
}

export function calculateCaloriePerSatietyRatio(
  caloriesPer100g: number,
  satietyScore: number,
): number {
  if (satietyScore <= 0) return Infinity;
  return caloriesPer100g / satietyScore;
}

/**
 * Test Helper Functions
 */

export function createMockSatietyIntelligence(
  overrides: Partial<SatietyIntelligence> = {},
): SatietyIntelligence {
  return {
    satietyScore: 50.0,
    satietyFactors: {
      proteinFactor: 30.0,
      fiberFactor: 20.0,
      volumeFactor: 30.0,
      processingPenalty: 70.0,
    },
    expectedSatietyDuration: 180,
    caloriePerSatietyRatio: 4.0,
    ...overrides,
  };
}

export function createHighSatietyAnalysis(): SatietyIntelligence {
  return {
    satietyScore: 85.0,
    satietyFactors: {
      proteinFactor: 70.0,
      fiberFactor: 40.0,
      volumeFactor: 60.0,
      processingPenalty: 90.0,
    },
    expectedSatietyDuration: 250,
    caloriePerSatietyRatio: 2.5,
  };
}

export function createLowSatietyAnalysis(): SatietyIntelligence {
  return {
    satietyScore: 25.0,
    satietyFactors: {
      proteinFactor: 15.0,
      fiberFactor: 5.0,
      volumeFactor: 25.0,
      processingPenalty: 40.0,
    },
    expectedSatietyDuration: 140,
    caloriePerSatietyRatio: 8.0,
  };
}

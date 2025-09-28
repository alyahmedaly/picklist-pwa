/**
 * Contract: Protein Scoring Interface
 * Feature: 009-halal-and-protein
 * Purpose: Define types and validation rules for protein optimization scoring
 */

export interface ProteinScoring {
  /** Protein optimization score (0-100, higher = better for protein goals) */
  proteinDensityScore: number;

  /** Protein content per 100g */
  proteinContribution: number;

  /** Percentage of daily 170g target per typical serving */
  targetContribution: number;
}

export interface ProteinScoringInput {
  /** Protein content in grams per 100g */
  proteinPer100g: number;
  /** Calories per 100g */
  caloriesPer100g: number;
  /** Product unit/serving information */
  unit?: string;
  /** Product category for serving size estimation */
  category?: string;
}

export interface ProteinScoringResult {
  /** Protein scoring data */
  scoring: ProteinScoring;
  /** Processing metadata */
  metadata: {
    /** Estimated serving size used in calculations */
    estimatedServingSize: number;
    /** Protein per calorie ratio */
    proteinPerCalorie: number;
    /** Dataset percentile for protein density */
    densityPercentile: number;
  };
}

/**
 * Constants
 */

export const PROTEIN_TARGET_DAILY = 170; // grams
export const MIN_PROTEIN_DENSITY_SCORE = 0;
export const MAX_PROTEIN_DENSITY_SCORE = 100;
export const DECIMAL_PRECISION = 1;

/**
 * Validation Functions
 */

export function isValidProteinScore(score: number): boolean {
  return (
    score >= MIN_PROTEIN_DENSITY_SCORE &&
    score <= MAX_PROTEIN_DENSITY_SCORE &&
    Number.isFinite(score)
  );
}

export function isValidProteinContribution(contribution: number): boolean {
  return contribution >= 0 && Number.isFinite(contribution);
}

export function isValidTargetContribution(contribution: number): boolean {
  return contribution >= 0 && contribution <= 100 && Number.isFinite(contribution);
}

export function validateProteinScoring(scoring: any): scoring is ProteinScoring {
  return (
    scoring &&
    typeof scoring === 'object' &&
    typeof scoring.proteinDensityScore === 'number' &&
    isValidProteinScore(scoring.proteinDensityScore) &&
    typeof scoring.proteinContribution === 'number' &&
    isValidProteinContribution(scoring.proteinContribution) &&
    typeof scoring.targetContribution === 'number' &&
    isValidTargetContribution(scoring.targetContribution)
  );
}

/**
 * Utility Functions
 */

export function calculateProteinDensity(proteinPer100g: number, caloriesPer100g: number): number {
  if (caloriesPer100g <= 0) return 0;
  return (proteinPer100g / caloriesPer100g) * 100;
}

export function calculateTargetContribution(proteinPerServing: number): number {
  return Math.min((proteinPerServing / PROTEIN_TARGET_DAILY) * 100, 100);
}

export function roundToDecimalPrecision(value: number): number {
  return Math.round(value * Math.pow(10, DECIMAL_PRECISION)) / Math.pow(10, DECIMAL_PRECISION);
}

/**
 * Test Helper Functions
 */

export function createMockProteinScoring(overrides: Partial<ProteinScoring> = {}): ProteinScoring {
  return {
    proteinDensityScore: 50.0,
    proteinContribution: 10.0,
    targetContribution: 5.9,
    ...overrides,
  };
}

export function createHighProteinScoring(): ProteinScoring {
  return {
    proteinDensityScore: 85.0,
    proteinContribution: 25.0,
    targetContribution: 17.6,
  };
}

export function createLowProteinScoring(): ProteinScoring {
  return {
    proteinDensityScore: 15.0,
    proteinContribution: 2.5,
    targetContribution: 1.5,
  };
}

/**
 * Serving Size Estimation
 */

export interface ServingSizeEstimate {
  grams: number;
  source: 'unit' | 'category' | 'default';
}

export const DEFAULT_SERVING_SIZES: Record<string, number> = {
  zuivel: 150, // yogurt, milk
  vlees: 100, // meat
  vis: 100, // fish
  brood: 30, // bread slice
  kaas: 30, // cheese
  noten: 30, // nuts
  default: 100,
};

export function estimateServingSize(category?: string, unit?: string): ServingSizeEstimate {
  // Try to parse from unit first
  if (unit) {
    const match = unit.match(/(\d+)\s*g/);
    if (match) {
      return { grams: parseInt(match[1]), source: 'unit' };
    }
  }

  // Use category-based estimation
  if (category && DEFAULT_SERVING_SIZES[category]) {
    return { grams: DEFAULT_SERVING_SIZES[category], source: 'category' };
  }

  // Default fallback
  return { grams: DEFAULT_SERVING_SIZES.default, source: 'default' };
}

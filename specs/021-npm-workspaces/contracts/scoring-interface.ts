/**
 * @picklist/scoring Package Interface
 *
 * Product scoring, nutrition analysis, and Ali-specific fitness calculations
 * Phase 1: Extract scoring logic from monolithic codebase (future phase)
 */

// Import shared types from @picklist/core
import type { Product, NutritionInfo, Price } from '@picklist/core';

// ==========================================
// SCORING INTERFACES
// ==========================================

export interface AliFilterProfile {
  name: string;
  description: string;
  halalCompliant: boolean;
  proteinTarget: number; // grams per day
  calorieLimit?: number; // kcal per 100g
  carbProteinRatio?: { min: number; max: number }; // for post-workout
  budgetPerEuro?: number; // max price per euro
  contextual?: 'training_day' | 'rest_day' | 'cutting' | 'bulking';
}

export interface ScoreResult {
  score: number; // 0-100
  confidence: number; // 0-1
  factors: Array<{
    name: string;
    value: number;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  metadata?: Record<string, unknown>;
}

export interface ProteinEfficiencyResult {
  efficiency: number; // grams protein per euro
  proteinPer100g: number;
  costPer100g: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface NutritionAnalysis {
  calorieDensity: number; // kcal per 100g
  macroRatio: {
    protein: number; // percentage
    carbs: number; // percentage
    fat: number; // percentage
  };
  isHighProtein: boolean; // >20g per 100g
  isLowCalorie: boolean; // <125 kcal per 100g
  postWorkoutScore?: number; // carb:protein ratio score
}

export interface PortionNormalization {
  originalPortion: string;
  normalizedPer100g: NutritionInfo;
  conversionFactor: number;
  confidence: 'high' | 'medium' | 'low';
}

// ==========================================
// SCORING PACKAGE EXPORTS
// ==========================================

export interface ScoringPackageExports {
  // Core scoring functions
  calculateAliScore(product: Product, profile: AliFilterProfile): ScoreResult;
  calculateNutriScore(nutrition: NutritionInfo): ScoreResult;
  calculateHybridScore(product: Product, aliWeight: number, nutriWeight: number): ScoreResult;

  // Protein & efficiency scoring
  calculateProteinEfficiency(nutrition: NutritionInfo, price?: Price): ProteinEfficiencyResult;
  calculatePostWorkoutScore(nutrition: NutritionInfo): ScoreResult;
  calculateFatLossScore(nutrition: NutritionInfo): ScoreResult;
  calculateBudgetScore(nutrition: NutritionInfo, price: Price): ScoreResult;

  // Nutrition analysis
  calculateCalorieDensity(nutrition: NutritionInfo): number;
  analyzeNutrition(nutrition: NutritionInfo): NutritionAnalysis;
  calculateMacroRatio(nutrition: NutritionInfo): { protein: number; carbs: number; fat: number };

  // Portion normalization
  normalizeNutritionPerPortion(nutrition: NutritionInfo, portionSize: string): PortionNormalization;
  detectServingSize(text: string): { size: number; unit: string } | null;
  convertToStandardUnits(amount: number, unit: string): { amount: number; unit: string };

  // Contextual scoring
  calculateContextualScore(product: Product, context: 'training_day' | 'rest_day' | 'cutting' | 'bulking'): ScoreResult;
  calculateSatietyScore(nutrition: NutritionInfo): ScoreResult;
  calculateHealthScore(product: Product): ScoreResult;

  // Ali-specific filters
  isHalalCompliant(product: Product): { compliant: boolean; reasons: string[] };
  meetsProteinTarget(nutrition: NutritionInfo, dailyTarget: number, servings: number): boolean;
  isPostWorkoutOptimal(nutrition: NutritionInfo): { optimal: boolean; carbProteinRatio: number };

  // Batch scoring
  scoreProducts(products: Product[], profile: AliFilterProfile): Array<Product & { score: ScoreResult }>;
  rankByScore(products: Product[], scoringFunction: (product: Product) => ScoreResult): Product[];

  // Filter profiles
  getAliFilterProfiles(): AliFilterProfile[];
  createCustomProfile(options: Partial<AliFilterProfile>): AliFilterProfile;
}

// ==========================================
// SCORING CONFIGURATION
// ==========================================

export interface ScoringConfig {
  // Ali scoring weights
  aliScoring: {
    proteinWeight: number; // 0-1
    halalWeight: number; // 0-1
    calorieWeight: number; // 0-1
    priceWeight: number; // 0-1
    additivesPenalty: number; // 0-1
  };

  // Nutri-Score thresholds
  nutriScore: {
    energyThresholds: number[];
    proteinThresholds: number[];
    fiberThresholds: number[];
    sodiumThresholds: number[];
  };

  // Contextual scoring
  contextual: {
    trainingDayBonus: number; // multiplier for high-carb foods
    restDayPenalty: number; // penalty for high-carb foods
    cuttingCalorieLimit: number; // kcal per 100g
    bulkingProteinMin: number; // grams per 100g
  };
}

// ==========================================
// VALIDATION RULES
// ==========================================

/**
 * Scoring Package Validation:
 * 1. All scoring functions must return values 0-100
 * 2. Must handle missing nutrition data gracefully
 * 3. Must depend only on @picklist/core for shared types
 * 4. All scoring algorithms must be deterministic
 * 5. Must support both absolute and relative scoring
 * 6. Ali-specific logic must be clearly documented
 * 7. Performance must handle 30k+ products efficiently
 */

// ==========================================
// USAGE EXAMPLES
// ==========================================

/**
 * Basic scoring usage:
 * ```typescript
 * import { calculateAliScore, calculateProteinEfficiency } from '@picklist/scoring';
 *
 * const aliProfile = {
 *   name: 'CrossFit Training',
 *   proteinTarget: 170,
 *   halalCompliant: true,
 *   contextual: 'training_day'
 * };
 *
 * const score = calculateAliScore(product, aliProfile);
 * const efficiency = calculateProteinEfficiency(product.nutrition, product.price);
 * ```
 *
 * Nutrition analysis:
 * ```typescript
 * import { analyzeNutrition, normalizeNutritionPerPortion } from '@picklist/scoring';
 *
 * const analysis = analyzeNutrition(product.nutrition);
 * const normalized = normalizeNutritionPerPortion(product.nutrition, '1 serving');
 * ```
 *
 * Batch processing:
 * ```typescript
 * import { scoreProducts, rankByScore } from '@picklist/scoring';
 *
 * const scoredProducts = scoreProducts(products, aliProfile);
 * const ranked = rankByScore(products, (p) => calculateAliScore(p, aliProfile));
 * ```
 */
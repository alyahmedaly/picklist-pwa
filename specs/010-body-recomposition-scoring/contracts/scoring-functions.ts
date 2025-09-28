// Function Contract: Body Recomposition Scoring Implementation
// This file defines the function signatures that MUST be implemented
// These functions form the core API contract for the scoring system

// Note: Import path will be resolved during implementation
// import type { Product } from '../../src/data/transform/types';

// Minimal Product interface for contract purposes
interface Product {
  id: string;
  name: string;
  nutrition?: {
    kcal?: number;
    protein?: number;
    carbs?: number;
    fiber?: number;
  };
  ingredients?: string[];
  categories?: string[];
  proteinOptimization?: {
    proteinDensityScore: number;
    proteinContribution: number;
    targetContribution: number;
  };
  satietyAnalysis?: {
    satietyScore: number;
    satietyFactors: {
      proteinFactor: number;
      fiberFactor: number;
      volumeFactor: number;
      processingPenalty: number;
    };
    expectedSatietyDuration: number;
    caloriePerSatietyRatio: number;
  };
  additiveInfo?: {
    totalAdditives: number;
    eNumbers: string[];
  };
}
import type {
  PostWorkoutScore,
  FatLossScore,
  CalorieEfficiencyScore,
  BodyCompositionContext,
} from './product-interface';

// Core scoring function contracts
export interface PostWorkoutScoringFunction {
  /**
   * Computes post-workout optimization score for a product
   * @param product - Product with nutrition and ingredient data
   * @returns PostWorkoutScore or undefined if insufficient data
   */
  (product: Partial<Product>): PostWorkoutScore | undefined;
}

export interface FatLossScoringFunction {
  /**
   * Computes fat loss compatibility score for a product
   * @param product - Product with nutrition data and existing satiety analysis
   * @returns FatLossScore or undefined if insufficient data
   */
  (product: Partial<Product>): FatLossScore | undefined;
}

export interface CalorieEfficiencyScoringFunction {
  /**
   * Computes enhanced calorie efficiency score for a product
   * @param product - Product with complete scoring data
   * @returns CalorieEfficiencyScore or undefined if insufficient data
   */
  (product: Partial<Product>): CalorieEfficiencyScore | undefined;
}

export interface BodyCompositionContextFunction {
  /**
   * Applies body composition context to all product scores
   * @param product - Product with computed scores
   * @param phase - Body composition phase (defaults to 'recomposition')
   * @param timing - Meal timing context (defaults to 'general')
   * @returns BodyCompositionContext with applied multipliers
   */
  (
    product: Partial<Product>,
    phase?: 'cutting' | 'bulking' | 'maintenance' | 'recomposition',
    timing?: 'pre_workout' | 'post_workout' | 'general',
  ): BodyCompositionContext | undefined;
}

// Helper function contracts
export interface GlycemicIndexEstimator {
  /**
   * Estimates glycemic index category from ingredients and food category
   * @param ingredients - Ingredient list
   * @param categories - Food category classification
   * @returns Multiplier between 1.0 (low GI) and 1.5 (high GI)
   */
  (ingredients: string[], categories: string[]): number;
}

export interface CalorieDensityClassifier {
  /**
   * Classifies calorie density based on kcal/100g
   * @param caloriesPer100g - Calories per 100g
   * @returns Classification: 'low' (<125), 'moderate' (125-225), 'high' (>225)
   */
  (caloriesPer100g: number): 'low' | 'moderate' | 'high';
}

export interface MicronutrientDensityEstimator {
  /**
   * Estimates micronutrient density from ingredients and category
   * @param ingredients - Natural ingredient list
   * @param categories - Food category for baseline estimation
   * @returns Score 0-100 representing estimated micronutrient richness
   */
  (ingredients: string[], categories: string[]): number;
}

export interface ContextMultiplierCalculator {
  /**
   * Calculates scoring multipliers based on body composition phase and meal timing
   * @param phase - Body composition goal
   * @param timing - Meal timing context
   * @returns ContextMultipliers with appropriate adjustments
   */
  (
    phase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition',
    timing: 'pre_workout' | 'post_workout' | 'general',
  ): import('./product-interface').ContextMultipliers;
}

// Integration function contracts
export interface BodyRecompositionScorer {
  /**
   * Main integration function that applies all body recomposition scoring
   * @param product - Product with existing nutrition and scoring data
   * @param options - Optional context parameters
   * @returns Product with all new scoring fields populated
   */
  (
    product: Product,
    options?: {
      bodyCompositionPhase?: 'cutting' | 'bulking' | 'maintenance' | 'recomposition';
      mealTiming?: 'pre_workout' | 'post_workout' | 'general';
      skipIncompleteData?: boolean;
    },
  ): Product;
}

// Pipeline integration contract
export interface ScoringPipelineExtension {
  /**
   * Extends existing scoring pipeline with body recomposition features
   * @param products - Array of products with existing scoring
   * @returns Products with enhanced body recomposition scoring
   */
  (products: Product[]): Product[];
}

// Required implementation exports (must be provided by implementing modules)
export declare const computePostWorkoutScoring: PostWorkoutScoringFunction;
export declare const computeFatLossCompatibility: FatLossScoringFunction;
export declare const computeEnhancedCalorieEfficiency: CalorieEfficiencyScoringFunction;
export declare const computeBodyCompositionContext: BodyCompositionContextFunction;

export declare const estimateGlycemicIndex: GlycemicIndexEstimator;
export declare const classifyCalorieDensity: CalorieDensityClassifier;
export declare const estimateMicronutrientDensity: MicronutrientDensityEstimator;
export declare const calculateContextMultipliers: ContextMultiplierCalculator;

export declare const scoreBodyRecomposition: BodyRecompositionScorer;
export declare const extendScoringPipeline: ScoringPipelineExtension;

// Error handling contracts
export interface ScoringError extends Error {
  code: 'INSUFFICIENT_DATA' | 'INVALID_INPUT' | 'CALCULATION_ERROR';
  product?: string; // Product ID for context
  field?: string; // Specific field that caused error
}

export declare function createScoringError(
  code: ScoringError['code'],
  message: string,
  productId?: string,
  field?: string,
): ScoringError;

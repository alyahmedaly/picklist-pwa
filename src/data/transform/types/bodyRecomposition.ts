/**
 * Body Recomposition Scoring Enhancement - TypeScript Interfaces
 *
 * This module defines TypeScript interfaces for contextual intelligence scoring
 * that adapts to body composition goals and meal timing contexts.
 *
 * Features:
 * - Post-workout optimization with fast carbs + protein scoring
 * - Fat loss compatibility through satiation efficiency
 * - Enhanced calorie efficiency beyond basic ratios
 * - Body composition context awareness with meal timing
 *
 * @module bodyRecomposition
 */



/**
 * Fat loss goal alignment through satiation efficiency analysis.
 *
 * Evaluates products for cutting phases by analyzing calorie density,
 * satiety per calorie ratios, and volume advantages.
 */
export interface FatLossScore {
  /** Fat loss compatibility score (0-100 scale) */
  fatLossScore: number;

  /** Energy density in kcal per 100g */
  calorieDensity: number;

  /** Calorie density classification based on WHO/CDC thresholds */
  calorieDensityClass: 'low' | 'moderate' | 'high';

  /** Satiety score per calorie efficiency ratio */
  satietyEfficiency: number;

  /** High volume with low calorie benefit indicator */
  volumeAdvantage: boolean;

  /** Data quality and completeness indicator */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Multi-dimensional nutritional efficiency scoring.
 *
 * Extends beyond basic calorie-to-nutrient ratios by incorporating
 * thermic effects, micronutrient density, and processing penalties.
 */
export interface CalorieEfficiencyScore {
  /** Overall nutritional efficiency score (0-100 scale) */
  efficiencyScore: number;

  /** Protein density per calorie optimization (0-100 scale) */
  proteinEfficiency: number;

  /** Satiation per calorie optimization (0-100 scale) */
  satietyEfficiency: number;

  /** Estimated micronutrient richness (0-100 scale) */
  micronutrientDensity: number;

  /** Metabolic cost bonus from thermic effect (0-20 range) */
  thermicEffect: number;

  /** NOVA-based ultra-processing penalty (0-30 range) */
  processingPenalty: number;

  /** Data quality and completeness indicator */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Context multipliers for body composition phase and meal timing adjustments.
 *
 * Defines scoring adjustment factors based on user's body composition goals
 * and temporal context (meal timing relative to workouts).
 */
export interface ContextMultipliers {
  /** Protein score adjustment multiplier (0.5-2.0 range) */
  proteinScoreMultiplier: number;

  /** Satiety score adjustment multiplier (0.5-2.0 range) */
  satietyScoreMultiplier: number;

  /** Post-workout score adjustment multiplier (0.5-2.0 range) */
  postWorkoutMultiplier: number;

  /** Fat loss score adjustment multiplier (0.5-2.0 range) */
  fatLossMultiplier: number;

  /** Efficiency score adjustment multiplier (0.5-2.0 range) */
  efficiencyMultiplier: number;
}

/**
 * Body composition context-aware scoring system.
 *
 * Adapts all scoring metrics based on user's body composition phase
 * (cutting, bulking, etc.) and meal timing context (pre/post workout).
 * Includes conflict resolution for opposing optimization goals.
 */
export interface BodyCompositionContext {
  /** User's current body composition goal phase */
  bodyCompositionPhase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition';

  /** Temporal context relative to workout timing */
  mealTiming: 'pre_workout' | 'post_workout' | 'general';

  /** Applied scoring adjustment multipliers */
  contextMultipliers: ContextMultipliers;

  /** Primary optimization focus for recommendations */
  recommendationPriority: 'protein' | 'satiety' | 'efficiency' | 'recovery';

  /** Strategy for resolving conflicting optimization goals */
  conflictResolution: 'prioritize_goal' | 'balanced' | 'context_specific';
}

/**
 * Comprehensive validation rules for body recomposition interfaces.
 *
 * Ensures all scoring values remain within valid ranges and
 * maintain consistency with nutritional science principles.
 */
export const BODY_RECOMPOSITION_VALIDATION = {
  /** PostWorkoutScore validation constraints */
  POST_WORKOUT: {
    SCORE_RANGE: { min: 0, max: 100 },
    CARB_PROTEIN_RATIO_MIN: 0,
    GLYCEMIC_BOOST_RANGE: { min: 1.0, max: 1.5 },
    RECOVERY_WINDOWS: ['immediate', 'delayed', 'general'] as const,
    CONFIDENCE_LEVELS: ['high', 'medium', 'low'] as const,
  },

  /** FatLossScore validation constraints */
  FAT_LOSS: {
    SCORE_RANGE: { min: 0, max: 100 },
    CALORIE_DENSITY_MIN: 0,
    DENSITY_THRESHOLDS: {
      LOW_MAX: 125, // <125 kcal/100g
      MODERATE_MAX: 225, // 125-225 kcal/100g
      HIGH_MIN: 225, // >225 kcal/100g
    },
    SATIETY_EFFICIENCY_MIN: 0,
    CONFIDENCE_LEVELS: ['high', 'medium', 'low'] as const,
  },

  /** CalorieEfficiencyScore validation constraints */
  CALORIE_EFFICIENCY: {
    SCORE_RANGE: { min: 0, max: 100 },
    PROTEIN_EFFICIENCY_RANGE: { min: 0, max: 100 },
    SATIETY_EFFICIENCY_RANGE: { min: 0, max: 100 },
    MICRONUTRIENT_DENSITY_RANGE: { min: 0, max: 100 },
    THERMIC_EFFECT_RANGE: { min: 0, max: 20 },
    PROCESSING_PENALTY_RANGE: { min: 0, max: 30 },
    CONFIDENCE_LEVELS: ['high', 'medium', 'low'] as const,
  },

  /** BodyCompositionContext validation constraints */
  BODY_COMPOSITION_CONTEXT: {
    PHASES: ['cutting', 'bulking', 'maintenance', 'recomposition'] as const,
    MEAL_TIMINGS: ['pre_workout', 'post_workout', 'general'] as const,
    MULTIPLIER_RANGE: { min: 0.5, max: 2.0 },
    PRIORITIES: ['protein', 'satiety', 'efficiency', 'recovery'] as const,
    CONFLICT_STRATEGIES: ['prioritize_goal', 'balanced', 'context_specific'] as const,
  },

  /** Default values for backward compatibility */
  DEFAULTS: {
    BODY_COMPOSITION_PHASE: 'recomposition' as const,
    MEAL_TIMING: 'general' as const,
    MULTIPLIER_NEUTRAL: 1.0,
    CONFIDENCE_DEFAULT: 'medium' as const,
  },
} as const;

/**
 * Utility functions for creating default body recomposition contexts.
 * Type guards can be added later if needed for runtime validation.
 */

/**
 * Creates a default BodyCompositionContext for backward compatibility.
 */
export const createDefaultBodyCompositionContext = (): BodyCompositionContext => ({
  bodyCompositionPhase: BODY_RECOMPOSITION_VALIDATION.DEFAULTS.BODY_COMPOSITION_PHASE,
  mealTiming: BODY_RECOMPOSITION_VALIDATION.DEFAULTS.MEAL_TIMING,
  contextMultipliers: {
    proteinScoreMultiplier: BODY_RECOMPOSITION_VALIDATION.DEFAULTS.MULTIPLIER_NEUTRAL,
    satietyScoreMultiplier: BODY_RECOMPOSITION_VALIDATION.DEFAULTS.MULTIPLIER_NEUTRAL,
    postWorkoutMultiplier: BODY_RECOMPOSITION_VALIDATION.DEFAULTS.MULTIPLIER_NEUTRAL,
    fatLossMultiplier: BODY_RECOMPOSITION_VALIDATION.DEFAULTS.MULTIPLIER_NEUTRAL,
    efficiencyMultiplier: BODY_RECOMPOSITION_VALIDATION.DEFAULTS.MULTIPLIER_NEUTRAL,
  },
  recommendationPriority: 'protein',
  conflictResolution: 'balanced',
});

/**
 * Validates that a score is within the valid 0-100 range.
 */
export const isValidScore = (score: number): boolean => score >= 0 && score <= 100;

/**
 * Validates that a multiplier is within the valid 0.5-2.0 range.
 */
export const isValidMultiplier = (multiplier: number): boolean => {
  const { min, max } = BODY_RECOMPOSITION_VALIDATION.BODY_COMPOSITION_CONTEXT.MULTIPLIER_RANGE;
  return multiplier >= min && multiplier <= max;
};

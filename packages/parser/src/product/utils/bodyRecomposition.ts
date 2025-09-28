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

import type { BodyCompositionContext } from '@picklist/types';

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
  // Default generalized daily context; downstream logic may refine to training/rest day
  context: 'maintenance',
});

/**
 * Creates a customized BodyCompositionContext with safe defaults and optional overrides.
 * Performs shallow validation of enumerated fields; falls back to defaults on invalid input.
 */
export const createBodyCompositionContext = (
  overrides: Partial<BodyCompositionContext> = {},
): BodyCompositionContext => {
  const defaults = createDefaultBodyCompositionContext();
  const phases = BODY_RECOMPOSITION_VALIDATION.BODY_COMPOSITION_CONTEXT.PHASES;
  const timings = BODY_RECOMPOSITION_VALIDATION.BODY_COMPOSITION_CONTEXT.MEAL_TIMINGS;
  const priorities = BODY_RECOMPOSITION_VALIDATION.BODY_COMPOSITION_CONTEXT.PRIORITIES;
  const strategies = BODY_RECOMPOSITION_VALIDATION.BODY_COMPOSITION_CONTEXT.CONFLICT_STRATEGIES;

  const context: BodyCompositionContext = {
    ...defaults,
    ...overrides,
    bodyCompositionPhase: phases.includes(
      (overrides.bodyCompositionPhase as (typeof phases)[number]) || defaults.bodyCompositionPhase,
    )
      ? (overrides.bodyCompositionPhase as (typeof phases)[number])
      : defaults.bodyCompositionPhase,
    mealTiming: timings.includes(
      (overrides.mealTiming as (typeof timings)[number]) || defaults.mealTiming,
    )
      ? (overrides.mealTiming as (typeof timings)[number])
      : defaults.mealTiming,
    recommendationPriority: priorities.includes(
      (overrides.recommendationPriority as (typeof priorities)[number]) ||
        defaults.recommendationPriority,
    )
      ? (overrides.recommendationPriority as (typeof priorities)[number])
      : defaults.recommendationPriority,
    conflictResolution: strategies.includes(
      (overrides.conflictResolution as (typeof strategies)[number]) || defaults.conflictResolution,
    )
      ? (overrides.conflictResolution as (typeof strategies)[number])
      : defaults.conflictResolution,
    context: overrides.context || defaults.context,
    contextMultipliers: {
      ...defaults.contextMultipliers,
      ...overrides.contextMultipliers,
    },
  };

  return context;
};

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

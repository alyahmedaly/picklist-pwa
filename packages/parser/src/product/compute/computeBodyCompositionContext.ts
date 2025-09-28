/**
 * Body Composition Context Implementation
 *
 * Contextual intelligence for body composition goals combining phase-aware
 * multipliers with meal timing optimization.
 *
 * Key Features:
 * - 4 body composition phases: cutting, bulking, maintenance, recomposition
 * - 3 meal timing contexts: pre_workout, post_workout, general
 * - Context multiplier calculation with bounds enforcement (0.5-2.0)
 * - Recommendation priority assignment
 * - Conflict resolution strategies
 *
 * @module computeBodyCompositionContext
 */

import type { BodyCompositionContext } from '@picklist/types';
import { calculateContextMultipliers } from '../utils/bodyRecompositionHelpers.ts';

/**
 * Computes body composition context based on user goals.
 *
 * Generates contextual multipliers and recommendation priorities for optimal
 * body composition outcomes based on phase and timing parameters.
 *
 * @param phase - Body composition phase (defaults to 'recomposition')
 * @param timing - Meal timing context (defaults to 'general')
 * @returns BodyCompositionContext (never undefined - always computable)
 */
export const computeBodyCompositionContext = (
  phase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition' = 'recomposition',
  timing: 'pre_workout' | 'post_workout' | 'general' = 'general',
): BodyCompositionContext => {
  // Calculate context multipliers using helper function
  const contextMultipliers = calculateContextMultipliers(phase, timing);

  // Determine recommendation priority based on phase and timing
  const recommendationPriority = determineRecommendationPriority(phase, timing);

  // Determine conflict resolution strategy
  const conflictResolution = determineConflictResolution(phase, timing);

  return {
    bodyCompositionPhase: phase,
    mealTiming: timing,
    contextMultipliers,
    recommendationPriority,
    conflictResolution,
    // Derive broad context classification; can be refined later
    context:
      phase === 'cutting' || phase === 'bulking' || phase === 'maintenance'
        ? phase
        : timing === 'pre_workout' || timing === 'post_workout'
          ? 'training_day'
          : 'rest_day',
  };
};

/**
 * Determines recommendation priority based on phase and timing context.
 */
const determineRecommendationPriority = (
  phase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition',
  timing: 'pre_workout' | 'post_workout' | 'general',
): 'protein' | 'satiety' | 'efficiency' | 'recovery' => {
  // Post-workout timing always prioritizes recovery
  if (timing === 'post_workout') {
    return 'recovery';
  }

  // Phase-specific priorities
  switch (phase) {
    case 'cutting':
      return 'satiety'; // Satiety is key for cutting phases
    case 'bulking':
      return 'protein'; // Protein is key for muscle building
    case 'recomposition':
      return 'protein'; // Protein is key for body recomposition
    case 'maintenance':
      return 'efficiency'; // Balanced efficiency for maintenance
    default:
      return 'efficiency';
  }
};

/**
 * Determines conflict resolution strategy based on phase and timing.
 */
const determineConflictResolution = (
  phase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition',
  timing: 'pre_workout' | 'post_workout' | 'general',
): 'prioritize_goal' | 'balanced' | 'context_specific' => {
  // Specific contexts require context-specific resolution
  if (timing === 'post_workout' && phase === 'cutting') {
    return 'context_specific'; // Balance fat loss with recovery
  }

  // Maintenance phase uses balanced approach
  if (phase === 'maintenance' && timing === 'general') {
    return 'balanced';
  }

  // Strong phase goals use goal prioritization
  if (phase === 'bulking' || phase === 'cutting') {
    return 'prioritize_goal';
  }

  // Default to context-specific for complex interactions
  return 'context_specific';
};

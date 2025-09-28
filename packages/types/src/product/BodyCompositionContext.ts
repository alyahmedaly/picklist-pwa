import type { ContextMultipliers } from './context/ContextMultipliers.ts';

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

  context: 'training_day' | 'rest_day' | 'cutting' | 'bulking' | 'maintenance';
}

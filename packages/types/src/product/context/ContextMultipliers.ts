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

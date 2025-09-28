/**
 * Post-workout recovery filter criteria for Ali's CrossFit training optimization.
 *
 * Optimizes carb:protein ratios for recovery window timing and glycemic index preferences.
 * Integrates with existing postWorkoutOptimization scoring for consistent filtering.
 *
 * @example
 * ```typescript
 * const aliPostWorkoutCriteria: PostWorkoutFilterCriteria = {
 *   minCarbProteinRatio: 2.0,        // Minimum carbs for recovery
 *   maxCarbProteinRatio: 4.0,        // Maximum to avoid excess carbs
 *   preferHighGI: true,              // Fast carbs for glycogen replenishment
 *   recoveryWindow: 'immediate'      // Within 30 minutes post-workout
 * };
 * ```
 */

export interface PostWorkoutFilterCriteria {
  /**
   * Minimum carbohydrate to protein ratio for effective recovery.
   * Range: 1.0-6.0 typical, default: 2.0 for balanced muscle recovery.
   * Must be less than maxCarbProteinRatio for valid range.
   */
  minCarbProteinRatio: number;

  /**
   * Maximum carbohydrate to protein ratio to avoid excess carbs.
   * Range: 2.0-6.0 typical, default: 4.0 for CrossFit athletes.
   * Must be greater than minCarbProteinRatio for valid range.
   */
  maxCarbProteinRatio: number;

  /**
   * Prefer high glycemic index foods for rapid glycogen replenishment.
   * True for immediate recovery, false for sustained energy.
   * Integrates with glycemic index estimation from existing scoring.
   */
  preferHighGI: boolean;

  /**
   * Recovery window timing for meal planning context.
   * - 'immediate': 0-30 minutes post-workout (fast carbs)
   * - 'moderate': 30-120 minutes post-workout (balanced)
   * - 'extended': 2+ hours post-workout (slower carbs)
   */
  recoveryWindow: 'immediate' | 'moderate' | 'extended';
}

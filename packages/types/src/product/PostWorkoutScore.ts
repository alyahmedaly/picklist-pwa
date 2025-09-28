/**
 * Post-workout recovery nutrition suitability scoring.
 *
 * Measures how well a product supports post-workout recovery through
 * carbohydrate-to-protein ratios and glycemic index optimization.
 */

export interface PostWorkoutScore {
  /** Overall post-workout suitability score (0-100 scale) */
  postWorkoutScore: number;

  /** Carbohydrate to protein ratio (optimal: 2:1 to 4:1) */
  carbProteinRatio: number;

  /** Glycemic index multiplier boost for fast carbs (1.0-1.5 range) */
  glycemicBoost: number;

  /** Recovery window timing suitability classification */
  recoveryWindow: 'immediate' | 'delayed' | 'general';

  /** Data quality and completeness indicator */
  confidence: 'high' | 'medium' | 'low';
}

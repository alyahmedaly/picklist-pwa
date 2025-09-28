/**
 * Context-aware filter criteria for Ali's training and meal timing optimization.
 *
 * Adapts filtering based on training schedule, meal timing, and food combination preferences.
 * Integrates with Ali's documented training/rest day calorie and macro targets.
 *
 * @example
 * ```typescript
 * const aliTrainingContext: ContextFilterCriteria = {
 *   isTrainingDay: true,             // Training day context
 *   targetCalories: 2000,            // Higher calories for training
 *   targetCarbs: 220,                // Higher carbs for performance
 *   mealTiming: 'post_workout',      // Post-workout meal context
 *   avoidCombinations: ['tuna+rice', 'honey'] // Ali's preferences
 * };
 * ```
 */

export interface ContextFilterCriteria {
  /**
   * Training vs rest day context for macro adjustment.
   * True for training days (higher calories/carbs), false for rest days.
   * Affects calorie and carb target validation.
   */
  isTrainingDay: boolean;

  /**
   * Daily calorie target based on training context.
   * Training day: 2000 kcal, Rest day: 1750 kcal (Ali's documented preferences).
   * Must align with isTrainingDay flag for consistency.
   */
  targetCalories: number;

  /**
   * Daily carb target based on training context.
   * Training day: 220g carbs, Rest day: 120g carbs (Ali's documented preferences).
   * Must align with isTrainingDay flag for consistency.
   */
  targetCarbs: number;

  /**
   * Meal timing context for targeted nutrition.
   * - 'pre_workout': Pre-training nutrition (energy focus)
   * - 'post_workout': Post-training recovery (carb:protein ratios)
   * - 'general': Regular meal timing (balanced approach)
   */
  mealTiming?: 'pre_workout' | 'post_workout' | 'general';

  /**
   * Food combinations to avoid based on Ali's preferences.
   * Format: ['tuna+rice', 'honey'] for specific avoidance patterns.
   * Optional field for personalized dietary restrictions.
   */
  avoidCombinations?: string[];
}

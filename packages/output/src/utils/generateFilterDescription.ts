import type { FilterStatistics } from '@picklist/types';

/**
 * Generates descriptive text for a filter based on its name and statistics.
 *
 * @param filterName - Filter name
 * @param statistics - Filter statistics
 * @returns Human-readable description
 */


export function generateFilterDescription(filterName: string, statistics: FilterStatistics): string {
  const { filteredCount, filterSpecific } = statistics;

  const descriptions: Record<string, string> = {
    'daily-protein': `Halal foods with high protein content (≥20g per 100g) for meeting daily 170g protein target. ${filterSpecific.halalCoverage || 0} halal-certified products.`,
    'post-workout': `Optimal post-CrossFit recovery foods with 2.0-4.0 carb:protein ratios. ${filterSpecific.postWorkoutCoverage || 0} products optimized for glycogen replenishment.`,
    'cutting': `Fat loss compatible foods with low calorie density (≤125 kcal/100g) and high satiety. ${filterSpecific.fatLossCoverage || 0} products for cutting phase.`,
    'budget': `Protein-per-euro optimized foods for budget-conscious nutrition. ${filterSpecific.budgetCoverage || 0} cost-effective protein sources.`,
    'training-day': `Higher calorie and carb foods appropriate for training days (2000 kcal, 220g carbs). ${filteredCount} products for workout fuel.`,
    'rest-day': `Lower calorie foods for rest days (1750 kcal, 120g carbs) with focus on muscle maintenance. ${filteredCount} products for recovery days.`,
  };

  return descriptions[filterName] || `Specialized nutrition filter with ${filteredCount} curated products.`;
}

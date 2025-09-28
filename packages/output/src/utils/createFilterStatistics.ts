import type { FilteredProduct, FilterStatistics } from '@picklist/types';

/**
 * Creates filter statistics from filtered products using existing FilterStatistics type.
 * Adapts internal data to match the existing type structure for consistency.
 *
 * @param totalProducts - Total input products
 * @param filteredProducts - Products after filtering
 * @param exclusions - Exclusion reasons and counts
 * @returns Filter statistics using existing type
 *
 * @example
 * ```typescript
 * const stats = createFilterStatistics(
 *   1000,
 *   filteredProducts,
 *   { 'missing-halal-data': 150, 'low-protein': 300 }
 * );
 * ```
 */


export function createFilterStatistics(
  totalProducts: number,
  filteredProducts: FilteredProduct[],
  exclusions: Record<string, number>
): FilterStatistics {
  const filteredCount = filteredProducts.length;
  const excludedCount = totalProducts - filteredCount;

  // Analyze filter-specific coverage using existing type structure
  const filterSpecific = {
    halalCoverage: filteredProducts.filter(p => p.halalCheck?.status === 'halal').length,
    proteinCoverage: filteredProducts.filter(p => p.proteinOptimization?.proteinDensityScore && p.proteinOptimization.proteinDensityScore > 0).length,
    postWorkoutCoverage: filteredProducts.filter(p => p.postWorkoutOptimization?.postWorkoutScore && p.postWorkoutOptimization.postWorkoutScore > 0).length,
    fatLossCoverage: filteredProducts.filter(p => p.fatLossCompatibility?.fatLossScore && p.fatLossCompatibility.fatLossScore > 0).length,
    budgetCoverage: filteredProducts.filter(p => p.price?.regular != null && p.price.regular > 0).length,
  };

  return {
    originalCount: totalProducts,
    filteredCount,
    excludedCount,
    filterSpecific,
    exclusionReasons: exclusions,
  };
}

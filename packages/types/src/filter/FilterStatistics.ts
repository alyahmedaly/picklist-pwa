export interface FilterStatistics {
  originalCount: number;
  filteredCount: number;
  excludedCount: number;
  filterSpecific: {
    halalCoverage?: number;
    proteinCoverage?: number;
    postWorkoutCoverage?: number;
    fatLossCoverage?: number;
    budgetCoverage?: number;
  };
  exclusionReasons: Record<string, number>;
}

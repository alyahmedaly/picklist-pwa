/**
 * Personal Health Extension: Evidence-based satiety intelligence scoring
 */

export interface SatietyIntelligence {
  /** Overall satiety score (0-100, higher = more satiating per calorie) */
  satietyScore: number;
  /** Breakdown of satiety contributing factors */
  satietyFactors: {
    /** Protein contribution to satiety (0-100) */
    proteinFactor: number;
    /** Fiber contribution to satiety (0-100) */
    fiberFactor: number;
    /** Food volume/water contribution (0-100) */
    volumeFactor: number;
    /** Processing quality score (30-95, higher = less processed, follows NOVA classification) */
    processingScore: number;
  };
  /** Expected satiety duration in minutes per 100kcal */
  expectedSatietyDuration: number;
  /** Calorie efficiency for satiety (lower = more efficient) */
  caloriePerSatietyRatio: number;
  /** Optional confidence level for satiety analysis data quality */
  confidence?: 'high' | 'medium' | 'low';
}

/**
 * Personal Health Extension: Protein density optimization scoring
 */

export interface ProteinScoring {
  /** Protein optimization score (0-100, higher = better) */
  proteinDensityScore: number;
  /** Protein content per 100g */
  proteinContribution: number;
  /** Percentage of daily 170g target per typical serving */
  targetContribution: number;
}

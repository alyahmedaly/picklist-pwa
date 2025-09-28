/** Consumer-friendly additive summary */

export interface AdditivesSummary {
  /** E-numbers found */
  eNumbers: string[];
  /** Human-readable summary text */
  summary: string;
  /** Safety warnings array */
  warnings: string[];
  /** Dietary restriction info */
  dietary: string[];
  /** Dutch functional categories */
  categories: string[];
}

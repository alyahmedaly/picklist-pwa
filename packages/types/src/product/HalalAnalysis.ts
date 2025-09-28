/**
 * Personal Health Extension: Structured Halal compliance analysis
 * Mirrors specification in specs/009-halal-and-protein/data-model.md
 */

export interface HalalAnalysis {
  /** Overall Halal compliance status */
  status: 'halal' | 'haram' | 'questionable' | 'unknown';
  /** Specific compliance flags */
  flags: {
    /** Contains animal-derived gelatin (E441, etc.) */
    hasAnimalGelatine: boolean;
    /** Contains alcohol or alcohol-derived ingredients */
    hasAlcohol: boolean;
    /** Contains pork or pork-derived ingredients */
    hasPork: boolean;
    /** Contains non-Halal meat sources */
    hasNonHalalMeat: boolean;
    /** Contains E-numbers with doubtful Halal status */
    hasDoubtfulAdditives: boolean;
  };
  /** Detailed analysis results */
  details: {
    /** Specific ingredients flagged as problematic */
    problematicIngredients: string[];
    /** E-numbers with Halal concerns */
    eNumberConcerns: string[];
    /** Alcohol percentage if detected */
    alcoholContent?: number;
  };
  /** Confidence level in the analysis */
  confidence: 'high' | 'medium' | 'low';

}

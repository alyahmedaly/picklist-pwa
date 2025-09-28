/**
 * Contract: Halal Analysis Interface
 * Feature: 009-halal-and-protein
 * Purpose: Define types and validation rules for Halal compliance detection
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

export interface HalalAnalysisInput {
  /** Dutch ingredient list */
  ingredients: string;
  /** Detected E-numbers from existing analysis */
  eNumbers: string[];
  /** Product category for context */
  category?: string;
}

export interface HalalAnalysisResult {
  /** Halal analysis data */
  analysis: HalalAnalysis;
  /** Processing metadata */
  metadata: {
    /** Time taken for analysis in milliseconds */
    processingTime: number;
    /** Version of Halal database used */
    databaseVersion: string;
    /** Number of ingredients analyzed */
    ingredientCount: number;
  };
}

/**
 * Validation Functions
 */

export function isValidHalalStatus(status: string): status is HalalAnalysis['status'] {
  return ['halal', 'haram', 'questionable', 'unknown'].includes(status);
}

export function isValidConfidence(confidence: string): confidence is HalalAnalysis['confidence'] {
  return ['high', 'medium', 'low'].includes(confidence);
}

export function validateHalalAnalysis(analysis: any): analysis is HalalAnalysis {
  return (
    analysis &&
    typeof analysis === 'object' &&
    isValidHalalStatus(analysis.status) &&
    typeof analysis.flags === 'object' &&
    typeof analysis.flags.hasAnimalGelatine === 'boolean' &&
    typeof analysis.flags.hasAlcohol === 'boolean' &&
    typeof analysis.flags.hasPork === 'boolean' &&
    typeof analysis.flags.hasNonHalalMeat === 'boolean' &&
    typeof analysis.flags.hasDoubtfulAdditives === 'boolean' &&
    typeof analysis.details === 'object' &&
    Array.isArray(analysis.details.problematicIngredients) &&
    Array.isArray(analysis.details.eNumberConcerns) &&
    (analysis.details.alcoholContent === undefined ||
      typeof analysis.details.alcoholContent === 'number') &&
    isValidConfidence(analysis.confidence)
  );
}

/**
 * Test Helper Functions
 */

export function createMockHalalAnalysis(overrides: Partial<HalalAnalysis> = {}): HalalAnalysis {
  return {
    status: 'halal',
    flags: {
      hasAnimalGelatine: false,
      hasAlcohol: false,
      hasPork: false,
      hasNonHalalMeat: false,
      hasDoubtfulAdditives: false,
    },
    details: {
      problematicIngredients: [],
      eNumberConcerns: [],
    },
    confidence: 'high',
    ...overrides,
  };
}

export function createHaramAnalysis(reasons: string[]): HalalAnalysis {
  return {
    status: 'haram',
    flags: {
      hasAnimalGelatine: reasons.includes('gelatin'),
      hasAlcohol: reasons.includes('alcohol'),
      hasPork: reasons.includes('pork'),
      hasNonHalalMeat: reasons.includes('non-halal-meat'),
      hasDoubtfulAdditives: reasons.includes('additives'),
    },
    details: {
      problematicIngredients: reasons,
      eNumberConcerns: reasons.filter((r) => r.startsWith('E')),
    },
    confidence: 'high',
  };
}

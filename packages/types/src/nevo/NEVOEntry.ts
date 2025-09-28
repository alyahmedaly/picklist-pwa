/**
 * NEVO (Nederlandse Voedingsstoffendatabase) Type Definitions
 *
 * Types for integrating with the Dutch national nutrition database
 * to provide accurate glycemic index estimation based on food composition.
 */

/**
 * Core NEVO database entry representing a single food item
 * with essential nutritional data for GI calculation.
 */
export interface NEVOEntry {
  /** NEVO database unique identifier */
  code: string;

  /** Dutch food name from NEVO database */
  dutchName: string;

  /** English translation of food name */
  englishName: string;

  /** NEVO food group classification (Dutch) */
  foodGroup: string;

  /** English translation of food group */
  foodGroupEn: string;

  /** Synonyms and alternative names */
  synonyms: string[];

  // Nutritional data for GI calculation
  /** Total carbohydrates per 100g */
  carbs: number;

  /** Simple sugars per 100g */
  sugars: number;

  /** Complex starch per 100g */
  starch: number;

  /** Dietary fiber per 100g */
  fiber: number;

  /** Energy content in kcal per 100g */
  calories: number;

  /** Protein content per 100g */
  protein: number;

  /** Fat content per 100g */
  fat: number;
}

/**
 * Optimized NEVO database structure with lookup indexes
 * for fast ingredient matching and GI calculation.
 */
export interface NEVODatabase {
  /** All NEVO entries */
  entries: NEVOEntry[];

  /** Index by normalized food names for fast lookup */
  nameIndex: Map<string, NEVOEntry[]>;

  /** Index by food group for category-based estimation */
  groupIndex: Map<string, NEVOEntry[]>;

  /** Database metadata */
  metadata: {
    version: string;
    totalEntries: number;
    lastUpdated: string;
  };
}

/**
 * Result of NEVO food matching with confidence scoring
 */
export interface NEVOMatch {
  /** Matched NEVO entry */
  entry: NEVOEntry;

  /** Match confidence score (0-1) */
  confidence: number;

  /** Type of match found */
  matchType: 'exact' | 'fuzzy' | 'synonym' | 'category';

  /** Matched text that triggered the result */
  matchedText: string;
}

/**
 * Glycemic index calculation result with metadata
 */
export interface GICalculationResult {
  /** Calculated GI value (0-100 scale) */
  giValue: number;

  /** GI multiplier for existing scoring system (1.0-1.5) */
  multiplier: number;

  /** Confidence in the calculation */
  confidence: 'high' | 'medium' | 'low';

  /** Source of GI calculation */
  source: 'nevo_composition' | 'pattern_fallback' | 'category_estimate';

  /** NEVO entry used (if any) */
  nevoEntry?: NEVOEntry;

  /** Composition factors used in calculation */
  factors?: {
    baseGI: number;
    fiberEffect: number;
    sugarEffect: number;
    starchEffect: number;
  };
}

/**
 * Food group to base GI mapping
 * Based on scientific literature and food group characteristics
 */
export interface FoodGroupGI {
  /** Dutch food group name */
  group: string;

  /** English food group name */
  groupEn: string;

  /** Base GI value for this food group */
  baseGI: number;

  /** Confidence in base GI value */
  confidence: 'high' | 'medium' | 'low';

  /** Scientific source/reference */
  source: string;
}
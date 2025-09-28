import type { Product } from '@picklist/types';


export interface Price {
  regular: number;
  sale?: number;
  currency: string;
}

export interface UnitInfo {
  raw: string;
  packCount?: number;
  amount?: number;
  amountUnit?: string;
}

export interface Nutrition {
  kcal?: number;
  kJ?: number;
  fat?: number;
  satFat?: number;
  carbs?: number;
  sugars?: number;
  fiber?: number;
  protein?: number;
  salt?: number;
  unit: string;
}

export interface AllergensInfo {
  contains: string[];
  mayContain: string[];
  treeNutDetail?: string[];
}

export interface Flags {
  isFood: boolean;
  isPetFood?: boolean;
  addedSugarFlag?: boolean;
  addedSaltFlag?: boolean;
  artificialSweetenersFlag?: boolean;
}

export interface AddedInfo {
  sugarsPer100?: number;
  saltPer100?: number;
}

/** Hierarchical category structure for enhanced JSON output */
export interface CategoryTree {
  /** Original flat array of categories */
  tree: string[];
  /** Primary category (first in array) */
  primary: string;
  /** Breadcrumb path joined with " > " */
  breadcrumbs: string;
  /** Category depth (array length) */
  depth: number;
}

/** Structured ingredient information with core/additives separation */
export interface IngredientInfo {
  /** Core food ingredients (non-additive) */
  core: string[];
  /** E-number additives found in ingredients */
  additives: string[];
  /** Special statements (added sugar/salt warnings) */
  statements: string[];
  /** Total ingredient count */
  total: number;
}

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

export interface NutritionalTags {
  netCarbs?: number;
  netCarbsBucket?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  lowCarb?: boolean;
  highProtein?: boolean;
  proteinDensity?: 'low' | 'moderate' | 'high';
  highFiber?: boolean;
  lactoseFree?: boolean;
  glutenFree?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  plantBased?: boolean;
}

export type FunctionalCategory =
  | 'Antiklontermiddel'
  | 'Antioxidant'
  | 'Antischuimmiddel'
  | 'Bevochtigingsmiddel'
  | 'Complexvormer'
  | 'Conserveermiddel'
  | 'Contrastverhoger'
  | 'Drijfgas'
  | 'Draagstof'
  | 'Emulgator'
  | 'Geleermiddel'
  | 'Gemodificeerd zetmeel'
  | 'Glansmiddel'
  | 'Kleurstof'
  | 'Meelverbeteraar'
  | 'Rijsmiddel'
  | 'Schuimmiddel'
  | 'Smaakversterker'
  | 'Smeltzout'
  | 'Stabilisator'
  | 'Verdikkingsmiddel'
  | 'Verpakkingsgas'
  | 'Verstevigingsmiddel'
  | 'Voedingszuur'
  | 'Vulstof'
  | 'Zoetstof'
  | 'Zuurteregelaar';

export interface AdditiveInfo {
  // Core identification
  eNumbers: string[];
  dutchCategories: string[];
  functionalCategories: string[];

  // Detection metadata
  totalAdditives: number;
  naturalAdditives: string[];
  syntheticAdditives: string[];

  // Specific additive collections by function
  preservatives: string[];
  colors: string[];
  antioxidants: string[];
  stabilizers: string[];
  sweeteners: string[];
  flavorEnhancers: string[];
}

export interface AdditiveFlags {
  // Safety warnings (mandatory by EU regulations)
  requiresChildWarning: boolean;
  containsAllergenicAdditives: boolean;
  requiresPKUWarning: boolean;
  mayWorsenAsthmaEczema: boolean;

  // Dietary restrictions
  hasAnimalDerivedAdditives: boolean;
  organicCompatible: boolean;

  // Consumer preferences
  hasPreservatives: boolean;
  hasArtificialColors: boolean;
  hasArtificialSweeteners: boolean;
  hasFlavorEnhancers: boolean;

  // Clean label indicators
  hasNaturalAlternatives: boolean;
  allNaturalAdditives: boolean;
}

/** Health grade classification using equal 20% distribution */
export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'E';

/** Components for EU Nutri-Score calculation with validation rules */
export interface NutriScoreComponents {
  /** Energy in kJ per 100g */
  energy: number;
  /** Saturated fat in g per 100g */
  saturatedFat: number;
  /** Sugars in g per 100g */
  sugars: number;
  /** Sodium in mg per 100g (converted from salt) */
  sodium: number;
  /** Fiber in g per 100g (positive scoring) */
  fiber?: number;
  /** Protein in g per 100g (positive scoring) */
  protein?: number;
  /** Fruits/vegetables percentage (positive scoring) */
  fruitsVegetables?: number;
}

/** Context for percentile ranking calculations */
export interface ScoringContext {
  /** Total products in scoring dataset */
  totalProducts: number;
  /** Products with valid nutrition data */
  scorableProducts: number;
  /** Category being scored (for category-relative scoring) */
  category?: string;
  /** Dataset creation timestamp */
  timestamp: Date;
}

/** Grade distribution statistics for validation */
export interface ScoreDistribution {
  /** Grade counts */
  gradeCount: { A: number; B: number; C: number; D: number; E: number };
  /** Total graded products */
  total: number;
  /** Distribution percentages */
  distribution: { A: number; B: number; C: number; D: number; E: number };
}

/** Conflict record capturing differing non-null values between duplicates. */
export interface DuplicateConflict {
  field: string; // field name with conflict
  first: unknown; // value from first occurrence
  second: unknown; // value from later occurrence
  note?: string; // optional explanation (e.g., 'numeric_tolerance_exceeded')
}

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
    /** Processing level penalty (0-100, lower = more processed) */
    processingPenalty: number;
  };
  /** Expected satiety duration in minutes per 100kcal */
  expectedSatietyDuration: number;
  /** Calorie efficiency for satiety (lower = more efficient) */
  caloriePerSatietyRatio: number;
}


export interface IndexEntry {
  id: Product['id'];
  name: string;
  price: number;
  image?: string;
  categories?: string[];
  isFood: boolean;
}

export function validateProduct(p: Product): string[] {
  const errs: string[] = [];
  if (p == null) {
    errs.push('null');
    return errs;
  }
  if (p.id === undefined || p.id === null || p.id === '') errs.push('id_missing');
  if (!p.name) errs.push('name_missing');
  if (!p.price || typeof p.price.regular !== 'number') errs.push('price_regular_missing');
  if (p.price && p.price.sale !== undefined && p.price.sale >= p.price.regular)
    errs.push('price_sale_invalid');
  return errs;
}

// ====================
// Filter System Types
// ====================

/**
 * Halal compliance filter criteria.
 * Validation rules:
 * - strict: boolean required
 * - excludeAlcohol and excludeGelatine: must be boolean if provided
 */
export interface HalalFilterCriteria {
  /** Require confirmed halal status (vs allowing 'questionable') */
  strict: boolean;
  /** Exclude products with alcohol content */
  excludeAlcohol?: boolean;
  /** Exclude products with animal gelatine */
  excludeGelatine?: boolean;
  /** Allowed E-numbers for less strict filtering */
  additiveWhitelist?: string[];
}

/**
 * High-protein filter criteria.
 * Validation rules:
 * - min: must be 0-100 (grams per 100g)
 * - target: must be 50-300 (daily target in grams)
 * - minEfficiency: must be 0-100 if provided
 */
export interface ProteinFilterCriteria {
  /** Minimum protein per 100g */
  min: number;
  /** Daily protein target (default: 170g for Ali) */
  target: number;
  /** Minimum protein efficiency score (0-100) */
  minEfficiency?: number;
  /** Preferred protein sources */
  preferredSources?: string[];
}

/**
 * Post-workout recovery filter criteria.
 * Validation rules:
 * - minRatio and maxRatio: must be 1.0-6.0, minRatio <= maxRatio
 * - preferHighGI: boolean if provided
 */
export interface PostWorkoutFilterCriteria {
  /** Minimum carb:protein ratio */
  minRatio: number;
  /** Maximum carb:protein ratio */
  maxRatio: number;
  /** Prefer high glycemic index foods */
  preferHighGI?: boolean;
  /** Recovery window timing */
  recoveryWindow?: 'immediate' | 'moderate' | 'extended';
}

/**
 * Fat loss compatibility filter criteria.
 * Validation rules:
 * - maxCalories: must be 50-300 (calories per 100g)
 * - minSatiety: must be 0-100 if provided
 * - preferHighVolume: boolean if provided
 */
export interface FatLossFilterCriteria {
  /** Maximum calories per 100g */
  maxCalories: number;
  /** Minimum satiety score (0-100) */
  minSatiety?: number;
  /** Prefer high volume foods */
  preferHighVolume?: boolean;
  /** Target calorie deficit */
  targetDeficit?: number;
}

/**
 * Budget optimization filter criteria.
 * Validation rules:
 * - maxPrice: must be 0.50-10.00 (euros per 100g/ml) if provided
 * - maxTotal: must be 20-200 (euros per week) if provided
 * - optimizeProtein: boolean if provided
 */
export interface BudgetFilterCriteria {
  /** Maximum price per 100g/ml (euros) */
  maxPrice?: number;
  /** Optimize for protein per euro efficiency */
  optimizeProtein?: boolean;
  /** Maximum total daily budget (euros) */
  maxTotal?: number;
  /** Preferred stores for price optimization */
  preferredStores?: string[];
}

/**
 * Training context filter criteria.
 * Validation rules:
 * - targetCalories: must be 1200-3500 if provided
 * - targetCarbs: must be 50-500 if provided
 * - mealTiming: must be valid enum value if provided
 */
export interface ContextFilterCriteria {
  /** Training day vs rest day */
  trainingDay?: boolean;
  /** Target daily calories */
  targetCalories?: number;
  /** Target daily carbs */
  targetCarbs?: number;
  /** Meal timing context */
  mealTiming?: 'pre_workout' | 'post_workout' | 'general';
  /** Avoid specific combinations (e.g., "tuna+rice", "honey") */
  avoidCombinations?: string[];
}


/**
 * Statistics for filtered output generation.
 */
export interface FilterStatistics {
  /** Original product count */
  originalCount: number;
  /** Products after filtering */
  filteredCount: number;
  /** Products excluded by filters */
  excludedCount: number;
  /** Filter-specific coverage statistics */
  filterSpecific: {
    halalCoverage?: number;
    proteinCoverage?: number;
    postWorkoutCoverage?: number;
    fatLossCoverage?: number;
    budgetCoverage?: number;
  };
  /** Processing time in milliseconds */
  processingTime: number;
  /** Exclusion reasons */
  exclusionReasons: Record<string, number>;
}

// ============================================================================
// FLEXIBLE SCHEMA ENTITY TYPES
// ============================================================================

/**
 * Core product entity for flexible database schema
 */
export interface FlexibleProduct {
  readonly id: string;
  readonly name: string;
  readonly price_regular: number;
  readonly price_sale?: number;
  readonly unit_amount: number;
  readonly unit_type: 'g' | 'ml' | 'pieces' | 'kg' | 'l';
  readonly brand?: string;
  readonly created_at: number;
  readonly updated_at: number;
}

/**
 * Category entity with hierarchical support
 */
export interface FlexibleCategory {
  readonly id: string;
  readonly name: string;
  readonly parent_id?: string;
  readonly path: string;
  readonly depth: number;
  readonly left_bound: number;
  readonly right_bound: number;
  readonly product_count: number;
  readonly display_order: number;
}

/**
 * Product-Category junction table
 */
export interface FlexibleProductCategory {
  readonly product_id: string;
  readonly category_id: string;
  readonly is_primary: boolean;
  readonly relevance_score: number;
}

/**
 * Normalized nutrition entity
 */
export interface FlexibleProductNutrition {
  readonly product_id: string;
  readonly kcal?: number;
  readonly kj?: number;
  readonly protein?: number;
  readonly carbs?: number;
  readonly sugars?: number;
  readonly fat?: number;
  readonly saturated_fat?: number;
  readonly fiber?: number;
  readonly salt?: number;
  readonly sodium?: number;
}

/**
 * Product flags entity
 */
export interface FlexibleProductFlag {
  readonly product_id: string;
  readonly flag_type: ProductFlagType;
  readonly flag_value: boolean;
  readonly confidence: number;
  readonly source: string;
}

/**
 * Product scores entity
 */
export interface FlexibleProductScore {
  readonly product_id: string;
  readonly score_type: ProductScoreType;
  readonly score_value: number;
  readonly context?: ProductScoreContext;
  readonly computed_at: number;
  readonly metadata?: string;
}

/**
 * Product additives entity
 */
export interface FlexibleProductAdditive {
  readonly product_id: string;
  readonly e_number?: string;
  readonly additive_name: string;
  readonly functional_category: string;
  readonly dutch_category?: string;
  readonly safety_flags?: string;
  readonly is_natural: boolean;
}

/**
 * Product search terms entity
 */
export interface FlexibleProductSearchTerm {
  readonly product_id: string;
  readonly term: string;
  readonly term_type: SearchTermType;
  readonly weight: number;
  readonly language: 'nl' | 'en';
}

// ============================================================================
// FLEXIBLE SCHEMA ENUMS
// ============================================================================

export type ProductFlagType =
  | 'is_vegan'
  | 'is_vegetarian'
  | 'is_gluten_free'
  | 'is_lactose_free'
  | 'is_halal'
  | 'is_kosher'
  | 'is_organic'
  | 'is_high_protein'
  | 'is_low_carb'
  | 'is_high_fiber'
  | 'has_artificial_colors'
  | 'has_preservatives'
  | 'has_sweeteners';

export type ProductScoreType =
  | 'protein_efficiency'
  | 'calorie_efficiency'
  | 'satiety_score'
  | 'nutri_score'
  | 'health_score'
  | 'sustainability_score'
  | 'post_workout_score'
  | 'fat_loss_score'
  | 'budget_score'
  | 'contextual_score';

export type ProductScoreContext =
  | 'training_day'
  | 'rest_day'
  | 'cutting'
  | 'bulking'
  | 'maintenance';

export type SearchTermType =
  | 'name'
  | 'brand'
  | 'ingredient'
  | 'category'
  | 'synonym'
  | 'alternative_name'
  | 'description'
  | 'nutritional_tag'
  | 'dietary_flag';

/**
 * Complete flexible schema data structure
 */
export interface FlexibleSchemaData {
  products: FlexibleProduct[];
  categories: FlexibleCategory[];
  productCategories: FlexibleProductCategory[];
  productNutrition: FlexibleProductNutrition[];
  productFlags: FlexibleProductFlag[];
  productScores: FlexibleProductScore[];
  productAdditives: FlexibleProductAdditive[];
  productSearchTerms: FlexibleProductSearchTerm[];
}

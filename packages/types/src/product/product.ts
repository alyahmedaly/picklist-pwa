import type { AddedInfo } from './AddedInfo.ts';
import type { AdditiveFlags } from './AdditiveFlags.ts';
import type { AdditiveInfo } from './AdditiveInfo.ts';
import type { AdditivesSummary } from './AdditivesSummary.ts';
import type { AllergensInfo } from './AllergensInfo.ts';
import type { BodyCompositionContext } from './BodyCompositionContext.ts';
import type { CalorieEfficiencyScore } from './CalorieEfficiencyScore.ts';
import type { CategoryTree } from './CategoryTree.ts';
import type { DuplicateConflict } from './DuplicateConflict.ts';
import type { FatLossScore } from './FatLossScore.ts';
import type { Flags } from './Flags.ts';
import type { HalalAnalysis } from './HalalAnalysis.ts';
import type { HealthGrade } from './HealthGrade.ts';
import type { IngredientInfo } from './IngredientInfo.ts';
import type { Nutrition } from './Nutrition.ts';
import type { NutritionalTags } from './NutritionalTags.ts';
import type { PostWorkoutScore } from './PostWorkoutScore.ts';
import type { Price } from './Price.ts';
import type { ProteinScoring } from './ProteinScoring.ts';
import type { SatietyIntelligence } from './SatietyIntelligence.ts';
import type { UnitInfo } from './UnitInfo.ts';

export interface Product {
  id: string;
  name: string;
  price: Price;
  categories?: string[];
  unit?: UnitInfo;
  nutrition?: Nutrition;
  ingredients?: string[];
  allergens?: AllergensInfo;
  images?: { low?: string; med?: string; high?: string; primary: string };
  flags?: Flags;
  added?: AddedInfo;
  nutritionalTags?: NutritionalTags;
  additiveInfo?: AdditiveInfo;
  additiveFlags?: AdditiveFlags;
  /** Conflicts collected during duplicate merge (deterministic ordering). */
  duplicate_conflicts?: DuplicateConflict[];
  addedSugarsPer100?: number;

  // Hybrid Nutrition Scoring fields (all optional for backward compatibility)
  /** EU Nutri-Score value (-15 to +40 range) */
  nutriScore?: number;
  /** Global health score (0-100 range, 1 decimal max) */
  globalHealthScore?: number;
  /** Global health grade (A-E) */
  globalHealthGrade?: HealthGrade;
  /** Category-relative health score (0-100 range, 1 decimal max) */
  categoryHealthScore?: number;
  /** Category-relative health grade (A-E) */
  categoryHealthGrade?: HealthGrade;

  // Personal Health Extensions (optional for backward compatibility)
  /** Halal compliance analysis */
  halalCheck?: HalalAnalysis;
  /** Protein optimization scoring */
  proteinOptimization?: ProteinScoring;
  /** Satiety intelligence scoring */
  satietyAnalysis?: SatietyIntelligence;

  // Body Recomposition Scoring (optional for backward compatibility)
  /** Post-workout recovery optimization scoring */
  postWorkoutOptimization?: PostWorkoutScore;
  /** Fat loss compatibility scoring */
  fatLossCompatibility?: FatLossScore;
  /** Enhanced calorie efficiency scoring */
  enhancedCalorieEfficiency?: CalorieEfficiencyScore;
  /** Body composition context and multipliers */
  bodyCompositionContext?: BodyCompositionContext;

  // Enhanced structured fields for UI-optimized JSON output
  /** Hierarchical category structure */
  categoryTree?: CategoryTree;
  /** Structured ingredient information */
  ingredientInfo?: IngredientInfo;
  /** Consumer-friendly additive summary */
  additivesSummary?: AdditivesSummary;
  /** Consolidated safety warnings from all sources */
  warnings?: string[];
}

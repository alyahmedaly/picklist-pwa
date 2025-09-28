
/**
 * Composite filter criteria combining all available filter types.
 * Uses boolean AND logic - products must match ALL specified criteria.
 */

import type { FatLossFilterCriteria } from "./FatLossFilterCriteria.ts";
import type { PostWorkoutFilterCriteria } from "./PostWorkoutFilterCriteria.ts";
import type { ProteinFilterCriteria } from "./ProteinFilterCriteria.ts";
import type { HalalFilterCriteria } from "./HalalFilterCriteria.ts";
import type { ContextFilterCriteria } from "./ContextFilterCriteria.ts";
import type { BudgetFilterCriteria } from "./BudgetFilterCriteria.ts";



export interface FilterCriteria {
  /** Halal compliance filtering using existing halalCheck data */
  halal?: HalalFilterCriteria;
  /** High-protein filtering using existing proteinOptimization data */
  protein?: ProteinFilterCriteria;
  /** Post-workout recovery filtering using existing postWorkoutOptimization data */
  postWorkout?: PostWorkoutFilterCriteria;
  /** Fat loss compatible filtering using existing fatLossCompatibility data */
  fatLoss?: FatLossFilterCriteria;
  /** Budget optimization filtering */
  budget?: BudgetFilterCriteria;
  /** Training context filtering */
  context?: ContextFilterCriteria;
}

/**
 * Core Filtering Engine Contract
 *
 * Primary interface for filtering products based on multiple criteria.
 * Implements boolean AND logic across all specified filter criteria.
 */

import type { Product } from '../../../src/data/transform/types';

export interface FilterCriteria {
  halal?: HalalFilterCriteria;
  protein?: ProteinFilterCriteria;
  postWorkout?: PostWorkoutFilterCriteria;
  fatLoss?: FatLossFilterCriteria;
  budget?: BudgetFilterCriteria;
  context?: ContextFilterCriteria;
}

export interface HalalFilterCriteria {
  strict: boolean;
  excludeAlcohol: boolean;
  excludeGelatine: boolean;
  additiveWhitelist?: string[];
}

export interface ProteinFilterCriteria {
  minProteinPer100g: number;
  minEfficiencyScore?: number;
  targetDailyAmount: number;
  preferredSources?: string[];
}

export interface PostWorkoutFilterCriteria {
  maxCarbProteinRatio: number;
  minCarbProteinRatio: number;
  preferHighGI: boolean;
  recoveryWindow: 'immediate' | 'moderate' | 'extended';
}

export interface FatLossFilterCriteria {
  maxCaloriesPer100g: number;
  minSatietyScore?: number;
  preferHighVolume: boolean;
  targetDeficit?: number;
}

export interface BudgetFilterCriteria {
  maxPricePerUnit?: number;
  optimizeProteinPerEuro: boolean;
  maxTotalBudget?: number;
  preferredStores?: string[];
}

export interface ContextFilterCriteria {
  isTrainingDay: boolean;
  targetCalories: number;
  targetCarbs: number;
  mealTiming?: 'pre_workout' | 'post_workout' | 'general';
  avoidCombinations?: string[];
}

export interface FilteredProduct extends Product {
  filterMatch: FilterMatchIndicators;
  filterScore?: number;
  portionRecommendation?: PortionInfo;
}

export interface FilterMatchIndicators {
  halal?: boolean;
  protein?: boolean;
  postWorkout?: boolean;
  fatLoss?: boolean;
  budget?: boolean;
  context?: boolean;
}

export interface PortionInfo {
  servingSize: number;
  servingUnit: string;
  macrosPerServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  costPerServing?: number;
}

/**
 * Primary filtering function that applies all criteria with boolean AND logic.
 *
 * @param products - Array of products with existing scoring data
 * @param criteria - Filter criteria configuration
 * @returns Filtered products matching ALL specified criteria
 *
 * @example
 * ```typescript
 * const criteria: FilterCriteria = {
 *   halal: { strict: true, excludeAlcohol: true, excludeGelatine: true },
 *   protein: { minProteinPer100g: 20, targetDailyAmount: 170 }
 * };
 *
 * const filtered = createFilter(products, criteria);
 * // Returns only products that are both halal AND high-protein
 * ```
 */
export function createFilter(products: Product[], criteria: FilterCriteria): FilteredProduct[];

/**
 * Validates filter criteria against business rules.
 *
 * @param criteria - Filter criteria to validate
 * @throws Error if criteria are invalid
 */
export function validateFilterCriteria(criteria: FilterCriteria): void;

/**
 * Creates default filter criteria for Ali's specific needs.
 *
 * @param options - Override specific defaults
 * @returns FilterCriteria optimized for Ali's preferences
 */
export function createAliDefaults(options?: Partial<FilterCriteria>): FilterCriteria;

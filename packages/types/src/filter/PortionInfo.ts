/**
 * Portion information for meal planning and macro calculations.
 */

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

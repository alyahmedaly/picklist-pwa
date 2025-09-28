/**
 * Budget optimization filter criteria for Ali's Dutch market shopping.
 *
 * Optimizes protein per euro efficiency while respecting total budget constraints.
 * Integrates with Dutch supermarket pricing and store preferences.
 *
 * @example
 * ```typescript
 * const aliBudgetCriteria: BudgetFilterCriteria = {
 *   maxPricePerUnit: 2.50,           // Max €2.50 per 100g/100ml
 *   optimizeProteinPerEuro: true,    // Focus on protein efficiency
 *   maxTotalBudget: 50,              // €50 weekly budget
 *   preferredStores: ['AH', 'Jumbo'] // Dutch supermarket chains
 * };
 * ```
 */

export interface BudgetFilterCriteria {
  /**
   * Maximum price per 100g/100ml in euros.
   * Typical range: €0.50-€5.00 for Dutch market products.
   * Optional field - when undefined, no price filtering applied.
   */
  maxPricePerUnit?: number;

  /**
   * Optimize for protein content per euro spent.
   * True prioritizes foods with best protein-to-price ratio.
   * Essential for Ali's high protein requirements on budget.
   */
  optimizeProteinPerEuro: boolean;

  /**
   * Maximum total daily/weekly budget in euros.
   * Used for portion size and meal planning calculations.
   * Optional field for advanced budget planning.
   */
  maxTotalBudget?: number;

  /**
   * Preferred Dutch supermarket chains for shopping.
   * Common options: 'AH' (Albert Heijn), 'Jumbo', 'Plus', 'Coop'.
   * Optional field - when undefined, all stores considered.
   */
  preferredStores?: string[];
}

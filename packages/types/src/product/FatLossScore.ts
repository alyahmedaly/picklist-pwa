/**
 * Fat loss goal alignment through satiation efficiency analysis.
 *
 * Evaluates products for cutting phases by analyzing calorie density,
 * satiety per calorie ratios, and volume advantages.
 */

export interface FatLossScore {
  /** Fat loss compatibility score (0-100 scale) */
  fatLossScore: number;

  /** Energy density in kcal per 100g */
  calorieDensity: number;

  /** Calorie density classification based on WHO/CDC thresholds */
  calorieDensityClass: 'low' | 'moderate' | 'high';

  /** Satiety score per calorie efficiency ratio */
  satietyEfficiency: number;

  /** High volume with low calorie benefit indicator */
  volumeAdvantage: boolean;

  /** Data quality and completeness indicator */
  confidence: 'high' | 'medium' | 'low';
}

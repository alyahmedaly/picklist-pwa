/**
 * Enhanced Calorie Efficiency Scoring Implementation
 *
 * Multi-dimensional calorie efficiency analysis combining protein density,
 * satiety effectiveness, micronutrient density, and processing penalties.
 *
 * Key Features:
 * - Weighted scoring: 40% protein + 30% satiety + 20% micronutrient + 10% processing
 * - Thermic effect calculation based on macronutrient composition
 * - NOVA processing penalty integration
 * - Integration with existing protein and satiety scoring systems
 *
 * @module computeEnhancedCalorieEfficiency
 */

import type { CalorieEfficiencyScore, Product } from '@picklist/types';
import { estimateMicronutrientDensity } from '../utils/bodyRecompositionHelpers.ts';
import {
  extractCalories,
  extractProtein,
  hasValidCalories,
  extractCarbs,
  extractFat,
  createNutritionObject,
} from '../utils/nutritionUtils.ts';
import { BODY_RECOMPOSITION_VALIDATION, isValidScore } from '../utils/bodyRecomposition.ts';

/**
 * Computes enhanced calorie efficiency score for a product.
 *
 * Analyzes multiple dimensions of nutritional efficiency per calorie:
 * protein density, satiety effectiveness, micronutrient density, and processing impact.
 *
 * @param product - Product with nutrition data and existing scoring analysis
 * @returns CalorieEfficiencyScore or undefined if insufficient data
 */
export const computeEnhancedCalorieEfficiency = (
  product: Partial<Product>,
): CalorieEfficiencyScore | undefined => {
  // Extract nutrition data using safe utilities
  const calories = extractCalories(product);
  const protein = extractProtein(product);

  if (
    !hasValidCalories(product) ||
    calories === undefined ||
    protein === undefined ||
    protein <= 0
  ) {
    return undefined;
  }

  const carbs = extractCarbs(product) ?? 0;
  const fat = extractFat(product) ?? 0;

  // Calculate protein efficiency (calories from protein / total calories)
  const proteinEfficiency = calculateProteinEfficiency(product, protein, calories);

  // Calculate satiety efficiency using existing satiety analysis
  const satietyEfficiency = calculateSatietyEfficiency(product, calories);

  // Estimate micronutrient density (use processingScore if available)
  const ingredients = product.ingredients || [];
  const categories = product.categories || [];
  const processingScore = product.satietyAnalysis?.satietyFactors?.processingScore;
  const micronutrientDensity = estimateMicronutrientDensity(ingredients, categories, processingScore);

  // Calculate thermic effect based on macronutrient composition
  const thermicEffect = calculateThermicEffect(protein, carbs, fat, calories);

  // Calculate processing penalty using existing additive info
  const processingPenalty = calculateProcessingPenalty(product);

  // Calculate weighted efficiency score
  const efficiencyScore = calculateWeightedEfficiency(
    proteinEfficiency,
    satietyEfficiency,
    micronutrientDensity,
    processingPenalty,
  );

  // Calculate confidence based on data completeness
  const nutritionForConfidence = createNutritionObject(product);
  const confidence = calculateEfficiencyConfidence(product, nutritionForConfidence);

  // Validate score bounds
  const finalScore = Math.max(0, Math.min(100, Math.round(efficiencyScore * 100) / 100));

  // Derive macro balance indicator (simple evenness metric across protein/carbs/fat calories)
  const macroBalance = (() => {
    const proteinCals = protein * 4;
    const carbCals = carbs * 4;
    const fatCals = fat * 9;
    const total = proteinCals + carbCals + fatCals;
    if (total <= 0) return 0;
    const ratios = [proteinCals / total, carbCals / total, fatCals / total];
    // Ideal even distribution ~33/33/33 -> lower variance => higher score
    const mean = ratios.reduce((s, r) => s + r, 0) / ratios.length;
    const variance = ratios.reduce((s, r) => s + (r - mean) ** 2, 0) / ratios.length;
    const balanceScore = Math.max(0, 100 - variance * 300); // scale variance inversely
    return Math.round(Math.min(balanceScore, 100) * 100) / 100;
  })();

  return {
    efficiencyScore: finalScore,
    proteinEfficiency: Math.round(proteinEfficiency * 100) / 100,
    satietyEfficiency: Math.round(satietyEfficiency * 100) / 100,
    micronutrientDensity: Math.round(micronutrientDensity * 100) / 100,
    thermicEffect: Math.round(thermicEffect * 100) / 100,
    processingPenalty: Math.round(processingPenalty * 100) / 100,
    confidence,
    macroBalance,
  };
};

/**
 * Calculates protein efficiency using existing protein optimization data or estimates.
 */
const calculateProteinEfficiency = (
  product: Partial<Product>,
  protein: number,
  calories: number,
): number => {
  // Try to use existing protein scoring if available
  const proteinOptimization = product.proteinOptimization;
  if (proteinOptimization && proteinOptimization.proteinDensityScore) {
    return Math.min(proteinOptimization.proteinDensityScore, 100);
  }

  // Fallback: calculate protein efficiency per calorie
  const proteinCalories = protein * 4; // 4 calories per gram protein
  const proteinPercentage = (proteinCalories / calories) * 100;

  // Optimal protein percentage scoring (20-35% is optimal)
  if (proteinPercentage >= 20 && proteinPercentage <= 35) {
    return 100; // Optimal range
  } else if (proteinPercentage >= 15) {
    return Math.max(60, 100 - (proteinPercentage - 35) * 2); // Gradual decline
  } else {
    return Math.max(20, proteinPercentage * 4); // Low protein penalty
  }
};

/**
 * Calculates satiety efficiency using existing satiety analysis or estimates.
 */
const calculateSatietyEfficiency = (product: Partial<Product>, calories: number): number => {
  // Try to use existing satiety analysis
  const satietyAnalysis = product.satietyAnalysis;
  if (satietyAnalysis && satietyAnalysis.satietyScore) {
    // Convert satiety score to efficiency (satiety per calorie)
    const satietyPerCalorie = (satietyAnalysis.satietyScore / calories) * 100;
    return Math.min(satietyPerCalorie * 10, 100); // Scale to reasonable range
  }

  // Fallback: estimate from fiber and protein (use dual-field approach)
  const protein = product.nutrition?.protein ?? 0;
  const fiber = product.nutrition?.fiber ?? 0;

  // Simple satiety estimation based on protein and fiber
  const proteinSatiety = Math.min(protein * 2, 40);
  const fiberSatiety = Math.min(fiber * 8, 30);
  const baseSatiety = proteinSatiety + fiberSatiety;

  return Math.min(baseSatiety, 100);
};

/**
 * Calculates thermic effect based on macronutrient composition.
 * Protein: 20-30%, Carbs: 5-10%, Fats: 0-3%
 */
const calculateThermicEffect = (
  protein: number,
  carbs: number,
  fat: number,
  calories: number,
): number => {
  const proteinCalories = protein * 4;
  const carbCalories = carbs * 4;
  const fatCalories = fat * 9;

  const proteinPercentage = proteinCalories / calories;
  const carbPercentage = carbCalories / calories;
  const fatPercentage = fatCalories / calories;

  // Thermic effect percentages
  const proteinThermic = proteinPercentage * 25; // 25% average for protein
  const carbThermic = carbPercentage * 7.5; // 7.5% average for carbs
  const fatThermic = fatPercentage * 1.5; // 1.5% average for fats

  const totalThermicEffect = (proteinThermic + carbThermic + fatThermic) * 100;

  return Math.min(totalThermicEffect, 20); // Cap at 20%
};

/**
 * Calculates processing penalty using existing additive info and NOVA classification.
 */
const calculateProcessingPenalty = (product: Partial<Product>): number => {
  const additiveInfo = product.additiveInfo;
  const ingredients = product.ingredients || [];

  let penalty = 0;

  // Additive-based penalty
  if (additiveInfo && additiveInfo.totalAdditives) {
    penalty += Math.min(additiveInfo.totalAdditives * 2, 20); // Max 20 points from additives
  }

  // Ingredient-based processing indicators
  const processedIndicators = [
    /syrup|sirop/i,
    /artificial|kunstmatig/i,
    /preservat|conserveer/i,
    /flavor|aroma/i,
    /modified|gemodificeerd/i,
    /isolate|isolaat/i,
  ];

  const processedCount = ingredients.reduce((count, ingredient) => {
    return count + processedIndicators.filter((pattern) => pattern.test(ingredient)).length;
  }, 0);

  penalty += Math.min(processedCount * 3, 10); // Max 10 points from processed ingredients

  return Math.min(penalty, 30); // Cap at 30%
};

/**
 * Calculates weighted efficiency score combining all components.
 * Weights: 40% protein + 30% satiety + 20% micronutrient + 10% processing
 */
const calculateWeightedEfficiency = (
  proteinEfficiency: number,
  satietyEfficiency: number,
  micronutrientDensity: number,
  processingPenalty: number,
): number => {
  const proteinWeight = proteinEfficiency * 0.4;
  const satietyWeight = satietyEfficiency * 0.3;
  const micronutrientWeight = micronutrientDensity * 0.2;
  const processingWeight = (100 - processingPenalty) * 0.1; // Invert penalty to bonus

  return proteinWeight + satietyWeight + micronutrientWeight + processingWeight;
};

/**
 * Calculates confidence level based on data quality and completeness.
 */
const calculateEfficiencyConfidence = (
  product: Partial<Product>,
  nutrition: Product['nutrition'],
): 'high' | 'medium' | 'low' => {
  let confidenceScore = 0;

  // Nutrition data completeness (35 points)
  if (nutrition?.kcal && nutrition?.protein) {
    confidenceScore += 15;

    if (nutrition.carbs !== undefined) confidenceScore += 5;
    if (nutrition.fat !== undefined) confidenceScore += 5;
    if (nutrition.fiber !== undefined) confidenceScore += 5;
    if (nutrition.sugars !== undefined) confidenceScore += 5;
  }

  // Existing scoring data (30 points)
  const proteinOptimization = product.proteinOptimization;
  const satietyAnalysis = product.satietyAnalysis;

  if (proteinOptimization) {
    confidenceScore += 15;
  }

  if (satietyAnalysis) {
    confidenceScore += 15;
  }

  // Ingredient data quality (20 points)
  const ingredients = product.ingredients || [];
  if (ingredients.length > 0) {
    confidenceScore += 10;
    if (ingredients.length >= 3) confidenceScore += 5;
    if (ingredients.length >= 5) confidenceScore += 5;
  }

  // Category and additive data (15 points)
  const categories = product.categories || [];
  const additiveInfo = product.additiveInfo;

  if (categories.length > 0) confidenceScore += 7;
  if (additiveInfo) confidenceScore += 8;

  // Classify confidence level
  if (confidenceScore >= 80) return 'high';
  if (confidenceScore >= 50) return 'medium';
  return 'low';
};

/**
 * Validates calorie efficiency score data integrity.
 * Used for testing and debugging purposes.
 */
export const validateCalorieEfficiencyScore = (score: CalorieEfficiencyScore): boolean => {
  const validation = BODY_RECOMPOSITION_VALIDATION.CALORIE_EFFICIENCY;

  return (
    isValidScore(score.efficiencyScore) &&
    isValidScore(score.proteinEfficiency) &&
    isValidScore(score.satietyEfficiency) &&
    isValidScore(score.micronutrientDensity) &&
    score.thermicEffect >= validation.THERMIC_EFFECT_RANGE.min &&
    score.thermicEffect <= validation.THERMIC_EFFECT_RANGE.max &&
    score.processingPenalty >= validation.PROCESSING_PENALTY_RANGE.min &&
    score.processingPenalty <= validation.PROCESSING_PENALTY_RANGE.max &&
    validation.CONFIDENCE_LEVELS.includes(score.confidence)
  );
};

/**
 * Fat Loss Compatibility Scoring Implementation
 *
 * Evaluates product alignment with fat loss goals through satiation efficiency
 * and calorie density analysis. Integrates with existing satiety scoring system.
 *
 * Key Features:
 * - Calorie density classification (low/moderate/high)
 * - Satiety efficiency calculation using existing satietyAnalysis
 * - Volume advantage for low-calorie-density products
 * - Confidence scoring based on data quality
 *
 * @module computeFatLossCompatibility
 */

import type { FatLossScore, Product, SatietyIntelligence } from '@picklist/types';
import { BODY_RECOMPOSITION_VALIDATION, isValidScore } from '../utils/bodyRecomposition.ts';
import { classifyCalorieDensity } from '../utils/bodyRecompositionHelpers.ts';
import {
  createNutritionObject,
  extractCalories,
  hasValidCalories,
} from '../utils/nutritionUtils.ts';

/**
 * Computes fat loss compatibility score for a product.
 *
 * Analyzes calorie density, integrates with existing satiety scoring,
 * and calculates volume advantages for cutting phases.
 *
 * @param product - Product with nutrition data and existing satiety analysis
 * @returns FatLossScore or undefined if insufficient data
 */
export const computeFatLossCompatibility = (
  product: Partial<Product>,
): FatLossScore | undefined => {
  // Extract nutrition data using safe utilities
  const calories = extractCalories(product);
  if (!hasValidCalories(product) || calories === undefined) {
    return undefined;
  }

  // Create nutrition object for helper functions
  const nutritionForHelpers = createNutritionObject(product);
  if (!nutritionForHelpers) {
    return undefined;
  }

  // Must have existing satiety analysis for fat loss scoring
  const satietyAnalysis = product.satietyAnalysis;
  if (!satietyAnalysis || typeof satietyAnalysis.satietyScore !== 'number') {
    return undefined;
  }

  const satietyScore = satietyAnalysis.satietyScore;

  // Classify calorie density
  const calorieDensityClass = classifyCalorieDensity(calories);

  // Calculate satiety efficiency (satiety per calorie)
  const satietyEfficiency = calculateSatietyEfficiency(satietyScore, calories);

  // Determine volume advantage
  const volumeAdvantage = calculateVolumeAdvantage(calories, nutritionForHelpers);

  // Calculate base fat loss score
  const baseFatLossScore = calculateFatLossBaseScore(
    calorieDensityClass,
    satietyEfficiency,
    volumeAdvantage,
    satietyScore,
  );

  // Calculate confidence based on data quality
  const confidence = calculateFatLossConfidence(nutritionForHelpers, satietyAnalysis, product);

  // Validate score bounds
  const finalScore = Math.max(0, Math.min(100, Math.round(baseFatLossScore * 100) / 100));

  return {
    fatLossScore: finalScore,
    calorieDensity: Math.round(calories * 100) / 100, // 2 decimal places
    calorieDensityClass,
    satietyEfficiency: Math.round(satietyEfficiency * 100) / 100, // 2 decimal places
    volumeAdvantage,
    confidence,
  };
};

/**
 * Calculates satiety efficiency as a ratio of satiety per calorie.
 * Higher values indicate better satiation for fewer calories.
 */
const calculateSatietyEfficiency = (satietyScore: number, calories: number): number => {
  if (calories <= 0) return 0;

  // Normalize to a reasonable scale (satiety score per 100 calories)
  return (satietyScore / calories) * 100;
};

/**
 * Determines if a product has volume advantage for fat loss.
 * Products with low calorie density and high fiber/water content qualify.
 */
const calculateVolumeAdvantage = (calories: number, nutrition: Product['nutrition']): boolean => {
  // Volume advantage criteria:
  // 1. Low calorie density (<100 kcal/100g)
  // 2. High fiber content (>3g per 100g) OR reasonable water content indicators

  if (calories >= 100) {
    return false; // Too calorie-dense for volume advantage
  }

  // High fiber content provides volume advantage
  if (nutrition?.fiber && nutrition.fiber >= 3) {
    return true;
  }

  // Very low calories (<50) likely indicates high water content
  if (calories < 50) {
    return true;
  }

  return false;
};

/**
 * Calculates base fat loss score using multiple factors.
 */
const calculateFatLossBaseScore = (
  calorieDensityClass: 'low' | 'moderate' | 'high',
  satietyEfficiency: number,
  volumeAdvantage: boolean,
  satietyScore: number,
): number => {
  let score = 0;

  // Calorie density scoring (40% of total)
  switch (calorieDensityClass) {
    case 'low':
      score += 40; // Best for fat loss
      break;
    case 'moderate':
      score += 25; // Moderate for fat loss
      break;
    case 'high':
      score += 10; // Poor for fat loss
      break;
  }

  // Satiety efficiency scoring (35% of total)
  const normalizedSatietyEff = Math.min(satietyEfficiency / 5, 1); // Normalize to 0-1
  score += normalizedSatietyEff * 35;

  // Base satiety score contribution (15% of total)
  const normalizedSatiety = Math.min(satietyScore / 100, 1); // Normalize to 0-1
  score += normalizedSatiety * 15;

  // Volume advantage bonus (10% of total)
  if (volumeAdvantage) {
    score += 10;
  }

  return Math.min(score, 100);
};

/**
 * Calculates confidence level based on data quality and completeness.
 */
const calculateFatLossConfidence = (
  nutrition: Product['nutrition'],
  satietyAnalysis: SatietyIntelligence,
  product: Partial<Product>,
): 'high' | 'medium' | 'low' => {
  let confidenceScore = 0;

  // Nutrition data completeness (40 points)
  if (nutrition?.kcal) {
    confidenceScore += 15;

    // Bonus for additional nutritional data
    if (nutrition.fiber !== undefined) confidenceScore += 8;
    if (nutrition.protein !== undefined) confidenceScore += 7;
    if (nutrition.fat !== undefined) confidenceScore += 5;
    if (nutrition.carbs !== undefined) confidenceScore += 5;
  }

  // Satiety analysis quality (35 points)
  if (satietyAnalysis?.satietyScore !== undefined) {
    confidenceScore += 15;

    // Bonus for detailed satiety factors
    if (satietyAnalysis.satietyFactors) {
      confidenceScore += 10;
    }

    // Bonus for satiety confidence if available
    const satietyWithConfidence = satietyAnalysis;
    if (satietyWithConfidence.confidence) {
      const satietyConfidenceBonus =
        satietyWithConfidence.confidence === 'high'
          ? 10
          : satietyWithConfidence.confidence === 'medium'
            ? 5
            : 0;
      confidenceScore += satietyConfidenceBonus;
    }
  }

  // Ingredient and category data (25 points)
  const ingredients = product.ingredients || [];
  const categories = product.categories || [];

  if (ingredients.length > 0) {
    confidenceScore += 10;
    if (ingredients.length >= 3) confidenceScore += 5;
  }

  if (categories.length > 0) {
    confidenceScore += 10;
  }

  // Classify confidence level
  if (confidenceScore >= 80) return 'high';
  if (confidenceScore >= 50) return 'medium';
  return 'low';
};

/**
 * Validates fat loss score data integrity.
 * Used for testing and debugging purposes.
 */
export const validateFatLossScore = (score: FatLossScore): boolean => {
  const validation = BODY_RECOMPOSITION_VALIDATION.FAT_LOSS;

  return (
    isValidScore(score.fatLossScore) &&
    score.calorieDensity >= validation.CALORIE_DENSITY_MIN &&
    ['low', 'moderate', 'high'].includes(score.calorieDensityClass) &&
    score.satietyEfficiency >= validation.SATIETY_EFFICIENCY_MIN &&
    typeof score.volumeAdvantage === 'boolean' &&
    validation.CONFIDENCE_LEVELS.includes(score.confidence)
  );
};

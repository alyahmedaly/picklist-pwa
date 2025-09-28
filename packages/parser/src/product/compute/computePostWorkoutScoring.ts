/**
 * Post-Workout Recovery Scoring Implementation
 *
 * Computes post-workout optimization scores based on carbohydrate-to-protein ratios
 * and glycemic index optimization for recovery nutrition.
 *
 * Key Features:
 * - Carb:protein ratio analysis (optimal 2:1 to 4:1)
 * - Glycemic index boost calculation (1.0-1.5 multiplier)
 * - Recovery window timing classification
 * - Confidence scoring based on data completeness
 *
 * @module computePostWorkoutScoring
 */

import { BODY_RECOMPOSITION_VALIDATION, isValidScore } from '../utils/bodyRecomposition.ts';
import { extractCarbs, extractProtein, createNutritionObject } from '../utils/nutritionUtils.ts';
import type { Product } from '@picklist/types';
import type { PostWorkoutScore } from '@picklist/types';
import { estimateGlycemicIndex } from '../utils/bodyRecompositionHelpers.ts';

/**
 * Computes post-workout optimization score for a product.
 *
 * Analyzes carbohydrate and protein content, applies glycemic index weighting,
 * and determines recovery window timing suitability.
 *
 * @param product - Product with nutrition and ingredient data
 * @returns PostWorkoutScore or undefined if insufficient data
 */
export const computePostWorkoutScoring = (product: Product): PostWorkoutScore | undefined => {
  // Extract nutrition data using safe utilities
  const carbs = extractCarbs(product);
  const protein = extractProtein(product);

  // Must have both carbs AND protein for post-workout scoring
  if (carbs === undefined || carbs <= 0 || protein === undefined || protein <= 0) {
    return undefined;
  }

  // Calculate carb:protein ratio
  const carbProteinRatio = carbs / protein;

  // Get ingredients and categories for GI estimation
  const ingredients = product.ingredients || [];
  const categories = product.categories || [];

  // Estimate glycemic index multiplier
  const glycemicBoost = estimateGlycemicIndex(ingredients, categories);

  // Calculate base post-workout score
  const baseScore = calculatePostWorkoutBaseScore(carbProteinRatio, carbs, protein);

  // Apply glycemic index boost
  const boostedScore = Math.min(baseScore * glycemicBoost, 100);

  // Determine recovery window based on GI and macro composition
  const recoveryWindow = determineRecoveryWindow(glycemicBoost, carbProteinRatio, protein);

  // Calculate confidence based on data completeness
  const nutritionForConfidence = createNutritionObject(product);
  const confidence = calculatePostWorkoutConfidence(
    nutritionForConfidence,
    ingredients,
    categories,
  );

  // Validate score bounds
  const finalScore = Math.max(0, Math.min(100, Math.round(boostedScore * 100) / 100));

  return {
    postWorkoutScore: finalScore,
    carbProteinRatio: Math.round(carbProteinRatio * 100) / 100, // 2 decimal places
    glycemicBoost: Math.round(glycemicBoost * 100) / 100, // 2 decimal places
    recoveryWindow,
    confidence,
  };
};

/**
 * Calculates base post-workout score before glycemic index adjustment.
 *
 * Optimal ratios (2:1 to 4:1) score highest, with gradual decline outside this range.
 */
const calculatePostWorkoutBaseScore = (ratio: number, carbs: number, protein: number): number => {
  // Optimal ratio range: 2:1 to 4:1
  const optimalMin = 2.0;
  const optimalMax = 4.0;

  let ratioScore = 0;

  if (ratio >= optimalMin && ratio <= optimalMax) {
    // Perfect ratio range gets maximum score
    ratioScore = 100;
  } else if (ratio < optimalMin) {
    // Too much protein relative to carbs - gradual decline
    const distance = optimalMin - ratio;
    ratioScore = Math.max(40, 100 - distance * 20); // Min 40 for protein-heavy
  } else {
    // Too many carbs relative to protein - steeper decline
    const distance = ratio - optimalMax;
    ratioScore = Math.max(20, 100 - distance * 15); // Min 20 for carb-heavy
  }

  // Boost score based on absolute amounts
  const carbBonus = Math.min(carbs * 2, 20); // Up to 20 bonus for carb content
  const proteinBonus = Math.min(protein * 3, 20); // Up to 20 bonus for protein content

  const totalScore = ratioScore + (carbBonus + proteinBonus) / 2;

  return Math.min(totalScore, 100);
};

/**
 * Determines recovery window timing based on glycemic index and macronutrient profile.
 */
const determineRecoveryWindow = (
  glycemicBoost: number,
  carbProteinRatio: number,
  protein: number,
): 'immediate' | 'delayed' | 'general' => {
  // High GI foods with good carb content = immediate recovery
  if (glycemicBoost >= 1.2 && carbProteinRatio >= 2.0) {
    return 'immediate';
  }

  // High protein with low/medium GI = delayed recovery (muscle synthesis focus)
  if (protein >= 15 && glycemicBoost < 1.2) {
    return 'delayed';
  }

  // Moderate carb:protein with medium GI = general recovery
  if (carbProteinRatio >= 1.5 && carbProteinRatio < 6.0) {
    return 'general';
  }

  // Default to general for edge cases
  return 'general';
};

/**
 * Calculates confidence level based on data quality and completeness.
 */
const calculatePostWorkoutConfidence = (
  nutrition: Product['nutrition'],
  ingredients: string[],
  categories: string[],
): 'high' | 'medium' | 'low' => {
  let confidenceScore = 0;

  // Nutrition data completeness (40 points)
  if (nutrition?.carbs && nutrition?.protein) {
    confidenceScore += 20;

    // Bonus for additional macro data
    if (nutrition.fat !== undefined) confidenceScore += 5;
    if (nutrition.fiber !== undefined) confidenceScore += 5;
    if (nutrition.sugars !== undefined) confidenceScore += 5;
    if (nutrition.kcal !== undefined) confidenceScore += 5;
  }

  // Ingredient data quality (30 points)
  if (ingredients && ingredients.length > 0) {
    confidenceScore += 15;

    // Bonus for detailed ingredient lists
    if (ingredients.length >= 3) confidenceScore += 5;
    if (ingredients.length >= 5) confidenceScore += 5;

    // Bonus for specific carb/protein ingredients
    const hasSpecificIngredients = ingredients.some((ing) =>
      /\b(rijst|haver|tarwe|melk|eiwit|vlees|kip|vis|cheese|whey|protein)\b/i.test(ing),
    );
    if (hasSpecificIngredients) confidenceScore += 5;
  }

  // Category data completeness (30 points)
  if (categories && categories.length > 0) {
    confidenceScore += 15;

    // Bonus for specific food categories
    const hasSpecificCategories = categories.some((cat) =>
      /\b(graan|zuivel|vlees|sport|protein|dairy|meat|grains)\b/i.test(cat),
    );
    if (hasSpecificCategories) confidenceScore += 15;
  }

  // Classify confidence level
  if (confidenceScore >= 80) return 'high';
  if (confidenceScore >= 50) return 'medium';
  return 'low';
};

/**
 * Validates post-workout score data integrity.
 * Used for testing and debugging purposes.
 */
export const validatePostWorkoutScore = (score: PostWorkoutScore): boolean => {
  const validation = BODY_RECOMPOSITION_VALIDATION.POST_WORKOUT;

  return (
    isValidScore(score.postWorkoutScore) &&
    score.carbProteinRatio >= validation.CARB_PROTEIN_RATIO_MIN &&
    score.glycemicBoost >= validation.GLYCEMIC_BOOST_RANGE.min &&
    score.glycemicBoost <= validation.GLYCEMIC_BOOST_RANGE.max &&
    validation.RECOVERY_WINDOWS.includes(score.recoveryWindow) &&
    validation.CONFIDENCE_LEVELS.includes(score.confidence)
  );
};

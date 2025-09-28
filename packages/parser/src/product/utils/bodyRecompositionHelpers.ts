/**
 * Body Recomposition Helper Functions
 *
 * Pure helper functions for body recomposition scoring calculations.
 * These functions support glycemic index estimation, calorie density classification,
 * micronutrient density estimation, and context multiplier calculations.
 *
 * @module bodyRecompositionHelpers
 */

import type { ContextMultipliers } from '@picklist/types';
import { BODY_RECOMPOSITION_VALIDATION, isValidMultiplier } from './bodyRecomposition.ts';
import { estimateGlycemicIndexWithNEVO } from '../../nevo/nevoIntegration.ts';

/**
 * Estimates glycemic index multiplier from ingredients and food categories.
 *
 * Enhanced with NEVO database integration for composition-based GI calculation.
 * Falls back to improved patterns when NEVO data is unavailable.
 *
 * @param ingredients - Product ingredient list
 * @param categories - Product category classifications
 * @param productName - Optional product name for better NEVO matching
 * @returns Multiplier between 1.0 (low GI) and 1.5 (high GI)
 */
export const estimateGlycemicIndex = (
  ingredients: string[],
  categories: string[],
  productName?: string,
): number => {
  // Use NEVO-enhanced estimation
  return estimateGlycemicIndexWithNEVO(ingredients, categories, productName);
};

/**
 * Classifies calorie density based on WHO/CDC energy density thresholds.
 *
 * @param caloriesPer100g - Calories per 100g of product
 * @returns 'low' (<125), 'moderate' (125-225), 'high' (>225)
 */
export const classifyCalorieDensity = (caloriesPer100g: number): 'low' | 'moderate' | 'high' => {
  // Handle invalid inputs
  if (typeof caloriesPer100g !== 'number' || isNaN(caloriesPer100g) || caloriesPer100g < 0) {
    return 'moderate'; // Default classification for invalid input
  }

  const { LOW_MAX, MODERATE_MAX } = BODY_RECOMPOSITION_VALIDATION.FAT_LOSS.DENSITY_THRESHOLDS;

  if (caloriesPer100g < LOW_MAX) {
    return 'low';
  } else if (caloriesPer100g <= MODERATE_MAX) {
    return 'moderate';
  } else {
    return 'high';
  }
};

/**
 * Estimates micronutrient density from ingredients and food categories.
 *
 * Uses ingredient complexity analysis and category-based scoring to estimate
 * the micronutrient richness of products.
 *
 * @param ingredients - Product ingredient list
 * @param categories - Product category classifications
 * @returns Score 0-100 representing estimated micronutrient richness
 */
export const estimateMicronutrientDensity = (
  ingredients: string[],
  categories: string[],
): number => {
  // Handle invalid inputs
  if (!Array.isArray(ingredients) || !Array.isArray(categories)) {
    return 50; // Default moderate score for invalid input
  }

  // High micronutrient density categories (80-100 score)
  const highDensityCategories = [
    // Dutch terms
    /\b(groente|groenten|fruit|lever|orgaan|vis|zeevrucht)\b/i,
    // English terms
    /\b(vegetables|fruit|liver|organ|fish|seafood|produce)\b/i,
  ];

  // Medium micronutrient density categories (60-80 score)
  const mediumDensityCategories = [
    // Dutch terms
    /\b(volkoren|peulvrucht|noten|zuivel|vlees)\b/i,
    // English terms
    /\b(whole\s*grain|legumes|nuts|dairy|meat)\b/i,
  ];

  // Low micronutrient density categories (0-40 score)
  const lowDensityCategories = [
    // Dutch terms
    /\b(geraffineerd|wit\s*brood|snoep|frisdrank|olie|vet)\b/i,
    // English terms
    /\b(refined|white\s*bread|sweets|soda|oil|fat|confectionery)\b/i,
  ];

  const ingredientText = ingredients.join(' ').toLowerCase();
  const categoryText = categories.join(' ').toLowerCase();

  // Check for high-value ingredients directly first
  const highValueIngredients = [
    /\b(lever|organ|spinazie|kale|broccoli|wortel|blauwe\s*bessen)\b/i, // Dutch
    /\b(liver|organ|spinach|kale|broccoli|carrot|blueberries)\b/i, // English
  ];

  // Check for medium-value ingredients
  const mediumValueIngredients = [
    /\b(noten|volkoren|peulvrucht|zuivel|vlees)\b/i, // Dutch
    /\b(nuts|whole\s*grain|legumes|dairy|meat|tomatoes)\b/i, // English
  ];

  for (const pattern of highValueIngredients) {
    if (pattern.test(ingredientText)) {
      return 92; // Fixed high-value score for deterministic results
    }
  }

  for (const pattern of mediumValueIngredients) {
    if (pattern.test(ingredientText)) {
      return 72; // Fixed medium-value score for deterministic results
    }
  }

  // Check for processed ingredients that should get low scores
  const lowValueIngredients = [
    /\b(witte\s*suiker|corn\s*syrup|kunstmatig|conserveermiddel)\b/i, // Dutch
    /\b(white\s*sugar|corn\s*syrup|artificial|preservative)\b/i, // English
  ];

  for (const pattern of lowValueIngredients) {
    if (pattern.test(ingredientText)) {
      return 25; // Fixed low-value score for deterministic results
    }
  }

  // Check high density categories
  for (const pattern of highDensityCategories) {
    if (pattern.test(categoryText)) {
      return 95; // Fixed high-density category score for deterministic results
    }
  }

  // Check medium density categories
  for (const pattern of mediumDensityCategories) {
    if (pattern.test(categoryText)) {
      return 72; // Fixed medium-density category score for deterministic results
    }
  }

  // Check low density categories
  for (const pattern of lowDensityCategories) {
    if (pattern.test(categoryText)) {
      return 25; // Fixed low-density category score for deterministic results
    }
  }

  // Ingredient complexity scoring
  const ingredientComplexityScore = calculateIngredientComplexity(ingredients);

  // Base category scoring if no specific patterns matched
  const baseScore = 50; // Default moderate score

  // Adjust based on ingredient complexity
  const finalScore = Math.min(Math.max(baseScore + ingredientComplexityScore, 0), 100);

  return Math.round(finalScore);
};

/**
 * Calculates ingredient complexity score for micronutrient estimation.
 * More natural, fewer ingredients typically indicate higher micronutrient density.
 */
const calculateIngredientComplexity = (ingredients: string[]): number => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return 0;
  }

  // Fewer, more natural ingredients = higher score
  const ingredientCountPenalty = Math.max(0, ingredients.length - 5) * -2; // Penalty for >5 ingredients

  // Check for natural vs processed ingredient indicators
  const naturalIngredients = ingredients.filter((ingredient) => {
    const ing = ingredient.toLowerCase();
    return (
      /\b(water|zout|kruiden|specerij|fruit|groente|vlees|vis|melk|eieren|lever|spinazie|wortel|noten|tomaat)\b/.test(
        ing,
      ) ||
      /\b(water|salt|herbs|spice|fruit|vegetable|meat|fish|milk|eggs|liver|spinach|carrot|nuts|tomatoes)\b/.test(
        ing,
      )
    );
  });

  const processedIngredients = ingredients.filter((ingredient) => {
    const ing = ingredient.toLowerCase();
    return (
      /\b(emulgator|conserveermiddel|kleurstof|smaakversterker|verdikkingsmiddel|stroop|kunstmatig|suiker)\b/.test(
        ing,
      ) ||
      /\b(emulsifier|preservative|coloring|flavor\s*enhancer|thickener|syrup|artificial|sugar)\b/.test(
        ing,
      )
    );
  });

  const naturalBonus = (naturalIngredients.length / ingredients.length) * 20;
  const processedPenalty = (processedIngredients.length / ingredients.length) * -15;

  return ingredientCountPenalty + naturalBonus + processedPenalty;
};

/**
 * Calculates context multipliers based on body composition phase and meal timing.
 *
 * Implements phase-specific and timing-specific multiplier adjustments while
 * enforcing the 0.5-2.0 bounds for all multipliers.
 *
 * @param phase - Body composition goal phase
 * @param timing - Meal timing context relative to workouts
 * @returns ContextMultipliers with appropriate adjustments (0.5-2.0 range)
 */
export const calculateContextMultipliers = (
  phase: 'cutting' | 'bulking' | 'maintenance' | 'recomposition',
  timing: 'pre_workout' | 'post_workout' | 'general',
): ContextMultipliers => {
  // Base neutral multipliers
  const multipliers: ContextMultipliers = {
    proteinScoreMultiplier: 1.0,
    satietyScoreMultiplier: 1.0,
    postWorkoutMultiplier: 1.0,
    fatLossMultiplier: 1.0,
    efficiencyMultiplier: 1.0,
  };

  // Phase-specific adjustments
  switch (phase) {
    case 'cutting':
      multipliers.fatLossMultiplier = 1.4; // Boost fat loss scoring
      multipliers.efficiencyMultiplier = 1.3; // Boost efficiency scoring
      multipliers.satietyScoreMultiplier = 1.2; // Boost satiety for satiation
      break;

    case 'bulking':
      multipliers.proteinScoreMultiplier = 1.4; // Boost protein scoring
      multipliers.postWorkoutMultiplier = 1.3; // Boost post-workout scoring
      multipliers.efficiencyMultiplier = 0.9; // Slightly reduce efficiency focus
      break;

    case 'maintenance':
      // Keep balanced multipliers close to 1.0
      multipliers.proteinScoreMultiplier = 1.1;
      multipliers.satietyScoreMultiplier = 1.1;
      multipliers.efficiencyMultiplier = 1.0;
      break;

    case 'recomposition':
      multipliers.proteinScoreMultiplier = 1.2; // Slight protein bias
      multipliers.efficiencyMultiplier = 1.2; // Slight efficiency bias
      multipliers.fatLossMultiplier = 1.1; // Slight fat loss bias
      break;
  }

  // Timing-specific adjustments (layered on top of phase adjustments)
  switch (timing) {
    case 'post_workout':
      multipliers.postWorkoutMultiplier *= 1.3; // Additional boost for post-workout
      multipliers.proteinScoreMultiplier *= 1.2; // Additional protein focus
      break;

    case 'pre_workout':
      multipliers.efficiencyMultiplier *= 1.1; // Slight efficiency boost
      multipliers.fatLossMultiplier *= 0.9; // Slightly reduce fat loss focus
      break;

    case 'general':
      // No additional timing adjustments for general meals
      break;
  }

  // Enforce bounds (0.5-2.0) for all multipliers
  const enforceBounds = (value: number): number => {
    const { min, max } = BODY_RECOMPOSITION_VALIDATION.BODY_COMPOSITION_CONTEXT.MULTIPLIER_RANGE;
    return Math.max(min, Math.min(max, value));
  };

  multipliers.proteinScoreMultiplier = enforceBounds(multipliers.proteinScoreMultiplier);
  multipliers.satietyScoreMultiplier = enforceBounds(multipliers.satietyScoreMultiplier);
  multipliers.postWorkoutMultiplier = enforceBounds(multipliers.postWorkoutMultiplier);
  multipliers.fatLossMultiplier = enforceBounds(multipliers.fatLossMultiplier);
  multipliers.efficiencyMultiplier = enforceBounds(multipliers.efficiencyMultiplier);

  return multipliers;
};

/**
 * Utility function to validate all multipliers are within valid range.
 * Used for testing and debugging purposes.
 */
export const validateContextMultipliers = (multipliers: ContextMultipliers): boolean => {
  return Object.values(multipliers).every(isValidMultiplier);
};

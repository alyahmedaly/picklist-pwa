import type { HalalAnalysis, Product } from '@picklist/types';
import { readFileSync } from 'node:fs';
import { createRows, readCSV } from './parser.ts';
import { classify } from './product/classify.ts';
import { computeBodyCompositionContext } from './product/compute/computeBodyCompositionContext.ts';
import { computeEnhancedCalorieEfficiency } from './product/compute/computeEnhancedCalorieEfficiency.ts';
import { computeFatLossCompatibility } from './product/compute/computeFatLossCompatibility.ts';
import { computeHalalAnalysis } from './product/compute/computeHalalAnalysis.ts';
import { computeNutritionalTags } from './product/compute/computeNutritionalTags.ts';
import { computePostWorkoutScoring } from './product/compute/computePostWorkoutScoring.ts';
import { computeProteinScoring } from './product/compute/computeProteinScoring.ts';
import { computeSatietyAnalysis } from './product/compute/computeSatietyAnalysis.ts';
import { calculateNutriScores } from './product/compute/enhanceWithDualScoring.ts';
import { parseAdditives } from './product/parse/parseAdditives.ts';
import { consolidateWarnings, parseAllergens } from './product/parse/parseAllergens.ts';
import {
  buildCategoryTree,
  getPrimaryCategory,
  parseCategories,
} from './product/parse/parseCategories.ts';
import { parseIngredients } from './product/parse/parseIngredients.ts';
import { parseNutrition } from './product/parse/parseNutrition.ts';
import { parsePrice } from './product/parse/parsePrice.ts';
import { parseUnits } from './product/parse/parseUnits.ts';
import type { StatsAccumulator } from './stats.ts';
import type { CSVHeader, CSVRow } from './types.ts';

/**
 * Parse image URLs from CSV row
 * Maps ImageLowURL, ImageMediumURL, ImageHighURL to Product images field
 */
function parseImages(
  csvRow: CSVRow,
): { low?: string; med?: string; high?: string; primary: string } | undefined {
  const lowUrl = csvRow.ImageLowURL?.trim();
  const medUrl = csvRow.ImageMediumURL?.trim();
  const highUrl = csvRow.ImageHighURL?.trim();

  // If no images are available, return undefined
  if (!lowUrl && !medUrl && !highUrl) {
    return undefined;
  }

  // Determine primary image (prefer high, then medium, then low)
  const primary = highUrl || medUrl || lowUrl || '';

  return {
    ...(lowUrl && { low: lowUrl }),
    ...(medUrl && { med: medUrl }),
    ...(highUrl && { high: highUrl }),
    primary,
  };
}

export function transformCSV(inputPath: string) {
  const csvText = readFileSync(inputPath, 'utf8');

  const parsed = readCSV(csvText);
  const headerCols = parsed.headers as CSVHeader[];
  const matrix = parsed.matrix;
  const rows = createRows(headerCols, matrix);

  return { headers: headerCols, matrix, rows };
}

export function convertCSVToProduct(csvRow: CSVRow, stats: StatsAccumulator) {
  const id = String(csvRow.ProductId || '').trim();
  const name = csvRow.ProductName || 'Unknown';
  const price = parsePrice(csvRow);

  // EUR default for Dutch products
  const ingParsed = parseIngredients(csvRow.Ingredients || '');
  const categories = parseCategories(csvRow);
  const parsedUnit = parseUnits(csvRow.ProductUnitSize, stats);

  const contained =
    csvRow.ContainedAllergens && csvRow.ContainedAllergens !== 'NA'
      ? csvRow.ContainedAllergens
      : '';
  const may =
    csvRow.MayContainAllergens && csvRow.MayContainAllergens !== 'NA'
      ? csvRow.MayContainAllergens
      : '';
  const combined = [contained && `Contains: ${contained}`, may && `May contain: ${may}`]
    .filter(Boolean)
    .join('. ');

  const allergens = parseAllergens(combined, stats);

  const nutrition = parseNutrition(csvRow);

  const classification = classify({
    categories,
    ingredients: ingParsed.tokens,
  });

  // Parse image URLs from CSV columns
  const images = parseImages(csvRow);

  const product: Product = {
    id,
    name,
    price,
    ingredients: ingParsed.tokens,
    allergens,
    categories,
    unit: parsedUnit,
    nutrition,
    images,
    flags: {
      isFood: classification.flags.isFood,
      isPetFood: classification.flags.isPetFood,
      addedSugarFlag: ingParsed.flags.addedSugarFlag,
      addedSaltFlag: ingParsed.flags.addedSaltFlag,
      artificialSweetenersFlag: ingParsed.flags.artificialSweetenersFlag,
    },
    categoryTree: buildCategoryTree(categories),
    ingredientInfo: ingParsed.ingredientInfo,
    added: ingParsed.added ?? {},
    duplicate_conflicts: [],
    addedSugarsPer100: ingParsed.added?.sugarsPer100,
  };

  // Add nutritional tags for food products only
  if (classification.flags.isFood && product.nutrition) {
    const nutritionalTags = computeNutritionalTags(
      product.nutrition,
      product.ingredients,
      product.allergens,
    );
    if (nutritionalTags) {
      product.nutritionalTags = nutritionalTags;
    }
  }

  // Add additive analysis for food products (FR-016: analyze all food products)
  if (classification.flags.isFood) {
    const ingredientList =
      product.ingredients && product.ingredients.length > 0 ? product.ingredients : [];
    const additiveResult = parseAdditives(ingredientList);
    product.additiveInfo = additiveResult.additiveInfo;
    product.additiveFlags = additiveResult.additiveFlags;
    product.additivesSummary = additiveResult.additivesSummary;
  }

  product.warnings = consolidateWarnings(product.allergens, product.additiveFlags);
  product.nutriScore = calculateNutriScores(product);
  product.halalCheck = getHalalCheck(product);
  product.proteinOptimization = getProteinScore(product);
  product.satietyAnalysis = getSatietyScore(product);
  product.postWorkoutOptimization = getPostWorkoutScore(product);
  product.fatLossCompatibility = getFatLossCompatibility(product);
  // needs proteinOptimization to be calculated first and satiety
  product.enhancedCalorieEfficiency = getCalorieEfficiency(product);
  product.bodyCompositionContext = getBodyCompositionContext(product);

  return product;
}

function getHalalCheck(product: Product): HalalAnalysis | undefined {
  // Apply Halal Analysis (T006)
  try {
    // Validate ingredients input - handle arrays or non-strings
    const ingredientsString = Array.isArray(product.ingredients)
      ? product.ingredients.join(', ')
      : typeof product.ingredients === 'string'
        ? product.ingredients
        : undefined;

    if (ingredientsString && product.additiveInfo?.eNumbers) {
      const halalAnalysis = computeHalalAnalysis({
        ingredients: ingredientsString,
        eNumbers: product.additiveInfo.eNumbers,
      });
      return halalAnalysis;
    }
  } catch (error) {
    // Graceful degradation - log error but continue processing
    console.warn(`Halal analysis failed for product ${product.id}:`, error);
    return undefined;
  }
  return undefined;
}

function getProteinScore(product: Product) {
  // Apply Protein Scoring (T007)
  try {
    // Use nutrition field (legacy) or nutrition field
    const proteinValue = product.nutrition?.protein;
    const kcalValue = product.nutrition?.kcal;

    if (typeof proteinValue === 'number' && typeof kcalValue === 'number') {
      const proteinScoring = computeProteinScoring({
        nutrition: {
          protein: proteinValue,
          kcal: kcalValue,
          unit: product.nutrition?.unit,
        },
        unit: typeof product.unit === 'string' ? product.unit : undefined,
        category: getPrimaryCategory(product.categories),
      });

      return proteinScoring;
    }
    return undefined;
  } catch (error) {
    // Graceful degradation
    console.warn(`Protein scoring failed for product ${product.id}:`, error);
  }
  return undefined;
}

function getSatietyScore(product: Product) {
  // Apply Satiety Analysis (T008)
  try {
    // Use nutrition field (legacy) or nutrition field
    const proteinValue = product.nutrition?.protein ?? 0;
    const fiberValue = product.nutrition?.fiber ?? 0;
    const kcalValue = product.nutrition?.kcal ?? 0;

    if (
      typeof proteinValue === 'number' &&
      typeof fiberValue === 'number' &&
      typeof kcalValue === 'number'
    ) {
      const category = getPrimaryCategory(product.categories);
      const satietyIntelligence = computeSatietyAnalysis({
        category: category,
        proteinPer100g: proteinValue,
        fiberPer100g: fiberValue,
        caloriesPer100g: kcalValue,
        additiveInfo: product.additiveInfo,
        additiveFlags: product.additiveFlags,
      });
      return satietyIntelligence;
    }
  } catch (error) {
    // Graceful degradation
    console.warn(`Satiety analysis failed for product ${product.id}:`, error);
  }
  return undefined;
}

function getPostWorkoutScore(product: Product) {
  // Apply Post-Workout Scoring
  try {
    return computePostWorkoutScoring(product);
  } catch (error) {
    // Graceful degradation - log error but continue processing
    console.warn(`Post-workout scoring failed for product ${product.id}:`, error);
  }
  return undefined;
}

function getFatLossCompatibility(product: Product) {
  try {
    return computeFatLossCompatibility(product);
  } catch (error) {
    // Graceful degradation
    console.warn(`Fat loss scoring failed for product ${product.id}:`, error);
  }
  return undefined;
}

function getCalorieEfficiency(product: Product) {
  // Apply Enhanced Calorie Efficiency Scoring
  try {
    return computeEnhancedCalorieEfficiency(product);
  } catch (error) {
    // Graceful degradation
    console.warn(`Calorie efficiency scoring failed for product ${product.id}:`, error);
  }
  return undefined;
}

function getBodyCompositionContext(product: Product) {
  // Apply Body Composition Context (always computable with defaults)
  try {
    // Apply default body composition context: recomposition + general
    return computeBodyCompositionContext(
      'recomposition', // Default phase for backward compatibility
      'general', // Default timing for backward compatibility
    );
  } catch (error) {
    // Graceful degradation - this should never fail as it always returns a value
    console.warn(`Body composition context failed for product ${product.id}:`, error);
  }
  return undefined;
}

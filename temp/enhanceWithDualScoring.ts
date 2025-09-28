import type { Product } from '../src/data/transform/types.ts';
import { computeNutriScore } from '../src/data/transform/compute/computeNutriScore.ts';
import { computePercentileRank } from '../src/data/transform/compute/computePercentileRank.ts';
import {
  computeHealthGrade,
  computeHealthScore,
} from '../src/data/transform/compute/computeHealthGrade.ts';

/**
 * Enhance products with dual scoring (global + category-relative)
 *
 * Implements a two-pass architecture:
 * - Pass 1: Calculate Nutri-Scores for all products with sufficient nutrition data
 * - Pass 2: Apply percentile ranking and grade assignment (both global and category-relative)
 *
 * @param products - Array of products with nutrition data
 * @returns Products enhanced with scoring fields
 *
 * @example
 * ```typescript
 * const products = [
 *   { id: 1, name: 'Yogurt', nutrition: { kcal: 78, satFat: 1.1, sugars: 11, salt: 0.11 } },
 *   { id: 2, name: 'Chips', nutrition: { kcal: 450, satFat: 8, sugars: 25, salt: 1.5 } }
 * ];
 * const scoredProducts = enhanceWithDualScoring(products);
 * // Each product now has nutriScore, globalHealthScore, globalHealthGrade, etc.
 * ```
 */
export function enhanceWithDualScoring(products: Product[]): Product[] {
  // Handle empty input
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  // Pass 1: Calculate Nutri-Scores
  const productsWithNutriScores = calculateNutriScores(products);

  // Pass 2: Apply percentile ranking and grade assignment
  const enhancedProducts = applyPercentileRanking(productsWithNutriScores);

  return enhancedProducts;
}

/**
 * Pass 1: Calculate all Nutri-Scores and collect for percentile computation
 *
 * @param products - Products with nutrition data
 * @returns Products with nutriScore field populated
 */
export function calculateNutriScores(products: Product[]): Product[] {
  // Pre-compute category classifications to avoid repeated string operations
  const categoryCache = new Map<string, string>();

  return products.map((product) => {
    // Skip products without nutrition data
    if (!product.nutrition) {
      return product;
    }

    // Use cached category classification or compute and cache it
    const categoryKey = product.categories ? product.categories.join('|') : '';
    let category = categoryCache.get(categoryKey);
    if (category === undefined) {
      category = getCategoryForNutriScore(product.categories);
      categoryCache.set(categoryKey, category);
    }

    // Calculate Nutri-Score
    const nutriScore = computeNutriScore(product.nutrition, category);

    // Return product with nutriScore field (undefined if insufficient data)
    return {
      ...product,
      nutriScore,
    };
  });
}

/**
 * Pass 2: Apply percentile ranking and grade assignment
 *
 * @param products - Products with nutriScore field
 * @returns Products with full scoring fields
 */
export function applyPercentileRanking(products: Product[]): Product[] {
  // Collect all valid Nutri-Scores for global percentile calculation
  const allNutriScores = products
    .map((p) => p.nutriScore)
    .filter((score): score is number => score !== undefined);

  // Handle case with no valid scores
  if (allNutriScores.length === 0) {
    return products;
  }

  // Pre-compute inverted scores once for global percentiles (major optimization!)
  const invertedAllScores = allNutriScores.map((score) => -score);

  // Group products by category for category-relative scoring
  const productsByCategory = groupProductsByCategory(products);

  // Pre-compute inverted category scores for all categories (major optimization!)
  const invertedCategoryScores = new Map<string, number[]>();
  for (const [category, scores] of productsByCategory.entries()) {
    invertedCategoryScores.set(
      category,
      scores.map((score) => -score),
    );
  }

  // Process each product to add global and category-relative scores
  return products.map((product) => {
    // Skip products without Nutri-Score
    if (product.nutriScore === undefined) {
      return product;
    }

    // Calculate global percentile rank (use pre-computed inverted scores)
    // For Nutri-Score, lower scores are better, so we need to invert for percentile calculation
    // We invert by negating the score so that lower (better) Nutri-Scores become higher values
    const invertedScore = -product.nutriScore;

    const globalPercentile = computePercentileRank(invertedScore, invertedAllScores);
    const globalHealthScore = computeHealthScore(globalPercentile);
    const globalHealthGrade = computeHealthGrade(globalPercentile);

    // Calculate category-relative percentile rank
    let categoryHealthScore: number | undefined;
    let categoryHealthGrade: import('../src/data/transform/types.ts').HealthGrade | undefined;

    // Inline getPrimaryCategory for better performance (avoid function calls in hot path)
    const primaryCategory =
      product.categories && product.categories.length > 0 ? product.categories[0] : undefined;
    const categoryScores = primaryCategory ? productsByCategory.get(primaryCategory) : undefined;
    if (categoryScores) {
      // Only calculate category scores if there are multiple products in category
      if (categoryScores.length > 1) {
        // Apply same inversion for category scoring (use pre-computed inverted scores)
        const invertedCategoryScore = -product.nutriScore;
        const precomputedInvertedCategoryScores = invertedCategoryScores.get(primaryCategory)!;

        const categoryPercentile = computePercentileRank(
          invertedCategoryScore,
          precomputedInvertedCategoryScores,
        );
        categoryHealthScore = computeHealthScore(categoryPercentile);
        categoryHealthGrade = computeHealthGrade(categoryPercentile);
      }
    }

    // Return enhanced product
    return {
      ...product,
      globalHealthScore,
      globalHealthGrade,
      categoryHealthScore,
      categoryHealthGrade,
    };
  });
}

// Pre-compiled regex patterns for better performance
const BEVERAGE_PATTERN =
  /\b(?:dranken|frisdrank|sap|smoothie|koffie|thee|beverages|drinks|juice|soda|coffee|tea)\b/i;
const CHEESE_PATTERN = /\b(?:kaas|cheese|fromage)\b/i;
const FAT_PATTERN = /\b(?:olie|boter|margarine|vet|oil|butter|fat|oils)\b/i;

/**
 * Determine the appropriate category for Nutri-Score calculation (optimized)
 */
function getCategoryForNutriScore(categories?: string[]): string {
  if (!categories || categories.length === 0) {
    return 'general';
  }

  // Join categories once and convert to lowercase
  const categoryString = categories.join(' ').toLowerCase();

  // Use pre-compiled regex patterns for faster matching
  if (BEVERAGE_PATTERN.test(categoryString)) {
    return 'beverages';
  }

  if (CHEESE_PATTERN.test(categoryString)) {
    return 'cheese';
  }

  if (FAT_PATTERN.test(categoryString)) {
    return 'fats';
  }

  return 'general';
}

/**
 * Group products by their primary category for category-relative scoring
 */
function groupProductsByCategory(products: Product[]): Map<string, number[]> {
  const categoryMap = new Map<string, number[]>();

  // Single pass through products using for...of for better performance
  for (const product of products) {
    // Skip products without Nutri-Score
    if (product.nutriScore === undefined) {
      continue;
    }

    // Inline getPrimaryCategory for better performance
    const primaryCategory =
      product.categories && product.categories.length > 0 ? product.categories[0] : undefined;
    if (primaryCategory) {
      let categoryScores = categoryMap.get(primaryCategory);
      if (!categoryScores) {
        categoryScores = [];
        categoryMap.set(primaryCategory, categoryScores);
      }
      categoryScores.push(product.nutriScore);
    }
  }

  return categoryMap;
}

/**
 * Get the primary category for a product (first category or most specific)
 */
function getPrimaryCategory(categories?: string[]): string | undefined {
  if (!categories || categories.length === 0) {
    return undefined;
  }

  // For now, use the first category as primary
  // In the future, this could be enhanced with category hierarchy logic
  return categories[0];
}

/**
 * Get scoring statistics for validation and debugging
 */
export function getScoringStatistics(products: Product[]): {
  totalProducts: number;
  productsWithNutrition: number;
  productsWithScores: number;
  scoringCoverage: number;
  nutriScoreRange: { min: number; max: number } | null;
  globalGradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  categoryCount: number;
} {
  const totalProducts = products.length;
  const productsWithNutrition = products.filter((p) => p.nutrition).length;
  const productsWithScores = products.filter((p) => p.nutriScore !== undefined).length;
  const scoringCoverage = totalProducts > 0 ? (productsWithScores / totalProducts) * 100 : 0;

  // Calculate Nutri-Score range
  const nutriScores = products
    .map((p) => p.nutriScore)
    .filter((score): score is number => score !== undefined);

  const nutriScoreRange =
    nutriScores.length > 0
      ? { min: Math.min(...nutriScores), max: Math.max(...nutriScores) }
      : null;

  // Calculate global grade distribution
  const globalGrades = products
    .map((p) => p.globalHealthGrade)
    .filter(
      (grade): grade is import('../src/data/transform/types.ts').HealthGrade => grade !== undefined,
    );

  const globalGradeDistribution = {
    A: globalGrades.filter((g) => g === 'A').length,
    B: globalGrades.filter((g) => g === 'B').length,
    C: globalGrades.filter((g) => g === 'C').length,
    D: globalGrades.filter((g) => g === 'D').length,
    E: globalGrades.filter((g) => g === 'E').length,
  };

  // Count unique categories
  const allCategories = new Set<string>();
  products.forEach((product) => {
    const primaryCategory = getPrimaryCategory(product.categories);
    if (primaryCategory) {
      allCategories.add(primaryCategory);
    }
  });

  return {
    totalProducts,
    productsWithNutrition,
    productsWithScores,
    scoringCoverage: Math.round(scoringCoverage * 10) / 10,
    nutriScoreRange,
    globalGradeDistribution,
    categoryCount: allCategories.size,
  };
}

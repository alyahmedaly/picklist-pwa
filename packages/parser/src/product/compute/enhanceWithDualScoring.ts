import { computeNutriScore } from './computeNutriScore.ts';
import { computePercentileRank } from './computePercentileRank.ts';
import { computeHealthGrade, computeHealthScore, applyCategoryCap } from './computeHealthGrade.ts';
import type { Product } from '@picklist/types';
import type { HealthGrade } from '@picklist/types';

/**
 * Pass 1: Calculate all Nutri-Scores and collect for percentile computation
 *
 * @param products - Products with nutrition data
 * @returns Products with nutriScore field populated
 */
export function calculateNutriScores(product: Product): number | undefined {
  // Skip products without nutrition data
  if (!product.nutrition) {
    return undefined;
  }

  // Determine category for category-specific thresholds
  const category = getCategoryForNutriScore(product.categories);

  // Calculate Nutri-Score with processing penalties
  const nutriScore = computeNutriScore(product.nutrition, category, product.additiveInfo);

  return nutriScore;
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

  // Group products by category for category-relative scoring
  const productsByCategory = groupProductsByCategory(products);

  // Process each product to add global and category-relative scores
  return products.map((product) => {
    // Skip products without Nutri-Score
    if (product.nutriScore === undefined) {
      return product;
    }

    // Calculate global percentile rank
    // For Nutri-Score, lower scores are better, so we need to invert for percentile calculation
    // We invert by negating the score so that lower (better) Nutri-Scores become higher values
    const invertedScore = -product.nutriScore;
    const invertedAllScores = allNutriScores.map((score) => -score);

    const baseGlobalPercentile = computePercentileRank(invertedScore, invertedAllScores);

    // Apply category-based grade capping to prevent grade inflation
    const { cappedPercentile: globalPercentile } = applyCategoryCap(
      baseGlobalPercentile,
      product.categories || [],
      product.nutrition,
      product.additiveInfo,
    );

    const globalHealthScore = computeHealthScore(globalPercentile);
    const globalHealthGrade = computeHealthGrade(globalPercentile);

    // Calculate category-relative percentile rank
    let categoryHealthScore: number | undefined;
    let categoryHealthGrade: HealthGrade | undefined;

    const primaryCategory = getPrimaryCategory(product.categories);
    if (primaryCategory && productsByCategory.has(primaryCategory)) {
      const categoryScores = productsByCategory.get(primaryCategory)!;

      // Only calculate category scores if there are multiple products in category
      if (categoryScores.length > 1) {
        // Apply same inversion for category scoring
        const invertedCategoryScore = -product.nutriScore;
        const invertedCategoryScores = categoryScores.map((score) => -score);

        const baseCategoryPercentile = computePercentileRank(
          invertedCategoryScore,
          invertedCategoryScores,
        );

        // Apply category capping to category-relative score as well
        const { cappedPercentile: categoryPercentile } = applyCategoryCap(
          baseCategoryPercentile,
          product.categories || [],
          product.nutrition,
          product.additiveInfo,
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

/**
 * Determine the appropriate category for Nutri-Score calculation
 */
function getCategoryForNutriScore(categories?: string[]): string {
  if (!categories || categories.length === 0) {
    return 'general';
  }

  // Check for beverage categories (Dutch localization)
  const beverageKeywords = [
    'dranken',
    'frisdrank',
    'sap',
    'smoothie',
    'koffie',
    'thee',
    'beverages',
    'drinks',
    'juice',
    'soda',
    'coffee',
    'tea',
  ];

  // Check for cheese categories
  const cheeseKeywords = ['kaas', 'cheese', 'fromage'];

  // Check for fats/oils categories
  const fatKeywords = ['olie', 'boter', 'margarine', 'vet', 'oil', 'butter', 'fat', 'oils'];

  const categoryString = categories.join(' ').toLowerCase();

  if (beverageKeywords.some((keyword) => categoryString.includes(keyword))) {
    return 'beverages';
  }

  if (cheeseKeywords.some((keyword) => categoryString.includes(keyword))) {
    return 'cheese';
  }

  if (fatKeywords.some((keyword) => categoryString.includes(keyword))) {
    return 'fats';
  }

  return 'general';
}

/**
 * Group products by their primary category for category-relative scoring
 */
function groupProductsByCategory(products: Product[]): Map<string, number[]> {
  const categoryMap = new Map<string, number[]>();

  products.forEach((product) => {
    // Skip products without Nutri-Score
    if (product.nutriScore === undefined) {
      return;
    }

    const primaryCategory = getPrimaryCategory(product.categories);
    if (primaryCategory) {
      if (!categoryMap.has(primaryCategory)) {
        categoryMap.set(primaryCategory, []);
      }
      categoryMap.get(primaryCategory)!.push(product.nutriScore);
    }
  });

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
    .filter((grade): grade is HealthGrade => grade !== undefined);

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

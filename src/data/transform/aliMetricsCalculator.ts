/**
 * Ali Metrics Calculator
 *
 * Calculates Ali-specific metrics for category aggregation in the transform pipeline.
 * Pre-computes halal compliance, protein density, and price efficiency for categories.
 *
 * Constitutional Principle VIII: Transform Pipeline First - complex computations are
 * pre-computed during build for faster loading and better performance.
 */

import type { Product } from './types.ts';
import type { AliMetrics, AliContext, AliMetricsConfig } from '../../types/category-index.ts';

// Default configuration for Ali metrics calculation
const DEFAULT_CONFIG: AliMetricsConfig = {
  halalCompliance: {
    countHalalProducts: true,
    excludeQuestionable: false, // Include questionable as non-halal for conservative estimate
  },
  proteinDensity: {
    weightByProductCount: true,
    excludeZeroProtein: false, // Include zero protein products in average
  },
  priceEfficiency: {
    useProteinPerEuro: true,
    excludeMissingPrices: true,
  },
  contextRecommendations: {
    proteinThresholds: {
      'daily-protein': 15,    // g/100g minimum
      'post-workout': 20,     // g/100g minimum
    },
    halalRequirements: {
      strict: 100,            // % for strict halal contexts
      standard: 80,           // % for standard contexts
    },
    efficiencyThresholds: {
      'budget': 0.50,         // €/g maximum for budget
    },
  },
};

/**
 * Calculate halal compliance percentage for a category (T004)
 *
 * @param products - Products in the category
 * @param config - Configuration for halal calculation
 * @returns Percentage (0-100) of halal products in category
 */
export function calculateHalalCompliance(
  products: Product[],
  config: AliMetricsConfig['halalCompliance'] = DEFAULT_CONFIG.halalCompliance
): number {
  if (products.length === 0) return 0;

  const halalProducts = products.filter(product => {
    const halalStatus = product.halalCheck?.status;

    if (config.excludeQuestionable) {
      return halalStatus === 'halal';
    } else {
      // Conservative approach: only confirmed halal counts as halal
      return halalStatus === 'halal';
    }
  });

  return Math.round((halalProducts.length / products.length) * 100);
}

/**
 * Calculate average protein density for a category (T005)
 *
 * @param products - Products in the category
 * @param config - Configuration for protein calculation
 * @returns Average protein density in g/100g
 */
export function calculateProteinDensity(
  products: Product[],
  config: AliMetricsConfig['proteinDensity'] = DEFAULT_CONFIG.proteinDensity
): number {
  let validProducts = products.filter(product =>
    product.nutrition?.protein !== undefined &&
    product.nutrition.protein !== null &&
    !isNaN(product.nutrition.protein)
  );

  if (config.excludeZeroProtein) {
    validProducts = validProducts.filter(product =>
      (product.nutrition?.protein || 0) > 0
    );
  }

  if (validProducts.length === 0) return 0;

  if (config.weightByProductCount) {
    // Simple average - each product contributes equally
    const totalProtein = validProducts.reduce((sum, product) =>
      sum + (product.nutrition?.protein || 0), 0
    );
    return Math.round((totalProtein / validProducts.length) * 10) / 10; // Round to 1 decimal
  } else {
    // Alternative: weight by some other factor (not implemented in default config)
    const totalProtein = validProducts.reduce((sum, product) =>
      sum + (product.nutrition?.protein || 0), 0
    );
    return Math.round((totalProtein / validProducts.length) * 10) / 10;
  }
}

/**
 * Calculate price efficiency for a category (T006)
 *
 * @param products - Products in the category
 * @param config - Configuration for efficiency calculation
 * @returns Average price per gram of protein in euros
 */
export function calculatePriceEfficiency(
  products: Product[],
  config: AliMetricsConfig['priceEfficiency'] = DEFAULT_CONFIG.priceEfficiency
): number {
  let validProducts = products.filter(product => {
    const hasPrice = product.price?.regular !== undefined &&
                    product.price.regular !== null &&
                    !isNaN(product.price.regular) &&
                    product.price.regular > 0;

    const hasProtein = product.nutrition?.protein !== undefined &&
                      product.nutrition.protein !== null &&
                      !isNaN(product.nutrition.protein) &&
                      product.nutrition.protein > 0;

    return hasPrice && hasProtein;
  });

  if (config.excludeMissingPrices) {
    // Already filtered above
  }

  if (validProducts.length === 0) return 999; // High value indicates poor efficiency

  if (config.useProteinPerEuro) {
    // Calculate euros per gram of protein for each product
    const efficiencyScores = validProducts.map(product => {
      const price = product.price!.sale || product.price!.regular; // Use sale price if available
      const protein = product.nutrition!.protein!;

      // Price is per package, protein is per 100g
      // For now, assume price is per 100g equivalent for consistency
      const proteinPerPackage = protein;

      return price / proteinPerPackage; // euros per gram of protein
    });

    const averageEfficiency = efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length;
    return Math.round(averageEfficiency * 100) / 100; // Round to 2 decimals
  }

  return 999; // Fallback high value
}

/**
 * Determine Ali context recommendations for a category
 *
 * @param products - Products in the category
 * @param aliMetrics - Already calculated metrics
 * @param config - Configuration for context determination
 * @returns Array of recommended contexts
 */
export function determineAliContexts(
  products: Product[],
  aliMetrics: Omit<AliMetrics, 'recommendedFor'>,
  config: AliMetricsConfig['contextRecommendations'] = DEFAULT_CONFIG.contextRecommendations
): AliContext[] {
  const contexts: AliContext[] = [];

  // Daily protein context - high protein categories
  if (aliMetrics.averageProtein >= config.proteinThresholds['daily-protein']) {
    contexts.push('daily-protein');
  }

  // Post-workout context - very high protein categories
  if (aliMetrics.averageProtein >= config.proteinThresholds['post-workout']) {
    contexts.push('post-workout');
  }

  // Budget context - good price efficiency
  if (aliMetrics.priceEfficiency <= config.efficiencyThresholds['budget']) {
    contexts.push('budget');
  }

  // Halal-dependent contexts
  const isStandardHalal = aliMetrics.halalCompliance >= config.halalRequirements.standard;

  // Training day context - requires moderate halal compliance + decent protein
  if (isStandardHalal && aliMetrics.averageProtein >= 10) {
    contexts.push('training-day');
  }

  // Rest day context - broader criteria
  if (isStandardHalal) {
    contexts.push('rest-day');
  }

  // Cutting context - analyze products for low calorie density
  const lowCalorieProducts = products.filter(product =>
    product.nutrition?.kcal !== undefined &&
    product.nutrition.kcal < 125 // < 125 kcal per 100g
  );

  if (lowCalorieProducts.length > 0 && (lowCalorieProducts.length / products.length) >= 0.3) {
    contexts.push('cutting');
  }

  return contexts;
}

/**
 * Calculate complete Ali metrics for a category
 *
 * @param products - Products in the category
 * @param config - Configuration for all calculations
 * @returns Complete AliMetrics object
 */
export function calculateCategoryAliMetrics(
  products: Product[],
  config: AliMetricsConfig = DEFAULT_CONFIG
): AliMetrics {
  const halalCompliance = calculateHalalCompliance(products, config.halalCompliance);
  const averageProtein = calculateProteinDensity(products, config.proteinDensity);
  const priceEfficiency = calculatePriceEfficiency(products, config.priceEfficiency);

  const partialMetrics = {
    halalCompliance,
    averageProtein,
    priceEfficiency,
  };

  const recommendedFor = determineAliContexts(products, partialMetrics, config.contextRecommendations);

  return {
    halalCompliance,
    averageProtein,
    priceEfficiency,
    recommendedFor,
  };
}

/**
 * Batch calculate Ali metrics for multiple categories
 * Used by category tree builder for efficient processing
 *
 * @param categorizedProducts - Map of category path to products
 * @param config - Configuration for calculations
 * @returns Map of category path to Ali metrics
 */
export function batchCalculateAliMetrics(
  categorizedProducts: Map<string, Product[]>,
  config: AliMetricsConfig = DEFAULT_CONFIG
): Map<string, AliMetrics> {
  const results = new Map<string, AliMetrics>();

  categorizedProducts.forEach((products, categoryPath) => {
    const metrics = calculateCategoryAliMetrics(products, config);
    results.set(categoryPath, metrics);
  });

  return results;
}

/**
 * Filter products by category for Ali metrics calculation
 * Helper function to group products by category path
 *
 * @param products - All products
 * @returns Map of category path to products in that category
 */
export function groupProductsByCategory(products: Product[]): Map<string, Product[]> {
  const categoryMap = new Map<string, Product[]>();

  for (const product of products) {
    if (!product.categoryTree?.tree || product.categoryTree.tree.length === 0) {
      continue;
    }

    // Add product to all category levels it belongs to
    const { tree } = product.categoryTree;
    for (let i = 0; i < tree.length; i++) {
      const categoryPath = tree.slice(0, i + 1).join(' > ');

      if (!categoryMap.has(categoryPath)) {
        categoryMap.set(categoryPath, []);
      }

      categoryMap.get(categoryPath)!.push(product);
    }
  }

  return categoryMap;
}
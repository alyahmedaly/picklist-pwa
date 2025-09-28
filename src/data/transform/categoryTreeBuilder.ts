/**
 * Category Tree Builder with Ali Metrics
 *
 * Extends the existing category tree building pipeline to include Ali-specific metrics
 * pre-computed during the transform pipeline for optimal performance.
 *
 * Constitutional Principle VIII: Transform Pipeline First - Ali metrics are calculated
 * during build time rather than client-side for faster loading and better UX.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Product } from './types.ts';
import type { CategoryNode, ProductCategoryData, CategoryTreeBuilderOptions } from '../../types/category-tree.ts';
import type { CategoryWithMetrics, AliMetrics, AliMetricsConfig } from '../../types/category-index.ts';
import {
  buildCategoryTree,
  flattenCategoryTree,
  calculateCategoryStats,
} from '../../lib/category-tree-utils.ts';
import {
  groupProductsByCategory,
  batchCalculateAliMetrics,
} from './aliMetricsCalculator.ts';

/**
 * Extended category tree builder options with Ali metrics configuration
 */
export interface CategoryTreeBuilderWithAliOptions extends CategoryTreeBuilderOptions {
  // Ali metrics configuration
  aliMetrics?: {
    enabled: boolean;
    config?: AliMetricsConfig;
  };
}

/**
 * Build category tree with Ali metrics from product data
 * Integrates with existing category tree building while adding Ali-specific calculations
 *
 * @param products - Full product array with all data needed for Ali metrics
 * @param options - Configuration including Ali metrics settings
 * @returns CategoryWithMetrics array with pre-computed Ali data
 */
export function buildCategoryTreeWithAliMetrics(
  products: Product[],
  options: CategoryTreeBuilderWithAliOptions = {
    includeEmptyCategories: false,
    sortByProductCount: true,
    minProductCount: 1,
    aliMetrics: {
      enabled: true,
    },
  }
): CategoryWithMetrics[] {
  // First, build the standard category tree using existing utilities
  const productCategoryData: ProductCategoryData[] = products
    .filter(p => p.categoryTree && p.categoryTree.tree && p.categoryTree.tree.length > 0)
    .map(p => ({
      id: String(p.id), // Ensure id is string
      name: p.name,
      categoryTree: p.categoryTree!
    }));

  const baseCategoryTree = buildCategoryTree(productCategoryData, options);

  // If Ali metrics are disabled, return basic tree
  if (!options.aliMetrics?.enabled) {
    return baseCategoryTree as CategoryWithMetrics[];
  }

  // Group products by category for efficient Ali metrics calculation
  const categorizedProducts = groupProductsByCategory(products);

  // Batch calculate Ali metrics for all categories
  const aliMetricsMap = batchCalculateAliMetrics(
    categorizedProducts,
    options.aliMetrics.config
  );

  // Enhance category tree with Ali metrics
  return enhanceCategoryTreeWithAliMetrics(baseCategoryTree, aliMetricsMap);
}

/**
 * Enhance existing category tree with Ali metrics
 * Recursively adds Ali metrics to each category node
 *
 * @param categories - Base category tree
 * @param aliMetricsMap - Pre-computed Ali metrics by category path
 * @returns Enhanced category tree with Ali metrics
 */
function enhanceCategoryTreeWithAliMetrics(
  categories: CategoryNode[],
  aliMetricsMap: Map<string, AliMetrics>
): CategoryWithMetrics[] {
  return categories.map(category => enhanceCategoryNode(category, aliMetricsMap));
}

/**
 * Enhance a single category node with Ali metrics
 * Recursively processes children
 *
 * @param category - Base category node
 * @param aliMetricsMap - Pre-computed Ali metrics by category path
 * @returns Enhanced category with Ali metrics
 */
function enhanceCategoryNode(
  category: CategoryNode,
  aliMetricsMap: Map<string, AliMetrics>
): CategoryWithMetrics {
  const categoryPath = category.breadcrumbs;
  const aliMetrics = aliMetricsMap.get(categoryPath) || getDefaultAliMetrics();

  const enhancedCategory: CategoryWithMetrics = {
    ...category,
    aliMetrics,
    children: category.children.map(child => enhanceCategoryNode(child, aliMetricsMap)),
  };

  return enhancedCategory;
}

/**
 * Get default Ali metrics for categories without data
 * Used as fallback when no products are found for a category
 *
 * @returns Default AliMetrics object
 */
function getDefaultAliMetrics(): AliMetrics {
  return {
    halalCompliance: 0,
    averageProtein: 0,
    priceEfficiency: 999, // High value indicates poor efficiency
    recommendedFor: [],
  };
}

/**
 * Write enhanced category tree with Ali metrics to JSON file
 * Extends the existing writeCategoryTree function with Ali metrics support
 *
 * @param filePath - Output file path
 * @param products - Full product array
 * @param options - Build options with Ali metrics configuration
 */
export function writeCategoryTreeWithAliMetrics(
  filePath: string,
  products: Product[],
  options: CategoryTreeBuilderWithAliOptions = {
    includeEmptyCategories: false,
    sortByProductCount: true,
    minProductCount: 1,
    aliMetrics: {
      enabled: true,
    },
  }
): void {

  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  // Build enhanced category tree with Ali metrics
  const categoryTree = buildCategoryTreeWithAliMetrics(products, options);

  // Create flat category list for easier searching/filtering
  const flatCategories = flattenCategoryTree(categoryTree);

  // Calculate statistics (standard category stats)
  const stats = calculateCategoryStats(categoryTree);

  // Remove circular references from category tree for JSON serialization
  const serializableTree = removeCircularReferencesWithAliMetrics(categoryTree);

  // Calculate Ali-specific statistics
  const aliStats = calculateAliStatistics(categoryTree);

  // Create output structure with Ali enhancements
  const output = {
    metadata: {
      totalProductsWithCategories: products.filter(p => p.categoryTree?.tree?.length).length,
      aliMetricsEnabled: options.aliMetrics?.enabled || false,
      ...stats,
      ...aliStats,
    },
    categoryTree: serializableTree,
    flatCategories,
    stats: {
      ...stats,
      ali: aliStats,
    }
  };

  // Write atomic
  const json = JSON.stringify(output, null, 2) + '\n';
  const tmp = filePath + '.tmp-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  try {
    fs.writeFileSync(tmp, json, 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (e) {
    try {
      fs.rmSync(tmp, { force: true });
    } catch {
      /* ignore */
    }
    throw e;
  }
}

/**
 * Remove circular references from enhanced category tree for JSON serialization
 * Creates a clean tree without parent references while preserving Ali metrics
 */
function removeCircularReferencesWithAliMetrics(categories: CategoryWithMetrics[]): CategoryWithMetrics[] {
  return categories.map(node => ({
    name: node.name,
    path: node.path,
    breadcrumbs: node.breadcrumbs,
    depth: node.depth,
    productCount: node.productCount,
    children: removeCircularReferencesWithAliMetrics(node.children as CategoryWithMetrics[]),
    isExpanded: node.isExpanded,
    isSelected: node.isSelected,
    isVisible: node.isVisible,
    aliMetrics: node.aliMetrics,
    // Note: parent reference is omitted to avoid circular structure
  }));
}

/**
 * Calculate Ali-specific statistics for the category tree
 * Provides insights into halal compliance, protein distribution, etc.
 *
 * @param categories - Enhanced category tree with Ali metrics
 * @returns Ali statistics object
 */
function calculateAliStatistics(categories: CategoryWithMetrics[]) {
  let totalCategories = 0;
  let categoriesWithHalalProducts = 0;
  let categoriesWithHighProtein = 0;
  let categoriesWithGoodEfficiency = 0;
  let avgHalalCompliance = 0;
  let avgProteinDensity = 0;
  let avgPriceEfficiency = 0;

  const contextCounts: Record<string, number> = {
    'daily-protein': 0,
    'post-workout': 0,
    'cutting': 0,
    'budget': 0,
    'training-day': 0,
    'rest-day': 0,
  };

  const traverse = (nodes: CategoryWithMetrics[]) => {
    for (const node of nodes) {
      totalCategories++;

      const { aliMetrics } = node;

      // Accumulate metrics for averages
      avgHalalCompliance += aliMetrics.halalCompliance;
      avgProteinDensity += aliMetrics.averageProtein;
      avgPriceEfficiency += aliMetrics.priceEfficiency;

      // Count categories meeting Ali's criteria
      if (aliMetrics.halalCompliance > 0) categoriesWithHalalProducts++;
      if (aliMetrics.averageProtein >= 15) categoriesWithHighProtein++;
      if (aliMetrics.priceEfficiency <= 0.50) categoriesWithGoodEfficiency++;

      // Count context recommendations
      for (const context of aliMetrics.recommendedFor) {
        if (context in contextCounts) {
          contextCounts[context]++;
        }
      }

      if (node.children.length > 0) {
        traverse(node.children as CategoryWithMetrics[]);
      }
    }
  };

  traverse(categories);

  return {
    totalCategoriesWithAliMetrics: totalCategories,
    categoriesWithHalalProducts,
    categoriesWithHighProtein,
    categoriesWithGoodEfficiency,
    averageHalalCompliance: totalCategories > 0 ? Math.round(avgHalalCompliance / totalCategories) : 0,
    averageProteinDensity: totalCategories > 0 ? Math.round((avgProteinDensity / totalCategories) * 10) / 10 : 0,
    averagePriceEfficiency: totalCategories > 0 ? Math.round((avgPriceEfficiency / totalCategories) * 100) / 100 : 0,
    contextRecommendations: contextCounts,
    aliCoveragePercentage: totalCategories > 0 ? Math.round((categoriesWithHalalProducts / totalCategories) * 100) : 0,
  };
}

/**
 * Sort categories with Ali metrics by specified criteria
 * Extends standard sorting with Ali-specific sort options
 *
 * @param categories - Categories with Ali metrics
 * @param sortBy - Sort criteria including Ali-specific options
 * @returns Sorted categories
 */
export function sortCategoriesWithAliMetrics(
  categories: CategoryWithMetrics[],
  sortBy: 'product-count-desc' | 'product-count-asc' | 'name-asc' | 'name-desc' |
          'protein-desc' | 'halal-compliance-desc' | 'price-efficiency-desc'
): CategoryWithMetrics[] {
  const sortNode = (nodes: CategoryWithMetrics[]): CategoryWithMetrics[] => {
    const sorted = [...nodes].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'product-count-desc':
          return b.productCount - a.productCount || a.name.localeCompare(b.name);
        case 'product-count-asc':
          return a.productCount - b.productCount || a.name.localeCompare(b.name);
        case 'protein-desc':
          return b.aliMetrics.averageProtein - a.aliMetrics.averageProtein || a.name.localeCompare(b.name);
        case 'halal-compliance-desc':
          return b.aliMetrics.halalCompliance - a.aliMetrics.halalCompliance || a.name.localeCompare(b.name);
        case 'price-efficiency-desc':
          return a.aliMetrics.priceEfficiency - b.aliMetrics.priceEfficiency || a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted.map(node => ({
      ...node,
      children: sortNode(node.children as CategoryWithMetrics[]),
    }));
  };

  return sortNode(categories);
}
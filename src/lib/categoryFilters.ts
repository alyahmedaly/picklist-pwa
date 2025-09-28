/**
 * Category Filtering Utilities
 *
 * Functions to filter categories based on Ali-specific criteria.
 * Supports halal compliance, protein density, price efficiency, and context filtering.
 */

import type { CategoryWithMetrics, AliFilterCriteria, AliContext } from '../types/category-index';

/**
 * Filter categories based on Ali-specific criteria
 * @param categories - Array of categories to filter
 * @param criteria - Filter criteria to apply
 * @returns Filtered array of categories
 */
export function filterCategories(
  categories: CategoryWithMetrics[],
  criteria: AliFilterCriteria
): CategoryWithMetrics[] {
  if (!categories.length || !criteria || Object.keys(criteria).length === 0) {
    return categories;
  }

  return categories.filter(category => {
    // Check halal compliance filter
    if (criteria.minHalalCompliance !== undefined) {
      const halalCompliance = category.aliMetrics?.halalCompliance || 0;
      if (halalCompliance < criteria.minHalalCompliance) {
        return false;
      }
    }

    // Check protein density filter
    if (criteria.minProtein !== undefined) {
      const proteinDensity = category.aliMetrics?.averageProtein || 0;
      if (proteinDensity < criteria.minProtein) {
        return false;
      }
    }

    // Check price efficiency filter (lower is better)
    if (criteria.maxPricePerProtein !== undefined) {
      const priceEfficiency = category.aliMetrics?.priceEfficiency || 999;
      if (priceEfficiency > criteria.maxPricePerProtein) {
        return false;
      }
    }

    // Check minimum product count filter
    if (criteria.minProductCount !== undefined) {
      if (category.productCount < criteria.minProductCount) {
        return false;
      }
    }

    // Check Ali context filter
    if (criteria.contexts && criteria.contexts.length > 0) {
      const categoryContexts = category.aliMetrics?.recommendedFor || [];
      const hasMatchingContext = criteria.contexts.some(context =>
        categoryContexts.includes(context)
      );
      if (!hasMatchingContext) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Filter categories by halal compliance percentage
 * @param categories - Array of categories to filter
 * @param minCompliance - Minimum halal compliance percentage (0-100)
 * @returns Filtered array of categories
 */
export function filterByHalalCompliance(
  categories: CategoryWithMetrics[],
  minCompliance: number
): CategoryWithMetrics[] {
  return categories.filter(category => {
    const halalCompliance = category.aliMetrics?.halalCompliance || 0;
    return halalCompliance >= minCompliance;
  });
}

/**
 * Filter categories by protein density
 * @param categories - Array of categories to filter
 * @param minProtein - Minimum protein density in g/100g
 * @returns Filtered array of categories
 */
export function filterByProteinDensity(
  categories: CategoryWithMetrics[],
  minProtein: number
): CategoryWithMetrics[] {
  return categories.filter(category => {
    const proteinDensity = category.aliMetrics?.averageProtein || 0;
    return proteinDensity >= minProtein;
  });
}

/**
 * Filter categories by price efficiency
 * @param categories - Array of categories to filter
 * @param maxPrice - Maximum price per gram of protein in €
 * @returns Filtered array of categories
 */
export function filterByPriceEfficiency(
  categories: CategoryWithMetrics[],
  maxPrice: number
): CategoryWithMetrics[] {
  return categories.filter(category => {
    const priceEfficiency = category.aliMetrics?.priceEfficiency || 999;
    return priceEfficiency <= maxPrice;
  });
}

/**
 * Filter categories by Ali context recommendations
 * @param categories - Array of categories to filter
 * @param contexts - Array of Ali contexts to match
 * @returns Filtered array of categories
 */
export function filterByAliContext(
  categories: CategoryWithMetrics[],
  contexts: AliContext[]
): CategoryWithMetrics[] {
  if (!contexts.length) {
    return categories;
  }

  return categories.filter(category => {
    const categoryContexts = category.aliMetrics?.recommendedFor || [];
    return contexts.some(context => categoryContexts.includes(context));
  });
}

/**
 * Filter categories by minimum product count
 * @param categories - Array of categories to filter
 * @param minCount - Minimum number of products in category
 * @returns Filtered array of categories
 */
export function filterByProductCount(
  categories: CategoryWithMetrics[],
  minCount: number
): CategoryWithMetrics[] {
  return categories.filter(category => category.productCount >= minCount);
}

/**
 * Check if any filters are active in the criteria
 * @param criteria - Filter criteria object
 * @returns True if any filters are set
 */
export function hasActiveFilters(criteria: AliFilterCriteria): boolean {
  return Boolean(
    criteria.minHalalCompliance ||
    criteria.minProtein ||
    criteria.maxPricePerProtein ||
    criteria.minProductCount ||
    (criteria.contexts && criteria.contexts.length > 0)
  );
}

/**
 * Get a count of active filters
 * @param criteria - Filter criteria object
 * @returns Number of active filters
 */
export function getActiveFilterCount(criteria: AliFilterCriteria): number {
  let count = 0;

  if (criteria.minHalalCompliance) count++;
  if (criteria.minProtein) count++;
  if (criteria.maxPricePerProtein) count++;
  if (criteria.minProductCount) count++;
  if (criteria.contexts && criteria.contexts.length > 0) count++;

  return count;
}

/**
 * Clear all filters and return empty criteria
 * @returns Empty filter criteria object
 */
export function clearAllFilters(): AliFilterCriteria {
  return {};
}

/**
 * Get filter summary for display purposes
 * @param criteria - Filter criteria object
 * @returns Human-readable filter summary
 */
export function getFilterSummary(criteria: AliFilterCriteria): string[] {
  const summary: string[] = [];

  if (criteria.minHalalCompliance) {
    summary.push(`≥${criteria.minHalalCompliance}% halal`);
  }

  if (criteria.minProtein) {
    summary.push(`≥${criteria.minProtein}g protein`);
  }

  if (criteria.maxPricePerProtein) {
    summary.push(`≤€${criteria.maxPricePerProtein.toFixed(2)}/g protein`);
  }

  if (criteria.minProductCount) {
    summary.push(`≥${criteria.minProductCount} products`);
  }

  if (criteria.contexts && criteria.contexts.length > 0) {
    const contextLabels = criteria.contexts.map(context => {
      switch (context) {
        case 'daily-protein': return 'Daily Protein';
        case 'post-workout': return 'Post Workout';
        case 'cutting': return 'Cutting';
        case 'budget': return 'Budget';
        case 'training-day': return 'Training Day';
        case 'rest-day': return 'Rest Day';
        default: return context;
      }
    });
    summary.push(`Context: ${contextLabels.join(', ')}`);
  }

  return summary;
}
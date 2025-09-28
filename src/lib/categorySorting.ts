/**
 * Category Sorting Utilities
 *
 * Functions to sort categories based on various criteria including Ali metrics.
 * Supports product count, protein efficiency, price efficiency, and halal compliance sorting.
 */

import type { CategoryWithMetrics, CategorySortOption } from '../types/category-index';

/**
 * Sort categories based on the specified criteria
 * @param categories - Array of categories to sort
 * @param sortBy - Sort option to apply
 * @returns Sorted array of categories
 */
export function sortCategories(
  categories: CategoryWithMetrics[],
  sortBy: CategorySortOption
): CategoryWithMetrics[] {
  if (!categories.length) {
    return categories;
  }

  const sorted = [...categories];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    case 'product-count-asc':
      return sorted.sort((a, b) => a.productCount - b.productCount);

    case 'product-count-desc':
      return sorted.sort((a, b) => b.productCount - a.productCount);

    case 'protein-asc':
      return sorted.sort((a, b) => {
        const proteinA = a.aliMetrics?.averageProtein || 0;
        const proteinB = b.aliMetrics?.averageProtein || 0;
        return proteinA - proteinB;
      });

    case 'protein-desc':
      return sorted.sort((a, b) => {
        const proteinA = a.aliMetrics?.averageProtein || 0;
        const proteinB = b.aliMetrics?.averageProtein || 0;
        return proteinB - proteinA;
      });

    case 'price-efficiency-asc':
      return sorted.sort((a, b) => {
        const efficiencyA = a.aliMetrics?.priceEfficiency || 999;
        const efficiencyB = b.aliMetrics?.priceEfficiency || 999;
        return efficiencyA - efficiencyB;
      });

    case 'price-efficiency-desc':
      return sorted.sort((a, b) => {
        const efficiencyA = a.aliMetrics?.priceEfficiency || 999;
        const efficiencyB = b.aliMetrics?.priceEfficiency || 999;
        return efficiencyB - efficiencyA;
      });

    case 'halal-compliance-asc':
      return sorted.sort((a, b) => {
        const halalA = a.aliMetrics?.halalCompliance || 0;
        const halalB = b.aliMetrics?.halalCompliance || 0;
        return halalA - halalB;
      });

    case 'halal-compliance-desc':
      return sorted.sort((a, b) => {
        const halalA = a.aliMetrics?.halalCompliance || 0;
        const halalB = b.aliMetrics?.halalCompliance || 0;
        return halalB - halalA;
      });

    default:
      console.warn(`Unknown sort option: ${sortBy}, defaulting to product-count-desc`);
      return sorted.sort((a, b) => b.productCount - a.productCount);
  }
}

/**
 * Sort categories by name (alphabetical)
 * @param categories - Array of categories to sort
 * @param ascending - Sort in ascending order (default: true)
 * @returns Sorted array of categories
 */
export function sortByName(
  categories: CategoryWithMetrics[],
  ascending: boolean = true
): CategoryWithMetrics[] {
  const sorted = [...categories];
  return ascending
    ? sorted.sort((a, b) => a.name.localeCompare(b.name))
    : sorted.sort((a, b) => b.name.localeCompare(a.name));
}

/**
 * Sort categories by product count
 * @param categories - Array of categories to sort
 * @param ascending - Sort in ascending order (default: false for most products first)
 * @returns Sorted array of categories
 */
export function sortByProductCount(
  categories: CategoryWithMetrics[],
  ascending: boolean = false
): CategoryWithMetrics[] {
  const sorted = [...categories];
  return ascending
    ? sorted.sort((a, b) => a.productCount - b.productCount)
    : sorted.sort((a, b) => b.productCount - a.productCount);
}

/**
 * Sort categories by protein density
 * @param categories - Array of categories to sort
 * @param ascending - Sort in ascending order (default: false for highest protein first)
 * @returns Sorted array of categories
 */
export function sortByProteinDensity(
  categories: CategoryWithMetrics[],
  ascending: boolean = false
): CategoryWithMetrics[] {
  const sorted = [...categories];
  return ascending
    ? sorted.sort((a, b) => {
        const proteinA = a.aliMetrics?.averageProtein || 0;
        const proteinB = b.aliMetrics?.averageProtein || 0;
        return proteinA - proteinB;
      })
    : sorted.sort((a, b) => {
        const proteinA = a.aliMetrics?.averageProtein || 0;
        const proteinB = b.aliMetrics?.averageProtein || 0;
        return proteinB - proteinA;
      });
}

/**
 * Sort categories by price efficiency (lower is better)
 * @param categories - Array of categories to sort
 * @param ascending - Sort in ascending order (default: true for best value first)
 * @returns Sorted array of categories
 */
export function sortByPriceEfficiency(
  categories: CategoryWithMetrics[],
  ascending: boolean = true
): CategoryWithMetrics[] {
  const sorted = [...categories];
  return ascending
    ? sorted.sort((a, b) => {
        const efficiencyA = a.aliMetrics?.priceEfficiency || 999;
        const efficiencyB = b.aliMetrics?.priceEfficiency || 999;
        return efficiencyA - efficiencyB;
      })
    : sorted.sort((a, b) => {
        const efficiencyA = a.aliMetrics?.priceEfficiency || 999;
        const efficiencyB = b.aliMetrics?.priceEfficiency || 999;
        return efficiencyB - efficiencyA;
      });
}

/**
 * Sort categories by halal compliance percentage
 * @param categories - Array of categories to sort
 * @param ascending - Sort in ascending order (default: false for highest compliance first)
 * @returns Sorted array of categories
 */
export function sortByHalalCompliance(
  categories: CategoryWithMetrics[],
  ascending: boolean = false
): CategoryWithMetrics[] {
  const sorted = [...categories];
  return ascending
    ? sorted.sort((a, b) => {
        const halalA = a.aliMetrics?.halalCompliance || 0;
        const halalB = b.aliMetrics?.halalCompliance || 0;
        return halalA - halalB;
      })
    : sorted.sort((a, b) => {
        const halalA = a.aliMetrics?.halalCompliance || 0;
        const halalB = b.aliMetrics?.halalCompliance || 0;
        return halalB - halalA;
      });
}

/**
 * Get sort option display label
 * @param sortBy - Sort option
 * @returns Human-readable label
 */
export function getSortLabel(sortBy: CategorySortOption): string {
  switch (sortBy) {
    case 'name-asc':
      return 'Name (A-Z)';
    case 'name-desc':
      return 'Name (Z-A)';
    case 'product-count-asc':
      return 'Product Count (Low to High)';
    case 'product-count-desc':
      return 'Product Count (High to Low)';
    case 'protein-asc':
      return 'Protein (Low to High)';
    case 'protein-desc':
      return 'Protein (High to Low)';
    case 'price-efficiency-asc':
      return 'Best Value First';
    case 'price-efficiency-desc':
      return 'Most Expensive First';
    case 'halal-compliance-asc':
      return 'Halal Compliance (Low to High)';
    case 'halal-compliance-desc':
      return 'Halal Compliance (High to Low)';
    default:
      return 'Unknown Sort';
  }
}

/**
 * Get all available sort options with labels
 * @returns Array of sort options with labels
 */
export function getAllSortOptions(): Array<{ value: CategorySortOption; label: string }> {
  const options: CategorySortOption[] = [
    'product-count-desc',
    'product-count-asc',
    'name-asc',
    'name-desc',
    'protein-desc',
    'protein-asc',
    'price-efficiency-asc',
    'price-efficiency-desc',
    'halal-compliance-desc',
    'halal-compliance-asc',
  ];

  return options.map(option => ({
    value: option,
    label: getSortLabel(option)
  }));
}

/**
 * Check if sort option is related to Ali metrics
 * @param sortBy - Sort option to check
 * @returns True if sort uses Ali metrics
 */
export function isAliMetricSort(sortBy: CategorySortOption): boolean {
  return [
    'protein-asc',
    'protein-desc',
    'price-efficiency-asc',
    'price-efficiency-desc',
    'halal-compliance-asc',
    'halal-compliance-desc',
  ].includes(sortBy);
}

/**
 * Get default sort option
 * @returns Default sort option
 */
export function getDefaultSort(): CategorySortOption {
  return 'product-count-desc';
}
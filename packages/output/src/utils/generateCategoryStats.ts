import type { CategoryDirectoryGroup } from '@picklist/types';

/**
 * Generates statistics for a category directory group.
 *
 * @param group - Category directory group
 * @returns Category statistics
 */


export function generateCategoryStats(group: CategoryDirectoryGroup) {
  const { products } = group;
  const totalProducts = products.length;

  // Calculate Ali-specific metrics
  const halalProducts = products.filter(p => p.halalCheck?.status === 'halal').length;
  const proteinProducts = products.filter(p => (p.nutrition?.protein || 0) >= 15).length;
  const avgProtein = products.reduce((sum, p) => sum + (p.nutrition?.protein || 0), 0) / totalProducts;
  const avgPrice = products.reduce((sum, p) => sum + (p.price?.regular || 0), 0) / totalProducts;

  return {
    categoryPath: group.categoryPath,
    breadcrumbs: group.breadcrumbs,
    totalProducts,
    halalCompliance: Math.round((halalProducts / totalProducts) * 100),
    averageProtein: Math.round(avgProtein * 10) / 10,
    averagePrice: Math.round(avgPrice * 100) / 100,
    highProteinProducts: proteinProducts,
    dataQuality: {
      withNutrition: products.filter(p => p.nutrition?.protein != null).length,
      withIngredients: products.filter(p => p.ingredients?.length).length,
      withHalalCheck: products.filter(p => p.halalCheck).length,
    },
  };
}

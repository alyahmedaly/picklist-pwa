import type { Product, CategoryDirectoryGroup } from '@picklist/types';
import { parseNestedCategoryPath } from './parseNestedCategoryPath.ts';

/**
 * Groups products by their category breadcrumbs with nested path information.
 * Creates directory structure that mirrors category hierarchy.
 *
 * @param products - Products with category data
 * @param minProductsPerCategory - Minimum products required per category
 * @returns Array of category directory groups with path info
 */


export function groupProductsByCategoryWithPaths(
  products: Product[],
  minProductsPerCategory: number = 1
): CategoryDirectoryGroup[] {
  const categoryMap = new Map<string, Product[]>();

  // Group products by category breadcrumbs
  for (const product of products) {
    if (!product.categoryTree?.breadcrumbs) continue;
    if (!product.flags?.isFood) continue; // Only include food products

    const breadcrumbs = product.categoryTree.breadcrumbs;
    const existing = categoryMap.get(breadcrumbs) || [];
    existing.push(product);
    categoryMap.set(breadcrumbs, existing);
  }

  // Convert to category groups with path information
  const groups: CategoryDirectoryGroup[] = [];
  for (const [breadcrumbs, categoryProducts] of Array.from(categoryMap.entries())) {
    if (categoryProducts.length < minProductsPerCategory) continue;

    const pathInfo = parseNestedCategoryPath(breadcrumbs);
    groups.push({
      categoryPath: breadcrumbs,
      breadcrumbs,
      products: categoryProducts,
      productCount: categoryProducts.length,
      directoryPath: pathInfo.directoryPath,
      fileName: pathInfo.fileName,
      fullPath: pathInfo.fullPath,
    });
  }

  // Sort by product count (descending) for consistent ordering
  return groups.sort((a, b) => b.productCount - a.productCount || a.breadcrumbs.localeCompare(b.breadcrumbs));
}

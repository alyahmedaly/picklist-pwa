import type { CategoryDirectoryGroup } from '@picklist/types';
import type { CategoryIndex } from './CategoryIndex.ts';

/**
 * Generates master index mapping all categories to their files.
 * Used for backward compatibility with flat structure expectations.
 *
 * @param groups - Category directory groups
 * @returns Master category index
 */


export function generateCategoryIndex(groups: CategoryDirectoryGroup[]): CategoryIndex {
  const categories = groups.map(group => {
    // Calculate quick metrics for the index
    const halalProducts = group.products.filter(p => p.halalCheck?.status === 'halal').length;
    const avgProtein = group.products.reduce((sum, p) => sum + (p.nutrition?.protein || 0), 0) / group.products.length;

    return {
      path: group.categoryPath,
      breadcrumbs: group.breadcrumbs,
      fileName: group.fullPath, // Use full path to locate file in nested structure
      filePath: `${group.fullPath}.jsonl`, // Direct link to JSONL file
      indexPath: `${group.fullPath}-index.json`, // Direct link to index file
      statsPath: `${group.fullPath}-stats.json`, // Direct link to stats file
      directoryPath: group.directoryPath, // Path to containing directory
      directoryIndexPath: `${group.directoryPath}/index.json`, // Link to directory index
      productCount: group.productCount,
      avgProtein: Math.round(avgProtein * 10) / 10,
      halalCompliance: Math.round((halalProducts / group.products.length) * 100),
    };
  });

  const totalProducts = groups.reduce((sum, group) => sum + group.productCount, 0);

  return {
    categories,
    metadata: {
      totalCategories: groups.length,
      totalProducts,
    },
  };
}

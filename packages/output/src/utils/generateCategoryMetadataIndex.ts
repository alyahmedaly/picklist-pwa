import type { CategoryDirectoryGroup, CategoryMetadataIndex, CategoryTreeNode } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'path';
import { formatDisplayName } from './formatDisplayName.ts';
import { countCategoriesInTree } from './countCategoriesInTree.ts';

/**
 * Generates comprehensive category metadata index with hierarchical linking.
 * Creates a complete tree structure with navigation links at every level.
 *
 * @param groups - Category directory groups
 * @param baseCategoryDir - Base category directory path
 * @returns Category metadata index with complete linking
 */


export function generateCategoryMetadataIndex(
  groups: CategoryDirectoryGroup[],
  baseCategoryDir: string
): CategoryMetadataIndex {
  // Build hierarchical tree structure
  const rootCategories = new Map<string, CategoryTreeNode>();

  for (const group of groups) {
    const pathParts = group.directoryPath.split('/').filter(p => p.length > 0);
    let currentLevel = rootCategories;
    let currentPath = '';

    // Build the tree path by path
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!currentLevel.has(part)) {
        const categoryPathParts = group.breadcrumbs.split(' > ');
        const categoryName = categoryPathParts[i] || formatDisplayName(part);

        currentLevel.set(part, {
          name: categoryName,
          path: currentPath,
          indexPath: `${currentPath}/index.json`,
          productCount: 0,
          directProductCount: 0,
          subcategories: [],
          files: [],
          metadata: {
            depth: i + 1,
            hasSubcategories: false,
            averageProtein: 0,
            halalCompliance: 0,
          },
        });
      }

      const node = currentLevel.get(part)!;

      // If this is the final level, add the file
      if (i === pathParts.length - 1) {
        node.files.push({
          name: group.fileName,
          displayName: formatDisplayName(group.fileName),
          filePath: `${group.fullPath}.jsonl`,
          indexPath: `${group.fullPath}-index.json`,
          statsPath: `${group.fullPath}-stats.json`,
          productCount: group.productCount,
        });
        node.directProductCount += group.productCount;

        // Update protein and halal averages
        const avgProtein = group.products.reduce((sum, p) => sum + (p.nutrition?.protein || 0), 0) / group.products.length;
        const halalCount = group.products.filter(p => p.halalCheck?.status === 'halal').length;
        const halalCompliance = (halalCount / group.products.length) * 100;

        node.metadata.averageProtein = Math.round(avgProtein * 10) / 10;
        node.metadata.halalCompliance = Math.round(halalCompliance);
      }

      // Update product count for all parent levels
      node.productCount += group.productCount;

      // Move to next level (subcategories)
      if (i < pathParts.length - 1) {
        node.metadata.hasSubcategories = true;

        // Get subcategories map for next iteration
        const subcatMap = new Map<string, CategoryTreeNode>();
        for (const subcat of node.subcategories) {
          subcatMap.set(subcat.path.split('/').pop()!, subcat);
        }
        currentLevel = subcatMap;
      }
    }
  }

  // Convert Map structure back to arrays and sort
  function processNode(node: CategoryTreeNode): CategoryTreeNode {
    // Sort subcategories by product count (descending)
    node.subcategories.sort((a, b) => b.productCount - a.productCount);

    // Sort files by product count (descending)
    node.files.sort((a, b) => b.productCount - a.productCount);

    // Process all subcategories recursively
    node.subcategories = node.subcategories.map(processNode);

    return node;
  }

  const categoryTree = Array.from(rootCategories.values())
    .map(processNode)
    .sort((a, b) => b.productCount - a.productCount);

  // Calculate metadata
  const totalFiles = groups.length;
  const totalProducts = groups.reduce((sum, g) => sum + g.productCount, 0);
  const maxDepth = Math.max(...groups.map(g => g.directoryPath.split('/').filter(p => p.length > 0).length));
  const totalCategories = countCategoriesInTree(categoryTree);

  const metadataIndex: CategoryMetadataIndex = {
    categoryTree,
    metadata: {
      totalCategories,
      totalFiles,
      totalProducts,
      maxDepth,
      version: '1.0.0',
    },
  };

  // Write the metadata index file
  const metadataPath = path.join(baseCategoryDir, 'categories.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadataIndex, null, 2));

  return metadataIndex;
}

import type { CategoryTreeNode } from '@picklist/types';

/**
 * Recursively counts total categories in a tree structure.
 *
 * @param tree - Array of category tree nodes
 * @returns Total number of categories
 */


export function countCategoriesInTree(tree: CategoryTreeNode[]): number {
  let count = tree.length;
  for (const node of tree) {
    count += countCategoriesInTree(node.subcategories);
  }
  return count;
}

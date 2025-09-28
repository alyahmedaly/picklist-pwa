/**
 * Category Tree Utilities
 *
 * Functions to build hierarchical category trees from product data
 * Following constitutional principles: deterministic, performance-optimized
 */

import type {
  CategoryNode,
  FlatCategory,
  CategoryTreeStats,
  CategoryTreeBuilderOptions,
  ProductCategoryData,
  CategoryTreeSort,
} from '../types/category-tree';

/**
 * Build category tree from product data
 * Deterministic output with stable sorting
 */
export function buildCategoryTree(
  products: ProductCategoryData[],
  options: CategoryTreeBuilderOptions = {
    includeEmptyCategories: true,
    sortByProductCount: true,
    maxDepth: undefined,
    minProductCount: 0,
  }
): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();
  const productCounts = new Map<string, number>();

  // First pass: count products per category path
  for (const product of products) {
    const { tree } = product.categoryTree;

    // Count products for each level of the tree
    for (let i = 0; i < tree.length; i++) {
      const path = tree.slice(0, i + 1);
      const pathKey = path.join(' > ');
      productCounts.set(pathKey, (productCounts.get(pathKey) || 0) + 1);
    }
  }

  // Second pass: build category nodes
  for (const product of products) {
    const { tree, depth } = product.categoryTree;

    if (options.maxDepth && depth > options.maxDepth) continue;

    for (let i = 0; i < tree.length; i++) {
      const path = tree.slice(0, i + 1);
      const pathKey = path.join(' > ');
      const productCount = productCounts.get(pathKey) || 0;

      if (productCount < (options.minProductCount || 0)) continue;

      if (!categoryMap.has(pathKey)) {
        const node: CategoryNode = {
          name: tree[i],
          path: [...path],
          breadcrumbs: path.join(' > '),
          depth: i + 1,
          productCount,
          children: [],
          isExpanded: false,
          isSelected: false,
          isVisible: true,
        };

        categoryMap.set(pathKey, node);
      }
    }
  }

  // Third pass: build parent-child relationships
  const rootNodes: CategoryNode[] = [];

  for (const [, node] of categoryMap) {
    if (node.depth === 1) {
      rootNodes.push(node);
    } else {
      const parentPath = node.path.slice(0, -1).join(' > ');
      const parent = categoryMap.get(parentPath);
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
      }
    }
  }

  // Sort children recursively
  const sortNodes = (nodes: CategoryNode[]): CategoryNode[] => {
    return nodes
      .sort((a, b) => {
        if (options.sortByProductCount) {
          return b.productCount - a.productCount || a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
      })
      .map(node => ({
        ...node,
        children: sortNodes(node.children),
      }));
  };

  return sortNodes(rootNodes);
}

/**
 * Flatten category tree for search and list view
 */
export function flattenCategoryTree(categories: CategoryNode[]): FlatCategory[] {
  const flattened: FlatCategory[] = [];

  const traverse = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      flattened.push({
        name: node.name,
        fullPath: node.breadcrumbs,
        breadcrumbs: node.breadcrumbs,
        depth: node.depth,
        productCount: node.productCount,
        hasChildren: node.children.length > 0,
        parentPath: node.parent?.breadcrumbs,
      });

      if (node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(categories);
  return flattened;
}

/**
 * Filter categories by search query
 */
export function filterCategories(
  categories: CategoryNode[],
  query: string
): CategoryNode[] {
  if (!query.trim()) return categories;

  const normalizedQuery = query.toLowerCase().trim();
  const filtered: CategoryNode[] = [];

  const matchesQuery = (node: CategoryNode): boolean => {
    return (
      node.name.toLowerCase().includes(normalizedQuery) ||
      node.breadcrumbs.toLowerCase().includes(normalizedQuery)
    );
  };

  const filterNode = (node: CategoryNode): CategoryNode | null => {
    const directMatch = matchesQuery(node);
    const filteredChildren = node.children
      .map(child => filterNode(child))
      .filter((child): child is CategoryNode => child !== null);

    // Include node if it matches or has matching children
    if (directMatch || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
        isExpanded: filteredChildren.length > 0, // Auto-expand if has matching children
      };
    }

    return null;
  };

  for (const category of categories) {
    const filteredCategory = filterNode(category);
    if (filteredCategory) {
      filtered.push(filteredCategory);
    }
  }

  return filtered;
}

/**
 * Sort categories by specified criteria
 */
export function sortCategories(
  categories: CategoryNode[],
  sortBy: CategoryTreeSort
): CategoryNode[] {
  const sortNode = (nodes: CategoryNode[]): CategoryNode[] => {
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
        case 'depth-asc':
          return a.depth - b.depth || a.name.localeCompare(b.name);
        case 'depth-desc':
          return b.depth - a.depth || a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted.map(node => ({
      ...node,
      children: sortNode(node.children),
    }));
  };

  return sortNode(categories);
}

/**
 * Calculate category tree statistics
 */
export function calculateCategoryStats(categories: CategoryNode[]): CategoryTreeStats {
  let totalCategories = 0;
  let maxDepth = 0;
  let totalDepth = 0;
  let categoriesWithProducts = 0;
  let totalProducts = 0;
  let mostPopularCategory = { name: '', productCount: 0 };

  const traverse = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      totalCategories++;
      maxDepth = Math.max(maxDepth, node.depth);
      totalDepth += node.depth;

      if (node.productCount > 0) {
        categoriesWithProducts++;
        totalProducts += node.productCount;
      }

      if (node.productCount > mostPopularCategory.productCount) {
        mostPopularCategory = {
          name: node.name,
          productCount: node.productCount,
        };
      }

      if (node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(categories);

  return {
    totalCategories,
    maxDepth,
    averageDepth: totalCategories > 0 ? totalDepth / totalCategories : 0,
    categoriesWithProducts,
    totalProducts,
    mostPopularCategory,
  };
}

/**
 * Find category by path
 */
export function findCategoryByPath(
  categories: CategoryNode[],
  path: string[]
): CategoryNode | null {
  const traverse = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const node of nodes) {
      if (node.path.join(' > ') === path.join(' > ')) {
        return node;
      }

      if (node.children.length > 0) {
        const found = traverse(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  return traverse(categories);
}

/**
 * Get all parent categories for a given category
 */
export function getCategoryAncestors(category: CategoryNode): CategoryNode[] {
  const ancestors: CategoryNode[] = [];
  let current = category.parent;

  while (current) {
    ancestors.unshift(current);
    current = current.parent;
  }

  return ancestors;
}

/**
 * Toggle node expansion state
 */
export function toggleNodeExpansion(
  categories: CategoryNode[],
  targetPath: string[]
): CategoryNode[] {
  const toggleNode = (nodes: CategoryNode[]): CategoryNode[] => {
    return nodes.map(node => {
      if (node.path.join(' > ') === targetPath.join(' > ')) {
        return {
          ...node,
          isExpanded: !node.isExpanded,
        };
      }

      return {
        ...node,
        children: toggleNode(node.children),
      };
    });
  };

  return toggleNode(categories);
}

/**
 * Expand all nodes up to a certain depth
 */
export function expandToDepth(
  categories: CategoryNode[],
  maxDepth: number
): CategoryNode[] {
  const expandNode = (nodes: CategoryNode[]): CategoryNode[] => {
    return nodes.map(node => ({
      ...node,
      isExpanded: node.depth <= maxDepth && node.children.length > 0,
      children: expandNode(node.children),
    }));
  };

  return expandNode(categories);
}
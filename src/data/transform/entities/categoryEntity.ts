/**
 * Category Entity Implementation
 * Feature: 019-flexible-database-schema
 *
 * Handles hierarchical category structure with nested set model,
 * category path generation, and hierarchy maintenance.
 */

import type { FlexibleCategory, FlexibleProductCategory } from '../types';

/**
 * Normalizes category strings to hierarchical category entities
 */
export function normalizeCategoryEntities(categories: string[]): {
  categories: FlexibleCategory[];
  productCategories: FlexibleProductCategory[];
} {
  const categoryMap = new Map<string, FlexibleCategory>();
  const categoryList: FlexibleCategory[] = [];
  let currentBound = 1;

  // Build category hierarchy from paths
  const uniqueCategories = [...new Set(categories)];

  for (const categoryPath of uniqueCategories) {
    const pathParts = categoryPath.split(/[/>]/).map(part => part.trim()).filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < pathParts.length; i++) {
      const categoryName = pathParts[i];
      const parentPath = i > 0 ? pathParts.slice(0, i).join('/') : '';
      currentPath = i === 0 ? categoryName : `${currentPath}/${categoryName}`;

      if (!categoryMap.has(currentPath)) {
        const category: FlexibleCategory = {
          id: generateCategoryId(currentPath),
          name: categoryName,
          parent_id: parentPath ? categoryMap.get(parentPath)?.id : undefined,
          path: currentPath,
          depth: i,
          left_bound: currentBound++,
          right_bound: currentBound++, // Will be updated later
          product_count: 0,
          display_order: categoryMap.size
        };

        categoryMap.set(currentPath, category);
        categoryList.push(category);
      }
    }
  }

  // Calculate proper nested set bounds
  calculateNestedSetBounds(categoryList);

  return {
    categories: categoryList,
    productCategories: [] // Will be generated separately per product
  };
}

/**
 * Generates product-category relationships for a product
 */
export function generateProductCategoryRelations(
  productId: string,
  categories: string[]
): FlexibleProductCategory[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  const relations: FlexibleProductCategory[] = [];

  for (let i = 0; i < categories.length; i++) {
    const categoryPath = categories[i];
    const isPrimary = i === 0; // First category is primary
    const relevanceScore = isPrimary ? 100 : Math.max(50, 100 - (i * 10));

    relations.push({
      product_id: productId,
      category_id: generateCategoryId(categoryPath),
      is_primary: isPrimary,
      relevance_score: relevanceScore
    });
  }

  return relations;
}

/**
 * Calculates nested set model bounds for hierarchical queries
 */
function calculateNestedSetBounds(categories: FlexibleCategory[]): void {
  // Sort categories by depth and path for proper traversal
  categories.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.path.localeCompare(b.path);
  });

  let currentBound = 1;
  const boundStack: number[] = [];

  for (const category of categories) {
    category.left_bound = currentBound++;

    // Find children
    const children = categories.filter(c => c.parent_id === category.id);

    if (children.length === 0) {
      // Leaf node
      category.right_bound = currentBound++;
    } else {
      // Parent node - right bound will be set after processing children
      boundStack.push(category.left_bound);
    }
  }

  // Second pass to set right bounds for parent categories
  const categoryById = new Map(categories.map(c => [c.id, c]));

  for (const category of categories.reverse()) {
    if (category.right_bound === category.left_bound + 1) {
      // Already set for leaf nodes
      continue;
    }

    const children = categories.filter(c => c.parent_id === category.id);
    if (children.length > 0) {
      const maxChildRightBound = Math.max(...children.map(c => c.right_bound));
      category.right_bound = maxChildRightBound + 1;
    }
  }
}

/**
 * Generates a consistent category ID from path
 */
function generateCategoryId(path: string): string {
  return path
    .toLowerCase()
    .replace(/[^a-z0-9\/]/g, '-')
    .replace(/\/+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validates category entity against business rules
 */
export function validateCategoryEntity(category: FlexibleCategory): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!category.id || category.id.trim() === '') {
    errors.push('Category ID is required');
  }

  if (!category.name || category.name.trim() === '') {
    errors.push('Category name is required');
  }

  if (category.name && category.name.length > 100) {
    errors.push('Category name must be 100 characters or less');
  }

  if (!category.path || category.path.trim() === '') {
    errors.push('Category path is required');
  }

  if (category.path && category.path.length > 500) {
    errors.push('Category path must be 500 characters or less');
  }

  // Depth validation
  if (category.depth < 0) {
    errors.push('Category depth must be 0 or greater');
  }

  if (category.depth > 6) {
    errors.push('Category depth must be 6 or less');
  }

  // Nested set validation
  if (category.left_bound <= 0) {
    errors.push('Left bound must be greater than 0');
  }

  if (category.right_bound <= category.left_bound) {
    errors.push('Right bound must be greater than left bound');
  }

  // Product count validation
  if (category.product_count < 0) {
    errors.push('Product count must be 0 or greater');
  }

  // Display order validation
  if (category.display_order < 0) {
    errors.push('Display order must be 0 or greater');
  }

  return errors;
}

/**
 * Validates product-category relationship
 */
export function validateProductCategoryRelation(relation: FlexibleProductCategory): string[] {
  const errors: string[] = [];

  if (!relation.product_id || relation.product_id.trim() === '') {
    errors.push('Product ID is required');
  }

  if (!relation.category_id || relation.category_id.trim() === '') {
    errors.push('Category ID is required');
  }

  if (typeof relation.is_primary !== 'boolean') {
    errors.push('is_primary must be a boolean');
  }

  if (relation.relevance_score < 0 || relation.relevance_score > 100) {
    errors.push('Relevance score must be between 0 and 100');
  }

  return errors;
}

/**
 * Gets category ancestors (breadcrumb path)
 */
export function getCategoryAncestors(
  categoryId: string,
  allCategories: FlexibleCategory[]
): FlexibleCategory[] {
  const categoryMap = new Map(allCategories.map(c => [c.id, c]));
  const category = categoryMap.get(categoryId);

  if (!category) {
    return [];
  }

  const ancestors: FlexibleCategory[] = [];
  let currentCategory: FlexibleCategory | undefined = category;

  while (currentCategory && currentCategory.parent_id) {
    const parent = categoryMap.get(currentCategory.parent_id);
    if (parent) {
      ancestors.unshift(parent);
      currentCategory = parent;
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * Gets category descendants using nested set model
 */
export function getCategoryDescendants(
  categoryId: string,
  allCategories: FlexibleCategory[]
): FlexibleCategory[] {
  const category = allCategories.find(c => c.id === categoryId);

  if (!category) {
    return [];
  }

  return allCategories.filter(c =>
    c.left_bound > category.left_bound &&
    c.right_bound < category.right_bound
  ).sort((a, b) => a.left_bound - b.left_bound);
}

/**
 * Updates product counts for categories
 */
export function updateCategoryProductCounts(
  categories: FlexibleCategory[],
  productCategories: FlexibleProductCategory[]
): FlexibleCategory[] {
  const productCountMap = new Map<string, number>();

  // Count direct product assignments
  for (const pc of productCategories) {
    productCountMap.set(pc.category_id, (productCountMap.get(pc.category_id) || 0) + 1);
  }

  // Update categories with counts
  return categories.map(category => ({
    ...category,
    product_count: productCountMap.get(category.id) || 0
  }));
}

/**
 * Creates a test category entity
 */
export function createTestCategoryEntity(overrides: Partial<FlexibleCategory> = {}): FlexibleCategory {
  const defaultCategory: FlexibleCategory = {
    id: 'test-category-001',
    name: 'Test Category',
    path: 'test-category',
    depth: 0,
    left_bound: 1,
    right_bound: 2,
    product_count: 0,
    display_order: 0
  };

  return { ...defaultCategory, ...overrides };
}
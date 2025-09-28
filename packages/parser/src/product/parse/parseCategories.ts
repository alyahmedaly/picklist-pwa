import type { CSVRow } from '../../types.ts';
import type { CategoryTree } from '@picklist/types';

export function parseCategories(csvRow: CSVRow): string[] {
  const categories: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const key = `Category${i}` as keyof CSVRow;
    const val = csvRow[key];
    if (val && val !== 'NA') categories.push(val);
  }
  return categories;
}

/**
 * Creates hierarchical category structure from flat array of categories
 * @param categories - Flat array of category strings
 * @returns CategoryTree with tree, primary, breadcrumbs, depth
 */
export function buildCategoryTree(categories: string[]): CategoryTree {
  // Handle empty/null arrays gracefully
  if (!categories || categories.length === 0) {
    return {
      tree: [],
      primary: '',
      breadcrumbs: '',
      depth: 0,
    };
  }

  // Filter out any empty/null categories
  const cleanCategories = categories.filter((cat) => cat && cat.trim());

  return {
    tree: cleanCategories,
    primary: cleanCategories[0] || '',
    breadcrumbs: cleanCategories.join(' > '),
    depth: cleanCategories.length,
  };
}

/**
 * Get the primary category for scoring calculations
 * Consistent with existing dual scoring categorization
 */
export function getPrimaryCategory(categories?: string[]): string | undefined {
  if (!categories || categories.length === 0) {
    return undefined;
  }

  // Use the first category as primary, matching existing dual scoring logic
  return categories[0];
}

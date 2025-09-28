/**
 * Filter Category Loader
 *
 * Utilities for loading and managing Ali's 6 filter categories with coverage statistics
 */

import type { FilterCategory, DataLoadResult } from '../../types/homepage';

// Ali's 6 filter categories configuration
const FILTER_CATEGORIES: Omit<FilterCategory, 'coverage'>[] = [
  {
    id: 'daily-protein',
    name: 'Daily Protein',
    description: 'High-protein foods for daily nutrition goals',
    dataFile: '/filtered-ali-daily-protein.jsonl',
    targetProtein: 150,
    context: 'daily',
    isActive: true
  },
  {
    id: 'post-workout',
    name: 'Post-Workout',
    description: 'Fast carbs + protein for recovery',
    dataFile: '/filtered-ali-post-workout.jsonl',
    targetProtein: 30,
    context: 'post-workout'
  },
  {
    id: 'cutting',
    name: 'Cutting',
    description: 'High satiety, low calorie density foods',
    dataFile: '/filtered-ali-cutting.jsonl',
    context: 'fat-loss'
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'Cost-effective protein sources',
    dataFile: '/filtered-ali-budget.jsonl',
    context: 'budget'
  },
  {
    id: 'training-day',
    name: 'Training Day',
    description: 'Carb-enhanced foods for training days',
    dataFile: '/filtered-ali-training-day.jsonl',
    context: 'training'
  },
  {
    id: 'rest-day',
    name: 'Rest Day',
    description: 'Lower carb options for rest days',
    dataFile: '/filtered-ali-rest-day.jsonl',
    context: 'rest'
  }
];

// Cache for loaded category statistics
let categoryStatsCache: Map<string, number> | null = null;

/**
 * Load all available filter categories with coverage statistics
 */
export async function loadAllCategories(): Promise<FilterCategory[]> {
  try {
    // Load coverage statistics if not cached
    if (!categoryStatsCache) {
      categoryStatsCache = await loadCoverageStatistics();
    }

    // Combine configuration with coverage data
    const categories: FilterCategory[] = FILTER_CATEGORIES.map(category => ({
      ...category,
      coverage: categoryStatsCache?.get(category.id) || 0
    }));

    return categories;
  } catch (error) {
    console.error('Failed to load filter categories:', error);

    // Return categories with zero coverage as fallback
    return FILTER_CATEGORIES.map(category => ({
      ...category,
      coverage: 0
    }));
  }
}

/**
 * Get the default active filter category
 */
export function getDefaultCategory(): FilterCategory {
  const defaultCategory = FILTER_CATEGORIES[0]; // Daily Protein
  return {
    ...defaultCategory,
    coverage: categoryStatsCache?.get(defaultCategory.id) || 0
  };
}

/**
 * Load coverage statistics from stats files
 */
async function loadCoverageStatistics(): Promise<Map<string, number>> {
  const statsMap = new Map<string, number>();

  for (const category of FILTER_CATEGORIES) {
    try {
      // Try to load category-specific stats file
      const statsFile = category.dataFile.replace('.jsonl', '-stats.json');
      const response = await fetch(statsFile);

      if (response.ok) {
        const stats = await response.json();
        statsMap.set(category.id, stats.totalRows || stats.productCount || 0);
      } else {
        // Fallback: try to count products from the actual data file
        const count = await countProductsInFile(category.dataFile);
        statsMap.set(category.id, count);
      }
    } catch (error) {
      console.warn(`Failed to load stats for ${category.id}:`, error);
      statsMap.set(category.id, 0);
    }
  }

  return statsMap;
}

/**
 * Count products in a JSONL file by fetching and parsing
 */
async function countProductsInFile(dataFile: string): Promise<number> {
  try {
    const response = await fetch(dataFile);
    if (!response.ok) return 0;

    const text = await response.text();
    const lines = text.trim().split('\n').filter(line => line.trim());
    return lines.length;
  } catch (error) {
    console.warn(`Failed to count products in ${dataFile}:`, error);
    return 0;
  }
}

/**
 * Find a category by ID
 */
export function findCategoryById(categoryId: string): FilterCategory | null {
  const config = FILTER_CATEGORIES.find(cat => cat.id === categoryId);
  if (!config) return null;

  return {
    ...config,
    coverage: categoryStatsCache?.get(categoryId) || 0
  };
}

/**
 * Check if a data file exists for a category
 */
export async function validateCategoryDataFile(category: FilterCategory): Promise<boolean> {
  try {
    const response = await fetch(category.dataFile, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Load products for a specific category
 */
export async function loadProductsForCategory(categoryId: string): Promise<DataLoadResult> {
  const startTime = Date.now();
  const category = findCategoryById(categoryId);

  if (!category) {
    throw new Error(`Category not found: ${categoryId}`);
  }

  try {
    // Check if data file exists
    const isValid = await validateCategoryDataFile(category);
    if (!isValid) {
      throw new Error(`Data file not found: ${category.dataFile}`);
    }

    // Load products from JSONL file
    const response = await fetch(category.dataFile);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category.dataFile}: ${response.statusText}`);
    }

    const text = await response.text();
    const products = text
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.warn('Failed to parse product line:', line);
          return null;
        }
      })
      .filter(product => product !== null);

    const loadTime = Date.now() - startTime;

    return {
      products,
      category,
      loadTime,
      fromCache: false
    };
  } catch (error) {
    console.error(`Failed to load products for ${categoryId}:`, error);
    throw error;
  }
}

/**
 * Preload adjacent categories for better UX
 */
export function getAdjacentCategories(currentCategoryId: string): string[] {
  const currentIndex = FILTER_CATEGORIES.findIndex(cat => cat.id === currentCategoryId);
  if (currentIndex === -1) return [];

  const adjacent: string[] = [];

  // Add previous category
  if (currentIndex > 0) {
    adjacent.push(FILTER_CATEGORIES[currentIndex - 1].id);
  }

  // Add next category
  if (currentIndex < FILTER_CATEGORIES.length - 1) {
    adjacent.push(FILTER_CATEGORIES[currentIndex + 1].id);
  }

  return adjacent;
}

/**
 * Clear the coverage statistics cache
 */
export function clearCoverageCache(): void {
  categoryStatsCache = null;
}
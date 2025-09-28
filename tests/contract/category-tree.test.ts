/**
 * Category Tree Contract Tests
 *
 * Validates category tree generation and output structure
 * Tests both hierarchical tree structure and flat category list
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { CategoryNode, CategoryTreeStats } from '../../src/types/category-tree';

// Test data directory
const TEST_OUT_DIR = 'tests/fixtures/integration-output';
const CATEGORY_TREE_PATH = join(TEST_OUT_DIR, 'category-tree.json');

// Minimal product data for testing
const SAMPLE_PRODUCTS = [
  {
    id: '73',
    name: 'AH Franse baguettes',
    categoryTree: {
      tree: ['Bakkerij', 'Afbakbrood', 'Stokbrood en ciabatta'],
      primary: 'Bakkerij',
      breadcrumbs: 'Bakkerij > Afbakbrood > Stokbrood en ciabatta',
      depth: 3
    }
  },
  {
    id: '103',
    name: 'Lea & Perrins Worcestershire saus',
    categoryTree: {
      tree: ['Soepen, sauzen, kruiden, olie', 'Kruiden, smaakmakers, garnering', 'Smaakmakers', 'Tafelsauzen, toevoegingen', 'Worcester sauce'],
      primary: 'Soepen, sauzen, kruiden, olie',
      breadcrumbs: 'Soepen, sauzen, kruiden, olie > Kruiden, smaakmakers, garnering > Smaakmakers > Tafelsauzen, toevoegingen > Worcester sauce',
      depth: 5
    }
  },
  {
    id: '107',
    name: 'AH Aardappelballetjes',
    categoryTree: {
      tree: ['Diepvries', 'Diepvries aardappelproducten', 'Aardappelballetjes'],
      primary: 'Diepvries',
      breadcrumbs: 'Diepvries > Diepvries aardappelproducten > Aardappelballetjes',
      depth: 3
    }
  }
];

interface CategoryTreeOutput {
  metadata: {
    generatedAt: string;
    totalProducts: number;
    totalCategories: number;
    maxDepth: number;
    averageDepth: number;
    categoriesWithProducts: number;
    mostPopularCategory: {
      name: string;
      productCount: number;
    };
  };
  categoryTree: CategoryNode[];
  flatCategories: Array<{
    name: string;
    fullPath: string;
    breadcrumbs: string;
    depth: number;
    productCount: number;
    hasChildren: boolean;
    parentPath?: string;
  }>;
  stats: CategoryTreeStats;
}

describe('Category Tree Generation', () => {
  it('should generate valid category tree structure', () => {
    // This test assumes category tree has been generated during integration tests
    // If not generated, skip the test
    if (!existsSync(CATEGORY_TREE_PATH)) {
      console.warn('Category tree file not found, skipping test. Run transform with --generate-category-tree');
      return;
    }

    const content = readFileSync(CATEGORY_TREE_PATH, 'utf8');
    const categoryData: CategoryTreeOutput = JSON.parse(content);

    // Validate top-level structure
    expect(categoryData).toHaveProperty('metadata');
    expect(categoryData).toHaveProperty('categoryTree');
    expect(categoryData).toHaveProperty('flatCategories');
    expect(categoryData).toHaveProperty('stats');

    // Validate metadata
    expect(categoryData.metadata).toHaveProperty('generatedAt');
    expect(categoryData.metadata).toHaveProperty('totalProducts');
    expect(categoryData.metadata).toHaveProperty('totalCategories');
    expect(categoryData.metadata).toHaveProperty('maxDepth');
    expect(categoryData.metadata).toHaveProperty('averageDepth');

    expect(categoryData.metadata.totalProducts).toBeGreaterThan(0);
    expect(categoryData.metadata.totalCategories).toBeGreaterThan(0);
    expect(categoryData.metadata.maxDepth).toBeGreaterThan(0);
    expect(categoryData.metadata.averageDepth).toBeGreaterThan(0);

    // Validate ISO timestamp
    expect(() => new Date(categoryData.metadata.generatedAt)).not.toThrow();
  });

  it('should have valid hierarchical category tree structure', () => {
    if (!existsSync(CATEGORY_TREE_PATH)) {
      console.warn('Category tree file not found, skipping test');
      return;
    }

    const content = readFileSync(CATEGORY_TREE_PATH, 'utf8');
    const categoryData: CategoryTreeOutput = JSON.parse(content);

    expect(Array.isArray(categoryData.categoryTree)).toBe(true);
    expect(categoryData.categoryTree.length).toBeGreaterThan(0);

    // Validate each root category node
    for (const rootNode of categoryData.categoryTree) {
      expect(rootNode).toHaveProperty('name');
      expect(rootNode).toHaveProperty('path');
      expect(rootNode).toHaveProperty('breadcrumbs');
      expect(rootNode).toHaveProperty('depth');
      expect(rootNode).toHaveProperty('productCount');
      expect(rootNode).toHaveProperty('children');
      expect(rootNode).toHaveProperty('isExpanded');
      expect(rootNode).toHaveProperty('isSelected');
      expect(rootNode).toHaveProperty('isVisible');

      expect(typeof rootNode.name).toBe('string');
      expect(Array.isArray(rootNode.path)).toBe(true);
      expect(typeof rootNode.breadcrumbs).toBe('string');
      expect(typeof rootNode.depth).toBe('number');
      expect(typeof rootNode.productCount).toBe('number');
      expect(Array.isArray(rootNode.children)).toBe(true);

      expect(rootNode.depth).toBe(1); // Root nodes should have depth 1
      expect(rootNode.productCount).toBeGreaterThan(0); // Should have products
      expect(rootNode.path).toEqual([rootNode.name]); // Root path should be just the name
      expect(rootNode.breadcrumbs).toBe(rootNode.name); // Root breadcrumbs should be just the name
    }
  });

  it('should have valid flat categories list', () => {
    if (!existsSync(CATEGORY_TREE_PATH)) {
      console.warn('Category tree file not found, skipping test');
      return;
    }

    const content = readFileSync(CATEGORY_TREE_PATH, 'utf8');
    const categoryData: CategoryTreeOutput = JSON.parse(content);

    expect(Array.isArray(categoryData.flatCategories)).toBe(true);
    expect(categoryData.flatCategories.length).toBeGreaterThan(0);

    // Validate each flat category
    for (const flatCategory of categoryData.flatCategories) {
      expect(flatCategory).toHaveProperty('name');
      expect(flatCategory).toHaveProperty('fullPath');
      expect(flatCategory).toHaveProperty('breadcrumbs');
      expect(flatCategory).toHaveProperty('depth');
      expect(flatCategory).toHaveProperty('productCount');
      expect(flatCategory).toHaveProperty('hasChildren');

      expect(typeof flatCategory.name).toBe('string');
      expect(typeof flatCategory.fullPath).toBe('string');
      expect(typeof flatCategory.breadcrumbs).toBe('string');
      expect(typeof flatCategory.depth).toBe('number');
      expect(typeof flatCategory.productCount).toBe('number');
      expect(typeof flatCategory.hasChildren).toBe('boolean');

      expect(flatCategory.depth).toBeGreaterThan(0);
      expect(flatCategory.productCount).toBeGreaterThan(0);
      expect(flatCategory.fullPath).toBe(flatCategory.breadcrumbs); // Should be the same
    }
  });

  it('should have consistent statistics', () => {
    if (!existsSync(CATEGORY_TREE_PATH)) {
      console.warn('Category tree file not found, skipping test');
      return;
    }

    const content = readFileSync(CATEGORY_TREE_PATH, 'utf8');
    const categoryData: CategoryTreeOutput = JSON.parse(content);

    const stats = categoryData.stats;

    expect(stats).toHaveProperty('totalCategories');
    expect(stats).toHaveProperty('maxDepth');
    expect(stats).toHaveProperty('averageDepth');
    expect(stats).toHaveProperty('categoriesWithProducts');
    expect(stats).toHaveProperty('totalProducts');
    expect(stats).toHaveProperty('mostPopularCategory');

    // Stats should match metadata
    expect(stats.totalCategories).toBe(categoryData.metadata.totalCategories);
    expect(stats.maxDepth).toBe(categoryData.metadata.maxDepth);
    expect(stats.averageDepth).toBe(categoryData.metadata.averageDepth);

    // Validate most popular category
    expect(stats.mostPopularCategory).toHaveProperty('name');
    expect(stats.mostPopularCategory).toHaveProperty('productCount');
    expect(typeof stats.mostPopularCategory.name).toBe('string');
    expect(typeof stats.mostPopularCategory.productCount).toBe('number');
    expect(stats.mostPopularCategory.productCount).toBeGreaterThan(0);

    // Flat categories count should match total categories
    expect(categoryData.flatCategories.length).toBe(stats.totalCategories);
  });

  it('should handle Dutch categories correctly', () => {
    if (!existsSync(CATEGORY_TREE_PATH)) {
      console.warn('Category tree file not found, skipping test');
      return;
    }

    const content = readFileSync(CATEGORY_TREE_PATH, 'utf8');
    const categoryData: CategoryTreeOutput = JSON.parse(content);

    // Look for Dutch category names (common ones from sample data)
    const dutchCategories = [
      'Bakkerij',
      'Diepvries',
      'Soepen, sauzen, kruiden, olie',
      'Afbakbrood',
      'Aardappelproducten'
    ];

    const allCategoryNames = categoryData.flatCategories.map(c => c.name);

    // Should find at least some Dutch categories
    const foundDutchCategories = dutchCategories.filter(name =>
      allCategoryNames.includes(name)
    );

    expect(foundDutchCategories.length).toBeGreaterThan(0);
    console.log('Found Dutch categories:', foundDutchCategories);
  });

  it('should have proper parent-child relationships', () => {
    if (!existsSync(CATEGORY_TREE_PATH)) {
      console.warn('Category tree file not found, skipping test');
      return;
    }

    const content = readFileSync(CATEGORY_TREE_PATH, 'utf8');
    const categoryData: CategoryTreeOutput = JSON.parse(content);

    // Check that child categories have proper parent paths in flat structure
    const categoriesWithParents = categoryData.flatCategories.filter(c => c.parentPath);

    expect(categoriesWithParents.length).toBeGreaterThan(0);

    for (const childCategory of categoriesWithParents) {
      // Parent should exist in the flat categories
      const parent = categoryData.flatCategories.find(c =>
        c.breadcrumbs === childCategory.parentPath
      );
      expect(parent).toBeDefined();

      if (parent) {
        // Child depth should be parent depth + 1
        expect(childCategory.depth).toBe(parent.depth + 1);

        // Child breadcrumbs should start with parent breadcrumbs
        expect(childCategory.breadcrumbs.startsWith(parent.breadcrumbs)).toBe(true);
      }
    }
  });
});
/**
 * Output Structure Types for Picklist Pipeline
 *
 * Defines interfaces for organizing pipeline outputs into grouped directory structures.
 * Reuses existing types from @picklist/types for consistency and type safety.
 */

import type { FilterStatistics } from '../filter/FilterStatistics.ts';
import type { FilterCombination } from '../filter/FilterCombination.ts';
import type { Product } from '../product/product.ts';
import type { FilteredProduct } from '../filter/FilteredProduct.ts';

/**
 * Configuration for output generation with directory structure.
 */
export interface OutputConfig {
  outputDir: string;
  generateIndex: boolean;
  generateStats: boolean;
  format: 'standard' | 'ui';
}

/**
 * Output from a single filter operation with organized structure.
 * Reuses existing FilterStatistics type for consistency.
 */
export interface FilterOutput {
  filterName: string;
  products: FilteredProduct[];
  statistics: FilterStatistics;
  criteria: FilterCombination['criteria'];
}

/**
 * Configuration for category-based output with nested directory structure.
 */
export interface CategoryOutputConfig extends OutputConfig {
  subDirectory: string;
  minProductsPerCategory: number;
}

/**
 * Category product group with nested directory path information.
 * Uses CategoryTree.breadcrumbs for consistency with existing category system.
 */
export interface CategoryDirectoryGroup {
  categoryPath: string;
  breadcrumbs: string;           // From CategoryTree.breadcrumbs
  products: Product[];
  productCount: number;
  directoryPath: string;         // "aardappel-groente-fruit/aardappelen"
  fileName: string;              // "geschild"
  fullPath: string;              // "aardappel-groente-fruit/aardappelen/geschild"
}

/**
 * Directory-level index for navigating nested category structure.
 * Provides metadata about subdirectories and files within a directory with enhanced linking.
 */
export interface DirectoryIndex {
  categoryPath: string;
  breadcrumbs: string;
  subdirectories: Array<{
    name: string;
    displayName: string;               // Human-readable name
    productCount: number;
    hasSubdirectories: boolean;
    indexPath: string;                 // Direct link to subdirectory index
    averageProtein?: number;
    halalCompliance?: number;
  }>;
  files: Array<{
    name: string;
    displayName: string;               // Human-readable name
    productCount: number;
    filePath: string;                  // Direct link to .jsonl file
    indexPath: string;                 // Direct link to -index.json file
    statsPath: string;                 // Direct link to -stats.json file
    averageProtein?: number;
    halalCompliance?: number;
  }>;
  totalProducts: number;
  aggregatedFile?: {                   // Pre-generated aggregated file for "See All" functionality
    name: string;                      // "_all"
    filePath: string;                  // "_all.jsonl"
    productCount: number;              // Total products from all subcategories/files
    displayName: string;               // "All Products"
  };
  navigation: {                        // Enhanced navigation helpers
    parentPath?: string;               // Link to parent directory index
    rootPath: string;                  // Link to root category index
    breadcrumbLinks: Array<{           // Clickable breadcrumb navigation
      name: string;
      path: string;
    }>;
  };
  metadata: {
    depth: number;
    parentPath?: string;
  };
}

/**
 * Master filter index for discovering all available filter outputs.
 */
export interface FilterMasterIndex {
  filters: Array<{
    name: string;
    displayName: string;
    description: string;
    productCount: number;
    coveragePercentage: number;
    filePath: string;
    indexPath?: string;
    statsPath?: string;
  }>;
  metadata: {
    totalFilters: number;
    totalUniqueProducts: number;
    version: string;
  };
}

/**
 * Category path parsing result for nested directory generation.
 */
export interface CategoryPathInfo {
  directoryPath: string;         // Parent directories: "aardappel-groente-fruit/aardappelen"
  fileName: string;              // Final filename: "geschild"
  fullPath: string;              // Complete path: "aardappel-groente-fruit/aardappelen/geschild"
  depth: number;                 // Directory depth
  parts: string[];               // All path parts for traversal
}

/**
 * Enhanced category metadata index with comprehensive linking.
 * Provides hierarchical category tree with navigation links at every level.
 */
export interface CategoryMetadataIndex {
  categoryTree: CategoryTreeNode[];
  metadata: {
    totalCategories: number;
    totalFiles: number;
    totalProducts: number;
    maxDepth: number;
    version: string;
  };
}

/**
 * Hierarchical category tree node with complete linking information.
 */
export interface CategoryTreeNode {
  name: string;                  // Human-readable category name
  path: string;                  // URL-safe directory path
  indexPath: string;             // Direct link to directory index
  productCount: number;          // Total products in this category and subcategories
  directProductCount: number;    // Products directly in this category (files)
  subcategories: CategoryTreeNode[];
  files: Array<{                 // Direct product files in this category
    name: string;
    displayName: string;
    filePath: string;
    indexPath: string;
    statsPath: string;
    productCount: number;
  }>;
  metadata: {
    depth: number;
    hasSubcategories: boolean;
    averageProtein: number;
    halalCompliance: number;
  };
}


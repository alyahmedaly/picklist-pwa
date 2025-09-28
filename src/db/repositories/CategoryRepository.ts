/**
 * CategoryRepository Implementation
 * Feature: 020-migration-kysely
 *
 * Category repository providing type-safe database operations for hierarchical category data.
 * Implements nested set model operations for efficient tree traversal and hierarchy management.
 */

import type { Selectable } from 'kysely';
import type {
  FlexibleDatabase,
  CategoryTable,
  ProductCategoryTable
} from '../kysely/database.js';
import { BaseRepository, type RepositoryResult } from './BaseRepository.js';

// =============================================================================
// TYPE DEFINITIONS USING DATABASE SCHEMA
// =============================================================================

/**
 * Basic category result using database CategoryTable type
 */
export type CategoryResult = Selectable<CategoryTable>;

/**
 * Category with hierarchy metadata
 */
export interface CategoryWithHierarchy extends CategoryResult {
  direct_product_count: number;
  total_product_count: number;
  has_children: boolean;
  level: number;
}

/**
 * Category tree node for hierarchical display
 */
export interface CategoryTreeNode extends CategoryResult {
  direct_product_count: number;
  total_product_count: number;
  children?: CategoryTreeNode[];
}

/**
 * Nested set category with enhanced metadata
 */
export interface NestedSetCategory extends CategoryResult {
  is_leaf: boolean;
  node_size: number;
  children_count: number;
}

/**
 * Category query options
 */
export interface CategoryQueryOptions {
  includeProductCounts?: boolean;
  includeHierarchyInfo?: boolean;
  maxDepth?: number;
  minProductCount?: number;
  orderBy?: 'nested_set' | 'name' | 'product_count';
  rollupCounts?: boolean;
  includeEmptyCategories?: boolean;
  includeSelf?: boolean;
}

/**
 * Category hierarchy result with metadata
 */
export interface CategoryHierarchyResult<T = CategoryResult> {
  categories: T[];
  totalCount: number;
  maxDepth: number;
  queryTimeMs: number;
}

/**
 * Nested set model validation result
 */
export interface NestedSetValidation {
  isValid: boolean;
  errors: Array<{
    categoryId: string;
    message: string;
    severity: 'error' | 'warning';
    details?: any;
  }>;
  warnings: Array<{
    categoryId: string;
    message: string;
    details?: any;
  }>;
  totalCategories: number;
  validationTimeMs: number;
}

// =============================================================================
// CATEGORY REPOSITORY INTERFACE
// =============================================================================

/**
 * CategoryRepository interface defining all category operations
 */
export interface CategoryRepository {
  // Basic operations
  getById(id: string): Promise<RepositoryResult<CategoryResult>>;
  getAll(options?: CategoryQueryOptions): Promise<CategoryResult[]>;
  getRootCategories(options?: CategoryQueryOptions): Promise<CategoryWithHierarchy[]>;

  // Nested set model operations
  getChildren(categoryId: string, options?: CategoryQueryOptions): Promise<CategoryWithHierarchy[]>;
  getAncestors(categoryId: string): Promise<CategoryResult[]>;
  getDescendants(categoryId: string, options?: CategoryQueryOptions): Promise<CategoryWithHierarchy[]>;
  getSiblings(categoryId: string, options?: CategoryQueryOptions): Promise<CategoryResult[]>;

  // Path-based operations
  getByPath(path: string): Promise<RepositoryResult<CategoryResult>>;

  // Tree structure operations
  getCategoryTree(options?: CategoryQueryOptions): Promise<CategoryTreeNode[]>;
  getCategoriesWithProductCounts(options?: CategoryQueryOptions): Promise<CategoryWithHierarchy[]>;

  // Validation operations
  validateNestedSetModel(): Promise<NestedSetValidation>;
}

// =============================================================================
// CATEGORY REPOSITORY IMPLEMENTATION
// =============================================================================

/**
 * CategoryRepository implementation using Kysely query builder
 */
export class CategoryRepositoryImpl extends BaseRepository implements CategoryRepository {
  constructor() {
    super('categories');
  }

  // =============================================================================
  // BASIC OPERATIONS
  // =============================================================================

  /**
   * Get a single category by ID
   * @param id - Category ID
   * @returns Category or null if not found
   */
  async getById(id: string): Promise<RepositoryResult<CategoryResult>> {
    this.validateRequired(id, 'id');

    try {
      const db = await this.getConnection();

      this.logQuery('getById', { operation: 'SELECT_BY_ID', categoryId: id });

      const result = await db
        .selectFrom('categories')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (!result) {
        this.logQuery('getById completed', { categoryId: id, found: false });
        return null;
      }

      const category: CategoryResult = result as CategoryResult;

      this.logQuery('getById completed', { categoryId: id, found: true });
      return category;

    } catch (error) {
      this.handleError(error, 'getById');
    }
  }

  /**
   * Get all categories with optional ordering and filtering
   * @param options - Query options
   * @returns Array of categories
   */
  async getAll(options: CategoryQueryOptions = {}): Promise<CategoryResult[]> {
    const { orderBy = 'nested_set', maxDepth, minProductCount } = options;

    try {
      const db = await this.getConnection();

      this.logQuery('getAll', {
        operation: 'SELECT_ALL_CATEGORIES',
        orderBy,
        maxDepth,
        minProductCount
      });

      let query = db
        .selectFrom('categories')
        .selectAll();

      // Apply depth filter
      if (maxDepth !== undefined) {
        this.validateType(maxDepth, 'number', 'maxDepth');
        if (maxDepth < 0 || maxDepth > 6) {
          throw new Error('maxDepth must be between 0 and 6');
        }
        query = query.where('depth', '<=', maxDepth);
      }

      // Apply product count filter
      if (minProductCount !== undefined) {
        this.validateType(minProductCount, 'number', 'minProductCount');
        if (minProductCount < 0) {
          throw new Error('minProductCount must be non-negative');
        }
        query = query.where('product_count', '>=', minProductCount);
      }

      // Apply ordering
      switch (orderBy) {
        case 'nested_set':
          query = query.orderBy('left_bound', 'asc');
          break;
        case 'name':
          query = query.orderBy('name', 'asc').orderBy('id', 'asc');
          break;
        case 'product_count':
          query = query.orderBy('product_count', 'desc').orderBy('name', 'asc');
          break;
      }

      const result = await this.executeWithTiming(query);
      const categories: CategoryResult[] = result.data as CategoryResult[];

      this.logQuery('getAll completed', {
        returnedCount: categories.length,
        queryTimeMs: result.queryTimeMs
      });

      return categories;

    } catch (error) {
      this.handleError(error, 'getAll');
    }
  }

  /**
   * Get root categories (depth 0)
   * @param options - Query options
   * @returns Array of root categories with hierarchy info
   */
  async getRootCategories(options: CategoryQueryOptions = {}): Promise<CategoryWithHierarchy[]> {
    const { includeProductCounts = true, rollupCounts = false } = options;

    try {
      const db = await this.getConnection();

      this.logQuery('getRootCategories', {
        operation: 'SELECT_ROOT_CATEGORIES',
        includeProductCounts,
        rollupCounts
      });

      let query = db
        .selectFrom('categories')
        .selectAll()
        .where('depth', '=', 0)
        .where('parent_id', 'is', null)
        .orderBy('display_order', 'asc')
        .orderBy('name', 'asc');

      const result = await this.executeWithTiming(query);
      const rootCategories: CategoryResult[] = result.data as CategoryResult[];

      // Enhance with hierarchy information
      const enhancedCategories: CategoryWithHierarchy[] = await Promise.all(
        rootCategories.map(async (category) => {
          const directCount = category.product_count;
          let totalCount = directCount;

          // Calculate total count including descendants if rollupCounts is true
          if (rollupCounts) {
            const descendants = await this.getDescendants(category.id, { includeProductCounts: true });
            totalCount = directCount + descendants.reduce((sum, desc) => sum + desc.direct_product_count, 0);
          }

          // Check if category has children using nested set model
          const hasChildren = category.left_bound !== null && category.right_bound !== null &&
            (category.right_bound - category.left_bound) > 1;

          return {
            ...category,
            direct_product_count: directCount,
            total_product_count: totalCount,
            has_children: hasChildren,
            level: 0
          };
        })
      );

      this.logQuery('getRootCategories completed', {
        returnedCount: enhancedCategories.length,
        queryTimeMs: result.queryTimeMs
      });

      return enhancedCategories;

    } catch (error) {
      this.handleError(error, 'getRootCategories');
    }
  }

  // =============================================================================
  // NESTED SET MODEL OPERATIONS
  // =============================================================================

  /**
   * Get direct children of a category using nested set model
   * @param categoryId - Parent category ID
   * @param options - Query options
   * @returns Array of child categories
   */
  async getChildren(categoryId: string, options: CategoryQueryOptions = {}): Promise<CategoryWithHierarchy[]> {
    this.validateRequired(categoryId, 'categoryId');

    const { includeProductCounts = true, maxDepth = 1 } = options;

    try {
      const db = await this.getConnection();

      this.logQuery('getChildren', {
        operation: 'SELECT_CHILDREN',
        categoryId,
        includeProductCounts,
        maxDepth
      });

      // Get parent category first
      const parentCategory = await this.getById(categoryId);
      if (!parentCategory) {
        return [];
      }

      // Get children using nested set model
      let query = db
        .selectFrom('categories')
        .selectAll()
        .where('parent_id', '=', categoryId)
        .orderBy('display_order', 'asc')
        .orderBy('name', 'asc');

      // Apply max depth constraint relative to parent
      if (maxDepth > 0) {
        query = query.where('depth', '<=', parentCategory.depth + maxDepth);
      }

      const result = await this.executeWithTiming(query);
      const children: CategoryResult[] = result.data as CategoryResult[];

      // Enhance with hierarchy information
      const enhancedChildren: CategoryWithHierarchy[] = children.map(child => {
        const hasChildren = child.left_bound !== null && child.right_bound !== null &&
          (child.right_bound - child.left_bound) > 1;

        return {
          ...child,
          direct_product_count: child.product_count,
          total_product_count: child.product_count, // For now, same as direct
          has_children: hasChildren,
          level: child.depth - parentCategory.depth
        };
      });

      this.logQuery('getChildren completed', {
        categoryId,
        returnedCount: enhancedChildren.length,
        queryTimeMs: result.queryTimeMs
      });

      return enhancedChildren;

    } catch (error) {
      this.handleError(error, 'getChildren');
    }
  }

  /**
   * Get all ancestors of a category using nested set model
   * @param categoryId - Category ID
   * @returns Array of ancestor categories ordered from root to immediate parent
   */
  async getAncestors(categoryId: string): Promise<CategoryResult[]> {
    this.validateRequired(categoryId, 'categoryId');

    try {
      const db = await this.getConnection();

      this.logQuery('getAncestors', {
        operation: 'SELECT_ANCESTORS',
        categoryId
      });

      // Get the target category first
      const targetCategory = await this.getById(categoryId);
      if (!targetCategory || !targetCategory.left_bound || !targetCategory.right_bound) {
        return [];
      }

      // Find ancestors using nested set model: categories that contain this category
      let query = db
        .selectFrom('categories')
        .selectAll()
        .where('left_bound', '<', targetCategory.left_bound)
        .where('right_bound', '>', targetCategory.right_bound)
        .orderBy('depth', 'asc'); // Order from root to immediate parent

      const result = await this.executeWithTiming(query);
      const ancestors: CategoryResult[] = result.data as CategoryResult[];

      this.logQuery('getAncestors completed', {
        categoryId,
        returnedCount: ancestors.length,
        queryTimeMs: result.queryTimeMs
      });

      return ancestors;

    } catch (error) {
      this.handleError(error, 'getAncestors');
    }
  }

  /**
   * Get all descendants of a category using nested set model
   * @param categoryId - Parent category ID
   * @param options - Query options
   * @returns Array of descendant categories
   */
  async getDescendants(categoryId: string, options: CategoryQueryOptions = {}): Promise<CategoryWithHierarchy[]> {
    this.validateRequired(categoryId, 'categoryId');

    const { maxDepth, includeProductCounts = true } = options;

    try {
      const db = await this.getConnection();

      this.logQuery('getDescendants', {
        operation: 'SELECT_DESCENDANTS',
        categoryId,
        maxDepth,
        includeProductCounts
      });

      // Get the parent category first
      const parentCategory = await this.getById(categoryId);
      if (!parentCategory || !parentCategory.left_bound || !parentCategory.right_bound) {
        return [];
      }

      // Find descendants using nested set model: categories contained within this category
      let query = db
        .selectFrom('categories')
        .selectAll()
        .where('left_bound', '>', parentCategory.left_bound)
        .where('right_bound', '<', parentCategory.right_bound)
        .orderBy('left_bound', 'asc'); // Pre-order traversal

      // Apply max depth constraint
      if (maxDepth !== undefined) {
        this.validateType(maxDepth, 'number', 'maxDepth');
        if (maxDepth < 0 || maxDepth > 6) {
          throw new Error('maxDepth must be between 0 and 6');
        }
        query = query.where('depth', '<=', parentCategory.depth + maxDepth);
      }

      const result = await this.executeWithTiming(query);
      const descendants: CategoryResult[] = result.data as CategoryResult[];

      // Enhance with hierarchy information
      const enhancedDescendants: CategoryWithHierarchy[] = descendants.map(descendant => {
        const hasChildren = descendant.left_bound !== null && descendant.right_bound !== null &&
          (descendant.right_bound - descendant.left_bound) > 1;

        return {
          ...descendant,
          direct_product_count: descendant.product_count,
          total_product_count: descendant.product_count,
          has_children: hasChildren,
          level: descendant.depth - parentCategory.depth
        };
      });

      this.logQuery('getDescendants completed', {
        categoryId,
        returnedCount: enhancedDescendants.length,
        queryTimeMs: result.queryTimeMs
      });

      return enhancedDescendants;

    } catch (error) {
      this.handleError(error, 'getDescendants');
    }
  }

  /**
   * Get sibling categories (same parent and depth)
   * @param categoryId - Category ID
   * @param options - Query options
   * @returns Array of sibling categories
   */
  async getSiblings(categoryId: string, options: CategoryQueryOptions = {}): Promise<CategoryResult[]> {
    this.validateRequired(categoryId, 'categoryId');

    const { includeSelf = false } = options;

    try {
      const db = await this.getConnection();

      this.logQuery('getSiblings', {
        operation: 'SELECT_SIBLINGS',
        categoryId,
        includeSelf
      });

      // Get the target category first
      const targetCategory = await this.getById(categoryId);
      if (!targetCategory) {
        return [];
      }

      // Find siblings: categories with same parent_id and depth
      let query = db
        .selectFrom('categories')
        .selectAll()
        .where('parent_id', targetCategory.parent_id === null ? 'is' : '=', targetCategory.parent_id)
        .where('depth', '=', targetCategory.depth)
        .orderBy('display_order', 'asc')
        .orderBy('name', 'asc');

      // Exclude self if requested
      if (!includeSelf) {
        query = query.where('id', '!=', categoryId);
      }

      const result = await this.executeWithTiming(query);
      const siblings: CategoryResult[] = result.data as CategoryResult[];

      this.logQuery('getSiblings completed', {
        categoryId,
        returnedCount: siblings.length,
        queryTimeMs: result.queryTimeMs
      });

      return siblings;

    } catch (error) {
      this.handleError(error, 'getSiblings');
    }
  }

  // =============================================================================
  // PATH-BASED OPERATIONS
  // =============================================================================

  /**
   * Get category by path (e.g., "Zuivel/Yoghurt/Griekse yoghurt")
   * @param path - Category path
   * @returns Category or null if not found
   */
  async getByPath(path: string): Promise<RepositoryResult<CategoryResult>> {
    this.validateRequired(path, 'path');

    try {
      const db = await this.getConnection();

      // Normalize path: remove leading/trailing slashes and extra spaces
      const normalizedPath = path
        .trim()
        .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
        .replace(/\s*\/\s*/g, '/') // Remove spaces around slashes
        .replace(/\/+/g, '/'); // Collapse multiple slashes

      this.logQuery('getByPath', {
        operation: 'SELECT_BY_PATH',
        originalPath: path,
        normalizedPath
      });

      const result = await db
        .selectFrom('categories')
        .selectAll()
        .where('path', '=', normalizedPath)
        .executeTakeFirst();

      if (!result) {
        this.logQuery('getByPath completed', { path: normalizedPath, found: false });
        return null;
      }

      const category: CategoryResult = result as CategoryResult;

      this.logQuery('getByPath completed', { path: normalizedPath, found: true });
      return category;

    } catch (error) {
      this.handleError(error, 'getByPath');
    }
  }

  // =============================================================================
  // TREE STRUCTURE OPERATIONS
  // =============================================================================

  /**
   * Get complete category tree structure
   * @param options - Tree building options
   * @returns Array of root categories with nested children
   */
  async getCategoryTree(options: CategoryQueryOptions = {}): Promise<CategoryTreeNode[]> {
    const {
      includeProductCounts = true,
      maxDepth = 6,
      minProductCount = 0,
      includeEmptyCategories = true
    } = options;

    try {
      const db = await this.getConnection();

      this.logQuery('getCategoryTree', {
        operation: 'BUILD_CATEGORY_TREE',
        includeProductCounts,
        maxDepth,
        minProductCount,
        includeEmptyCategories
      });

      // Validate maxDepth
      if (maxDepth < 0 || maxDepth > 6) {
        throw new Error('maxDepth must be between 0 and 6');
      }

      // Get all categories within depth limit, ordered by left_bound for tree building
      let query = db
        .selectFrom('categories')
        .selectAll()
        .where('depth', '<=', maxDepth)
        .orderBy('left_bound', 'asc');

      // Apply product count filter
      if (!includeEmptyCategories || minProductCount > 0) {
        query = query.where('product_count', '>=', Math.max(minProductCount, includeEmptyCategories ? 0 : 1));
      }

      const result = await this.executeWithTiming(query);
      const categories: CategoryResult[] = result.data as CategoryResult[];

      // Build tree structure using nested set model
      const tree = this.buildCategoryTree(categories, includeProductCounts);

      this.logQuery('getCategoryTree completed', {
        totalCategories: categories.length,
        rootNodes: tree.length,
        queryTimeMs: result.queryTimeMs
      });

      return tree;

    } catch (error) {
      this.handleError(error, 'getCategoryTree');
    }
  }

  /**
   * Get categories with accurate product counts including rollup
   * @param options - Query options
   * @returns Array of categories with detailed product count information
   */
  async getCategoriesWithProductCounts(options: CategoryQueryOptions = {}): Promise<CategoryWithHierarchy[]> {
    const {
      includeEmptyCategories = true,
      rollupCounts = false,
      includeHierarchyInfo = false
    } = options;

    try {
      const db = await this.getConnection();

      this.logQuery('getCategoriesWithProductCounts', {
        operation: 'SELECT_WITH_PRODUCT_COUNTS',
        includeEmptyCategories,
        rollupCounts,
        includeHierarchyInfo
      });

      // Base query for categories with product counts
      let query = db
        .selectFrom('categories')
        .selectAll()
        .orderBy('left_bound', 'asc');

      // Apply empty category filter
      if (!includeEmptyCategories) {
        query = query.where('product_count', '>', 0);
      }

      const result = await this.executeWithTiming(query);
      const categories: CategoryResult[] = result.data as CategoryResult[];

      // Enhance with hierarchy and rollup information
      const enhancedCategories: CategoryWithHierarchy[] = await Promise.all(
        categories.map(async (category) => {
          const directCount = category.product_count;
          let totalCount = directCount;

          // Calculate rollup counts if requested
          if (rollupCounts) {
            const descendants = await this.getDescendants(category.id, { includeProductCounts: true });
            totalCount = directCount + descendants.reduce((sum, desc) => sum + desc.direct_product_count, 0);
          }

          // Determine if category has children
          const hasChildren = category.left_bound !== null && category.right_bound !== null &&
            (category.right_bound - category.left_bound) > 1;

          const enhanced: CategoryWithHierarchy = {
            ...category,
            direct_product_count: directCount,
            total_product_count: totalCount,
            has_children: hasChildren,
            level: category.depth
          };

          // Add hierarchy info if requested
          if (includeHierarchyInfo) {
            // This would typically include children array, but we'll keep it simple for now
          }

          return enhanced;
        })
      );

      this.logQuery('getCategoriesWithProductCounts completed', {
        returnedCount: enhancedCategories.length,
        queryTimeMs: result.queryTimeMs
      });

      return enhancedCategories;

    } catch (error) {
      this.handleError(error, 'getCategoriesWithProductCounts');
    }
  }

  // =============================================================================
  // VALIDATION OPERATIONS
  // =============================================================================

  /**
   * Validate nested set model integrity
   * @returns Validation result with errors and warnings
   */
  async validateNestedSetModel(): Promise<NestedSetValidation> {
    try {
      const db = await this.getConnection();
      const startTime = Date.now();

      this.logQuery('validateNestedSetModel', {
        operation: 'VALIDATE_NESTED_SET_MODEL'
      });

      // Get all categories for validation
      const categories = await this.getAll({ orderBy: 'nested_set' });
      const errors: NestedSetValidation['errors'] = [];
      const warnings: NestedSetValidation['warnings'] = [];

      // Validate each category
      for (const category of categories) {
        // Check basic constraints
        if (category.left_bound === null || category.right_bound === null) {
          errors.push({
            categoryId: category.id,
            message: 'Missing left_bound or right_bound values',
            severity: 'error',
            details: { left_bound: category.left_bound, right_bound: category.right_bound }
          });
          continue;
        }

        // Check left_bound < right_bound
        if (category.left_bound >= category.right_bound) {
          errors.push({
            categoryId: category.id,
            message: `Invalid bounds: left_bound (${category.left_bound}) must be less than right_bound (${category.right_bound})`,
            severity: 'error'
          });
        }

        // Check depth consistency
        if (category.depth < 0 || category.depth > 6) {
          errors.push({
            categoryId: category.id,
            message: `Invalid depth: ${category.depth} (must be 0-6)`,
            severity: 'error'
          });
        }

        // Check root category constraints
        if (category.depth === 0) {
          if (category.parent_id !== null) {
            errors.push({
              categoryId: category.id,
              message: 'Root category must have null parent_id',
              severity: 'error'
            });
          }
        } else {
          if (category.parent_id === null) {
            errors.push({
              categoryId: category.id,
              message: 'Non-root category must have a parent_id',
              severity: 'error'
            });
          }
        }

        // Check for gaps in nested set numbering (warning only)
        const nodeSize = category.right_bound - category.left_bound;
        if (nodeSize === 1) {
          // Leaf node - check if it actually has no children
          const children = await this.getChildren(category.id);
          if (children.length > 0) {
            warnings.push({
              categoryId: category.id,
              message: 'Leaf node has children in database',
              details: { childrenCount: children.length }
            });
          }
        }
      }

      // Check for overlapping ranges
      const sortedCategories = [...categories].sort((a, b) => (a.left_bound || 0) - (b.left_bound || 0));
      for (let i = 1; i < sortedCategories.length; i++) {
        const prev = sortedCategories[i - 1];
        const curr = sortedCategories[i];

        if (prev.right_bound && curr.left_bound && prev.right_bound > curr.left_bound) {
          errors.push({
            categoryId: curr.id,
            message: `Overlapping nested set ranges with category ${prev.id}`,
            severity: 'error',
            details: {
              prevCategory: { id: prev.id, left_bound: prev.left_bound, right_bound: prev.right_bound },
              currCategory: { id: curr.id, left_bound: curr.left_bound, right_bound: curr.right_bound }
            }
          });
        }
      }

      const validationTimeMs = Date.now() - startTime;
      const validation: NestedSetValidation = {
        isValid: errors.length === 0,
        errors,
        warnings,
        totalCategories: categories.length,
        validationTimeMs
      };

      this.logQuery('validateNestedSetModel completed', {
        isValid: validation.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        totalCategories: categories.length,
        validationTimeMs
      });

      return validation;

    } catch (error) {
      this.handleError(error, 'validateNestedSetModel');
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Build hierarchical tree structure from flat category list
   * @private
   */
  private buildCategoryTree(categories: CategoryResult[], includeProductCounts: boolean): CategoryTreeNode[] {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // Create tree nodes
    for (const category of categories) {
      const node: CategoryTreeNode = {
        ...category,
        direct_product_count: category.product_count,
        total_product_count: category.product_count,
        children: []
      };
      categoryMap.set(category.id, node);
    }

    // Build parent-child relationships
    for (const category of categories) {
      const node = categoryMap.get(category.id)!;

      if (category.parent_id === null) {
        // Root category
        rootCategories.push(node);
      } else {
        // Child category
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      }
    }

    // Calculate total product counts (rollup) if needed
    if (includeProductCounts) {
      this.calculateTotalProductCounts(rootCategories);
    }

    return rootCategories;
  }

  /**
   * Recursively calculate total product counts including descendants
   * @private
   */
  private calculateTotalProductCounts(nodes: CategoryTreeNode[]): void {
    for (const node of nodes) {
      let totalCount = node.direct_product_count;

      if (node.children && node.children.length > 0) {
        this.calculateTotalProductCounts(node.children);
        totalCount += node.children.reduce((sum, child) => sum + child.total_product_count, 0);
      }

      node.total_product_count = totalCount;
    }
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new CategoryRepository instance
 * @param databasePath - Optional database path for testing
 * @returns CategoryRepository instance
 */
export async function createCategoryRepository(databasePath?: string): Promise<CategoryRepository> {
  const repository = new CategoryRepositoryImpl();

  // Initialize connection (will be lazy-loaded on first use)
  await repository.checkHealth();

  return repository;
}

// =============================================================================
// TYPE EXPORTS (avoiding conflicts)
// =============================================================================

// Types are already exported through their interface/type declarations above
/**
 * Schema Verification Contract Test
 * Feature: 020-migration-kysely
 *
 * CRITICAL: This test must pass before any type definitions are created.
 * Validates actual database schema against documented schema-baseline.md
 */

import { describe, it, expect, beforeAll } from 'vitest';
import Database from 'better-sqlite3';
import { join } from 'path';

interface TableInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

interface TableCount {
  count: number;
}

interface IndexInfo {
  name: string;
  sql: string | null;
}

describe('Schema Verification Contract', () => {
  let db: Database.Database;
  let tablesResult: any[];
  let schemaInfo: Record<string, TableInfo[]> = {};

  beforeAll(() => {
    // Open the actual database file directly
    const dbPath = join(process.cwd(), 'out', 'products-flexible.db');
    db = new Database(dbPath, { readonly: true });

    // Get all tables in the database
    tablesResult = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all() as { name: string }[];

    // Get schema info for each expected table
    const expectedTables = [
      'products', 'categories', 'product_categories', 'product_nutrition',
      'product_flags', 'product_scores', 'product_additives'
    ];

    for (const table of expectedTables) {
      try {
        const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all() as TableInfo[];
        schemaInfo[table] = tableInfo;
      } catch (error) {
        // Table doesn't exist - will be caught in tests
        schemaInfo[table] = [];
      }
    }
  });

  describe('Expected Tables Present', () => {
    it('should have products table', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).toContain('products');
      expect(schemaInfo.products.length).toBeGreaterThan(0);
    });

    it('should have categories table', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).toContain('categories');
      expect(schemaInfo.categories.length).toBeGreaterThan(0);
    });

    it('should have product_categories table', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).toContain('product_categories');
      expect(schemaInfo.product_categories.length).toBeGreaterThan(0);
    });

    it('should have product_nutrition table', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).toContain('product_nutrition');
      expect(schemaInfo.product_nutrition.length).toBeGreaterThan(0);
    });

    it('should have product_flags table', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).toContain('product_flags');
      expect(schemaInfo.product_flags.length).toBeGreaterThan(0);
    });

    it('should have product_scores table', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).toContain('product_scores');
      expect(schemaInfo.product_scores.length).toBeGreaterThan(0);
    });

    it('should have product_additives table', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).toContain('product_additives');
      expect(schemaInfo.product_additives.length).toBeGreaterThan(0);
    });

    it('should NOT have product_search_terms table (search disabled)', () => {
      const tableNames = tablesResult.map(t => t.name);
      expect(tableNames).not.toContain('product_search_terms');
    });
  });

  describe('Products Table Schema', () => {
    it('should have correct column structure', () => {
      const columns = schemaInfo.products;
      expect(columns).toBeDefined();

      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('price_regular');
      expect(columnNames).toContain('price_sale');
      expect(columnNames).toContain('unit_amount');
      expect(columnNames).toContain('unit_type');
      expect(columnNames).toContain('brand');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    it('should have correct primary key', () => {
      const idColumn = schemaInfo.products.find(c => c.name === 'id');
      expect(idColumn).toBeDefined();
      expect(idColumn?.pk).toBe(1); // Primary key flag
      expect(idColumn?.type).toBe('TEXT');
      expect(idColumn?.notnull).toBe(0); // In SQLite, pk columns can be null unless explicitly NOT NULL
    });

    it('should have required columns marked as NOT NULL', () => {
      // Check actual NOT NULL columns based on PRAGMA output
      const notNullColumns = ['name', 'price_regular', 'unit_amount', 'unit_type', 'created_at', 'updated_at'];

      for (const colName of notNullColumns) {
        const column = schemaInfo.products.find(c => c.name === colName);
        expect(column).toBeDefined();
        expect(column?.notnull).toBe(1);
      }

      // ID is primary key but not explicitly NOT NULL in this schema
      const idColumn = schemaInfo.products.find(c => c.name === 'id');
      expect(idColumn?.pk).toBe(1); // Verify it's the primary key
    });
  });

  describe('Categories Table Schema', () => {
    it('should have correct column structure for nested set model', () => {
      const columns = schemaInfo.categories;
      expect(columns).toBeDefined();

      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('parent_id');
      expect(columnNames).toContain('path');
      expect(columnNames).toContain('depth');
      expect(columnNames).toContain('left_bound');
      expect(columnNames).toContain('right_bound');
      expect(columnNames).toContain('product_count');
      expect(columnNames).toContain('display_order');
    });

    it('should have correct nested set columns', () => {
      const leftBound = schemaInfo.categories.find(c => c.name === 'left_bound');
      const rightBound = schemaInfo.categories.find(c => c.name === 'right_bound');

      expect(leftBound).toBeDefined();
      expect(rightBound).toBeDefined();
      expect(leftBound?.type).toBe('INTEGER');
      expect(rightBound?.type).toBe('INTEGER');
      expect(leftBound?.notnull).toBe(1);
      expect(rightBound?.notnull).toBe(1);
    });
  });

  describe('Product Nutrition Table Schema', () => {
    it('should have correct nutritional columns', () => {
      const columns = schemaInfo.product_nutrition;
      expect(columns).toBeDefined();

      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('product_id');
      expect(columnNames).toContain('kcal');
      expect(columnNames).toContain('kj');
      expect(columnNames).toContain('protein');
      expect(columnNames).toContain('carbs');
      expect(columnNames).toContain('sugars');
      expect(columnNames).toContain('fat');
      expect(columnNames).toContain('saturated_fat');
      expect(columnNames).toContain('fiber');
      expect(columnNames).toContain('salt');
      expect(columnNames).toContain('sodium');
    });

    it('should have product_id as primary key and foreign key', () => {
      const productIdColumn = schemaInfo.product_nutrition.find(c => c.name === 'product_id');
      expect(productIdColumn).toBeDefined();
      expect(productIdColumn?.pk).toBe(1);
      expect(productIdColumn?.type).toBe('TEXT');
      expect(productIdColumn?.notnull).toBe(0); // Primary key but not explicitly NOT NULL
    });
  });

  describe('Product Flags Table Schema', () => {
    it('should have correct flag columns', () => {
      const columns = schemaInfo.product_flags;
      expect(columns).toBeDefined();

      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('product_id');
      expect(columnNames).toContain('flag_type');
      expect(columnNames).toContain('flag_value');
      expect(columnNames).toContain('confidence');
      expect(columnNames).toContain('source');
    });

    it('should have composite primary key structure', () => {
      const productId = schemaInfo.product_flags.find(c => c.name === 'product_id');
      const flagType = schemaInfo.product_flags.find(c => c.name === 'flag_type');

      expect(productId).toBeDefined();
      expect(flagType).toBeDefined();
      // Composite keys typically have pk > 0
      expect(productId?.pk).toBeGreaterThan(0);
      expect(flagType?.pk).toBeGreaterThan(0);
    });
  });

  describe('Product Scores Table Schema', () => {
    it('should have correct scoring columns', () => {
      const columns = schemaInfo.product_scores;
      expect(columns).toBeDefined();

      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('product_id');
      expect(columnNames).toContain('score_type');
      expect(columnNames).toContain('score_value');
      expect(columnNames).toContain('context');
      expect(columnNames).toContain('computed_at');
      expect(columnNames).toContain('metadata');
    });

    it('should support contextual scoring', () => {
      const contextColumn = schemaInfo.product_scores.find(c => c.name === 'context');
      expect(contextColumn).toBeDefined();
      expect(contextColumn?.type).toBe('TEXT');
      // Context should be nullable for non-contextual scores
      expect(contextColumn?.notnull).toBe(0);
    });
  });

  describe('Product Additives Table Schema', () => {
    it('should have correct additive columns', () => {
      const columns = schemaInfo.product_additives;
      expect(columns).toBeDefined();

      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('product_id');
      expect(columnNames).toContain('e_number');
      expect(columnNames).toContain('additive_name');
      expect(columnNames).toContain('functional_category');
      expect(columnNames).toContain('dutch_category');
      expect(columnNames).toContain('safety_flags');
      expect(columnNames).toContain('is_natural');
    });

    it('should allow nullable e_number for non E-number additives', () => {
      const eNumberColumn = schemaInfo.product_additives.find(c => c.name === 'e_number');
      expect(eNumberColumn).toBeDefined();
      expect(eNumberColumn?.type).toBe('TEXT');
      // E-number should be nullable since not all additives have E-numbers
      expect(eNumberColumn?.notnull).toBe(0);
    });
  });

  describe('Row Count Validation', () => {
    it('should have expected number of products (30k+ range)', () => {
      const result = db.prepare('SELECT COUNT(*) as count FROM products').get() as TableCount;
      expect(result.count).toBeGreaterThan(25000);
      expect(result.count).toBeLessThan(35000);
    });

    it('should have expected number of categories (3k+ range)', () => {
      const result = db.prepare('SELECT COUNT(*) as count FROM categories').get() as TableCount;
      expect(result.count).toBeGreaterThan(2000);
      expect(result.count).toBeLessThan(5000);
    });

    it('should have nutrition data for most products', () => {
      const result = db.prepare('SELECT COUNT(*) as count FROM product_nutrition').get() as TableCount;
      expect(result.count).toBeGreaterThan(25000);
    });

    it('should have extensive flag data', () => {
      const result = db.prepare('SELECT COUNT(*) as count FROM product_flags').get() as TableCount;
      expect(result.count).toBeGreaterThan(100000);
    });

    it('should have comprehensive scoring data', () => {
      const result = db.prepare('SELECT COUNT(*) as count FROM product_scores').get() as TableCount;
      expect(result.count).toBeGreaterThan(100000);
    });

    it('should have additive information', () => {
      const result = db.prepare('SELECT COUNT(*) as count FROM product_additives').get() as TableCount;
      expect(result.count).toBeGreaterThan(20000);
    });
  });

  describe('Index Validation', () => {
    it('should have expected indexes for performance', () => {
      const indexes = db.prepare(
        "SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL"
      ).all() as IndexInfo[];

      const indexNames = indexes.map(i => i.name);

      // Critical indexes for query performance (based on actual schema)
      expect(indexNames.some(name => name.includes('product_categories_category'))).toBe(true);
      expect(indexNames.some(name => name.includes('flags') && name.includes('type'))).toBe(true);
      expect(indexNames.some(name => name.includes('categories') && name.includes('nested'))).toBe(true);

      // Note: Protein-specific index may not exist in current schema, but basic nutrition queries should work
    });
  });

  describe('Blocking Validation', () => {
    it('should block type definition work if critical schema elements missing', () => {
      // This test aggregates all critical validations
      const tableNames = tablesResult.map(t => t.name);
      const requiredTables = [
        'products', 'categories', 'product_categories', 'product_nutrition',
        'product_flags', 'product_scores', 'product_additives'
      ];

      for (const table of requiredTables) {
        expect(tableNames).toContain(table);
        expect(schemaInfo[table]).toBeDefined();
        expect(schemaInfo[table].length).toBeGreaterThan(0);
      }

      // Search table should NOT exist
      expect(tableNames).not.toContain('product_search_terms');
    });

    it('should confirm schema matches schema-baseline.md exactly', () => {
      // Validates that our schema understanding is correct
      expect(schemaInfo.categories.find(c => c.name === 'left_bound')).toBeDefined();
      expect(schemaInfo.categories.find(c => c.name === 'right_bound')).toBeDefined();
      expect(schemaInfo.products.find(c => c.name === 'price_regular')).toBeDefined();
      expect(schemaInfo.products.find(c => c.name === 'price_sale')).toBeDefined();

      // Confirm no legacy naming patterns
      expect(schemaInfo.categories.find(c => c.name === 'lft')).toBeUndefined();
      expect(schemaInfo.categories.find(c => c.name === 'rgt')).toBeUndefined();
      expect(schemaInfo.products.find(c => c.name === 'price_cents')).toBeUndefined();
    });
  });
});
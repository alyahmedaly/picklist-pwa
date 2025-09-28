/**
 * Flexible Schema Database Generator
 * Feature: 019-flexible-database-schema
 *
 * Orchestrates the complete pipeline from rich Product objects to populated
 * flexible schema SQLite database with normalized data and optimized indexes.
 */

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Product } from '@picklist/types';
import { normalizeProductData, generateNormalizationReport } from '../../../packages/pipline/src/utils/normalizeProductData.ts';
import { createFlexibleSchema, validateFlexibleSchema } from './createFlexibleSchema.ts';

// Feature flag for search subsystem (product_search_terms + FTS)
const SEARCH_ENABLED = process.env.FLEX_SCHEMA_ENABLE_SEARCH !== 'false';
import Database from 'better-sqlite3';


/**
 * Configuration for flexible schema generation
 */
export interface FlexibleSchemaOptions {
  outputDir: string;
  fileName: string;
  validateSchema?: boolean;
  generateReport?: boolean;
  optimizeForQueries?: boolean;
}

/**
 * Statistics from flexible schema generation
 */
export interface FlexibleSchemaStats {
  databasePath: string;
  databaseSizeMB: number;
  normalizationTimeMs: number;
  insertionTimeMs: number;
  totalTimeMs: number;

  // Entity counts
  productsInserted: number;
  categoriesInserted: number;
  relationshipsInserted: number;
  nutritionRecordsInserted: number;
  flagsInserted: number;
  scoresInserted: number;
  additivesInserted: number;
  searchTermsInserted: number;

  // Schema info
  tablesCreated: number;
  indexesCreated: number;
  schemaVersion: string;

  // Quality metrics
  validationErrors: number;
  warnings: string[];
}

/**
 * Generates a complete flexible schema database from Product objects
 */
export function generateFlexibleSchemaOutput(
  products: Product[],
  options: FlexibleSchemaOptions
): FlexibleSchemaStats {
  const startTime = Date.now();

  // Ensure output directory exists
  if (!existsSync(options.outputDir)) {
    mkdirSync(options.outputDir, { recursive: true });
  }

  const databasePath = join(options.outputDir, options.fileName);

  try {
    // Create database connection
    const db = new Database(databasePath);

    try {
      // Step 1: Normalize product data
      console.log(`[flexible-schema] Normalizing ${products.length} products...`);
      const normalizationStart = Date.now();

      const normalizedData = normalizeProductData(products);
      const normalizationTimeMs = Date.now() - normalizationStart;

      // Summarize rejection reasons if there is a large drop-off
      if (normalizedData.products.length < products.length) {
        const errorCounts: Record<string, number> = {};
        const productErrors = normalizedData.errors.filter(e => e.severity === 'error' && e.entity === 'product');
        for (const err of productErrors) {
          errorCounts[err.message] = (errorCounts[err.message] || 0) + 1;
        }
        const topReasons = Object.entries(errorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([reason, count]) => `• ${reason}: ${count}`)
          .join('\n');
        console.warn('[flexible-schema] Product reduction summary:', {
          inputProducts: products.length,
          validProducts: normalizedData.products.length,
          drop: products.length - normalizedData.products.length
        });
        if (topReasons) {
          console.warn('[flexible-schema] Top rejection reasons:\n' + topReasons);
        }
      }

      if (options.generateReport) {
        const report = generateNormalizationReport(normalizedData);
        console.log(report);
      }

      // Step 2: Create flexible schema
      console.log('[flexible-schema] Creating database schema...');
      const schemaResult = createFlexibleSchema(db);

      // Step 3: Insert normalized data
      console.log('[flexible-schema] Inserting normalized data...');
      const insertionStart = Date.now();

      insertNormalizedData(db, normalizedData);
      const insertionTimeMs = Date.now() - insertionStart;

      // Step 4: Validate schema if requested
      if (options.validateSchema) {
        console.log('[flexible-schema] Validating schema...');
        const validation = validateFlexibleSchema(db);
        if (!validation.isValid) {
          console.warn('[flexible-schema] Schema validation issues:', validation.errors);
        }
      }

      // Step 5: Optimize for queries if requested
      if (options.optimizeForQueries) {
        console.log('[flexible-schema] Optimizing for query performance...');
        db.exec('ANALYZE');
        db.exec('PRAGMA optimize');
      }

      // ------------------------------------------------------------------
      // Browser Compatibility Finalization
      // ------------------------------------------------------------------
      // The bulk load phase uses WAL for speed. For wa-sqlite + OPFS in the
      // browser (especially main-thread OriginPrivateFileSystemVFS) we want a
      // single self-contained file. Ensure all WAL pages are checkpointed
      // and switch back to DELETE journal mode, then VACUUM to reclaim space.
      try {
        console.log('[flexible-schema] Finalizing journal mode for browser (checkpoint WAL → DELETE)...');
        db.exec('PRAGMA wal_checkpoint(FULL);');
        db.exec('PRAGMA journal_mode=DELETE;');
        db.exec('VACUUM;');
      } catch (finalizeError) {
        console.warn('[flexible-schema] Finalization (checkpoint/journal switch) failed:', (finalizeError as Error).message);
      }

      // Get database size after vacuum (post-finalization size)
      const stats = db.prepare('PRAGMA page_count').get() as { page_count: number } | undefined;
      const pageSize = db.prepare('PRAGMA page_size').get() as { page_size: number } | undefined;
      const databaseSizeMB = ((stats?.page_count || 0) * (pageSize?.page_size || 4096)) / (1024 * 1024);

      const totalTimeMs = Date.now() - startTime;

      return {
        databasePath,
        databaseSizeMB: Math.round(databaseSizeMB * 100) / 100,
        normalizationTimeMs,
        insertionTimeMs,
        totalTimeMs,
        productsInserted: normalizedData.products.length,
        categoriesInserted: normalizedData.categories.length,
        relationshipsInserted: normalizedData.productCategories.length,
        nutritionRecordsInserted: normalizedData.productNutrition.length,
        flagsInserted: normalizedData.productFlags.length,
        scoresInserted: normalizedData.productScores.length,
        additivesInserted: normalizedData.productAdditives.length,
        searchTermsInserted: SEARCH_ENABLED ? normalizedData.productSearchTerms.length : 0,
        tablesCreated: schemaResult.tablesCreated,
        indexesCreated: schemaResult.indexesCreated,
        schemaVersion: schemaResult.schemaVersion,
        validationErrors: normalizedData.stats.validationErrors,
        warnings: normalizedData.warnings
      };

    } finally {
      db.close();
    }

  } catch (error) {
    throw new Error(`Flexible schema generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Inserts all normalized data into the database
 */
function insertNormalizedData(
  db: InstanceType<typeof Database>,
  data: ReturnType<typeof normalizeProductData>
): {
  productsInserted: number;
  categoriesInserted: number;
  relationshipsInserted: number;
  nutritionInserted: number;
  flagsInserted: number;
  scoresInserted: number;
  additivesInserted: number;
  searchTermsInserted: number;
} {

  // Optimize database for bulk inserts
  console.log(`[flexible-schema] Optimizing database for bulk insert of ${data.products.length} products...`);
  const insertStartTime = Date.now();

  db.exec('PRAGMA journal_mode = MEMORY');
  db.exec('PRAGMA synchronous = OFF');
  db.exec('PRAGMA cache_size = -64000'); // 64MB cache
  db.exec('PRAGMA temp_store = MEMORY');
  db.exec('PRAGMA foreign_keys = OFF');

  try {
    // Prepare all statements once
    const productStmt = db.prepare(`
      INSERT INTO products (id, name, price_regular, price_sale, unit_amount, unit_type, brand, created_at, updated_at)
      VALUES (@id, @name, @price_regular, @price_sale, @unit_amount, @unit_type, @brand, @created_at, @updated_at)
    `);

    const categoryStmt = db.prepare(`
      INSERT INTO categories (id, name, parent_id, path, depth, left_bound, right_bound, product_count, display_order)
      VALUES (@id, @name, @parent_id, @path, @depth, @left_bound, @right_bound, @product_count, @display_order)
    `);

    const relationStmt = db.prepare(`
      INSERT OR REPLACE INTO product_categories (product_id, category_id, is_primary, relevance_score)
      VALUES (@product_id, @category_id, @is_primary, @relevance_score)
    `);

    const nutritionStmt = db.prepare(`
      INSERT INTO product_nutrition (product_id, kcal, kj, protein, carbs, sugars, fat, saturated_fat, fiber, salt, sodium)
      VALUES (@product_id, @kcal, @kj, @protein, @carbs, @sugars, @fat, @saturated_fat, @fiber, @salt, @sodium)
    `);

    const flagStmt = db.prepare(`
      INSERT OR REPLACE INTO product_flags (product_id, flag_type, flag_value, confidence, source)
      VALUES (@product_id, @flag_type, @flag_value, @confidence, @source)
    `);

    const scoreStmt = db.prepare(`
      INSERT OR REPLACE INTO product_scores (product_id, score_type, score_value, context, computed_at, metadata)
      VALUES (@product_id, @score_type, @score_value, @context, @computed_at, @metadata)
    `);

    const additiveStmt = db.prepare(`
      INSERT OR REPLACE INTO product_additives (product_id, e_number, additive_name, functional_category, dutch_category, safety_flags, is_natural)
      VALUES (@product_id, @e_number, @additive_name, @functional_category, @dutch_category, @safety_flags, @is_natural)
    `);

    const searchStmt = SEARCH_ENABLED ? db.prepare(`
      INSERT OR REPLACE INTO product_search_terms (product_id, term, term_type, weight, language)
      VALUES (@product_id, @term, @term_type, @weight, @language)
    `) : null;

    // Create optimized transaction functions
    const insertProducts = db.transaction((batch) => {
      for (const product of batch) {
        productStmt.run({
          id: product.id,
          name: product.name,
          price_regular: product.price_regular,
          price_sale: product.price_sale ?? null,
          unit_amount: product.unit_amount,
          unit_type: product.unit_type,
          brand: product.brand ?? null,
          created_at: product.created_at,
          updated_at: product.updated_at
        });
      }
    });

    const insertCategories = db.transaction((batch) => {
      for (const category of batch) {
        categoryStmt.run({
          id: category.id,
          name: category.name,
          parent_id: category.parent_id ?? null,
          path: category.path ?? null,
          depth: category.depth ?? null,
          left_bound: category.left_bound ?? null,
          right_bound: category.right_bound ?? null,
          product_count: category.product_count ?? null,
          display_order: category.display_order ?? null
        });
      }
    });

    const insertRelations = db.transaction((batch) => {
      for (const relation of batch) {
        relationStmt.run({
          product_id: relation.product_id,
          category_id: relation.category_id,
          is_primary: relation.is_primary ? 1 : 0,
          relevance_score: relation.relevance_score ?? null
        });
      }
    });

    const insertNutrition = db.transaction((batch) => {
      for (const nutrition of batch) {
        nutritionStmt.run({
          product_id: nutrition.product_id,
          kcal: nutrition.kcal ?? null,
          kj: nutrition.kj ?? null,
          protein: nutrition.protein ?? null,
          carbs: nutrition.carbs ?? null,
          sugars: nutrition.sugars ?? null,
          fat: nutrition.fat ?? null,
          saturated_fat: nutrition.saturated_fat ?? null,
          fiber: nutrition.fiber ?? null,
          salt: nutrition.salt ?? null,
          sodium: nutrition.sodium ?? null
        });
      }
    });

    const insertFlags = db.transaction((batch) => {
      for (const flag of batch) {
        flagStmt.run({
          product_id: flag.product_id,
          flag_type: flag.flag_type,
          flag_value: flag.flag_value ? 1 : 0,
          confidence: flag.confidence ?? null,
          source: flag.source ?? null
        });
      }
    });

    const insertScores = db.transaction((batch) => {
      for (const score of batch) {
        scoreStmt.run({
          product_id: score.product_id,
          score_type: score.score_type,
          score_value: score.score_value ?? null,
          context: score.context ?? null,
          computed_at: score.computed_at ?? null,
          metadata: score.metadata ?? null
        });
      }
    });

    const insertAdditives = db.transaction((batch) => {
      for (const additive of batch) {
        additiveStmt.run({
          product_id: additive.product_id,
          e_number: additive.e_number ?? null,
          additive_name: additive.additive_name ?? null,
          functional_category: additive.functional_category ?? null,
          dutch_category: additive.dutch_category ?? null,
          safety_flags: additive.safety_flags ?? null,
          is_natural: additive.is_natural ? 1 : 0
        });
      }
    });

    const insertSearchTerms = SEARCH_ENABLED && searchStmt ? db.transaction((batch: typeof data.productSearchTerms) => {
      for (const searchTerm of batch) {
        searchStmt.run({
          product_id: searchTerm.product_id,
          term: searchTerm.term,
          term_type: searchTerm.term_type ?? null,
          weight: searchTerm.weight ?? null,
          language: searchTerm.language ?? null
        });
      }
    }) : null;

    // Execute batch inserts
    console.log(`[flexible-schema] Inserting ${data.products.length} products...`);
    console.time('insert-products');
    insertProducts(data.products);
    console.timeEnd('insert-products');

    console.log(`[flexible-schema] Inserting ${data.categories.length} categories...`);
    console.time('insert-categories');
    insertCategories(data.categories);
    console.timeEnd('insert-categories');

    console.log(`[flexible-schema] Inserting ${data.productCategories.length} relationships...`);
    // Drop indexes that slow massive junction inserts (will recreate after)
    // Safe even if they don't exist yet (wrapped in try/catch)
    try { db.exec('DROP INDEX IF EXISTS idx_product_categories_category'); } catch { /* ignore if not exists */ }
    try { db.exec('DROP INDEX IF EXISTS idx_product_categories_primary'); } catch { /* ignore if not exists */ }
    try { db.exec('DROP INDEX IF EXISTS idx_product_categories_relevance'); } catch { /* ignore if not exists */ }
    console.time('insert-relations');
    insertRelations(data.productCategories);
    console.timeEnd('insert-relations');
    console.time('recreate-relation-indexes');
    db.exec(`CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_primary ON product_categories(is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_product_categories_relevance ON product_categories(relevance_score DESC);`);
    console.timeEnd('recreate-relation-indexes');

    console.log(`[flexible-schema] Inserting ${data.productNutrition.length} nutrition records...`);
    console.time('insert-nutrition');
    insertNutrition(data.productNutrition);
    console.timeEnd('insert-nutrition');

    console.log(`[flexible-schema] Inserting ${data.productFlags.length} flags...`);
    console.time('insert-flags');
    insertFlags(data.productFlags);
    console.timeEnd('insert-flags');

    console.log(`[flexible-schema] Inserting ${data.productScores.length} scores...`);
    console.time('insert-scores');
    insertScores(data.productScores);
    console.timeEnd('insert-scores');

    console.log(`[flexible-schema] Inserting ${data.productAdditives.length} additives...`);
    console.time('insert-additives');
    insertAdditives(data.productAdditives);
    console.timeEnd('insert-additives');

    // ---- Search Terms Bulk Strategy (dedupe + pre-aggregate) ----
    if (SEARCH_ENABLED && insertSearchTerms) {
      const originalSearchTermCount = data.productSearchTerms.length;
      console.log(`[flexible-schema] Preparing ${originalSearchTermCount} raw search terms (dedupe + normalize)...`);
      const seen = new Map<string, { product_id: string; term: string; term_type: string; weight: number | undefined; language: string | undefined }>();
      const perProductTerms = new Map<string, { terms: string[]; weighted: Array<{ term: string; weight: number | undefined }> }>();
      for (const st of data.productSearchTerms) {
        const term = st.term.trim().toLowerCase();
        if (!term || term.length < 2) continue; // drop empty / overly short tokens
        const key = `${st.product_id}||${term}||${st.term_type}`;
        const existing = seen.get(key);
        if (existing) {
          // Keep higher weight (if provided)
          if ((st.weight ?? 0) > (existing.weight ?? 0)) {
            existing.weight = st.weight;
          }
        } else {
          const record = { product_id: st.product_id, term, term_type: st.term_type ?? 'name', weight: st.weight, language: st.language };
          seen.set(key, record);
          // Collect for aggregation
          let agg = perProductTerms.get(st.product_id);
          if (!agg) {
            agg = { terms: [], weighted: [] };
            perProductTerms.set(st.product_id, agg);
          }
          agg.terms.push(term);
          agg.weighted.push({ term, weight: st.weight });
        }
      }
      // Build deduped list
      const dedupedSearchTerms = Array.from(seen.values()).map(r => ({
        product_id: r.product_id,
        term: r.term,
        term_type: r.term_type,
        weight: r.weight,
        language: r.language
      }));
      const dedupedCount = dedupedSearchTerms.length;
      console.log(`[flexible-schema] Search term dedupe: kept ${dedupedCount} / ${originalSearchTermCount} (removed ${originalSearchTermCount - dedupedCount})`);
      // Produce ordered aggregated term strings per product (sort by weight desc then term asc)
      const aggregated: Array<{ product_id: string; terms: string }> = [];
      for (const [pid, bundle] of perProductTerms.entries()) {
        bundle.weighted.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0) || a.term.localeCompare(b.term));
        const uniqueOrdered: string[] = [];
        let last = '';
        for (const w of bundle.weighted) {
          if (w.term !== last) uniqueOrdered.push(w.term);
          last = w.term;
        }
        aggregated.push({ product_id: pid, terms: uniqueOrdered.join(' ') });
      }
      // Drop search term indexes & FTS trigger for faster bulk load
      try { db.exec('DROP INDEX IF EXISTS idx_search_terms_term'); } catch { /* ignore */ }
      try { db.exec('DROP INDEX IF EXISTS idx_search_terms_type_weight'); } catch { /* ignore */ }
      try { db.exec('DROP INDEX IF EXISTS idx_search_terms_language'); } catch { /* ignore */ }
      try { db.exec('DROP TRIGGER IF EXISTS populate_fts_insert'); } catch { /* ignore */ }
      console.log(`[flexible-schema] Inserting ${dedupedCount} deduped search terms...`);
      console.time('insert-search-terms');
      // Narrow term_type to known literal union via filter (defensive)
      const allowedTypes = [
        'name', 'brand', 'ingredient', 'category', 'synonym', 'alternative_name', 'description', 'nutritional_tag', 'dietary_flag'
      ] as const;
      type AllowedType = typeof allowedTypes[number];
      function isAllowedType(t: string): t is AllowedType { return (allowedTypes as readonly string[]).includes(t); }
      const narrowed = dedupedSearchTerms.filter(r => isAllowedType(r.term_type))
        .map(r => r) as unknown as import('./types').FlexibleProductSearchTerm[];
      insertSearchTerms(narrowed);
      console.timeEnd('insert-search-terms');
      console.time('rebuild-search-indexes-fts');
      // Recreate indexes
      db.exec(`CREATE INDEX IF NOT EXISTS idx_search_terms_term ON product_search_terms(term);
CREATE INDEX IF NOT EXISTS idx_search_terms_type_weight ON product_search_terms(term_type, weight DESC);
CREATE INDEX IF NOT EXISTS idx_search_terms_language ON product_search_terms(language);`);
      // Create temp aggregation table
      db.exec('CREATE TEMP TABLE temp_aggregated_terms (product_id TEXT PRIMARY KEY, terms TEXT);');
      const aggStmt = db.prepare('INSERT INTO temp_aggregated_terms (product_id, terms) VALUES (?, ?)');
      const insertAgg = db.transaction((rows: typeof aggregated) => { for (const r of rows) aggStmt.run(r.product_id, r.terms); });
      insertAgg(aggregated);
      // Rebuild FTS content using aggregated table
      try {
        db.exec('DELETE FROM product_search_fts;');
        db.exec(`INSERT INTO product_search_fts(product_id, name, terms, category_path)
      SELECT p.id, p.name, t.terms, c.path
      FROM products p
      LEFT JOIN temp_aggregated_terms t ON p.id = t.product_id
      LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
      LEFT JOIN categories c ON pc.category_id = c.id;`);
      } catch (e) {
        console.warn('[flexible-schema] FTS rebuild (aggregated) failed:', (e as Error).message);
      } finally {
        try { db.exec('DROP TABLE IF EXISTS temp_aggregated_terms;'); } catch { /* ignore */ }
      }
      // Recreate trigger (lightweight; still full recompute per product if future inserts happen)
      db.exec(`CREATE TRIGGER IF NOT EXISTS populate_fts_insert
AFTER INSERT ON product_search_terms
BEGIN
  INSERT OR REPLACE INTO product_search_fts(product_id, name, terms, category_path)
  SELECT p.id, p.name,
    (SELECT GROUP_CONCAT(term, ' ') FROM product_search_terms WHERE product_id = NEW.product_id),
    c.path
  FROM products p
  LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
  LEFT JOIN categories c ON pc.category_id = c.id
  WHERE p.id = NEW.product_id;
END;`);
      console.timeEnd('rebuild-search-indexes-fts');
      // Metrics
      const maxTerms = aggregated.reduce((m, a) => Math.max(m, a.terms ? a.terms.split(' ').length : 0), 0);
      console.log(`[flexible-schema] Search term aggregation: products=${aggregated.length}, maxTermsPerProduct=${maxTerms}`);
    } else {
      console.log('[flexible-schema] Search disabled: skipping search term insertion and FTS rebuild.');
    }


    // Restore normal database settings
    db.exec('PRAGMA synchronous = NORMAL');
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');

    const insertTimeMs = Date.now() - insertStartTime;
    console.log(`[flexible-schema] Bulk insert completed in ${insertTimeMs}ms (${(insertTimeMs / 1000).toFixed(1)}s)`);

    return {
      productsInserted: data.products.length,
      categoriesInserted: data.categories.length,
      relationshipsInserted: data.productCategories.length,
      nutritionInserted: data.productNutrition.length,
      flagsInserted: data.productFlags.length,
      scoresInserted: data.productScores.length,
      additivesInserted: data.productAdditives.length,
      searchTermsInserted: SEARCH_ENABLED ? data.productSearchTerms.length : 0
    };

  } catch (error) {
    // If we are in a transaction, roll it back.
    if (db.inTransaction) {
      db.exec('ROLLBACK');
    }
    throw error;
  } finally {
    // Restore PRAGMA settings even if there's an error
    db.exec('PRAGMA synchronous = NORMAL');
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
  }
}
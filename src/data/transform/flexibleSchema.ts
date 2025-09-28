/**
 * Flexible Database Schema Implementation
 * Feature: 019-flexible-database-schema
 *
 * Provides the complete SQL schema for normalized relational database
 * supporting multi-dimensional filtering, hierarchical categories,
 * extensible scoring systems, and advanced search capabilities.
 */

/**
 * Complete SQL schema for flexible product database
 * Implements all 8 core entities with proper relationships, constraints, and indexes
 */
// Feature flag: allow disabling search subsystem to reduce DB size.
// Set process.env.FLEX_SCHEMA_ENABLE_SEARCH = 'false' before running the generator to omit search tables/FTS.
// Must stay in sync with flexibleSchemaGenerator.ts (SEARCH_ENABLED logic)
const ENABLE_SEARCH = process.env.FLEX_SCHEMA_ENABLE_SEARCH !== 'false';

// Index tier selection: 'full' | 'core' | 'min'.
// CORE keeps only high-value indexes for 30k scale.
const envTier = process.env.FLEX_SCHEMA_INDEX_TIER;
const INDEX_TIER: 'full' | 'core' | 'min' = (envTier === 'full' || envTier === 'core' || envTier === 'min') ? envTier : 'core';

export const FLEXIBLE_SCHEMA_SQL = `
-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Products: Core product identity and basic attributes
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) <= 200),
  price_regular REAL NOT NULL CHECK (price_regular > 0 AND price_regular <= 999.99),
  price_sale REAL CHECK (price_sale > 0 AND price_sale <= 999.99),
  unit_amount REAL NOT NULL CHECK (unit_amount > 0),
  unit_type TEXT NOT NULL CHECK (unit_type IN ('g', 'ml', 'pieces', 'kg', 'l')),
  brand TEXT CHECK (length(brand) <= 100),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Categories: Hierarchical product categorization
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) <= 100),
  parent_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
  path TEXT NOT NULL CHECK (length(path) <= 500),
  depth INTEGER NOT NULL CHECK (depth >= 0 AND depth <= 6),
  left_bound INTEGER NOT NULL CHECK (left_bound > 0),
  right_bound INTEGER NOT NULL CHECK (right_bound > left_bound),
  product_count INTEGER NOT NULL DEFAULT 0 CHECK (product_count >= 0),
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Product-Category Junction: Many-to-many with primary category designation
CREATE TABLE product_categories (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  relevance_score REAL NOT NULL DEFAULT 100 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  PRIMARY KEY (product_id, category_id)
);

-- Product Nutrition: Structured nutritional data per 100g
CREATE TABLE product_nutrition (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  kcal REAL CHECK (kcal >= 0 AND kcal <= 1000),
  kj REAL CHECK (kj >= 0 AND kj <= 5000),
  protein REAL CHECK (protein >= 0 AND protein <= 100),
  carbs REAL CHECK (carbs >= 0 AND carbs <= 100),
  sugars REAL CHECK (sugars >= 0 AND sugars <= 100),
  fat REAL CHECK (fat >= 0 AND fat <= 100),
  saturated_fat REAL CHECK (saturated_fat >= 0 AND saturated_fat <= 100),
  fiber REAL CHECK (fiber >= 0 AND fiber <= 100),
  salt REAL CHECK (salt >= 0 AND salt <= 50),
  sodium REAL CHECK (sodium >= 0 AND sodium <= 20000),

  -- Business logic constraints
  CHECK (sugars IS NULL OR carbs IS NULL OR sugars <= carbs),
  CHECK (saturated_fat IS NULL OR fat IS NULL OR saturated_fat <= fat)
);

-- Product Flags: Boolean dietary and classification flags
CREATE TABLE product_flags (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN (
    'is_vegan', 'is_vegetarian', 'is_gluten_free', 'is_lactose_free',
    'is_halal', 'is_kosher', 'is_organic',
    'is_high_protein', 'is_low_carb', 'is_high_fiber',
    'has_artificial_colors', 'has_preservatives', 'has_sweeteners'
  )),
  flag_value BOOLEAN NOT NULL,
  confidence REAL NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  source TEXT NOT NULL CHECK (length(source) <= 50),
  PRIMARY KEY (product_id, flag_type)
);

-- Product Scores: Extensible multi-dimensional scoring system
CREATE TABLE product_scores (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  score_type TEXT NOT NULL CHECK (score_type IN (
    'protein_efficiency', 'calorie_efficiency', 'satiety_score',
    'nutri_score', 'health_score', 'sustainability_score',
    'post_workout_score', 'fat_loss_score', 'budget_score',
    'contextual_score'
  )),
  score_value REAL NOT NULL CHECK (score_value >= 0 AND score_value <= 100),
  context TEXT CHECK (context IN ('training_day', 'rest_day', 'cutting', 'bulking', 'maintenance')),
  computed_at INTEGER NOT NULL,
  metadata TEXT, -- JSON metadata from scoring algorithm
  PRIMARY KEY (product_id, score_type, context)
);

-- Product Additives: E-number and food additive information
CREATE TABLE product_additives (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  e_number TEXT CHECK (e_number IS NULL OR e_number GLOB 'E[0-9][0-9][0-9]*'),
  additive_name TEXT NOT NULL CHECK (length(additive_name) <= 200),
  functional_category TEXT NOT NULL CHECK (length(functional_category) <= 100),
  dutch_category TEXT CHECK (length(dutch_category) <= 100),
  safety_flags TEXT, -- JSON array of safety warnings
  is_natural BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (product_id, e_number, additive_name)
);

-- Product Search Terms: Pre-computed search optimization (optional)
${ENABLE_SEARCH ? `CREATE TABLE product_search_terms (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  term TEXT NOT NULL CHECK (length(term) <= 100),
  term_type TEXT NOT NULL CHECK (term_type IN (
    'name', 'brand', 'ingredient', 'category',
    'synonym', 'alternative_name', 'description',
    'nutritional_tag', 'dietary_flag'
  )),
  weight REAL NOT NULL DEFAULT 50 CHECK (weight >= 0 AND weight <= 100),
  language TEXT NOT NULL DEFAULT 'nl' CHECK (language IN ('nl', 'en')),
  PRIMARY KEY (product_id, term, term_type)
);` : '-- Search disabled: product_search_terms omitted'}

-- =========================================================================
-- PERFORMANCE INDEXES (Tiered)
--   full : all original indexes
--   core : essential high-value indexes only
--   min  : minimal (only those strictly required for main filters)
-- =========================================================================

${INDEX_TIER === 'full' ? `
-- FULL INDEX SET
CREATE INDEX idx_products_price ON products(price_regular);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_updated ON products(updated_at);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path);
CREATE INDEX idx_categories_nested_set ON categories(left_bound, right_bound);
CREATE INDEX idx_categories_depth ON categories(depth);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);
CREATE INDEX idx_product_categories_primary ON product_categories(is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_product_categories_relevance ON product_categories(relevance_score DESC);
CREATE INDEX idx_nutrition_protein ON product_nutrition(protein DESC) WHERE protein IS NOT NULL;
CREATE INDEX idx_nutrition_kcal ON product_nutrition(kcal) WHERE kcal IS NOT NULL;
CREATE INDEX idx_nutrition_carbs ON product_nutrition(carbs) WHERE carbs IS NOT NULL;
CREATE INDEX idx_nutrition_fiber ON product_nutrition(fiber DESC) WHERE fiber IS NOT NULL;
CREATE INDEX idx_flags_type_value ON product_flags(flag_type, flag_value);
CREATE INDEX idx_flags_vegan ON product_flags(product_id) WHERE flag_type = 'is_vegan' AND flag_value = TRUE;
CREATE INDEX idx_flags_halal ON product_flags(product_id) WHERE flag_type = 'is_halal' AND flag_value = TRUE;
CREATE INDEX idx_flags_high_protein ON product_flags(product_id) WHERE flag_type = 'is_high_protein' AND flag_value = TRUE;
CREATE INDEX idx_scores_type_value ON product_scores(score_type, score_value DESC);
CREATE INDEX idx_scores_context ON product_scores(context) WHERE context IS NOT NULL;
CREATE INDEX idx_scores_computed ON product_scores(computed_at);
CREATE INDEX idx_additives_e_number ON product_additives(e_number) WHERE e_number IS NOT NULL;
CREATE INDEX idx_additives_functional ON product_additives(functional_category);
CREATE INDEX idx_additives_natural ON product_additives(is_natural);
${ENABLE_SEARCH ? `CREATE INDEX idx_search_terms_term ON product_search_terms(term);
CREATE INDEX idx_search_terms_type_weight ON product_search_terms(term_type, weight DESC);
CREATE INDEX idx_search_terms_language ON product_search_terms(language);` : ''}
` : INDEX_TIER === 'core' ? `
-- CORE INDEX SET (lean)
CREATE INDEX idx_products_price ON products(price_regular);
CREATE INDEX idx_categories_nested_set ON categories(left_bound, right_bound);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);
CREATE INDEX idx_nutrition_protein ON product_nutrition(protein) WHERE protein IS NOT NULL;
CREATE INDEX idx_nutrition_kcal ON product_nutrition(kcal) WHERE kcal IS NOT NULL;
CREATE INDEX idx_flags_type_value ON product_flags(flag_type, flag_value);
` : `
-- MIN INDEX SET (minimal)
CREATE INDEX idx_categories_nested_set ON categories(left_bound, right_bound);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);
CREATE INDEX idx_flags_type_value ON product_flags(flag_type, flag_value);
`}

-- ============================================================================
-- BUSINESS LOGIC CONSTRAINTS
-- ============================================================================

-- Ensure each product has exactly one primary category
CREATE TRIGGER enforce_single_primary_category
BEFORE INSERT ON product_categories
WHEN NEW.is_primary = TRUE
BEGIN
  UPDATE product_categories
  SET is_primary = FALSE
  WHERE product_id = NEW.product_id AND is_primary = TRUE;
END;

-- Update category product counts when products are assigned/removed
CREATE TRIGGER update_category_count_insert
AFTER INSERT ON product_categories
BEGIN
  UPDATE categories
  SET product_count = product_count + 1
  WHERE id = NEW.category_id;
END;

CREATE TRIGGER update_category_count_delete
AFTER DELETE ON product_categories
BEGIN
  UPDATE categories
  SET product_count = product_count - 1
  WHERE id = OLD.category_id;
END;

-- Invalidate search terms when product name changes
${ENABLE_SEARCH ? `CREATE TRIGGER invalidate_search_terms
AFTER UPDATE OF name ON products
BEGIN
  DELETE FROM product_search_terms
  WHERE product_id = NEW.id AND term_type = 'name';
END;` : '-- Search disabled: invalidate_search_terms trigger omitted'}

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Complete product view with primary category and key flags
CREATE VIEW product_summary AS
SELECT
  p.id,
  p.name,
  p.price_regular,
  p.price_sale,
  c.name as primary_category,
  c.path as category_path,
  pn.protein,
  pn.kcal,
  pn.carbs,
  pn.fat,
  COALESCE(pf_halal.flag_value, FALSE) as is_halal,
  COALESCE(pf_vegan.flag_value, FALSE) as is_vegan,
  COALESCE(pf_protein.flag_value, FALSE) as is_high_protein
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
LEFT JOIN product_flags pf_halal ON p.id = pf_halal.product_id AND pf_halal.flag_type = 'is_halal'
LEFT JOIN product_flags pf_vegan ON p.id = pf_vegan.product_id AND pf_vegan.flag_type = 'is_vegan'
LEFT JOIN product_flags pf_protein ON p.id = pf_protein.product_id AND pf_protein.flag_type = 'is_high_protein';

-- Category hierarchy view for tree navigation
CREATE VIEW category_hierarchy AS
SELECT
  c.*,
  pc.name as parent_name,
  (c.right_bound - c.left_bound - 1) / 2 as descendant_count
FROM categories c
LEFT JOIN categories pc ON c.parent_id = pc.id
ORDER BY c.left_bound;

-- ============================================================================
-- FULL-TEXT SEARCH SETUP
-- ============================================================================

${ENABLE_SEARCH ? `-- Virtual FTS5 table for product search
CREATE VIRTUAL TABLE product_search_fts USING fts5(
  product_id,
  name,
  terms,
  category_path,
  content=product_search_terms,
  tokenize='porter'
);

-- Populate FTS table trigger
CREATE TRIGGER populate_fts_insert
AFTER INSERT ON product_search_terms
BEGIN
  INSERT OR REPLACE INTO product_search_fts(product_id, name, terms, category_path)
  SELECT
    p.id,
    p.name,
    GROUP_CONCAT(pst.term, ' '),
    c.path
  FROM products p
  LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
  LEFT JOIN categories c ON pc.category_id = c.id
  LEFT JOIN product_search_terms pst ON p.id = pst.product_id
  WHERE p.id = NEW.product_id
  GROUP BY p.id;
END;` : '-- Search disabled: FTS and trigger omitted'}

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Query performance statistics view
CREATE VIEW query_performance AS
SELECT 'Total Products' as metric, COUNT(*) as value FROM products
UNION ALL SELECT 'Products with Nutrition', COUNT(*) FROM product_nutrition
UNION ALL SELECT 'Products with Flags', COUNT(DISTINCT product_id) FROM product_flags
UNION ALL SELECT 'Average Flags per Product', CAST(COUNT(*) AS REAL) / COUNT(DISTINCT product_id) FROM product_flags
UNION ALL SELECT 'Categories', COUNT(*) FROM categories
UNION ALL SELECT 'Search Terms', ${ENABLE_SEARCH ? '(SELECT COUNT(*) FROM product_search_terms)' : '0'};

-- Schema validation and integrity check
CREATE VIEW schema_integrity AS
SELECT
  'Orphaned Product Categories' as check_name,
  COUNT(*) as violations
FROM product_categories pc
LEFT JOIN products p ON pc.product_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT
  'Products without Primary Category',
  COUNT(*)
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
WHERE pc.product_id IS NULL
UNION ALL
SELECT
  'Invalid Category Paths',
  COUNT(*)
FROM categories c
WHERE c.path NOT LIKE '%' || c.name || '%'
UNION ALL
SELECT
  'Broken Nested Set Model',
  COUNT(*)
FROM categories c
WHERE c.left_bound >= c.right_bound;
`;

/**
 * Schema configuration metadata
 */
export interface FlexibleSchemaConfig {
  version: string;
  entities: string[];
  totalIndexes: number;
  totalTriggers: number;
  totalViews: number;
  performanceTarget: {
    queryResponseMs: number;
    transformPipelineS: number;
    maxProducts: number;
  };
}

// Dynamic counts based on tier & feature flags
function computeIndexCount(): number {
  if (INDEX_TIER === 'min') return 3; // nested_set, product_categories_category, flags_type_value
  if (INDEX_TIER === 'core') return 6; // + products_price, protein, kcal
  // full
  const base = 24; // all non-search indexes
  return ENABLE_SEARCH ? base + 3 : base; // add search term indexes if enabled
}

function computeTriggerCount(): number {
  // Base triggers: enforce_single_primary_category, update_category_count_insert, update_category_count_delete
  let count = 3;
  if (ENABLE_SEARCH) {
    // invalidate_search_terms + populate_fts_insert
    count += 2;
  }
  return count;
}

export const FLEXIBLE_SCHEMA_CONFIG: FlexibleSchemaConfig = {
  version: '1.0.0',
  entities: [
    'products',
    'categories',
    'product_categories',
    'product_nutrition',
    'product_flags',
    'product_scores',
    'product_additives',
    ...(ENABLE_SEARCH ? ['product_search_terms'] : [])
  ],
  totalIndexes: computeIndexCount(),
  totalTriggers: computeTriggerCount(),
  totalViews: 4,
  performanceTarget: {
    queryResponseMs: 2000, // <2s on 3G
    transformPipelineS: 10, // <10s for 30k products
    maxProducts: 30000
  }
};

/**
 * Database connection interface for SQLite operations
 */
interface DatabaseConnection {
  get(sql: string, params?: unknown[]): Promise<{ name?: string; count?: number }>;
  exec(sql: string): Promise<void>;
}

/**
 * Validates that a database connection has the flexible schema
 */
export async function validateFlexibleSchema(db: DatabaseConnection): Promise<boolean> {
  try {
    // Check that all core tables exist
    for (const entity of FLEXIBLE_SCHEMA_CONFIG.entities) {
      const result = await db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [entity]
      );
      if (!result) {
        console.error(`Missing table: ${entity}`);
        return false;
      }
    }

    // Check that indexes exist
    const indexCount = await db.get(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='index' AND sql IS NOT NULL"
    );
    const foundIndexes = indexCount?.count ?? 0;
    if (foundIndexes < FLEXIBLE_SCHEMA_CONFIG.totalIndexes) {
      console.error(`Expected ${FLEXIBLE_SCHEMA_CONFIG.totalIndexes} indexes, found ${foundIndexes}`);
      return false;
    }

    // Check that views exist
    const viewCount = await db.get(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='view'"
    );
    const foundViews = viewCount?.count ?? 0;
    if (foundViews < FLEXIBLE_SCHEMA_CONFIG.totalViews) {
      console.error(`Expected ${FLEXIBLE_SCHEMA_CONFIG.totalViews} views, found ${foundViews}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Schema validation error:', error);
    return false;
  }
}

/**
 * Creates the flexible schema in the provided database connection
 */
export async function createFlexibleSchema(db: DatabaseConnection): Promise<void> {
  try {
    // Execute the complete schema SQL
    await db.exec(FLEXIBLE_SCHEMA_SQL);

    console.log('✅ Flexible schema created successfully');
    console.log(`   - ${FLEXIBLE_SCHEMA_CONFIG.entities.length} tables`);
    console.log(`   - ${FLEXIBLE_SCHEMA_CONFIG.totalIndexes} indexes`);
    console.log(`   - ${FLEXIBLE_SCHEMA_CONFIG.totalTriggers} triggers`);
    console.log(`   - ${FLEXIBLE_SCHEMA_CONFIG.totalViews} views`);
  } catch (error) {
    console.error('❌ Failed to create flexible schema:', error);
    throw error;
  }
}
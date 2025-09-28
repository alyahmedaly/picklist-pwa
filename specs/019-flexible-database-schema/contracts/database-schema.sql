-- Database Schema Contract: Flexible Product Database
-- Feature: 019-flexible-database-schema
-- Date: 2025-09-22
-- Purpose: Define normalized relational schema for multi-dimensional product filtering

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
  PRIMARY KEY (product_id, score_type, COALESCE(context, ''))
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
  PRIMARY KEY (product_id, COALESCE(e_number, ''), additive_name)
);

-- Product Search Terms: Pre-computed search optimization
CREATE TABLE product_search_terms (
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
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Product indexes for basic filtering and sorting
CREATE INDEX idx_products_price ON products(price_regular);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_updated ON products(updated_at);

-- Category indexes for hierarchical operations
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path);
CREATE INDEX idx_categories_nested_set ON categories(left_bound, right_bound);
CREATE INDEX idx_categories_depth ON categories(depth);

-- Product-category indexes for filtering and primary category queries
CREATE INDEX idx_product_categories_category ON product_categories(category_id);
CREATE INDEX idx_product_categories_primary ON product_categories(is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_product_categories_relevance ON product_categories(relevance_score DESC);

-- Nutrition indexes for nutritional filtering (most critical for performance)
CREATE INDEX idx_nutrition_protein ON product_nutrition(protein DESC) WHERE protein IS NOT NULL;
CREATE INDEX idx_nutrition_kcal ON product_nutrition(kcal) WHERE kcal IS NOT NULL;
CREATE INDEX idx_nutrition_carbs ON product_nutrition(carbs) WHERE carbs IS NOT NULL;
CREATE INDEX idx_nutrition_fiber ON product_nutrition(fiber DESC) WHERE fiber IS NOT NULL;

-- Flag indexes for dietary filtering (partial indexes for efficiency)
CREATE INDEX idx_flags_type_value ON product_flags(flag_type, flag_value);
CREATE INDEX idx_flags_vegan ON product_flags(product_id) WHERE flag_type = 'is_vegan' AND flag_value = TRUE;
CREATE INDEX idx_flags_halal ON product_flags(product_id) WHERE flag_type = 'is_halal' AND flag_value = TRUE;
CREATE INDEX idx_flags_high_protein ON product_flags(product_id) WHERE flag_type = 'is_high_protein' AND flag_value = TRUE;

-- Score indexes for performance-critical queries
CREATE INDEX idx_scores_type_value ON product_scores(score_type, score_value DESC);
CREATE INDEX idx_scores_context ON product_scores(context) WHERE context IS NOT NULL;
CREATE INDEX idx_scores_computed ON product_scores(computed_at);

-- Additive indexes for E-number and safety filtering
CREATE INDEX idx_additives_e_number ON product_additives(e_number) WHERE e_number IS NOT NULL;
CREATE INDEX idx_additives_functional ON product_additives(functional_category);
CREATE INDEX idx_additives_natural ON product_additives(is_natural);

-- Search term indexes for full-text search optimization
CREATE INDEX idx_search_terms_term ON product_search_terms(term);
CREATE INDEX idx_search_terms_type_weight ON product_search_terms(term_type, weight DESC);
CREATE INDEX idx_search_terms_language ON product_search_terms(language);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Ali's most common query: halal + high protein + price filtering
CREATE INDEX idx_halal_protein_price ON product_flags pf1, product_flags pf2, products p
WHERE pf1.product_id = p.id
  AND pf2.product_id = p.id
  AND pf1.flag_type = 'is_halal'
  AND pf1.flag_value = TRUE
  AND pf2.flag_type = 'is_high_protein'
  AND pf2.flag_value = TRUE;

-- Category + nutrition filtering (e.g., dairy products with high protein)
CREATE INDEX idx_category_nutrition ON product_categories pc, product_nutrition pn
WHERE pc.product_id = pn.product_id;

-- Score-based filtering with context
CREATE INDEX idx_contextual_scores ON product_scores(score_type, context, score_value DESC)
WHERE context IS NOT NULL;

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
CREATE TRIGGER invalidate_search_terms
AFTER UPDATE OF name ON products
BEGIN
  DELETE FROM product_search_terms
  WHERE product_id = NEW.id AND term_type = 'name';
END;

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

-- Virtual FTS5 table for product search
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
  INSERT INTO product_search_fts(product_id, name, terms, category_path)
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
END;

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Query performance statistics view
CREATE VIEW query_performance AS
SELECT
  'Total Products' as metric,
  COUNT(*) as value
FROM products
UNION ALL
SELECT
  'Products with Nutrition',
  COUNT(*)
FROM product_nutrition
UNION ALL
SELECT
  'Products with Flags',
  COUNT(DISTINCT product_id)
FROM product_flags
UNION ALL
SELECT
  'Average Flags per Product',
  CAST(COUNT(*) AS REAL) / COUNT(DISTINCT product_id)
FROM product_flags
UNION ALL
SELECT
  'Categories',
  COUNT(*)
FROM categories
UNION ALL
SELECT
  'Search Terms',
  COUNT(*)
FROM product_search_terms;

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
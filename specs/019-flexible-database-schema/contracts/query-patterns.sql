-- Query Patterns Contract: Multi-dimensional Product Filtering
-- Feature: 019-flexible-database-schema
-- Date: 2025-09-22
-- Purpose: Define standard query patterns for complex product filtering

-- ============================================================================
-- CORE QUERY PATTERNS
-- ============================================================================

-- 1. Basic Product Search with Filters
-- Returns products matching text search + basic filters
-- Performance: <100ms for 30k products
SELECT
  p.id,
  p.name,
  p.price_regular,
  c.name as category,
  pn.protein,
  pn.kcal
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
WHERE p.name LIKE ? -- Text search parameter
  AND p.price_regular <= ? -- Price filter
  AND (pn.protein IS NULL OR pn.protein >= ?) -- Protein filter
ORDER BY p.name
LIMIT 50;

-- 2. Multi-dimensional Flag Filtering
-- Returns products matching multiple boolean flags
-- Performance: <200ms with proper indexing
SELECT
  p.id,
  p.name,
  p.price_regular,
  pn.protein,
  pn.kcal
FROM products p
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
WHERE p.id IN (
  SELECT pf1.product_id
  FROM product_flags pf1
  WHERE pf1.flag_type = 'is_halal' AND pf1.flag_value = TRUE
)
AND p.id IN (
  SELECT pf2.product_id
  FROM product_flags pf2
  WHERE pf2.flag_type = 'is_high_protein' AND pf2.flag_value = TRUE
)
AND p.id IN (
  SELECT pf3.product_id
  FROM product_flags pf3
  WHERE pf3.flag_type = 'is_vegan' AND pf3.flag_value = TRUE
)
ORDER BY pn.protein DESC NULLS LAST
LIMIT 100;

-- 3. Category Hierarchy Navigation
-- Returns products in category and all subcategories
-- Performance: <150ms using nested set model
SELECT DISTINCT
  p.id,
  p.name,
  p.price_regular,
  c_primary.name as primary_category,
  c_primary.path
FROM products p
JOIN product_categories pc ON p.id = pc.product_id
JOIN categories c ON pc.category_id = c.id
LEFT JOIN product_categories pc_primary ON p.id = pc_primary.product_id AND pc_primary.is_primary = TRUE
LEFT JOIN categories c_primary ON pc_primary.category_id = c_primary.id
WHERE c.left_bound >= (
  SELECT left_bound FROM categories WHERE id = ? -- Parent category ID
)
AND c.right_bound <= (
  SELECT right_bound FROM categories WHERE id = ? -- Parent category ID
)
ORDER BY p.name
LIMIT 200;

-- 4. Contextual Scoring Query
-- Returns products ranked by contextual scores
-- Performance: <300ms with score indexes
SELECT
  p.id,
  p.name,
  p.price_regular,
  ps.score_value,
  ps.context,
  pn.protein,
  pn.kcal
FROM products p
JOIN product_scores ps ON p.id = ps.product_id
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
WHERE ps.score_type = ? -- Score type (e.g., 'protein_efficiency')
  AND (ps.context = ? OR ps.context IS NULL) -- Context filter
  AND ps.score_value >= ? -- Minimum score threshold
ORDER BY ps.score_value DESC
LIMIT 50;

-- 5. Advanced Nutritional Filtering
-- Returns products meeting complex nutritional criteria
-- Performance: <250ms with nutrition indexes
SELECT
  p.id,
  p.name,
  p.price_regular,
  pn.protein,
  pn.carbs,
  pn.fat,
  pn.kcal,
  -- Computed metrics
  ROUND(pn.protein * 4.0 / pn.kcal * 100, 1) as protein_percentage,
  ROUND(pn.carbs / NULLIF(pn.protein, 0), 2) as carb_protein_ratio
FROM products p
JOIN product_nutrition pn ON p.id = pn.product_id
WHERE pn.protein >= ? -- Minimum protein
  AND pn.kcal <= ? -- Maximum calories
  AND pn.carbs / NULLIF(pn.protein, 0) BETWEEN ? AND ? -- Carb:protein ratio range
  AND pn.fiber >= ? -- Minimum fiber
ORDER BY pn.protein DESC, pn.kcal
LIMIT 100;

-- 6. E-number and Additive Filtering
-- Returns products filtered by additives and safety concerns
-- Performance: <200ms with additive indexes
SELECT
  p.id,
  p.name,
  p.price_regular,
  GROUP_CONCAT(pa.e_number) as e_numbers,
  GROUP_CONCAT(pa.functional_category) as categories,
  COUNT(pa.e_number) as additive_count
FROM products p
LEFT JOIN product_additives pa ON p.id = pa.product_id
WHERE p.id NOT IN (
  -- Exclude products with harmful additives
  SELECT DISTINCT product_id
  FROM product_additives
  WHERE e_number IN ('E102', 'E104', 'E110', 'E122', 'E124', 'E129') -- Southampton Six
)
AND (
  ? = FALSE OR -- Include all products flag
  pa.is_natural = TRUE -- Natural additives only
)
GROUP BY p.id, p.name, p.price_regular
HAVING COUNT(pa.e_number) <= ? -- Maximum additive count
ORDER BY additive_count, p.name
LIMIT 100;

-- ============================================================================
-- FULL-TEXT SEARCH PATTERNS
-- ============================================================================

-- 7. Full-Text Search with Relevance Ranking
-- Returns products matching search terms with relevance scoring
-- Performance: <400ms using FTS5
SELECT
  p.id,
  p.name,
  p.price_regular,
  c.name as category,
  bm25(product_search_fts) as relevance_score
FROM product_search_fts
JOIN products p ON product_search_fts.product_id = p.id
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
LEFT JOIN categories c ON pc.category_id = c.id
WHERE product_search_fts MATCH ? -- Search query
ORDER BY relevance_score
LIMIT 100;

-- 8. Combined Search and Filter
-- Full-text search with additional filtering
-- Performance: <500ms combining FTS with filters
SELECT
  p.id,
  p.name,
  p.price_regular,
  c.name as category,
  pn.protein,
  bm25(product_search_fts) as relevance_score
FROM product_search_fts
JOIN products p ON product_search_fts.product_id = p.id
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
WHERE product_search_fts MATCH ? -- Search query
  AND p.price_regular <= ? -- Price filter
  AND EXISTS (
    SELECT 1 FROM product_flags pf
    WHERE pf.product_id = p.id
      AND pf.flag_type = 'is_halal'
      AND pf.flag_value = TRUE
  )
ORDER BY relevance_score, pn.protein DESC NULLS LAST
LIMIT 50;

-- ============================================================================
-- AGGREGATION AND ANALYTICS PATTERNS
-- ============================================================================

-- 9. Category Statistics
-- Returns category-level analytics for navigation
-- Performance: <100ms with materialized counts
SELECT
  c.id,
  c.name,
  c.path,
  c.depth,
  c.product_count,
  AVG(pn.protein) as avg_protein,
  AVG(p.price_regular) as avg_price,
  COUNT(CASE WHEN pf.flag_type = 'is_halal' AND pf.flag_value = TRUE THEN 1 END) as halal_count
FROM categories c
LEFT JOIN product_categories pc ON c.id = pc.category_id
LEFT JOIN products p ON pc.product_id = p.id
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
LEFT JOIN product_flags pf ON p.id = pf.product_id
WHERE c.depth = ? -- Category depth level
GROUP BY c.id, c.name, c.path, c.depth, c.product_count
HAVING c.product_count > 0
ORDER BY c.product_count DESC, c.name;

-- 10. Score Distribution Analysis
-- Returns score statistics for algorithm validation
-- Performance: <200ms with score indexes
SELECT
  score_type,
  context,
  COUNT(*) as product_count,
  MIN(score_value) as min_score,
  MAX(score_value) as max_score,
  AVG(score_value) as avg_score,
  -- Percentiles using window functions
  PERCENTILE_25(score_value) as p25_score,
  PERCENTILE_50(score_value) as median_score,
  PERCENTILE_75(score_value) as p75_score
FROM product_scores
WHERE computed_at >= ? -- Recent scores only
GROUP BY score_type, context
ORDER BY score_type, context;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION PATTERNS
-- ============================================================================

-- 11. Efficient Flag Combination Query
-- Optimized version of multi-flag filtering using EXISTS
-- Performance: <150ms vs 200ms+ for IN subqueries
SELECT
  p.id,
  p.name,
  p.price_regular,
  pn.protein
FROM products p
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
WHERE EXISTS (
  SELECT 1 FROM product_flags pf1
  WHERE pf1.product_id = p.id
    AND pf1.flag_type = 'is_halal'
    AND pf1.flag_value = TRUE
)
AND EXISTS (
  SELECT 1 FROM product_flags pf2
  WHERE pf2.product_id = p.id
    AND pf2.flag_type = 'is_high_protein'
    AND pf2.flag_value = TRUE
)
AND NOT EXISTS (
  SELECT 1 FROM product_flags pf3
  WHERE pf3.product_id = p.id
    AND pf3.flag_type = 'has_artificial_colors'
    AND pf3.flag_value = TRUE
)
ORDER BY pn.protein DESC NULLS LAST
LIMIT 100;

-- 12. Pagination with Stable Sorting
-- Ensures consistent pagination results
-- Performance: <100ms with proper indexes
SELECT
  p.id,
  p.name,
  p.price_regular,
  pn.protein,
  c.name as category
FROM products p
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
LEFT JOIN categories c ON pc.category_id = c.id
WHERE (pn.protein, p.id) < (?, ?) -- Cursor-based pagination
  AND pn.protein IS NOT NULL
ORDER BY pn.protein DESC, p.id DESC
LIMIT 50;

-- ============================================================================
-- COMPLEX FILTERING COMBINATIONS
-- ============================================================================

-- 13. Ali's Ultimate Filter Query
-- Combines all major filter dimensions for complex searches
-- Performance target: <2000ms (constitutional requirement)
WITH filtered_products AS (
  SELECT DISTINCT p.id
  FROM products p
  JOIN product_nutrition pn ON p.id = pn.product_id
  WHERE p.price_regular <= ? -- Price filter
    AND pn.protein >= ? -- Protein minimum
    AND pn.kcal <= ? -- Calorie maximum
    AND EXISTS (
      SELECT 1 FROM product_flags pf
      WHERE pf.product_id = p.id
        AND pf.flag_type = 'is_halal'
        AND pf.flag_value = TRUE
    )
    AND NOT EXISTS (
      SELECT 1 FROM product_additives pa
      WHERE pa.product_id = p.id
        AND pa.e_number IN ('E102', 'E104', 'E110', 'E122', 'E124', 'E129')
    )
    AND EXISTS (
      SELECT 1 FROM product_categories pc
      JOIN categories c ON pc.category_id = c.id
      WHERE pc.product_id = p.id
        AND c.path LIKE ? -- Category filter
    )
)
SELECT
  p.id,
  p.name,
  p.price_regular,
  c.name as category,
  pn.protein,
  pn.kcal,
  pn.carbs,
  ps.score_value as efficiency_score,
  -- Computed ranking
  ROW_NUMBER() OVER (
    ORDER BY ps.score_value DESC, pn.protein DESC, p.price_regular
  ) as rank
FROM filtered_products fp
JOIN products p ON fp.id = p.id
LEFT JOIN product_categories pc ON p.id = pc.product_id AND pc.is_primary = TRUE
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN product_nutrition pn ON p.id = pn.product_id
LEFT JOIN product_scores ps ON p.id = ps.product_id
  AND ps.score_type = 'protein_efficiency'
  AND (ps.context = ? OR ps.context IS NULL)
ORDER BY rank
LIMIT 100;

-- ============================================================================
-- EXPLAIN QUERY PLAN VALIDATION
-- ============================================================================

-- Query plan validation for performance-critical queries
-- These should be run during testing to ensure proper index usage

-- Validate basic search uses proper indexes
EXPLAIN QUERY PLAN
SELECT * FROM products
WHERE price_regular <= 5.0
  AND name LIKE '%protein%';

-- Validate flag filtering uses partial indexes
EXPLAIN QUERY PLAN
SELECT p.* FROM products p
WHERE EXISTS (
  SELECT 1 FROM product_flags pf
  WHERE pf.product_id = p.id
    AND pf.flag_type = 'is_halal'
    AND pf.flag_value = TRUE
);

-- Validate category hierarchy uses nested set indexes
EXPLAIN QUERY PLAN
SELECT * FROM categories
WHERE left_bound >= 10 AND right_bound <= 50;

-- Validate nutrition filtering uses covering indexes
EXPLAIN QUERY PLAN
SELECT p.id, p.name, pn.protein
FROM products p
JOIN product_nutrition pn ON p.id = pn.product_id
WHERE pn.protein >= 20
ORDER BY pn.protein DESC;

-- ============================================================================
-- PERFORMANCE BENCHMARKS
-- ============================================================================

-- Benchmark queries for performance validation
-- Target: All queries <2000ms on 30k products

-- Benchmark 1: Simple product search (target: <100ms)
.timer ON
SELECT COUNT(*) FROM products WHERE name LIKE '%protein%';

-- Benchmark 2: Multi-flag filtering (target: <200ms)
.timer ON
SELECT COUNT(*) FROM products p
WHERE EXISTS (SELECT 1 FROM product_flags pf WHERE pf.product_id = p.id AND pf.flag_type = 'is_halal' AND pf.flag_value = TRUE)
  AND EXISTS (SELECT 1 FROM product_flags pf WHERE pf.product_id = p.id AND pf.flag_type = 'is_high_protein' AND pf.flag_value = TRUE);

-- Benchmark 3: Category filtering (target: <150ms)
.timer ON
SELECT COUNT(*) FROM products p
JOIN product_categories pc ON p.id = pc.product_id
JOIN categories c ON pc.category_id = c.id
WHERE c.path LIKE 'dairy%';

-- Benchmark 4: Complex nutritional query (target: <300ms)
.timer ON
SELECT COUNT(*) FROM products p
JOIN product_nutrition pn ON p.id = pn.product_id
WHERE pn.protein >= 15 AND pn.kcal <= 200 AND pn.carbs / NULLIF(pn.protein, 0) BETWEEN 2.0 AND 4.0;

-- Benchmark 5: Full-text search (target: <400ms)
.timer ON
SELECT COUNT(*) FROM product_search_fts WHERE product_search_fts MATCH 'protein powder';

.timer OFF
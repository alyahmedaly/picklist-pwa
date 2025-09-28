# Data Model: Flexible Database Schema

**Feature**: 019-flexible-database-schema
**Date**: 2025-09-22
**Status**: Complete

## Entity Overview

The flexible database schema consists of 8 core entities organized in a normalized relational structure with strategic denormalization for performance.

```
products (1) ──< product_categories (N) >── (1) categories
products (1) ──< product_ingredients (N)
products (1) ──< product_nutrition (1)
products (1) ──< product_flags (N)
products (1) ──< product_scores (N)
products (1) ──< product_additives (N)
products (1) ──< product_search_terms (N)
```

---

## Core Entities

### 1. Products (Primary Entity)

**Purpose**: Core product identity and basic attributes

```typescript
interface Product {
  id: string;                    // Primary key, unique identifier
  name: string;                  // Product name (Dutch/English)
  price_regular: number;         // Regular price in euros
  price_sale?: number;           // Sale price (optional)
  unit_amount: number;           // Package amount (e.g., 500)
  unit_type: string;             // Unit type (g, ml, pieces)
  brand?: string;                // Brand name (optional)
  created_at: number;            // Unix timestamp
  updated_at: number;            // Unix timestamp
}
```

**Validation Rules**:
- `id`: Non-empty string, unique across dataset
- `name`: Non-empty string, max 200 characters
- `price_regular`: Positive number, max 999.99
- `unit_amount`: Positive number
- `unit_type`: Enum ['g', 'ml', 'pieces', 'kg', 'l']

**Indexes**:
- PRIMARY KEY (id)
- INDEX (price_regular) for price-based filtering
- INDEX (name) for name-based sorting

### 2. Categories (Hierarchical Structure)

**Purpose**: Product categorization with hierarchical relationships

```typescript
interface Category {
  id: string;                    // Primary key (UUID)
  name: string;                  // Category name
  parent_id?: string;            // Foreign key to parent category
  path: string;                  // Materialized path: 'parent/child/grandchild'
  depth: number;                 // Tree depth (0 = root, 1 = child, etc.)
  left_bound: number;            // Nested set left boundary
  right_bound: number;           // Nested set right boundary
  product_count: number;         // Cached product count in category
  display_order: number;         // Sort order within parent
}
```

**Validation Rules**:
- `path`: Forward slash separated, matches parent-child relationship
- `depth`: Non-negative integer, consistent with path depth
- `left_bound < right_bound`: Nested set model integrity
- `parent_id`: Must exist in categories table or be null (root)

**Indexes**:
- PRIMARY KEY (id)
- INDEX (parent_id) for parent-child queries
- INDEX (path) for breadcrumb and subtree queries
- INDEX (left_bound, right_bound) for nested set queries

### 3. ProductCategories (Junction Table)

**Purpose**: Many-to-many relationship between products and categories

```typescript
interface ProductCategory {
  product_id: string;            // Foreign key to products
  category_id: string;           // Foreign key to categories
  is_primary: boolean;           // True for primary category assignment
  relevance_score: number;       // 0-100, category relevance to product
}
```

**Validation Rules**:
- `product_id`: Must exist in products table
- `category_id`: Must exist in categories table
- Only one `is_primary: true` per product_id
- `relevance_score`: 0-100 range

**Indexes**:
- PRIMARY KEY (product_id, category_id)
- INDEX (category_id) for category-based filtering
- INDEX (is_primary) for primary category queries

### 4. ProductNutrition (Nutrition Data)

**Purpose**: Structured nutritional information per 100g

```typescript
interface ProductNutrition {
  product_id: string;            // Foreign key to products (1:1)
  kcal?: number;                 // Energy in kcal per 100g
  kj?: number;                   // Energy in kJ per 100g
  protein?: number;              // Protein in grams per 100g
  carbs?: number;                // Carbohydrates in grams per 100g
  sugars?: number;               // Sugars in grams per 100g
  fat?: number;                  // Fat in grams per 100g
  saturated_fat?: number;        // Saturated fat in grams per 100g
  fiber?: number;                // Fiber in grams per 100g
  salt?: number;                 // Salt in grams per 100g
  sodium?: number;               // Sodium in mg per 100g
}
```

**Validation Rules**:
- `product_id`: Must exist in products table, unique (1:1 relationship)
- All nutrition values: Non-negative numbers when present
- Logical constraints: `sugars <= carbs`, `saturated_fat <= fat`

**Indexes**:
- PRIMARY KEY (product_id)
- INDEX (protein) for protein-based filtering
- INDEX (kcal) for calorie-based filtering
- INDEX (carbs) for carb-based filtering

### 5. ProductFlags (Boolean Classifications)

**Purpose**: Boolean dietary and classification flags

```typescript
interface ProductFlag {
  product_id: string;            // Foreign key to products
  flag_type: string;             // Flag category/type
  flag_value: boolean;           // True/false value
  confidence: number;            // 0-100 confidence score
  source: string;                // Source of flag determination
}
```

**Flag Types**:
- `is_vegan`, `is_vegetarian`, `is_gluten_free`, `is_lactose_free`
- `is_halal`, `is_kosher`, `is_organic`
- `is_high_protein`, `is_low_carb`, `is_high_fiber`
- `has_artificial_colors`, `has_preservatives`, `has_sweeteners`

**Validation Rules**:
- `product_id`: Must exist in products table
- `flag_type`: Must be from approved flag type enum
- `confidence`: 0-100 range
- `source`: Non-empty string (algorithm, manual, api, etc.)

**Indexes**:
- PRIMARY KEY (product_id, flag_type)
- INDEX (flag_type, flag_value) for filtering by flag type
- INDEX (flag_value) for boolean filtering

### 6. ProductScores (Extensible Scoring)

**Purpose**: Multi-dimensional scoring system supporting various algorithms

```typescript
interface ProductScore {
  product_id: string;            // Foreign key to products
  score_type: string;            // Score algorithm identifier
  score_value: number;           // Normalized 0-100 score
  context?: string;              // Contextual modifier (training_day, cutting, etc.)
  computed_at: number;           // Unix timestamp for cache invalidation
  metadata?: string;             // JSON metadata from scoring algorithm
}
```

**Score Types**:
- `protein_efficiency`, `calorie_efficiency`, `satiety_score`
- `nutri_score`, `health_score`, `sustainability_score`
- `post_workout_score`, `fat_loss_score`, `budget_score`
- `contextual_score` (requires context field)

**Validation Rules**:
- `product_id`: Must exist in products table
- `score_value`: 0-100 range for normalized scores
- `score_type`: Must be from approved score type registry
- `computed_at`: Valid Unix timestamp

**Indexes**:
- PRIMARY KEY (product_id, score_type, context)
- INDEX (score_type, score_value DESC) for top-N queries
- INDEX (context) for contextual filtering

### 7. ProductAdditives (E-number and Additive Data)

**Purpose**: Food additive and E-number information

```typescript
interface ProductAdditive {
  product_id: string;            // Foreign key to products
  e_number?: string;             // E-number (E300, E330, etc.)
  additive_name: string;         // Additive name (ascorbic acid, etc.)
  functional_category: string;   // EU functional category
  dutch_category?: string;       // Dutch category name
  safety_flags: string;          // JSON array of safety warnings
  is_natural: boolean;           // Natural vs synthetic origin
}
```

**Validation Rules**:
- `product_id`: Must exist in products table
- `e_number`: Pattern /^E\d{3,4}$/ when present
- `functional_category`: Must be from EU approved categories
- `safety_flags`: Valid JSON array format

**Indexes**:
- PRIMARY KEY (product_id, e_number, additive_name)
- INDEX (e_number) for E-number filtering
- INDEX (functional_category) for category filtering
- INDEX (is_natural) for natural/synthetic filtering

### 8. ProductSearchTerms (Search Optimization)

**Purpose**: Pre-computed search terms for full-text search optimization

```typescript
interface ProductSearchTerm {
  product_id: string;            // Foreign key to products
  term: string;                  // Search term (word or phrase)
  term_type: string;             // Term category
  weight: number;                // Search weight/relevance (0-100)
  language: string;              // Term language (nl, en)
}
```

**Term Types**:
- `name`, `brand`, `ingredient`, `category`
- `synonym`, `alternative_name`, `description`
- `nutritional_tag`, `dietary_flag`

**Validation Rules**:
- `product_id`: Must exist in products table
- `term`: Non-empty, max 100 characters, normalized (lowercase)
- `weight`: 0-100 range
- `language`: ISO 639-1 language code

**Indexes**:
- PRIMARY KEY (product_id, term, term_type)
- INDEX (term) for term-based search
- INDEX (term_type, weight DESC) for weighted search

---

## State Transitions

### Product Lifecycle
```
[New] → [Validated] → [Categorized] → [Scored] → [Indexed] → [Active]
           ↓              ↓             ↓          ↓
      [Validation    [Category    [Score      [Search
       Failed]        Assignment] Update]     Reindex]
```

### Category Tree Operations
```
[Create Category] → [Assign Position] → [Update Nested Set] → [Recompute Paths]
[Move Category] → [Update Children Paths] → [Recompute Nested Set] → [Update Product Counts]
[Delete Category] → [Reassign Products] → [Update Tree Structure]
```

### Scoring Pipeline
```
[Product Changed] → [Mark Scores Stale] → [Recompute Scores] → [Update Search Index]
[New Algorithm] → [Compute All Products] → [Validate Results] → [Activate Scores]
```

---

## Data Integrity Constraints

### Referential Integrity
- All foreign keys must reference valid primary keys
- Cascade delete for dependent entities (scores, flags, etc.)
- Restrict delete for referenced entities (categories with products)

### Business Logic Constraints
- Product must have at least one category assignment
- Primary category must be leaf node (no children)
- Nutrition values must be logical (sugars ≤ carbs, etc.)
- Score values must be within valid ranges per algorithm

### Performance Constraints
- Maximum 50 search terms per product
- Maximum 20 scores per product per context
- Category tree depth limited to 6 levels
- Product name length limited to 200 characters

---

## Migration Strategy

### From Current Schema
1. **Extract Data**: Parse existing monolithic product records
2. **Normalize**: Split data into appropriate entity tables
3. **Validate**: Apply integrity constraints and business rules
4. **Index**: Create optimized indexes for query patterns
5. **Verify**: Run contract tests to validate schema compliance

### Data Transformation Rules
- `categories` array → `product_categories` junction table
- `nutritionalTags` → `product_flags` with confidence scores
- Nested scoring objects → `product_scores` with normalized values
- `ingredients` array → search terms + additive extraction
- Complex JSON → appropriate normalized tables with JSON fallback

This data model provides the foundation for efficient multi-dimensional filtering while maintaining constitutional compliance and performance requirements.
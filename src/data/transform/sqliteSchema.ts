/**
 * SQLite Schema Definition for Ali's Product Database
 *
 * Optimized for OPFS performance with strategic indexing for Ali's
 * common query patterns: halal + protein + price efficiency filtering.
 */

export interface SQLiteSchemaConfig {
  version: string;
  vfsOptions: string[];
  tables: Record<string, TableDefinition>;
  indexes: IndexDefinition[];
  aliQueries: Record<string, string>;
}

export interface TableDefinition {
  name: string;
  description: string;
  fields: Record<string, FieldDefinition>;
}

export interface FieldDefinition {
  type: 'TEXT' | 'REAL' | 'INTEGER' | 'BLOB';
  nullable?: boolean;
  primaryKey?: boolean;
  description: string;
  computed?: string;
  values?: string[];
}

export interface IndexDefinition {
  name: string;
  table: string;
  columns: string[];
  unique?: boolean;
  description: string;
}

/**
 * Complete schema definition optimized for Ali's CrossFit nutrition needs.
 */
export const SQLITE_SCHEMA: SQLiteSchemaConfig = {
  version: '1.0.0',
  vfsOptions: ['AccessHandlePoolVFS', 'OPFSAdaptiveVFS', 'IDBBatchAtomicVFS'],

  tables: {
    products: {
      name: 'products',
      description: 'Main product data with Ali-optimized fields for fast querying',
      fields: {
        // Core identification
        id: {
          type: 'TEXT',
          primaryKey: true,
          description: 'Unique product identifier'
        },
        name: {
          type: 'TEXT',
          description: 'Product name (Dutch/English)'
        },

        // Pricing data
        price_regular: {
          type: 'REAL',
          description: 'Regular price in euros'
        },
        price_sale: {
          type: 'REAL',
          nullable: true,
          description: 'Sale price in euros (if on sale)'
        },

        // Core nutrition (most important for Ali)
        protein_per_100g: {
          type: 'REAL',
          nullable: true,
          description: 'Protein content in grams per 100g'
        },
        kcal_per_100g: {
          type: 'REAL',
          nullable: true,
          description: 'Energy content in kcal per 100g'
        },
        carbs_per_100g: {
          type: 'REAL',
          nullable: true,
          description: 'Carbohydrate content in grams per 100g'
        },
        fat_per_100g: {
          type: 'REAL',
          nullable: true,
          description: 'Fat content in grams per 100g'
        },
        fiber_per_100g: {
          type: 'REAL',
          nullable: true,
          description: 'Fiber content in grams per 100g'
        },
        salt_per_100g: {
          type: 'REAL',
          nullable: true,
          description: 'Salt content in grams per 100g'
        },

        // Halal compliance (critical for Ali)
        halal_status: {
          type: 'TEXT',
          nullable: true,
          description: 'Halal compliance status',
          values: ['halal', 'haram', 'questionable', 'unknown']
        },
        halal_confidence: {
          type: 'TEXT',
          nullable: true,
          description: 'Confidence level in halal analysis',
          values: ['high', 'medium', 'low']
        },

        // Categorization
        categories_json: {
          type: 'TEXT',
          nullable: true,
          description: 'JSON array of category breadcrumbs for LIKE queries'
        },
        primary_category: {
          type: 'TEXT',
          nullable: true,
          description: 'Primary category for fast filtering'
        },

        // Nutritional tags (boolean flags as integers for indexing)
        is_vegan: {
          type: 'INTEGER',
          nullable: true,
          description: 'Vegan flag (0/1)'
        },
        is_vegetarian: {
          type: 'INTEGER',
          nullable: true,
          description: 'Vegetarian flag (0/1)'
        },
        is_gluten_free: {
          type: 'INTEGER',
          nullable: true,
          description: 'Gluten-free flag (0/1)'
        },
        is_lactose_free: {
          type: 'INTEGER',
          nullable: true,
          description: 'Lactose-free flag (0/1)'
        },
        is_high_protein: {
          type: 'INTEGER',
          nullable: true,
          description: 'High protein flag (≥20g/100g) (0/1)'
        },
        is_low_carb: {
          type: 'INTEGER',
          nullable: true,
          description: 'Low carb flag (<10g net carbs/100g) (0/1)'
        },
        is_high_fiber: {
          type: 'INTEGER',
          nullable: true,
          description: 'High fiber flag (≥6g/100g) (0/1)'
        },

        // Ali-specific computed metrics (pre-calculated for speed)
        protein_efficiency: {
          type: 'REAL',
          nullable: true,
          computed: 'price_regular / NULLIF(protein_per_100g, 0)',
          description: 'Price per gram of protein (euros/g) - lower is better'
        },
        calorie_efficiency: {
          type: 'REAL',
          nullable: true,
          computed: 'price_regular / NULLIF(kcal_per_100g, 0)',
          description: 'Price per kcal - lower is better for bulking'
        },
        satiety_per_kcal: {
          type: 'REAL',
          nullable: true,
          description: 'Satiety score per kcal - higher is better for cutting'
        },
        carb_protein_ratio: {
          type: 'REAL',
          nullable: true,
          computed: 'carbs_per_100g / NULLIF(protein_per_100g, 0)',
          description: 'Carb to protein ratio - important for post-workout'
        },

        // Additional metadata
        ingredients_json: {
          type: 'TEXT',
          nullable: true,
          description: 'JSON array of ingredients'
        },
        allergens_json: {
          type: 'TEXT',
          nullable: true,
          description: 'JSON object with allergen information'
        },
        additive_flags_json: {
          type: 'TEXT',
          nullable: true,
          description: 'JSON object with additive safety flags'
        },

        // Search optimization
        search_text: {
          type: 'TEXT',
          nullable: true,
          description: 'Searchable text combining name, categories, ingredients'
        }
      }
    }
  },

  indexes: [
    // Core Ali query patterns
    {
      name: 'idx_halal_protein',
      table: 'products',
      columns: ['halal_status', 'protein_per_100g'],
      description: 'Fast halal + high protein queries (Ali\'s most common pattern)'
    },
    {
      name: 'idx_protein_efficiency',
      table: 'products',
      columns: ['protein_efficiency'],
      description: 'Budget-conscious protein shopping'
    },
    {
      name: 'idx_high_protein_foods',
      table: 'products',
      columns: ['is_high_protein', 'protein_per_100g'],
      description: 'Quick high-protein food discovery'
    },

    // Category and dietary filtering
    {
      name: 'idx_primary_category',
      table: 'products',
      columns: ['primary_category'],
      description: 'Fast category browsing'
    },
    {
      name: 'idx_dietary_flags',
      table: 'products',
      columns: ['is_vegan', 'is_vegetarian', 'is_gluten_free', 'is_lactose_free'],
      description: 'Dietary restriction filtering'
    },

    // Price and nutrition optimization
    {
      name: 'idx_calorie_efficiency',
      table: 'products',
      columns: ['calorie_efficiency'],
      description: 'Budget bulking queries'
    },
    {
      name: 'idx_satiety_cutting',
      table: 'products',
      columns: ['satiety_per_kcal', 'kcal_per_100g'],
      description: 'Cutting phase food selection'
    },
    {
      name: 'idx_post_workout',
      table: 'products',
      columns: ['carb_protein_ratio', 'protein_per_100g'],
      description: 'Post-workout nutrition (carb:protein ratio 2:1 to 4:1)'
    },

    // Full-text search
    {
      name: 'idx_search_text',
      table: 'products',
      columns: ['search_text'],
      description: 'Product name and ingredient search'
    }
  ],

  aliQueries: {
    // Ali's most common query patterns
    highProteinHalal: `
      SELECT id, name, protein_per_100g, protein_efficiency, price_regular, halal_status
      FROM products
      WHERE halal_status = 'halal'
        AND protein_per_100g >= 15
      ORDER BY protein_per_100g DESC, protein_efficiency ASC
      LIMIT 50
    `,

    budgetProteinSources: `
      SELECT id, name, protein_per_100g, protein_efficiency, price_regular, primary_category
      FROM products
      WHERE protein_efficiency <= 0.50
        AND protein_per_100g >= 10
        AND halal_status IN ('halal', 'unknown')
      ORDER BY protein_efficiency ASC
      LIMIT 30
    `,

    postWorkoutHalalOptions: `
      SELECT id, name, protein_per_100g, carbs_per_100g, carb_protein_ratio, price_regular
      FROM products
      WHERE halal_status = 'halal'
        AND carb_protein_ratio BETWEEN 2.0 AND 4.0
        AND protein_per_100g >= 10
      ORDER BY carb_protein_ratio ASC, protein_per_100g DESC
      LIMIT 25
    `,

    cuttingFoodOptions: `
      SELECT id, name, kcal_per_100g, protein_per_100g, satiety_per_kcal, fiber_per_100g
      FROM products
      WHERE kcal_per_100g <= 125
        AND satiety_per_kcal >= 0.8
        AND halal_status IN ('halal', 'unknown')
      ORDER BY satiety_per_kcal DESC, protein_per_100g DESC
      LIMIT 40
    `,

    veganHighProtein: `
      SELECT id, name, protein_per_100g, protein_efficiency, primary_category
      FROM products
      WHERE is_vegan = 1
        AND protein_per_100g >= 15
      ORDER BY protein_per_100g DESC
      LIMIT 20
    `,

    dairyFreeHighProtein: `
      SELECT id, name, protein_per_100g, protein_efficiency, halal_status
      FROM products
      WHERE is_lactose_free = 1
        AND protein_per_100g >= 15
        AND halal_status IN ('halal', 'unknown')
      ORDER BY protein_per_100g DESC
      LIMIT 20
    `,

    categoryExploration: `
      SELECT primary_category,
             COUNT(*) as product_count,
             AVG(protein_per_100g) as avg_protein,
             AVG(protein_efficiency) as avg_protein_efficiency,
             COUNT(CASE WHEN halal_status = 'halal' THEN 1 END) as halal_count
      FROM products
      WHERE primary_category IS NOT NULL
      GROUP BY primary_category
      HAVING product_count >= 5
      ORDER BY avg_protein DESC, halal_count DESC
    `,

    searchProducts: `
      SELECT id, name, protein_per_100g, halal_status, primary_category, price_regular
      FROM products
      WHERE search_text LIKE '%' || ? || '%'
        AND halal_status IN ('halal', 'unknown')
      ORDER BY
        CASE WHEN name LIKE '%' || ? || '%' THEN 1 ELSE 2 END,
        protein_per_100g DESC
      LIMIT 50
    `
  }
};

/**
 * SQL statements to create the database schema.
 */
export const CREATE_SCHEMA_SQL = `
-- Main products table optimized for Ali's nutrition needs
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_regular REAL,
  price_sale REAL,
  protein_per_100g REAL,
  kcal_per_100g REAL,
  carbs_per_100g REAL,
  fat_per_100g REAL,
  fiber_per_100g REAL,
  salt_per_100g REAL,
  halal_status TEXT CHECK (halal_status IN ('halal', 'haram', 'questionable', 'unknown')),
  halal_confidence TEXT CHECK (halal_confidence IN ('high', 'medium', 'low')),
  categories_json TEXT,
  primary_category TEXT,
  is_vegan INTEGER CHECK (is_vegan IN (0, 1)),
  is_vegetarian INTEGER CHECK (is_vegetarian IN (0, 1)),
  is_gluten_free INTEGER CHECK (is_gluten_free IN (0, 1)),
  is_lactose_free INTEGER CHECK (is_lactose_free IN (0, 1)),
  is_high_protein INTEGER CHECK (is_high_protein IN (0, 1)),
  is_low_carb INTEGER CHECK (is_low_carb IN (0, 1)),
  is_high_fiber INTEGER CHECK (is_high_fiber IN (0, 1)),
  protein_efficiency REAL GENERATED ALWAYS AS (price_regular / NULLIF(protein_per_100g, 0)) STORED,
  calorie_efficiency REAL GENERATED ALWAYS AS (price_regular / NULLIF(kcal_per_100g, 0)) STORED,
  satiety_per_kcal REAL,
  carb_protein_ratio REAL GENERATED ALWAYS AS (carbs_per_100g / NULLIF(protein_per_100g, 0)) STORED,
  ingredients_json TEXT,
  allergens_json TEXT,
  additive_flags_json TEXT,
  search_text TEXT
);

-- Strategic indexes for Ali's query patterns
CREATE INDEX IF NOT EXISTS idx_halal_protein ON products(halal_status, protein_per_100g);
CREATE INDEX IF NOT EXISTS idx_protein_efficiency ON products(protein_efficiency);
CREATE INDEX IF NOT EXISTS idx_high_protein_foods ON products(is_high_protein, protein_per_100g);
CREATE INDEX IF NOT EXISTS idx_primary_category ON products(primary_category);
CREATE INDEX IF NOT EXISTS idx_dietary_flags ON products(is_vegan, is_vegetarian, is_gluten_free, is_lactose_free);
CREATE INDEX IF NOT EXISTS idx_calorie_efficiency ON products(calorie_efficiency);
CREATE INDEX IF NOT EXISTS idx_satiety_cutting ON products(satiety_per_kcal, kcal_per_100g);
CREATE INDEX IF NOT EXISTS idx_post_workout ON products(carb_protein_ratio, protein_per_100g);
CREATE INDEX IF NOT EXISTS idx_search_text ON products(search_text);

-- Performance analysis view for monitoring
CREATE VIEW IF NOT EXISTS ali_performance_stats AS
SELECT
  'Total Products' as metric, COUNT(*) as value FROM products
UNION ALL
SELECT
  'Halal Products', COUNT(*) FROM products WHERE halal_status = 'halal'
UNION ALL
SELECT
  'High Protein Products', COUNT(*) FROM products WHERE is_high_protein = 1
UNION ALL
SELECT
  'Vegan Products', COUNT(*) FROM products WHERE is_vegan = 1
UNION ALL
SELECT
  'Budget Protein Sources', COUNT(*) FROM products WHERE protein_efficiency <= 0.50 AND protein_per_100g >= 10;
`;
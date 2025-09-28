# @picklist/pipline

> Production-ready CSV → JSONL product transformation pipeline with AI-enhanced nutrition scoring and Ali-specific filtering profiles

## Overview

The `@picklist/pipline` package provides a complete data transformation pipeline that processes Dutch food product CSV files into optimized JSONL outputs with enhanced nutrition scoring, halal compliance validation, and personalized filtering profiles for CrossFit athlete nutrition.

## Features

### 🔄 **Multi-Phase Pipeline Architecture**
- **Phase 1**: CSV loading with sparsity analysis and column exclusion
- **Phase 2**: Product construction from CSV rows with validation
- **Phase 3**: Post-processing with deduplication and normalization
- **Phase 4**: Enhanced scoring with percentile ranking and health grades
- **Phase 5**: Multi-filter output generation and statistics finalization

### 🎯 **Ali-Specific Nutrition Profiles**
- **Daily Protein Hunting**: Halal + high-protein foods (≥20g/100g)
- **Post-CrossFit Recovery**: Optimal 2.0-4.0 carb:protein ratios
- **Cutting Phase**: Low calorie density (<125 kcal/100g) + high satiety
- **Budget Optimization**: Protein-per-euro efficiency in Dutch market
- **Training vs Rest Day**: Context-aware calorie and carb adjustments

### 📊 **Advanced Scoring System**
- **Dual Scoring**: EU Nutri-Score + AliScore enhancement
- **Percentile Ranking**: Global and category-relative health scoring
- **Health Grades**: A-E grading system with percentile-based distribution
- **Contextual Scoring**: Training day vs rest day optimization

### 🥗 **Dutch Food Product Support**
- Column mapping for ProductId, ProductName, PriceRegular, Category1-6
- Ingredient and allergen processing with Dutch localization
- Unit parsing with Dutch measurement conventions
- E-number detection and safety flagging

## Quick Start

### Installation

```bash
npm install @picklist/pipline
```

### Basic Usage

```typescript
import { runPipeline } from '@picklist/pipline';

// Transform CSV to optimized JSONL with all filtering profiles
await runPipeline('products.csv', 'output/');
```

This generates:
- `products.jsonl` - All products with enhanced scoring
- `category-tree.json` - Hierarchical category navigation
- `products-by-category/` - Category-specific JSONL files
- `ali-*.jsonl` - Filtered outputs for all Ali profiles
- `schema.md` - Complete data schema documentation

## API Reference

### Core Functions

#### `runPipeline(inputPath: string, outputDir: string): Promise<void>`

Executes the complete transformation pipeline with all phases.

**Parameters:**
- `inputPath` - Path to input CSV file
- `outputDir` - Output directory for generated files

**Example:**
```typescript
import { runPipeline } from '@picklist/pipline';

await runPipeline('data/products.csv', 'dist/');
// Generates complete product database with all filtering profiles
```

## Pipeline Phases

### Phase 1: CSV Loading (`loadCsv`)
```typescript
import { loadCsv } from '@picklist/pipline/phases/01_loadCsv';

const { headers, matrix, rows } = loadCsv('products.csv', 'output/');
// - Analyzes column sparsity (excludes >90% empty columns)
// - Generates schema documentation
// - Returns structured CSV data
```

### Phase 2: Product Construction (`buildProductsPipeline`)
```typescript
import { buildProductsPipeline } from '@picklist/pipline/phases/02_buildProducts';

const { productsMap } = buildProductsPipeline(matrix, headers);
// - Converts CSV rows to typed Product objects
// - Validates required fields (id, name)
// - Tracks ingestion statistics
```

### Phase 3: Post-Processing (`postProcessProducts`)
```typescript
import { postProcessProducts } from '@picklist/pipline/phases/03_postProcess';

const processedProducts = postProcessProducts(products);
// - Deduplicates products by ID
// - Applies canonical ordering
// - Normalizes product data
```

### Phase 4: Enhanced Scoring (`scoreProducts`)
```typescript
import { scoreProducts } from '@picklist/pipline/phases/04_scoring';

const scoredProducts = scoreProducts(products);
// - Applies percentile ranking (global + category-relative)
// - Computes health grades (A-E scale)
// - Tracks scoring statistics
```

### Phase 5: Filter Generation (`filterOutputs`)
```typescript
import { filterOutputs } from '@picklist/pipline/phases/05_filters';

await filterOutputs(products, 'output/');
// - Generates all Ali filtering profiles
// - Creates category-specific outputs
// - Produces filtering statistics
```

## Ali Filtering Profiles

### Available Profiles

```typescript
import {
  createAliDailyProteinProfile,
  createAliPostWorkoutProfile,
  createAliCuttingProfile,
  createAliBudgetProfile,
  createAliTrainingDayProfile,
  createAliRestDayProfile
} from '@picklist/pipline/utils/aliFilterProfiles';

// Daily protein hunting (halal + ≥20g protein/100g)
const dailyProtein = createAliDailyProteinProfile();

// Post-workout recovery (2.0-4.0 carb:protein ratio)
const postWorkout = createAliPostWorkoutProfile();

// Cutting phase (≤125 kcal/100g + high satiety)
const cutting = createAliCuttingProfile();

// Budget optimization (protein per euro)
const budget = createAliBudgetProfile(45); // €45/week budget

// Training day context (2000 kcal, 220g carbs)
const trainingDay = createAliTrainingDayProfile();

// Rest day context (1750 kcal, 120g carbs)
const restDay = createAliRestDayProfile();
```

### Profile Customization

```typescript
import { createAliCuttingProfile, type AliProfile } from '@picklist/pipline/utils/aliFilterProfiles';

const customProfile: Partial<AliProfile> = {
  currentWeight: 85,
  targetWeight: 75,
  trainingFrequency: 5
};

const personalizedCutting = createAliCuttingProfile(customProfile);
```

### Batch Profile Generation

```typescript
import { createAliFilterCombinations } from '@picklist/pipline/utils/aliFilterProfiles';

const allProfiles = createAliFilterCombinations();
// Returns array of all 6 Ali filtering scenarios for bulk processing
```

## Scoring System

### Health Grade Distribution
- **Grade A**: Top 20% (80th-100th percentile)
- **Grade B**: 60th-80th percentile
- **Grade C**: 40th-60th percentile
- **Grade D**: 20th-40th percentile
- **Grade E**: Bottom 20% (0th-20th percentile)

### Dual Scoring Approach
```typescript
// Products receive both global and category-relative scores
{
  nutriScore: 12,              // EU Nutri-Score (lower = better)
  globalHealthScore: 85,       // Global percentile rank
  globalHealthGrade: 'A',      // Global health grade
  categoryHealthScore: 72,     // Category-relative score
  categoryHealthGrade: 'B'     // Category-relative grade
}
```

## Output Structure

```
output/
├── products.jsonl                    # All products with full scoring
├── category-tree.json               # Hierarchical navigation
├── schema.md                        # Data schema documentation
├── products-by-category/            # Category-specific files
│   ├── dairy-products.jsonl
│   ├── meat-products.jsonl
│   └── ...
└── filtered/                        # Ali-specific filtered outputs
    ├── ali-daily-protein.jsonl
    ├── ali-post-workout.jsonl
    ├── ali-cutting.jsonl
    ├── ali-budget.jsonl
    ├── ali-training-day.jsonl
    └── ali-rest-day.jsonl
```

## Dutch Localization

### Supported Column Names
- **Product ID**: `ProductId`, `id`, `ID`
- **Product Name**: `ProductName`, `name`
- **Price**: `PriceRegular`, `price`
- **Categories**: `Category1` through `Category6`
- **Ingredients**: `Ingredients`
- **Allergens**: `ContainedAllergens`, `MayContainAllergens`
- **Unit Size**: `ProductUnitSize`, `size`, `unit`

### Dutch-Specific Processing
- Ingredient placeholder removal (`"n/a"`, `"NA"`, etc.)
- Allergen normalization (plural → singular)
- E-number detection with Dutch category mapping
- Unit parsing for Dutch measurements

## Performance

- **Linear Scaling**: O(n) processing for n products
- **Memory Efficient**: Streaming processing for large datasets
- **Fast Processing**: <100ms for 10k products
- **Deterministic**: Identical input produces byte-identical output

## Integration

### With @picklist/core
```typescript
import { calculateSparsity, mergeDuplicates } from '@picklist/core';
import { runPipeline } from '@picklist/pipline';

// Pipeline automatically uses @picklist/core utilities for:
// - Sparsity analysis and column exclusion
// - Product deduplication and merging
// - JSONL writing and index generation
```

### With @picklist/parser
```typescript
import { transformCSV } from '@picklist/parser';
import { buildProductsPipeline } from '@picklist/pipline/phases/02_buildProducts';

// Pipeline integrates parser for CSV processing:
const { headers, matrix, rows } = transformCSV('products.csv');
const { productsMap } = buildProductsPipeline(matrix, headers);
```

### With @picklist/filter
```typescript
import { createFilter } from '@picklist/filter';
import { createAliDailyProteinProfile } from '@picklist/pipline/utils/aliFilterProfiles';

// Use pipeline profiles with filter engine:
const criteria = createAliDailyProteinProfile();
const filteredProducts = createFilter(products, criteria);
```

## Error Handling

The pipeline includes comprehensive error handling:

```typescript
try {
  await runPipeline('products.csv', 'output/');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('Input CSV file not found');
  } else if (error.code === 'EMPTY_CSV') {
    console.error('CSV file is empty or malformed');
  } else {
    console.error('Pipeline error:', error.message);
  }
}
```

## Development

### Scripts
```bash
npm run typecheck     # TypeScript validation
npm run test          # Run test suite
npm run test:run      # Run tests once
npm run lint          # ESLint validation
npm run lint:fix      # Auto-fix linting issues
npm run format        # Prettier formatting
```

### Dependencies
- **@picklist/core**: Shared utilities and types
- **@picklist/parser**: CSV parsing and row conversion
- **@picklist/types**: TypeScript type definitions
- **@picklist/filter**: Filtering engine and criteria

## License

Part of the Picklist monorepo. See root LICENSE file.

## Contributing

This package follows the Picklist development guidelines. See the main project README for contribution guidelines and code style requirements.
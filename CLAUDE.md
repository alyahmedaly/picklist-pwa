# Picklist Development Guidelines

Auto-generated from all feature plans. Last updated: January 2025

## Active Technologies
- **Frontend**: React 19, TypeScript 5.8+, Vite 7+, Tailwind CSS v4
- **Backend**: Node.js 22+, SQLite, Kysely 0.28.7 (type-safe query builder)
- **Database**: SQLite via SQLocal (browser)
- **Testing**: Vitest, Testing Library, Storybook 9+, axe-core for accessibility
- **Build Tools**: Vite, SWC, ESLint 9+, Biome 2.2.4
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Data Visualization**: Recharts
- **Development**: Knip for unused code detection
- **Monorepo**: NPM Workspaces with TypeScript project references
- TypeScript 5.8+ with ES modules in Node.js 22+ + @std/csv library for CSV parsing, NPM workspaces (022-csv-parser-package)
- N/A (parser operates on in-memory data structures) (022-csv-parser-package)

## Project Structure
```
packages/                 # NPM Workspaces
├── core/                # @picklist/core - Shared utilities package
│   ├── src/
│   │   ├── utils/       # Utility functions (sparsity, merge, ordering, writer)
│   │   ├── types/       # TypeScript interfaces and types
│   │   └── index.ts     # Package barrel exports
│   ├── tests/           # Package-specific unit tests
│   │   ├── stringUtils.test.ts
│   │   └── validation.test.ts
│   ├── package.json     # Core package definition
│   ├── tsconfig.json    # Package TypeScript config
│   └── vitest.config.ts # Package test configuration
│
├── parser/              # @picklist/parser - CSV parsing package
│   ├── src/
│   │   ├── parser.ts    # Core parsing functions (readCSV, createRows, convertTypes)
│   │   ├── legacy.ts    # Legacy helper functions (createCSVRow, csvRowToRecord)
│   │   ├── types.ts     # CSVRow interface and parsing types
│   │   └── index.ts     # Package barrel exports
│   ├── tests/           # Comprehensive test suite (54 test cases)
│   │   ├── *.contract.test.ts     # Contract tests (TDD approach)
│   │   ├── error-handling.test.ts # Error edge cases
│   │   ├── performance.test.ts    # Performance validation
│   │   └── behavioral-identity.test.ts # Baseline compatibility
│   ├── package.json     # Parser package definition (v1.0.0)
│   ├── tsconfig.json    # Package TypeScript config with strict mode
│   ├── vitest.config.ts # Package test configuration
│   └── README.md        # Comprehensive API documentation
│
src/                     # Main application code
├── components/           # React components
│   ├── ui/              # shadcn/ui base components
│   ├── nutrition/       # Ali-specific nutrition components
│   └── layout/          # Responsive layout components
├── data/
│   ├── transform/       # Parsing & scoring modules (remaining here)
│   └── loadFilters.ts   # Static JSONL loading
├── db/                  # Database layer with Kysely
├── scripts/
│   └── transform-data.ts # Main transformation pipeline
├── hooks/               # React hooks
├── pages/               # Page components
└── styles/              # CSS and design tokens

specs/                   # Feature specifications
tests/
├── unit/                # Module-level tests (including @picklist/core tests)
├── integration/         # Full pipeline tests
├── contract/            # Package interface tests
├── parity/              # Migration parity tests
└── fixtures/            # Sample CSV files
```

## Commands

### Development
- `npm run dev` - Start Vite development server for the React frontend
- `npm run typecheck` - Run TypeScript type checking
- `npm run build` - Build both TypeScript and Vite for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on all files

### Workspace Commands
- `npm run build --workspace=@picklist/core` - Build specific workspace package
- `npm run typecheck --workspace=@picklist/core` - Type-check specific package
- `npm run test --workspace=@picklist/core` - Run tests for specific package
- `npm run lint --workspace=@picklist/parser` - Lint parser package
- `npm ls --workspaces` - List all workspace packages (@picklist/core, @picklist/parser)
- `npm install --workspace=@picklist/core <package>` - Install dependency in specific workspace

### Testing
- `npm test` - Run full test suite (Vitest)
- `npm run test:watch` - Run tests in watch mode
- `vitest run tests/unit/specific-test.test.ts` - Run a single test file
- `vitest run --grep "test pattern"` - Run tests matching a pattern

### Data Transformation
- `npm run transform` - Transform sample data (uses fixtures/sample-small.csv)
- `npm run transform:production` - Transform production data (uses data/2024-10-23.csv)
- `node src/scripts/transform-data.ts --input path/to/input.csv --outDir dist --format ui` - Transform with UI-optimized format

### Database
- Kysely-based type-safe queries with SQLite backend
- SQLocal for browser-based database access
- Database migrations and schema management

### Accessibility Testing
- `npm run test:a11y` - Run accessibility tests on all Storybook stories
- `npm run test:a11y:ci` - Run accessibility tests in CI mode
- `npm run test:a11y:detailed` - Run accessibility tests with verbose output

### Code Quality
- `npm run knip` - Detect unused code and dependencies
- `npm ci` - Clean install dependencies (preferred for CI/releases)

## @picklist/core Package

### Available Utilities
```typescript
import {
  // Data manipulation
  mergeDuplicates, calculateSparsity, canonicalOrderProducts,

  // File I/O
  writeJsonl, writeIndexFile, writeSchemaDoc,

  // String processing
  normalizeText, removePlaceholders, splitAndTrim, sanitizeForFilename,

  // Validation
  validateProduct, validateNutrition, isValidSemver, isValidPackageName,

  // Nutrition utilities
  extractNutritionValue, hasRequiredNutrition,

  // Type constructors
  createProduct, createNutritionInfo
} from '@picklist/core';
```

### Package Scope
- **Included**: Pure utility functions, type definitions, string processing, basic validation
- **Excluded**: Parsing logic (parseIngredients, parseAllergens), complex scoring algorithms, UI components
- **Performance**: <10ms import time, deterministic output, memory-efficient for large datasets

## @picklist/parser Package

### Available Functions
```typescript
import {
  // Core parsing functions
  readCSV, createRows, convertTypes,

  // Legacy helpers (for migration compatibility)
  createCSVRow, csvRowToRecord,

  // Types
  type CSVRow, type ParsedCSVResult, type ConversionResult, type CSVParseError
} from '@picklist/parser';
```

### Parsing Pipeline
```typescript
// Complete CSV processing pipeline
const csvText = readFileSync('products.csv', 'utf8');
const parsed = readCSV(csvText);                    // CSV text → headers + matrix
const rows = createRows(parsed.headers, parsed.matrix); // matrix → typed CSVRow[]
const { records } = convertTypes(rows);             // CSVRow[] → Record<string, string>[]

// Compatible with @picklist/core sparsity analysis
const sparsity = calculateSparsity(records);
```

### Package Scope
- **Included**: CSV parsing with @std/csv, Dutch food product column mapping, type-safe row conversion
- **Excluded**: Product transformation logic, ingredient parsing, allergen processing, classification
- **Performance**: Linear scaling, <100ms for 10k products, behavioral parity with transform-data.ts baseline

### Dutch Food Product Support
- **Column Mapping**: ProductId/id/ID, ProductName/name, PriceRegular/price, Category1-6
- **Ingredient Fields**: Ingredients, ContainedAllergens, MayContainAllergens
- **Unit Parsing**: ProductUnitSize/size/unit with Dutch measurement conventions
- **Error Types**: EMPTY_CSV, MISSING_HEADERS, MALFORMED_CSV with descriptive messages

## Code Style

### TypeScript
- Strict mode enabled (TypeScript 5.8+)
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Follow kebab-case for file names, PascalCase for components

### React
- React 19 with modern patterns
- Functional components with hooks
- Use TypeScript interfaces for props
- Prefer composition over inheritance

### CSS/Styling
- Tailwind CSS v4 utility-first approach
- Design tokens for consistent spacing, colors, typography
- Component-specific styles in separate files when needed
- Responsive design with mobile-first approach

### Testing
- Vitest for unit and integration tests
- Testing Library for React component testing
- Prefer explicit test assertions over implicit
- Mock external dependencies appropriately

### Database
- Type-safe queries with Kysely query builder
- No raw SQL in application code
- Repository pattern for data access
- Explicit transaction boundaries

## Recent Changes
- 022-csv-parser-package: Added TypeScript 5.8+ with ES modules in Node.js 22+ + @std/csv library for CSV parsing, NPM workspaces
- 021-npm-workspaces: Added TypeScript 5.8+, Node.js 22+ + NPM workspaces, TypeScript project references, consola, @std/csv, better-sqlite3, kysely, React 19, Vite 7+

### Feature 020: Database Query Layer Migration to Kysely (January 2025)
- Migrated from raw SQL queries to type-safe Kysely query builder

### Feature 019: Flexible Database Schema Redesign (September 2024)

### Feature 014-016: Homepage Design System & Category Navigation (September 2024)

<!-- MANUAL ADDITIONS START -->

## Project Overview
This is a **CSV → JSONL Product Transformer** that processes product data with deterministic, hygiene-focused transformations. The project combines both a React frontend (Vite-based) and a Node.js data transformation pipeline.

## Data Pipeline Architecture
### Two-Pass Processing
1. **First Pass**: Sparsity analysis to identify >90% empty columns for exclusion
2. **Second Pass**: Full product parsing, deduplication, and transformation

### Core Transform Modules (`src/data/transform/`)
- **`types.ts`** - Core interfaces: `Product`, `Price`, `AllergensInfo`, `AdditiveInfo`, `AdditiveFlags`, etc.
- **`parseIngredients.ts`** - Ingredient hygiene: placeholder filtering, deduplication, added sugar/salt detection
- **`parseAllergens.ts`** - Allergen normalization: plural→singular, whitelist filtering, URL token removal
- **`parseAdditives.ts`** - E-number detection and Dutch additive analysis with regex patterns
- **`eNumberDatabase.ts`** - Comprehensive E-number database with 300+ EU-approved additives
- **`dutchCategoryMapper.ts`** - Dutch functional category mapping (conserveermiddel, kleurstof, antioxidant)
- **`mergeDuplicate.ts`** - Deterministic duplicate resolution with conflict tracking
- **`classify.ts`** - Food classification with negative keyword detection
- **`stats.ts`** - Aggregation counters including `skippedIndexEntries`
- **`writer.ts`** - Atomic JSONL writing, index generation, schema doc creation

### Ali Filters System
Advanced filtering system for Ali's CrossFit athlete nutritional needs:
- **Halal Compliance**: Strict validation with alcohol/gelatine exclusion
- **Protein Optimization**: 170g daily target with efficiency scoring
- **Post-Workout Recovery**: Carb:protein ratio filtering (2.0-4.0)
- **Fat Loss Compatibility**: Low calorie density (<125 kcal/100g)
- **Budget Optimization**: Protein-per-euro efficiency
- **Context Awareness**: Training vs rest day adaptation

### Key Behaviors
- **Deterministic output**: Identical input produces byte-identical results
- **Hygiene processing**: Removes "NA", "n/a" placeholders while preserving chemical symbols
- **Dutch localization**: Full support for Dutch ingredient and allergen processing
- **E-Number analysis**: Comprehensive additive detection with safety flags
- **Hybrid scoring**: EU Nutri-Score + AliScore enhancement for product ranking

<!-- MANUAL ADDITIONS END -->

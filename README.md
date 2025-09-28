# CSV → JSONL Product Transformer

Deterministic pipeline that ingests a CSV of product rows and produces:
- `products.jsonl` (one product per line, stable canonical key order)
- `products-index.json` (lightweight searchable subset)
- `stats.json` (row counts, null rates, duplicate merge stats)
- `schema.md` (documented excluded columns and ordering rule)
- `category-tree.json` (hierarchical category navigation tree, when using `--generate-category-tree`)
- **Filtered Outputs (when using `--generate-filtered-outputs`):**
  - `filtered-ali-daily-protein.jsonl` + index/stats - Halal + high protein foods
  - `filtered-ali-post-workout.jsonl` + index/stats - Recovery-optimized nutrition
  - `filtered-ali-cutting.jsonl` + index/stats - Fat loss compatible foods
  - `filtered-ali-budget.jsonl` + index/stats - Cost-efficient protein sources
  - `filtered-ali-training-day.jsonl` + index/stats - Training day nutrition
  - `filtered-ali-rest-day.jsonl` + index/stats - Rest day nutrition

Performance & drift baseline features were intentionally skipped (one-off run usage).

## Quick Start

Prerequisites: Node 18+.

1. Install deps (if not already):
  npm install
2. Run tests (verifies determinism & parsers):
  npm test
3. Execute transform:
  node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out --log human

Artifacts will appear in `out/`.

## CLI Usage

Human logging (default):
```
npx ts-node src/scripts/transform-data.ts --input path/to/input.csv --outDir dist
```

JSON structured logging:
```
npx ts-node src/scripts/transform-data.ts --input path/to/input.csv --outDir dist --log json
```

With Ali's filter system:
```
npx ts-node src/scripts/transform-data.ts --input path/to/input.csv --outDir dist \
  --filters halal,protein,postworkout \
  --halal-strict \
  --protein-min 20 --protein-target 170 \
  --post-workout-min-ratio 2.0 \
  --generate-filtered-outputs
```

With category tree generation:
```
npx ts-node src/scripts/transform-data.ts --input path/to/input.csv --outDir dist \
  --generate-category-tree
```
Events emitted (json mode): `start`, `sparsity-scan`, `done`.

Required flags:
- `--input <path>` CSV file
- `--outDir <dir>` destination directory (created if missing)
- `--log human|json` (optional; default human)

Filter flags (optional):
- `--filters <list>` Comma-separated: halal,protein,postworkout,fatloss,budget
- `--halal-strict` Require confirmed halal status
- `--protein-min <n>` Minimum protein per 100g (default: based on filter profile)
- `--protein-target <n>` Daily protein target in grams (default: 170)
- `--post-workout-min-ratio <n>` Min carb:protein ratio (default: 2.0)
- `--post-workout-max-ratio <n>` Max carb:protein ratio (default: 4.0)
- `--fat-loss-max-calories <n>` Max calories per 100g (default: 125)
- `--budget-max-price <n>` Max price per 100g in euros (default: 2.50)
- `--generate-filtered-outputs` Generate separate filtered JSONL files
- `--generate-category-tree` Generate category tree JSON with hierarchical navigation

Debug Environment Variables:
- `CLASSIFY_DEBUG=1` – Enable detailed food classification debug logging

Exit codes:
- 0 success
- 1 generic failure

## Determinism
Ordering: products sorted by `id` then `name` (if tie) to ensure stable output order.

Running twice with identical input yields byte-identical `products.jsonl` & `schema.md` (verified in tests) absent timestamped or random data.

## Hygiene Features
Implemented in Phase 3.3/3.4 (FR-DH-001..010):
- Placeholder Ingredient Filtering – removes NA variants, preserves chemical symbol `Na`.
- Ingredient Dedupe & Order Preservation – stable, removes duplicates respecting first occurrence order.
- Allergen Normalization – plural→singular, whitelist filtering + URL token filtering.
- Negative Classification Debug Gate – negative keyword classification with safe-list & optional debug logging (`CLASSIFY_DEBUG=1`).
// Omission Normalization removed alongside hashing (empty containers now retained as-is).
- Index Emission Guard – skips invalid id/name/price; counts `skippedIndexEntries`.
- Schema Doc Hygiene Section – lists placeholders and allergen whitelist.

### Dutch Language Localization (T014-T023)
- Dutch Allergen Support – recognizes Dutch prefixes (BEVAT:, KAN SPOREN BEVATTEN VAN) and allergen terms (melk, ei, soja, tarwe).
- Decimal Comma Normalization – converts Dutch decimal format (12,5 → 12.5) with statistics tracking.
- Added Sugar/Salt Extraction – parses Dutch phrases "Waarvan toegevoegde suikers X.Xg per 100 gram".
- Dutch Ingredient Processing – filters Dutch placeholders (GEEN, NVT) and detects artificial sweeteners (steviolglycosiden, zoetstof).
- Multilingual Classification – supports Dutch food categories (bakkerij, zuivel) and household detection (huishouden).
- Inequality Parsing – handles Dutch inequality symbols (< 0,01 g, ≤ 1,5 g) including multipack patterns.

### Precomputed Nutritional Tags (T001-T020)
**AH Netherlands Product Enhancement** – Adds precomputed nutritional tags to food products following EU/Dutch dietary standards:

**Nutritional Computation:**
- Net Carbs Calculation – Total carbs minus fiber (minimum 0)
- Net Carbs Bucketing – very_low (<2g), low (2-5g), moderate (5-10g), high (10-20g), very_high (>20g)
- Low Carb Classification – <10g net carbs per 100g (ketogenic threshold)

**EU/Dutch Standards Compliance:**
- High Fiber – ≥6g per 100g (EU Commission Regulation No 1924/2006)
- High Protein – ≥20g per 100g (Dutch fitness standard)
- Protein Density – low (<10g), moderate (10-20g), high (≥20g)

**Dietary Classifications (Dutch Ingredient Analysis):**
- Vegan – Excludes melk, ei, boter, kaas, vis, vlees, honing, yoghurt
- Vegetarian – Excludes vis, vlees, kip, rund, varken (allows dairy)
- Lactose-Free – Excludes melk, room, boter, kaas, lactose, yoghurt + dairy allergens
- Gluten-Free – Excludes tarwe, rogge, gerst, haver + gluten allergens
- Plant-Based – >80% plant ingredients by count

**Statistics Tracking:** Comprehensive counters for nutritional tags, dietary classifications, and distribution analysis included in `stats.json`.

### Food Additive & E-Number Analysis (T001-T022)
**EU E-Number System Implementation** – Comprehensive food additive detection and analysis for Dutch products following Voedingscentrum guidelines:

**E-Number Detection:**
- Regex Pattern Matching – Detects E-numbers in Dutch formats: `[E300]`, `[E330]`, `[E471]`
- 300+ E-Number Database – Complete EU-approved additive database with functional categories
- Performance Optimized – Pre-compiled patterns process 30,499 products in <10s
- Real Data Validated – Patterns tested against AH product frequency (E330: 1,726×, E202: 1,156×, E300: 1,053×)

**Dutch Category Mapping:**
- Functional Categories – Maps 27 official EU categories to Dutch terms
- Dutch Language Support – conserveermiddel, kleurstof, antioxidant, smaakversterker, stabilisator
- Compound Detection – Parses complex ingredient phrases with multiple E-numbers

**Safety & Dietary Analysis:**
- Southampton Six Warnings – Color additive warnings for children (E102, E104, E110, E122, E124, E129)
- Allergen Detection – Sulfite identification (E220-E228) for asthma/allergy warnings
- Dietary Restrictions – Vegan/vegetarian compatibility based on E-number origins
- Natural vs Synthetic – Classification of additive sources for clean label analysis

**Output Enhancement:**
- `additiveInfo` field – E-numbers found, Dutch categories, functional classifications
- `additiveFlags` field – Safety warnings, allergen flags, dietary compatibility indicators
- Statistics integration – Additive prevalence counters in `stats.json`

### Hybrid Nutrition Score System (Feature 008)
**EU Nutri-Score + AliScore Enhancement** – Dual scoring system providing both scientific validation and dataset-relative ranking:

**EU Nutri-Score Implementation:**
- Official FSA nutrient profiling algorithm (-15 to +40 range)
- Category-specific thresholds (general, beverages, cheese, fats)
- Negative points for energy, saturated fat, sugars, sodium
- Positive points for fiber, protein, fruits/vegetables
- EU regulatory compliance following Voedingscentrum guidelines

**AliScore Enhancement:**
- Percentile ranking within dataset to solve clustering problem
- Enables meaningful product differentiation beyond Nutri-Score
- Dual scoring: global (all products) and category-relative ranking
- A-E grade classification using equal 20% distribution (A=top 20%, E=bottom 20%)
- Performance optimized: two-pass architecture maintaining <10s for 30k products

**New Product Fields:**
- `nutriScore`: EU Nutri-Score base calculation (-15 to +40)
- `globalHealthScore`/`globalHealthGrade`: Ranking against all products (0-100, A-E)
- `categoryHealthScore`/`categoryHealthGrade`: Ranking within same category (0-100, A-E)

**Key Modules:**
- `computeNutriScore.ts` - EU FSA algorithm implementation with category-specific thresholds
- `computeHealthGrade.ts` - Percentile ranking and A-E grade assignment
- `enhanceWithDualScoring.ts` - Two-pass integration maintaining existing pipeline performance

### Body Recomposition Scoring System (Feature 010)
**Contextual Intelligence for Body Composition Goals** – Extends existing protein and satiety scoring with contextual optimization:

**Post-Workout Optimization:**
- Fast carbs + protein scoring for recovery with glycemic index weighting
- Carb:protein ratio analysis (optimal 2.0-4.0 range for CrossFit athletes)
- Recovery window timing classification (immediate/moderate/extended)
- Glycogen replenishment efficiency scoring

**Fat Loss Compatibility:**
- High satiation + low calorie density scoring for cutting phases
- Volume advantage calculations for satiety per calorie
- Calorie density classification (<125 kcal/100g for effective cutting)
- Hunger control optimization through satiety efficiency

**Enhanced Calorie Efficiency:**
- Multi-dimensional efficiency beyond basic protein ratios
- Micronutrient density weighting and thermic effect considerations
- Processing penalty adjustments for ultra-processed foods
- Comprehensive nutritional value per calorie optimization

**Body Composition Context:**
- Meal timing awareness (pre/post-workout context adaptation)
- Phase-specific multipliers (cutting/bulking/recomposition goals)
- Training vs rest day macro adjustments
- Conflict resolution for competing optimization goals

**New Product Fields:**
- `postWorkoutOptimization`: Carb:protein ratios, GI boost, recovery window timing
- `fatLossCompatibility`: Calorie density classification, satiety efficiency, volume advantage
- `enhancedCalorieEfficiency`: Multi-dimensional scoring with processing penalties
- `bodyCompositionContext`: Phase-aware multipliers and contextual optimization

**Key Modules:**
- `computePostWorkoutScoring.ts` - Recovery optimization with carb:protein ratios and GI factors
- `computeFatLossCompatibility.ts` - Satiety efficiency and calorie density analysis
- `computeEnhancedCalorieEfficiency.ts` - Multi-dimensional nutritional efficiency
- `computeBodyCompositionContext.ts` - Context-aware scoring multipliers
- `enhanceScoringPipeline.ts` - Integration pipeline maintaining <10s performance

### Ali Filters + Multiple Outputs System (Feature 011)
**Targeted Filtering for CrossFit Athlete Optimization** – Advanced filtering system for Ali's specific nutritional needs:

**Core Filtering Capabilities:**
- **Halal Compliance**: Strict halal validation with alcohol/gelatine exclusion and E-number whitelisting
- **Protein Optimization**: 170g daily target with efficiency scoring and Dutch category preferences
- **Post-Workout Recovery**: Carb:protein ratio filtering (2.0-4.0) with glycemic index preferences
- **Fat Loss Compatibility**: Low calorie density (<125 kcal/100g) with high satiety filtering
- **Budget Optimization**: Protein-per-euro efficiency for Dutch market pricing
- **Context Awareness**: Training vs rest day adaptation (2000/1750 kcal, 220/120g carbs)
- **Multiple Output Generation**: Automatic generation of filtered JSONL files for each criteria combination

**CLI Filter Options:**
- `--filters halal,protein,postworkout,fatloss,budget` - Enable specific filter combinations
- `--halal-strict` - Require confirmed halal status
- `--protein-min 20 --protein-target 170` - Protein filtering thresholds
- `--post-workout-min-ratio 2.0 --post-workout-max-ratio 4.0` - Recovery ratios
- `--fat-loss-max-calories 125` - Calorie density for cutting phases
- `--budget-optimize-protein --budget-max-price 2.50` - Dutch market optimization
- `--generate-filtered-outputs` - Create separate files for each filter combination

**Ali-Specific Profiles:**
- `createAliDailyProteinProfile()` - Daily 170g protein hunting with halal compliance
- `createAliPostWorkoutProfile()` - CrossFit recovery optimization
- `createAliCuttingProfile()` - 83kg→72kg fat loss phase
- `createAliBudgetProfile()` - €50/week Dutch market optimization
- `createAliTrainingDayProfile()` / `createAliRestDayProfile()` - Context-aware macro targets

**Output Files:**
- `filtered-ali-daily-protein.jsonl` - Halal + high protein foods
- `filtered-ali-post-workout.jsonl` - Recovery-optimized nutrition
- `filtered-ali-cutting.jsonl` - Fat loss compatible foods
- `filtered-ali-budget.jsonl` - Cost-efficient protein sources
- `*-index.json` and `*-stats.json` for each filtered output

**Key Modules:**
- `filterEngine.ts` - Core filtering logic with Boolean AND operations
- `aliFilterProfiles.ts` - Pre-configured profiles for Ali's use cases
- `outputGenerator.ts` - Multiple filtered output generation

---

## Flexible Relational Schema (Experimental)

An optional normalized SQLite schema optimized for multi-dimensional filtering, hierarchical categories, scoring, and (optionally) full‑text style search term querying.

### Enabling Generation

The flexible schema database is produced during the transform when the internal generator is invoked (already wired in the transform script). Outputs land alongside other artifacts (e.g. `out/flexible-products.db`).

### Feature Flags (Environment Variables)

Set before running the transform command.

| Variable | Values | Default | Effect |
|----------|--------|---------|--------|
| `FLEX_SCHEMA_ENABLE_SEARCH` | `true` / `false` | `true` | When `false`, omits `product_search_terms`, FTS virtual table and related triggers/indexes (cuts file size & build time substantially). |
| `FLEX_SCHEMA_INDEX_TIER` | `full` / `core` / `min` | `core` | Controls how many secondary indexes are created. |

### Index Tiers

| Tier | Intended Use | Index Coverage |
|------|--------------|----------------|
| `full` | Deep analysis, broad ad‑hoc queries, search enabled | All historical indexes (nutrition, flags, scores, additives, category variants, product name/updated, search term indexes if search enabled). |
| `core` (default) | Production browsing & primary filtering on ~30k products | Lean high‑value set: price, nested set, product→category, protein, kcal, flag type/value. |
| `min` | Size-constrained or mobile/offline prototypes | Only absolutely essential structural indexes (nested set, product_categories.category_id, flags type/value). |

Changing tiers materially affects build time & DB size. For most UI filter + category tree use cases, `core` is the sweet spot.

### Search Subsystem

When enabled:
- Table: `product_search_terms`
- (Optionally) FTS5 virtual table `product_search_fts` + trigger for incremental rebuild
- Weighted, categorized terms (name, brand, ingredient, category, synonym, alternative_name, description, nutritional_tag, dietary_flag)

When disabled (`FLEX_SCHEMA_ENABLE_SEARCH=false`):
- All search tables, indexes, FTS objects & triggers omitted
- Search API / hook returns a stub result with explanatory metadata
- Size reduction: removes term rows + FTS index pages + related indexes (often the majority of DB bytes)

### Runtime Detection

The loader exposes helpers that dynamically respect the flag:
- `searchFlexibleProducts()` short‑circuits with a message when search disabled
- `isFlexibleSchemaAvailable()` only probes search table if search enabled
- Stats & summary views show 0 search terms when disabled

### Typical Commands

Disable search, use core index tier:
```
FLEX_SCHEMA_ENABLE_SEARCH=false FLEX_SCHEMA_INDEX_TIER=core npm run transform:production
```

Ultra‑minimal (prototype sizing):
```
FLEX_SCHEMA_ENABLE_SEARCH=false FLEX_SCHEMA_INDEX_TIER=min npm run transform:production
```

Full richness (all indexes + search):
```
FLEX_SCHEMA_ENABLE_SEARCH=true FLEX_SCHEMA_INDEX_TIER=full npm run transform:production
```

### Planned (Not Yet Implemented)

| Proposal | Description |
|----------|-------------|
| `FLEX_SCHEMA_MIN_SIZE` | Apply `WITHOUT ROWID` on select tables, drop low-value indexes automatically, and force `min` tier. |
| Surrogate Integer IDs | Introduce compact numeric primary keys to further reduce B‑tree overhead. |
| Adaptive Vacuum | Post-build size trimming and page density optimization. |

### When To Use / Skip

Use when you need: category tree traversal, multi-criteria nutrition + flags + score filtering, or future advanced search consolidation.

Skip (stick to flat JSONL) when you only need simple lookups or static filtering on a handful of fields and want the smallest possible bundle.

### Caveats

- Experimental: schema & flag names may still evolve.
- Contract tests assume the original 8 entities; when search disabled entity count shrinks (some tests may need adjustment if enforced strictly).
- FTS rebuild is optimized but still heavier with very large term counts; disabling search avoids this entirely.

---
- `cliFilterParser.ts` - CLI argument parsing and validation
- `types/filterCriteria.ts` - Comprehensive filter interface definitions

### Category Tree Navigation System (Feature 012)
**Hierarchical Category Navigation for Product Discovery** - Category tree generation system for Dutch food product hierarchies:

**Core Capabilities:**
- **Hierarchical Tree Structure**: Builds multi-level category trees from product `categoryTree` data
- **Product Count Aggregation**: Counts products at each category level with parent rollup
- **Deterministic Sorting**: Categories sorted by product count (descending) then name (ascending)
- **Flat Category Index**: Generates searchable flat list for filtering and navigation
- **Dutch Category Support**: Handles Dutch category names and hierarchies (Bakkerij, Diepvries, etc.)
- **Statistics Generation**: Category depth analysis, most popular categories, coverage metrics
- **UI-Ready Output**: JSON structure optimized for frontend tree navigation components

**CLI Usage:**
- `--generate-category-tree` - Generate `category-tree.json` with hierarchical navigation structure

**Output Structure:**
- **`category-tree.json`** - Complete category navigation data with:
  - `metadata`: Generation timestamp, product counts, tree statistics
  - `categoryTree`: Hierarchical tree structure with nested children
  - `flatCategories`: Flat array of all categories for search/filter
  - `stats`: Comprehensive category statistics and analysis

**Key Features:**
- **Performance Optimized**: Processes 30k+ products in <1s for category tree generation
- **Memory Efficient**: Removes circular references for JSON serialization
- **Frontend Ready**: Includes UI state fields (isExpanded, isSelected, isVisible)
- **Search Optimized**: Provides both tree and flat representations for different UI patterns
- **Dutch Market Focused**: Handles Albert Heijn category hierarchies with proper depth support

**Key Modules:**
- `buildCategoryTree()` - Constructs hierarchical tree from product category data
- `flattenCategoryTree()` - Creates flat searchable category index
- `calculateCategoryStats()` - Generates comprehensive category statistics
- `writeCategoryTree()` - Atomic JSON file generation with circular reference removal

### Remaining Features for Web UI Enhancement
**Additional Features for Complete Frontend Integration:**

**Health Scoring & Grading:** ✅ **IMPLEMENTED** (Feature 008)
- ✅ Composite health scores (0-100 scale) with EU Nutri-Score + AliScore enhancement
- ✅ A-E letter grade system with percentile-based ranking (A = top 20%, etc.)
- ✅ Both global and category-relative scoring for meaningful differentiation
- ✅ Output: `globalHealthScore`, `globalHealthGrade`, `categoryHealthScore`, `categoryHealthGrade` fields

**Advanced Filtering System:** ✅ **IMPLEMENTED** (Feature 011)
- ✅ Multi-criteria filtering with Ali-specific profiles (halal, protein, post-workout, cutting, budget)
- ✅ Context-aware filtering for training vs rest days
- ✅ Multiple filtered output generation for targeted product lists

**Portion-Aware Context:** ⚠️ **PARTIALLY IMPLEMENTED**
- ✅ Portion utilities implemented in `portionUtils.ts` with realistic serving calculations
- ✅ Category-specific serving size defaults (150g yogurt, 15g nuts, etc.)
- ❌ Missing: Full integration with scoring pipeline for portion-aware health assessments
- ❌ Missing: Per-serving nutrition display in output files
- Need: Enhanced scoring that accounts for typical serving sizes vs per-100g abstractions

These pipeline features will enable the frontend to handle all filtering, ranking, and themed list generation without additional backend processing.

Hashing & baseline drift detection have been removed to simplify the pipeline.

## Schema Doc
Generated at `schema.md` each run. Includes:
- Excluded Columns ( >90% empty )
- Ordering rule statement

## Release Checklist
See `RELEASE_CHECKLIST.md` for a minimal pre-tag routine.

## CI (Planned)
Suggested pipeline step (when CI added):
```
npm ci
npm test
```
Optional perf test (currently skipped) can be enabled by un-skipping T014 when performance becomes a requirement.
If CI absent, treat this section as a TODO to integrate.

## Development
Run a single transform after edits:
```
npm test && npx ts-node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir out
```

## Skipped Scope
- Performance benchmarking
- Drift baseline comparison & fail-on-drift
- Granular exit codes (only 0/1 kept)
- Config precedence via env vars

## Design System Components

This project includes a comprehensive **nutrition-focused design system** built with React, TypeScript, shadcn/ui, and TailwindCSS. All components are fully responsive, accessible (WCAG 2.1 AA), and support both light and dark themes.

### **Core UI Components** (`src/components/ui/`)

#### **Button** (`button.tsx`)
Multi-variant button component with nutrition-themed variants:
- **Basic**: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`
- **Protein Levels**: `protein-low`, `protein-moderate`, `protein-high`
- **Health Grades**: `health-A`, `health-B`, `health-C`, `health-D`, `health-E`
- **Halal Status**: `halal-confirmed`, `halal-questionable`, `halal-prohibited`
- **Sizes**: `sm`, `md`, `lg`, `icon`

#### **Badge** (`badge.tsx`)
Compact status indicators with nutrition classifications:
- **Basic**: `default`, `secondary`, `destructive`, `outline`
- **Nutrition**: Protein levels, calorie density, health grades, halal status
- **Sizes**: `sm`, `md`, `lg`
- **Shapes**: `default`, `rounded`, `pill`

#### **Card** (`card.tsx`)
Flexible container component with specialized variants:
- **Variants**: `default`, `nutrition`, `product`, `interactive`
- **Sizes**: `sm`, `md`, `lg`
- **Elevation**: Enhanced shadow option
- **Subcomponents**: `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`

#### **Input** (`input.tsx`)
Form input with validation states and nutrition theming:
- **States**: `default`, `error`, `success`, `disabled`
- **Fully accessible** with proper ARIA attributes

### **Nutrition Components** (`src/components/nutrition/`)

#### **ProteinMeter** (`protein-meter.tsx`)
Visual protein content indicator with multiple display modes:
- **Modes**: `default`, `daily-progress`, `per-100g`
- **Variants**: `default`, `compact`, `minimal`
- **Features**: Progress visualization, target tracking, level classification
- **Props**: `protein`, `target`, `servingSize`, `showLevel`, `showTarget`, `animated`

#### **HealthGrade** (`health-grade.tsx`)
EU Nutri-Score inspired health grading system:
- **Grades**: A (excellent) to E (poor) with color-coded indicators
- **Variants**: `default`, `compact`, `minimal`, `badge`
- **Features**: Score display, comparison text, trend indicators
- **Props**: `grade`, `score`, `showScore`, `context`, `animated`

#### **HalalBadge** (`halal-badge.tsx`)
Islamic dietary compliance indicator:
- **Statuses**: `confirmed`, `questionable`, `prohibited`, `unknown`
- **Variants**: `default`, `compact`, `minimal`, `icon`
- **Features**: Confidence levels, source attribution, flag indicators
- **Localization**: English, Dutch, Arabic support
- **Props**: `status`, `confidence`, `source`, `flags`, `locale`

### **Design System Provider** (`design-system-provider.tsx`)
Centralized theme and configuration management:
- **Theme Management**: Light/dark mode with CSS variable integration
- **Locale Support**: Multi-language content (EN, NL, AR)
- **Ali-Specific Settings**: 170g protein target, Dutch market preferences
- **Accessibility**: Theme-aware color contrast and WCAG compliance

### **Color System**
Nutrition-focused color palette with theme adaptation:

#### **Protein Levels**
- **Low** (`protein-low`): Light amber for <10g protein
- **Moderate** (`protein-moderate`): Amber for 10-20g protein
- **High** (`protein-high`): Green for >20g protein

#### **Health Grades**
- **Grade A** (`health-A`): Dark green (excellent)
- **Grade B** (`health-B`): Light green (very good)
- **Grade C** (`health-C`): Amber (good)
- **Grade D** (`health-D`): Orange (fair)
- **Grade E** (`health-E`): Red (poor)

#### **Halal Status**
- **Confirmed** (`halal-confirmed`): Green (verified halal)
- **Questionable** (`halal-questionable`): Amber (needs verification)
- **Prohibited** (`halal-prohibited`): Red (contains haram ingredients)

### **Storybook Documentation**
Interactive component documentation with:
- **Live Examples**: All component variants and states
- **Dark Mode Testing**: Built-in theme switcher
- **Accessibility Testing**: Automated a11y validation
- **Real-World Examples**: Practical usage scenarios
- **Interactive Controls**: Dynamic prop manipulation

#### **Available Stories** (`src/stories/`)
- `Button.stories.tsx` - All button variants and combinations
- `Badge.stories.tsx` - Status indicators and nutrition labels
- `Card.stories.tsx` - Container layouts and specialized variants
- `ProteinMeter.stories.tsx` - Protein visualization examples
- `HealthGrade.stories.tsx` - Health scoring demonstrations
- `HalalBadge.stories.tsx` - Dietary compliance indicators

### **Usage Examples**

```tsx
// High protein product button
<Button variant="protein-high">Add to Meal</Button>

// Health grade indicator
<HealthGrade grade="A" score={92} showScore animated />

// Halal compliance badge
<HalalBadge
  status="confirmed"
  confidence={95}
  source="certification"
  showConfidence
/>

// Protein content meter
<ProteinMeter
  protein={25}
  target={170}
  mode="daily-progress"
  showTarget
  animated
/>

// Nutrition-focused card
<Card variant="nutrition">
  <CardHeader>
    <CardTitle>Greek Yogurt</CardTitle>
  </CardHeader>
  <CardContent>
    <ProteinMeter protein={23} servingSize={150} />
  </CardContent>
</Card>
```

### **Technical Features**
- **TypeScript**: Full type safety with strict mode
- **Responsive Design**: Mobile-first with breakpoint optimization
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **Theme Support**: Automatic light/dark mode with CSS variables
- **Performance**: Optimized bundle size with tree-shaking
- **Testing**: Comprehensive test coverage with Vitest

### **Development Commands**
```bash
# Start Storybook development server
npm run storybook

# Build design system
npm run build

# Run component tests
npm test

# Type checking
npm run typecheck
```

The design system is optimized for Ali's nutrition tracking needs while maintaining flexibility for general food and health applications.

## License
Internal / not published.

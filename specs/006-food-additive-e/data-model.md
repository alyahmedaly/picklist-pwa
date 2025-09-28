# Data Model: Food Additive & E-Number Analysis

**Feature**: 006-food-additive-e
**Date**: 2025-01-16

## Entity Definitions

### AdditiveInfo
**Purpose**: Comprehensive information about detected food additives in a product
**Location**: Added to existing Product interface as optional field

```typescript
interface AdditiveInfo {
  // Core identification
  eNumbers: string[];              // ['E300', 'E621'] - detected E-numbers
  dutchCategories: string[];       // ['antioxidant', 'smaakversterker'] - Dutch functional names
  functionalCategories: string[];  // ['Antioxidant', 'Flavor enhancer'] - EU standard categories

  // Detection metadata
  totalAdditives: number;          // Count of all detected additives
  naturalAdditives: string[];      // ['E300'] - naturally occurring additives
  syntheticAdditives: string[];    // ['E621'] - synthetic/manufactured additives

  // Specific additive collections by function
  preservatives: string[];         // E200-E299 range + others
  colors: string[];               // E100-E199 range + others
  antioxidants: string[];         // E300-E399 range + others
  stabilizers: string[];          // E400-E499 range + others
  sweeteners: string[];           // E950-E999 range + others
  flavorEnhancers: string[];      // E600-E699 range + others
}
```

### AdditiveFlags
**Purpose**: Consumer-focused boolean indicators for quick filtering
**Location**: Added to existing Product interface as optional field

```typescript
interface AdditiveFlags {
  // Safety warnings (mandatory by EU regulations)
  requiresChildWarning: boolean;      // Southampton Six colors present
  containsAllergenicAdditives: boolean; // Sulfites (E220-E228) present
  requiresPKUWarning: boolean;        // Aspartame (E951/E962) present
  mayWorsenAsthmaEczema: boolean;     // Benzoic acid group (E210-E213) present

  // Dietary restrictions
  hasAnimalDerivedAdditives: boolean; // E120, E901, E322 (from eggs), etc.
  organicCompatible: boolean;         // All additives permitted in organic products

  // Consumer preferences
  hasPreservatives: boolean;          // Any preservative category additive
  hasArtificialColors: boolean;       // Synthetic color additives
  hasArtificialSweeteners: boolean;   // Synthetic sweetener additives
  hasFlavorEnhancers: boolean;        // MSG and other flavor enhancers

  // Clean label indicators
  hasNaturalAlternatives: boolean;    // Natural E-numbers available as alternatives
  allNaturalAdditives: boolean;       // Only naturally-occurring additives present
}
```

### ENumberDefinition
**Purpose**: Static database of official E-number information
**Location**: New static data structure in `src/data/transform/eNumberDatabase.ts`

```typescript
interface ENumberDefinition {
  // Official identification
  code: string;                    // 'E300'
  officialName: string;           // 'Ascorbic acid'
  dutchNames: string[];           // ['ascorbinezuur', 'vitamine C']

  // Functional classification
  functionalCategory: FunctionalCategory; // Enum of 27 EU categories
  dutchCategoryName: string;      // 'antioxidant'
  purpose: string;                // Human-readable description

  // Safety and regulatory
  isNaturallyOccurring: boolean;  // True for E300 (Vitamin C)
  isSynthetic: boolean;           // True for E951 (Aspartame)
  isAnimalDerived: boolean;       // True for E120 (Carmine)
  organicPermitted: boolean;      // Per EU regulation 2021/1165
  bannedSince?: string;           // '2022-08-07' for E171 (Titanium dioxide)

  // Special warnings
  southamptonSix: boolean;        // Requires child hyperactivity warning
  isAllergen: boolean;           // Sulfites requiring allergen labeling
  pkuWarning: boolean;           // Aspartame PKU warning required
  asthmaEczemaRisk: boolean;     // Benzoic acid group sensitivity

  // Consumer information
  commonProducts: string[];       // ['snoep', 'dranken', 'sauzen']
  voedingscentrumGuidance: string; // Official consumer guidance
}
```

### FunctionalCategory
**Purpose**: Enumeration of 27 official EU additive functional categories
**Location**: Static enum in types file

```typescript
enum FunctionalCategory {
  ANTIKLONTERMIDDEL = 'Antiklontermiddel',
  ANTIOXIDANT = 'Antioxidant',
  ANTISCHUIMMIDDEL = 'Antischuimmiddel',
  BEVOCHTIGINGSMIDDEL = 'Bevochtigingsmiddel',
  COMPLEXVORMER = 'Complexvormer',
  CONSERVEERMIDDEL = 'Conserveermiddel',
  CONTRASTVERHOGER = 'Contrastverhoger',
  DRIJFGAS = 'Drijfgas',
  DRAAGSTOF = 'Draagstof',
  EMULGATOR = 'Emulgator',
  GELEERMIDDEL = 'Geleermiddel',
  GEMODIFICEERD_ZETMEEL = 'Gemodificeerd zetmeel',
  GLANSMIDDEL = 'Glansmiddel',
  KLEURSTOF = 'Kleurstof',
  MEELVERBETERAAR = 'Meelverbeteraar',
  RIJSMIDDEL = 'Rijsmiddel',
  SCHUIMMIDDEL = 'Schuimmiddel',
  SMAAKVERSTERKER = 'Smaakversterker',
  SMELTZOUT = 'Smeltzout',
  STABILISATOR = 'Stabilisator',
  VERDIKKINGSMIDDEL = 'Verdikkingsmiddel',
  VERPAKKINGSGAS = 'Verpakkingsgas',
  VERSTEVIGINGSMIDDEL = 'Verstevigingsmiddel',
  VOEDINGSZUUR = 'Voedingszuur',
  VULSTOF = 'Vulstof',
  ZOETSTOF = 'Zoetstof',
  ZUURTEREGELAAR = 'Zuurteregelaar'
}
```

### ConsumerGuidance
**Purpose**: Voedingscentrum-compliant information for consumer presentation
**Location**: Static data structure for UI/output formatting

```typescript
interface ConsumerGuidance {
  // Safety messaging (based on Voedingscentrum position)
  safetyMessage: string;          // "E-nummers kun je veilig eten en drinken"
  officialPosition: string;       // Link to Voedingscentrum source

  // Warning templates
  childWarningTemplate: string;   // "[naam/E-nummer]: kan de activiteit of oplettendheid..."
  pkuWarningTemplate: string;     // "bevat aspartaam (een bron van fenylalanine)"
  allergenWarningTemplate: string; // "bevat sulfiet" declaration

  // Clean label alternatives
  naturalAlternatives: Record<string, string>; // E621 -> "gistextract"
  dutchPreferredNames: Record<string, string>; // E330 -> "citroenzuur"

  // Educational content
  categoryExplanations: Record<FunctionalCategory, string>;
  commonMisconceptions: string[];
}
```

## Entity Relationships

### Product Extension
Existing Product interface extended with:
```typescript
interface Product {
  // ... existing fields ...
  additiveInfo?: AdditiveInfo;    // Only for food products with detected additives
  additiveFlags?: AdditiveFlags;  // Only for food products with detected additives
}
```

### Data Flow
1. **Input**: Dutch ingredient strings from CSV
2. **Processing**: `parseAdditives()` function analyzes ingredients
3. **Lookup**: Cross-reference against `ENumberDefinition` database
4. **Classification**: Map to `FunctionalCategory` enums
5. **Flagging**: Generate `AdditiveFlags` based on safety rules
6. **Output**: Enhanced Product with `additiveInfo` and `additiveFlags`

## Validation Rules

### Required Fields Validation
- `eNumbers[]` must contain valid E-number format (E\d{3,4}[a-z]?)
- `functionalCategories[]` must map to valid `FunctionalCategory` enum values
- `totalAdditives` must equal sum of all detected additive arrays

### Business Rules Validation
- If `southamptonSix` E-number detected → `requiresChildWarning` must be true
- If sulfites (E220-E228) detected → `containsAllergenicAdditives` must be true
- If aspartame (E951/E962) detected → `requiresPKUWarning` must be true
- If any animal-derived additive → `hasAnimalDerivedAdditives` must be true

### Data Integrity Rules
- All E-numbers must exist in `ENumberDefinition` database
- Dutch category names must match official Voedingscentrum terminology
- Banned additives (E171) must be flagged appropriately with ban date

## Performance Considerations

### Memory Optimization
- Static E-number database loaded once at startup
- Lazy computation: only analyze products with `isFood: true`
- Efficient string operations for ingredient parsing
- Minimal object allocation during processing

### Processing Optimization
- Pre-compiled regex patterns for E-number detection
- Hash map lookups for E-number definitions (O(1) access)
- Batch processing compatible with existing streaming architecture
- Short-circuit evaluation for non-food products

## Integration Points

### Existing Codebase Integration
- Extends existing `src/data/transform/types.ts` Product interface
- Follows existing pattern of `computeNutritionalTags.ts` for integration
- Uses existing ingredient parsing infrastructure
- Maintains compatibility with existing JSONL output format

### Statistics Integration
- Extends existing `stats.ts` with additive prevalence counters
- Adds distribution tracking for functional categories
- Maintains deterministic output for reproducible builds
- Compatible with existing schema.md generation
# Research: CSV Parser Package

## Current Implementation Analysis

### Code Location and Structure
The existing CSV parsing logic is located in `src/scripts/transform-data.ts` with the following key components:

**Lines 31-73**: `CSVRow` interface with Dutch food product fields
- Product identification fields (ProductId, id, ID, sku)
- Product details (ProductName, name, product_name)
- Pricing fields (PriceRegular, price_regular, price, PriceSale, price_sale)
- Product specifications (ProductUnitSize, size, unit)
- Content fields (Ingredients, ingredients)
- Allergen fields (ContainedAllergens, MayContainAllergens)
- Category hierarchy (Category1-Category6)
- Index signature for additional CSV columns

**Lines 79-90**: `createCSVRow` helper function
- Creates type-safe CSV row from headers and values
- Handles missing values with empty string defaults
- Provides proper TypeScript typing

**Lines 96-106**: `csvRowToRecord` helper function
- Converts CSVRow to Record<string, string> for legacy compatibility
- Filters out undefined values to maintain string type consistency

**Lines 183-199**: Two-pass parsing approach
- First pass: Sparsity analysis using @std/csv parse() function
- Converts parsed matrix to record objects for calculateSparsity from @picklist/core
- Integrates with existing sparsity threshold detection (>90% empty columns)

### Dependency Integration
- **@std/csv**: Used for CSV parsing with parse() function
- **@picklist/core**: calculateSparsity function for sparsity analysis
- **Node.js**: readFileSync for file I/O operations

### Current Performance Characteristics
- Fully in-memory parsing model
- Two-pass processing: sparsity scan + full parsing
- Matrix-based data structure conversion
- Type-safe header mapping with fallback handling

## Extraction Strategy

### Package Interface Design
Based on clarifications, the parser should export separate functions for granular control:

**Decision**: Export distinct functions for each parsing step
- `readCSV(csvText: string): { headers: string[], matrix: string[][] }`
- `createRows(headers: string[], matrix: string[][]): CSVRow[]`
- `convertTypes(csvRows: CSVRow[]): Record<string, string>[]`

**Rationale**: Provides flexibility for different use cases while maintaining the existing two-pass approach compatibility.

**Alternatives Considered**: Single parseCSV function - rejected because it would reduce granular control over parsing steps.

### Dependency Management
**Decision**: @std/csv becomes a direct dependency of @picklist/parser package
- Parser package owns CSV library dependency
- Transform-data.ts imports parsing functions from @picklist/parser
- No dependency duplication across workspace packages

**Rationale**: Encapsulates CSV parsing concerns within the parser package, following single responsibility principle.

**Alternatives Considered**: Keep @std/csv as dev dependency in root - rejected because it creates unclear dependency ownership.

### Interface Compatibility
**Decision**: Maintain current CSVRow interface with fixed Dutch food product fields
- Preserve existing column mapping variations
- Keep index signature for extensibility: `[key: string]: string | undefined`
- No breaking changes to field structure

**Rationale**: Maintains backward compatibility with existing transform pipeline and Dutch localization requirements.

**Alternatives Considered**: Generic CSV interface - rejected because it would break existing Dutch food product assumptions.

### Validation Strategy
**Decision**: Structural comparison of parsed data objects ignoring order differences
- Compare all data content for identity verification
- Allow for different ordering between original and extracted implementations
- Validate that no data is lost or transformed during extraction

**Rationale**: Ensures functional equivalence while allowing for implementation flexibility.

**Alternatives Considered**: Byte-identical comparison - rejected because order differences are acceptable for validation.

### Version Management
**Decision**: Start at version 1.0.0 immediately
- No pre-release versions (0.x.x) since extracting stable, proven functionality
- Breaking changes require semantic major version bump only
- No mandatory deprecation warning period guaranteed

**Rationale**: The extracted code is already stable and battle-tested in production transform pipeline.

**Alternatives Considered**: Start at 0.1.0 - rejected because the functionality is mature and stable.

### Error Handling Strategy
**Decision**: Fail-fast on malformed CSV rows
- Throw descriptive error for missing required columns
- Throw descriptive error for unparsable numeric fields
- Abort entire parsing process, no partial output
- Maintain existing error handling patterns from transform-data.ts

**Rationale**: Preserves current behavior and prevents silent data corruption.

**Alternatives Considered**: Skip-and-continue with warnings - rejected because current implementation fails fast.

### Performance Requirements
**Decision**: No explicit performance target beyond subjective parity
- Maintain current fully in-memory parsing model
- Preserve two-pass processing approach
- Accept out-of-memory risk for large files (streaming deferred to future)

**Rationale**: Maintains existing performance characteristics without introducing complexity.

**Alternatives Considered**: Streaming parser API - rejected as out of scope for initial extraction.

### Observability Scope
**Decision**: Parser remains silent (no logging, metrics, event callbacks)
- Only errors surfaced via thrown exceptions
- Host applications must wrap parser if instrumentation desired
- Maintains pure function characteristics

**Rationale**: Keeps parser focused on data transformation without side effects.

**Alternatives Considered**: Built-in logging - rejected to maintain constitutional minimal dependencies principle.

## Integration Points

### Sparsity Calculation Integration
The parser must maintain compatibility with `calculateSparsity` from @picklist/core:
- Convert parsed CSV data to `Record<string, string>[]` format
- Preserve matrix-to-record transformation logic
- Support existing >90% sparsity threshold detection

### Transform Pipeline Integration
The extracted parser will integrate seamlessly with existing transform-data.ts:
- Replace inline parsing logic with @picklist/parser imports
- Maintain identical output data structures
- Preserve two-pass processing workflow
- Support existing filter criteria and CLI options

### NPM Workspace Structure
Follow established patterns from @picklist/core:
- Package structure under `packages/parser/`
- TypeScript configuration with project references
- Vitest testing configuration
- ESLint compliance
- README.md with API documentation

## Technical Decisions Summary

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Separate parsing functions | Granular control over parsing steps | Single parseCSV function - reduces flexibility |
| @std/csv in parser package | Encapsulates CSV parsing concerns | Keep in root - unclear dependency ownership |
| Fixed CSVRow interface | Backward compatibility with Dutch localization | Generic interface - breaks existing assumptions |
| Version 1.0.0 start | Extracting stable, proven functionality | 0.x versions - code is already mature |
| Fail-fast error handling | Preserves current behavior | Skip-and-continue - changes existing behavior |
| In-memory parsing only | Maintains existing performance model | Streaming API - adds complexity |
| Silent operation | Pure function without side effects | Built-in logging - violates minimal dependencies |
| Structural data comparison | Functional equivalence validation | Byte-identical - too strict for order differences |
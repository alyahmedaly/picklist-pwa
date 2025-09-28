# Research: UI-Optimized JSON Output Format

## Decision: JSON Structure Transformation Approach

**What was chosen**: Extend existing transform pipeline with UI formatting functions that restructure output data into UI-friendly formats while preserving all original data integrity.

**Rationale**:
- Existing pipeline already processes 30k+ products efficiently
- Current JSON output contains all necessary data but in suboptimal structure for UI consumption
- Category arrays are flat but represent hierarchical relationships
- Nutrition data lacks explicit units making frontend display complex
- Additive information is comprehensive but overly complex for typical UI needs
- No existing UI consumers means no backward compatibility concerns

**Alternatives considered**:
1. **Post-processing transformation**: Transform existing JSONL after generation
   - Rejected: Would require double I/O and violate single-pass constitutional requirement
2. **Separate UI endpoint/format**: Create entirely separate output format
   - Rejected: Would duplicate logic and increase maintenance burden
3. **Client-side transformation**: Leave transformation to frontend
   - Rejected: Violates user requirement to eliminate client-side data transformation

## Decision: Category Hierarchy Structure

**What was chosen**: Transform flat category arrays into structured tree with navigation helpers:
```json
{
  "categories": {
    "tree": ["Bakkerij", "Afbakbrood", "Stokbrood en ciabatta"],
    "primary": "Bakkerij",
    "breadcrumbs": "Bakkerij > Afbakbrood > Stokbrood en ciabatta"
  }
}
```

**Rationale**:
- Current format `["Bakkerij", "Afbakbrood", "Stokbrood en ciabatta"]` represents clear hierarchy
- UI components typically need both structured navigation and display strings
- Primary category useful for filtering/grouping
- Breadcrumbs eliminate client-side string construction

**Alternatives considered**:
1. **Nested object structure**: `{ "Bakkerij": { "Afbakbrood": ["Stokbrood en ciabatta"] } }`
   - Rejected: Complex to traverse, variable depth makes UI rendering difficult
2. **Parent-child references**: Array of objects with parent IDs
   - Rejected: Over-engineered for simple hierarchy, increases data size

## Decision: Currency Detection Strategy

**What was chosen**: Default EUR for Dutch product context, with configurable override option.

**Rationale**:
- Current hardcoded USD is incorrect for Dutch Albert Heijn products
- Context clearly indicates Dutch market (categories in Dutch, allergen terms in Dutch)
- Simple default with configuration option maintains flexibility

**Alternatives considered**:
1. **Locale-based detection**: Detect from ingredient language
   - Rejected: Too complex, unreliable for mixed-language products
2. **Price pattern analysis**: Detect currency from numeric patterns
   - Rejected: EUR and USD have similar patterns, unreliable

## Decision: Ingredient Separation Approach

**What was chosen**: Parse existing ingredient arrays to separate core ingredients, additives, and nutritional statements:
```json
{
  "ingredients": {
    "core": ["tarwebloem", "water", "gist"],
    "additives": ["antioxidant (ascorbinezuur [E300])"],
    "nutritionalStatement": "Waarvan toegevoegde suikers 0.00g per 100 gram"
  }
}
```

**Rationale**:
- Current array mixes different types of information
- UIs typically display ingredients and additives differently
- Nutritional statements are metadata, not ingredients
- Separation enables targeted UI rendering

**Alternatives considered**:
1. **Regex-based classification**: Use patterns to classify during parsing
   - Rejected: Complex, error-prone, would require extensive testing
2. **Manual tagging**: Add type fields to each ingredient
   - Rejected: Changes existing data structure significantly

## Decision: Additive Information Simplification

**What was chosen**: Create simplified additive summary focused on consumer-relevant information:
```json
{
  "additives": {
    "eNumbers": ["E300"],
    "summary": "1 additive (natural antioxidant)",
    "warnings": [],
    "dietary": { "vegan": true, "organic": true }
  }
}
```

**Rationale**:
- Current `additiveInfo` and `additiveFlags` contain duplicate information
- UI typically needs simple summary for display
- Safety warnings are most important for consumers
- Dietary compatibility is key for filtering

**Alternatives considered**:
1. **Keep existing structure**: Leave complex nested format
   - Rejected: Violates user requirement for UI-friendly format
2. **Multiple summary levels**: Basic, detailed, expert views
   - Rejected: Over-engineered for initial requirement

## Decision: Nutrition Data Enhancement

**What was chosen**: Add explicit units and group related values:
```json
{
  "nutrition": {
    "energy": { "kcal": 241, "kJ": 1023 },
    "macros": {
      "fat": { "value": 1, "unit": "g" },
      "carbs": { "value": 50, "unit": "g" }
    }
  }
}
```

**Rationale**:
- Current format requires UI to know that values are in grams/kcal
- Explicit units eliminate assumptions and errors
- Logical grouping (energy vs macros) matches common UI patterns

**Alternatives considered**:
1. **Unit suffixes**: `"fat_g": 1, "energy_kcal": 241`
   - Rejected: Makes field names variable, complicates programmatic access
2. **Separate units object**: Keep values flat, add `"units": {"fat": "g"}`
   - Rejected: Separates related information, more complex to consume

## Decision: UI Helper Fields Strategy

**What was chosen**: Add computed helper fields for common UI needs:
- `displayName`: Clean product name
- `summary`: One-line description
- `tags`: Key characteristics array
- `warnings`: Consolidated safety warnings

**Rationale**:
- Eliminates client-side computation for common display needs
- Standardizes formatting across different UIs
- Reduces frontend complexity and potential inconsistencies

**Alternatives considered**:
1. **Computed endpoints**: Generate helpers on-demand via separate API
   - Rejected: This is a CLI tool, not an API
2. **Template system**: Provide templates for client-side rendering
   - Rejected: Still requires client-side processing

## Technical Implementation Strategy

**Approach**: Extend existing transform pipeline with optional UI formatting step:

1. **New UI Formatter Module** (`src/data/transform/uiFormatter.ts`):
   - Pure functions for each transformation type
   - Takes existing Product interface, returns UI-optimized version
   - Preserves all original data integrity

2. **CLI Integration**:
   - Add `--format ui` flag to existing transform command
   - Default remains current format for backward compatibility
   - UI format becomes additional output option

3. **Testing Strategy**:
   - Unit tests for each formatter function (RED-GREEN-REFACTOR)
   - Integration tests comparing UI format to original format

4. **Constitutional Compliance**:
   - Maintains deterministic output (same input → same output)
   - Preserves single-pass processing architecture
   - No new dependencies required
   - Structured logging for UI format operations

This approach extends existing proven architecture while meeting all constitutional requirements and user needs.
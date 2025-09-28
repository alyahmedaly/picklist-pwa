# API Contracts: Food Additive & E-Number Analysis

**Feature**: 006-food-additive-e
**Date**: 2025-01-16

## Contract Overview

This feature extends the existing CSV → JSONL transformation pipeline with additive analysis capabilities. No new HTTP endpoints are required - the contracts define the data transformation interfaces and validation rules.

## Data Transformation Contracts

### Input Contract: CSV Product Data
```
Expected Input: Dutch product CSV with ingredient columns
Required Fields: id, name, ingredients (Dutch text)
Optional Fields: category, brand, price
```

### Output Contract: Enhanced Product JSONL
```
Enhanced Product Interface with new optional fields:
- additiveInfo?: AdditiveInfo
- additiveFlags?: AdditiveFlags
```

### Processing Contract: parseAdditives Function
```typescript
function parseAdditives(ingredients: string): {
  additiveInfo?: AdditiveInfo;
  additiveFlags?: AdditiveFlags;
}
```

## Validation Contracts

### E-Number Format Validation
- Pattern: /^E\d{3,4}[a-z]?$/
- Examples: E300, E621, E110a
- Invalid: E99, E12345, 300

### Dutch Category Mapping Validation
- Must map to one of 27 FunctionalCategory enum values
- Case-insensitive matching
- Support plural forms (conserveermiddelen → conserveermiddel)

## Error Handling Contracts

### Unknown E-Number Detection
- Log warning for unrecognized E-numbers
- Continue processing remaining ingredients
- Track unknown counts in statistics

### Invalid Ingredient Format
- Skip malformed ingredient entries
- Maintain deterministic output
- Report parsing errors in debug mode
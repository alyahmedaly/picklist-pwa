# Feature Specification: CSV to JSONL Product Data Transformer

**Feature Branch**: `001-csv-to-jsonl`  
**Created**: 2025-09-15  
**Status**: Draft  
**Input**: User description: "CSV to JSONL data transformer: Convert large raw product CSV (30,498 rows, 106 columns) into streamlined JSONL + index JSON artifacts for client consumption without relational joins. Includes parsing unit sizes, ingredients, allergens, nutrition, prices, images, added sugar/salt extraction, category hierarchy, heuristics for isFood and isPetFood. Exclude sparse micronutrients (>90% missing). Output: products.jsonl, products-index.json, stats.json, schema.md. Add npm script and TypeScript transformer with streaming parsing. Provide extensibility notes for future SQLite or search indexing."

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A platform maintainer needs a reliable way to transform a large, messy supermarket product CSV export into a concise, consumer‑ready dataset so the web application can load product information quickly without performing complex joins or parsing logic at runtime.

### Acceptance Scenarios
1. **Given** the raw CSV file is present in the `data` directory, **When** the maintainer triggers the data transformation process, **Then** new output data artifacts (JSONL, index JSON, stats, schema description) are produced and older versions are replaced.
2. **Given** the transformation completes successfully, **When** the application consumes the index JSON, **Then** it can list products with names, IDs, primary image, price, and categories without loading the full detailed dataset.
3. **Given** a product with complex unit size formatting (e.g., "6 x 0,33 l"), **When** the transformation runs, **Then** the product’s size is normalized into structured fields (pack count, amount, unit) in the output.
4. **Given** a product containing an ingredients paragraph with added sugar/salt statements, **When** the transformation runs, **Then** added sugars and salt per 100g/ml (if detected) are extracted into dedicated output fields.
5. **Given** a product with allergen declarations, **When** the transformation runs, **Then** contained and may‑contain allergens are listed separately in arrays.
6. **Given** non‑food and household products, **When** the transformation runs, **Then** they are marked so the consuming application can filter them from dietary contexts.
7. **Given** duplicate product IDs appear in the CSV, **When** the transformation processes them, **Then** later occurrences merge into the existing product (preserving first-seen values unless later row supplies a previously missing field, and accumulating unique categories and images) and the duplicate event is recorded in stats.
8. **Given** a sparsity threshold rule is defined (>90% missing for a field), **When** a field crosses that threshold, **Then** it is excluded; if threshold evaluation logic itself fails, the transformation fails with an error.

### Edge Cases
- CSV rows that have only an ID and name but no nutrition: still exported with minimal fields.
- Rows where unit size is ambiguous or unparsable: exported with raw unit string and no parsed numeric fields.
- Ingredients lines lacking the "Ingrediënten:" prefix: still split into list where feasible.
- Products without any image URLs: exported without an `images` object (or with only available sizes) while not causing consumer failures.
- Allergen fields containing "NA" or empty: emitted as empty arrays.
- Extremely large numeric values or malformed percentages: ignored for derived fields while retaining original text where meaningful.
- Duplicate product IDs: merged as described (later rows fill missing fields; conflicts keep first value, except arrays are unioned).
- CSV header stability: headers are assumed fixed; if required headers are absent the process fails immediately.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST ingest a single source CSV containing product rows with 100+ raw columns.
- **FR-002**: The system MUST produce a line‑delimited JSON (JSONL) file containing one denormalized product object per line.
- **FR-003**: The system MUST produce a separate compact index JSON containing lightweight product summaries (ID, name, categories, primary image, pricing) for fast initial loading.
- **FR-004**: The system MUST remove or omit fields whose coverage is below a sparsity threshold (>90% missing) excluding core nutrition fields and MUST fail if sparsity evaluation cannot complete.
- **FR-005**: The system MUST extract and structure category hierarchy into an ordered array of non‑missing category levels.
- **FR-006**: The system MUST parse heterogeneous unit size strings into structured fields (raw string plus parsed components when detectable).
- **FR-007**: The system MUST split ingredients text into an ordered list with the leading introductory label removed.
- **FR-008**: The system MUST extract declared added sugars and added salt per 100g/ml when explicitly stated in the ingredients paragraph.
- **FR-009**: The system MUST separate contained allergens from potential (may contain) allergens into distinct arrays.
- **FR-010**: The system MUST cast numeric nutrition and price values to numbers where valid and omit them otherwise.
- **FR-011**: The system MUST flag whether a product is food vs non‑food using a repeatable heuristic based on categories and nutrition presence.
- **FR-012**: The system SHOULD flag pet food distinctly if identifiable via category hierarchy.
- **FR-013**: The system MUST include available image URLs and designate at least one as primary if any exist.
- **FR-014**: The system MUST generate a statistics artifact summarizing record counts, field coverage percentages, sparsity threshold applied, duplicate ID merge count, and timestamp.
- **FR-015**: The system MUST generate a schema description artifact explaining each exported field’s meaning for consumers.
- **FR-016**: The system MUST handle missing or NA values by omitting those fields rather than emitting null where practical to reduce size.
- **FR-017**: The system MUST maintain stable ordering of keys inside each product object for deterministic diffing (e.g., id, name, price, categories, unit, nutrition, ingredients, allergens, images, flags, added).
- **FR-018**: The system MUST report (in stats) counts of rows skipped and reasons (e.g., missing mandatory ID or name).
- **FR-019**: The system MUST detect duplicate product IDs and merge later rows into the first while recording each merge event.
- **FR-020**: The system MUST fail gracefully with a clear error if the source CSV file is unreadable or required headers are missing.
- **FR-021**: The system SHOULD continue processing remaining rows when encountering a malformed line while counting errors.
- **FR-022**: The system SHOULD allow future extension to include currently excluded micronutrients without changing existing field semantics.
- **FR-023**: The system MUST complete transformation within an acceptable time for a ~30K record file (target: under 10 seconds on a typical modern laptop CPU).
- **FR-024**: The system MUST ensure output artifacts can be versioned and cache‑busted (include a content hash or checksum in stats).
- **FR-025**: The system MUST NOT enforce a strict index size limit but SHOULD keep the index minimal by excluding non‑essential fields.

### Key Entities
- **Product (Transformed)**: Represents a single purchasable item with core commercial, categorical, nutritional, compositional, and media attributes needed for presentation and filtering.
- **Ingredient**: An ordered component of a product’s composition, derived from textual list; implicitly associated to its product.
- **Allergen Declaration**: Two conceptual sets per product—contained allergens and potential cross‑contamination allergens.
- **Category Path**: Ordered list of hierarchical categories associated with a product used for navigation and filtering.
- **Statistics Summary**: Aggregated metrics about the transformation run (counts, coverage, sparsity decisions, duplicate merges, warnings, error counts, timestamp, source hash).
- **Schema Description**: Human-readable metadata documenting each exported field’s purpose and interpretation.

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (avoids specifying code-level approaches beyond output artifact forms)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable (includes runtime target and merge behavior)
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified (stable CSV headers)

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (resolved)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

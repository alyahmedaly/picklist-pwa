# Research – CSV to JSONL Product Data Transformer

## Decisions & Rationale

### 1. CSV Parsing Approach
**Decision**: Implement custom streaming parser using Node `readline` / chunked `fs.createReadStream` + state machine for quotes.
**Rationale**: Control over memory & performance; avoid extra dependency footprint.
**Alternatives**: `csv-parse` (simpler but adds dep), full file load (higher memory, slower start).

### 2. Sparsity Analysis
**Decision**: First pass counting non-`NA` per column; threshold >90% missing triggers exclusion (except whitelist of core nutrition fields).
**Rationale**: Avoid wide sparse JSON objects; reduces payload size.
**Alternatives**: Inline counting during transform (would require buffering decisions; complexity). Two-pass acceptable for 30K rows.

### 3. Duplicate Merge Strategy
**Decision**: First occurrence establishes canonical product; subsequent rows merge: fill empty primitive fields; arrays union (preserve order); ignore conflicting primitive differences (report in stats conflict counter).
**Rationale**: Deterministic, minimal complexity; retains earliest authoritative values.
**Alternatives**: Overwrite with latest (risk of regression), error out (blocks pipeline).

### 4. Unit Size Parsing
**Decision**: Regex patterns prioritized by specificity; fallback to raw only.
**Rationale**: Quick extraction for UI (pack count, per-unit amount, unit).
**Alternatives**: Full parser/grammar library (overkill).

### 5. Ingredients Parsing & Added Values
**Decision**: Strip leading label, split on commas, soft-trim parentheses, regex extraction for “Waarvan toegevoegde suikers” & “toegevoegd zout”.
**Rationale**: Good-enough heuristic; errors low-risk (display fallback still works).
**Alternatives**: NLP tokenization (unnecessary complexity now).

### 6. Allergen Extraction
**Decision**: Comma split, trim, filter `NA`; maintain two arrays (contains, mayContain).
**Rationale**: Simple, sufficient for filtering UI.
**Alternatives**: Cross-reference canonical allergen list (future enhancement for normalization).

### 7. Classification (isFood / isPetFood)
**Decision**: Heuristic: product isFood if any macro nutrition present OR Category1 in predefined allowlist excluding known non-food groups; isPetFood if Category1 == 'Huisdier' and Category2 indicates feed.
**Rationale**: Fast and explicit; easily tunable.
**Alternatives**: ML classifier (overkill currently).

### 8. Performance Target
**Decision**: <10s hard requirement; aim <3s typical on modern laptop CPU.
**Rationale**: Keeps build step negligible.
**Alternatives**: Single-pass only; rejected due to need for sparsity analysis pre-serialization.

### 9. Omitted Micronutrients
**Decision**: Drop columns exceeding sparsity threshold; document in `schema.md` excluded list.
**Rationale**: Prevent schema bloat.
**Alternatives**: Keep null placeholders (wastes space).

### 10. Output Determinism
**Decision**: Deterministic key order + stable sorting of products by numeric ID before final write (after merges) for reproducible diffs.
**Rationale**: Facilitates caching & version control.
**Alternatives**: Natural arrival order (less predictable merges).

## Risks & Mitigations
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Custom CSV parser edge cases (embedded quotes/newlines) | Incorrect field splits | Medium | Add targeted tests with crafted tricky lines; allow optional switch to library parser. |
| Memory spike during two-pass approach | Exceeds budget on larger files | Low | Counters only store integers per column (~hundreds of bytes). |
| Incorrect heuristic classification | Mislabel filtering | Medium | Log classification stats; allow override mapping file later. |
| Duplicate merge hides important change | Data accuracy | Low | Stats include conflict count; can review. |
| Regex misses some added sugar phrasing variants | Missing derived fields | Medium | Keep raw ingredients; iterative improvement allowed. |
| Future micronutrient need | Rework schema | Low | Document excluded columns list to allow future reintroduction with minor version bump. |

## Open Items (Resolved)
- None outstanding.

## Glossary
- **JSONL**: JSON Lines, one JSON object per line.
- **Sparsity Threshold**: Percentage above which field removal occurs (>90% missing).

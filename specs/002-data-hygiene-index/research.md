# Research: Data Hygiene & Index Refinement

## Decisions & Rationale

### Placeholder Token Handling (FR-DH-001)
- Decision: Define canonical placeholder set {"na","n/a","none","null","-"} (case-insensitive, trim punctuation) for ingredients.
- Rationale: Eliminates meaningless tokens that skew sparsity stats and ingredient heuristics.
- Alternatives: Allow list from config (rejected: scope creep, no requirement); broader regex for non-alphabetic tokens (rejected: risk of removing legitimate symbols like E-numbers).

### Allergen Whitelist & Normalization (FR-DH-002, FR-DH-003)
- Decision: Maintain fixed whitelist enumerated in spec; normalize to lowercase singular; drop URL tokens via /^https?:\/\//.
- Rationale: Removes noise while keeping deterministic ordering; avoids false positives from marketing text or asset links.
- Alternatives: Stemming or fuzzy matching (rejected: complexity, non-deterministic edge cases); dynamic whitelist update (rejected: adds state & governance overhead).

### isFood Classification Refinement (FR-DH-004)
- Decision: Negative keyword match on primary category path tokens to flip isFood=false.
- Rationale: Low-risk deterministic improvement; avoids adding ML/heuristics.
- Alternatives: Multi-stage taxonomy mapping (rejected: not justified by current error rate).

### Index Completeness Enforcement (FR-DH-005, FR-DH-006)
- Decision: Require id, non-blank name, finite numeric price before emitting entry; restrict fields (drop image until real data reliable).
- Rationale: Prevents stub entries that confuse downstream search.
- Alternatives: Emit partial with quality flag (rejected: increases consumer surface area).

### Optional Omission of Empty Structures (FR-DH-007)
- Decision: Treat absent vs empty for listed keys equivalently in canonical hash path; implement normalization step before hashing.
- Rationale: Allows leaner output without semantic drift; preserves deterministic hashing (FR-DH-008).
- Alternatives: Keep empties (baseline) (rejected: clutter) OR encode omission flag (rejected: needless complexity).

### Hash Stability & Regression Testing (FR-DH-008)
- Decision: Add fixture snapshot of (id, oldHash, newHash, reasonChanged?) and test that unchanged semantics keep identical hashes.
- Rationale: Quantifies impact; creates guardrail for future hygiene tweaks.
- Alternatives: Ignore hash drift (rejected: violates determinism principle).

### Schema & Stats Extensions (FR-DH-009, FR-DH-010)
- Decision: Append 'Hygiene Rules' section to schema doc; add skippedIndexEntries counter in stats object.
- Rationale: Transparent documentation; observability of hygiene effect.
- Alternatives: Omit stats counter (rejected: no feedback loop for data quality improvements).

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-filtering ingredients | Loss of valid minor tokens | Conservative placeholder set only |
| Allergen whitelist drift | Miss new regulated allergens | Document update path; add TODO in schema section |
| Hash instability due to omission | Downstream cache invalidation | Regression test & equivalence normalization |
| False negatives in isFood | Some food items misclassified | Keep keyword list small; log classification decisions (debug mode) |
| URL detection false positives | Drop legitimate tokens with 'http' pattern | Strict ^https?:// anchor only |

## Open Questions
None (spec declares no ambiguities; will revisit if new edge cases emerge during tests).

## Constitution Alignment
- Deterministic: Normalization precedes hashing; explicit placeholder & whitelist sets.
- Single Responsibility: Hygiene logic stays within parsers/classifier; writer handles omission canonicalization.
- Test-First: All FR-DH-* require failing tests before implementation.
- Observability: New stat, schema doc section.

## Summary
The hygiene feature introduces deterministic filtering and stricter indexing without expanding dependency surface or introducing probabilistic logic. All changes are localizable, testable, and reversible.

## Additional Research Areas (Forward-Looking)

### 1. Regulatory Allergen Drift Monitoring
- Objective: Track evolving EU/US allergen lists (e.g., addition of sesame in US) to update whitelist proactively.
- Approach: Schedule quarterly review; maintain external YAML of allergens versioned; add test validating whitelist parity with file.
- Open Question: Automate diff ingestion vs manual governance? (Defer until first change request.)

### 2. Internationalization & Locale Variants
- Issue: Ingredients/allergens may appear in Dutch, French, German future datasets.
- Research: Map multilingual synonyms to canonical English tokens pre-whitelist.
- Risk: Over-normalization merging distinct allergens; require per-locale mapping file.

### 3. Hash Canonical Spec Formalization
- Need: Current hash canonicalization implicit in implementation.
- Action: Write `HASH_SPEC.md` describing normalization steps, ordering, omission equivalence; add spec-parity test that recomputes hash via pure function and compares.

### 4. Performance Impact of Omission Normalization
- Hypothesis: <2% overhead; unverified.
- Plan: Add micro-benchmark (10k synthetic rows) measuring parse+hash before/after hygiene blocks; threshold regression guard.

### 5. Classification Maintenance Strategy
- Challenge: Keyword blacklist may grow ad-hoc.
- Proposal: External JSON listing negative category tokens with rationale & date added; tests ensure unused tokens flagged.

### 6. Schema Evolution & Consumer Versioning
- Consideration: Omitting empty fields may affect naive consumers expecting keys.
- Mitigation: Add schema version note indicating omission semantics; provide sample record in schema doc.

### 7. Potential .NET Aspire Integration (Future Pipeline Orchestration)
- Context: Not currently a .NET project; if pipeline migrates to .NET Aspire for distributed orchestration, research required.
- Topics to Investigate:
	* Resource modeling for transform service
	* Observability bridging (structured logs → Aspire dashboards)
	* Determinism guarantees across distributed steps
- Deferral: Outside current TypeScript scope; track as architecture spike if stack changes.

### 8. Provenance & Lineage Metadata
- Idea: Embed source CSV line number / original tokens for audit in optional debug mode.
- Risk: Hash stability impact if included by default → keep out of canonical hash path.

### 9. Pluggable Hygiene Rules
- Future: Allow external JSON config overriding placeholder/allergen sets.
- Guardrail: Config must sort & freeze to keep determinism; test ensuring identical hash when config logically equivalent (order-insensitive).

### 10. Security Review for Input Sanitization
- Scope: Ensure placeholder and allergen parsing cannot be exploited for path traversal or injection in downstream logs.
- Action: Fuzz test ingredient/allergen lines with random unicode and URL patterns.

# Constitution Update Checklist

When amending the constitution (`/memory/constitution.md`), ensure all dependent documents are updated to maintain consistency.

## Templates to Update

### When adding/modifying ANY principle:
- [ ] `/templates/plan-template.md` - Update Constitution Check section
- [ ] `/templates/spec-template.md` - Update if requirements/scope affected
- [ ] `/templates/tasks-template.md` - Update if new task types needed
- [ ] `/.claude/commands/plan.md` - Update if planning process changes
- [ ] `/.claude/commands/tasks.md` - Update if task generation affected
- [ ] `/CLAUDE.md` - Update runtime development guidelines
- [ ] `/templates/release-template.md` - Ensure release packaging & checksum steps
- [ ] `/templates/test-strategy-template.md` - Reflect coverage & performance gates

### Principle-specific updates:

#### Principle I (Single Responsibility)
- [ ] Templates enforce one-module-one-purpose notes
- [ ] Add module boundary checklist
- [ ] Ref update examples avoiding cross-concerns

#### Principle II (Deterministic & Reproducible)
- [ ] Add deterministic output verification step (hash compare)
- [ ] Include stable key ordering reminder
- [ ] Add JSONL diff tooling reference

#### Principle III (Test-First Discipline)
- [ ] Reassert Red-Green-Refactor sequence
- [ ] Include minimum coverage thresholds in templates
- [ ] Add pre-merge test evidence section

#### Principle IV (Fail Fast & Loud)
- [ ] List standardized exit codes in spec template
- [ ] Add error taxonomy table
- [ ] Ensure no TODO placeholders for errors remain

#### Principle V (Performance & Streaming)
- [ ] Include target + ceiling timing fields
- [ ] Add memory budget checklist item
- [ ] Add performance regression test slot

#### Principle VI (Observability & Transparency)
- [ ] Logging key schema snippet in spec template
- [ ] Include log level policy
- [ ] Add stats file required fields list

#### Principle VII (Explicit Contracts)
- [ ] CLI contract version badge in templates
- [ ] Migration note stub for breaking changes
- [ ] Add semantic version bump decision table

#### Principle VIII (Minimal Dependencies)
- [ ] Dependency rationale table section
- [ ] License vetting checklist
- [ ] Add rule: remove unused deps promptly

#### Principle IX (Security & Integrity)
- [ ] Add "no network at runtime" reminder
- [ ] Hash manifest section in release template
- [ ] Input sanitization checklist (quoting, injection)

#### Principle X (Simplicity Over Cleverness)
- [ ] Complexity justification note required for >50 line functions
- [ ] Add anti-pattern examples list
- [ ] YAGNI reminder box

## Validation Steps

1. **Before committing constitution changes:**
   - [ ] All templates reference new / modified principles
   - [ ] Examples updated to match new rules
   - [ ] No contradictions between documents

2. **After updating templates:**
   - [ ] Run a sample implementation plan end-to-end
   - [ ] Verify every principle has at least one enforceable checklist hook
   - [ ] Templates are self-contained (readable without constitution)

3. **Version tracking:**
   - [ ] Update constitution version number
   - [ ] Note version in template footers
   - [ ] Add amendment entry to constitution history/log

## Common Misses
- Command docs not updated (`/commands/*.md`)
- Determinism hash verification step omitted
- Performance ceiling not added to test plan
- Error exit codes drift from implementation
- Dependency table missing license column
- Lack of migration guidance on breaking CLI flag change

## Template Sync Status

Last sync check: 2025-09-15
- Constitution version: 1.0.0
- Templates aligned: ❌ (need determinism, dependency rationale, hash manifest, exit code table)

## Action Items to Reach Alignment
- [ ] Add release + test strategy templates
- [ ] Insert deterministic output verification section
- [ ] Create standardized exit code table snippet
- [ ] Introduce dependency rationale & license matrix
- [ ] Add hash manifest generation steps to release process
- [ ] Add performance budget + memory cap fields
- [ ] Add amendment history section if absent

---

*This checklist ensures the constitution's principles are consistently applied across all project documentation.*
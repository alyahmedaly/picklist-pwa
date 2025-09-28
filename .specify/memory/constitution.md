<!--
SYNC IMPACT REPORT
- Version: 1.7.0 → 1.8.0 (MINOR: Added SOLID Principles section while maintaining focus on simplicity)
- Modified principles: None
- Added sections: X. SOLID Principles for Clean Architecture
- Removed sections: None
- Templates requiring updates: ✅ All templates validated for consistency
- Follow-up TODOs: None - SOLID principles integrated with existing architecture focus
-->

# Picklist Product Transformer Constitution

## Core Principles

### I. Data-First Architecture
Every feature begins with well-structured data models. Transform pipeline MUST produce
deterministic, versioned JSONL outputs. Frontend MUST consume data as static assets
without backend dependencies. Data integrity and schema consistency are non-negotiable.

### II. Test-Driven Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement.
Red-Green-Refactor cycle strictly enforced. Integration tests required for all
filter combinations and data transformations. Contract tests verify API boundaries.

### III. Minimal Dependencies
Webapp MUST use minimal external dependencies. Core stack limited to: TypeScript,
React, Vite, TailwindCSS. Additional libraries require explicit justification
and constitutional amendment. Prefer native browser APIs over heavy frameworks.

**Design System Exception**: shadcn/ui (https://ui.shadcn.com/) is permitted for
design system components. Rationale: shadcn/ui provides copy-paste components built
on TailwindCSS and Radix primitives, maintaining zero runtime dependencies while
ensuring accessibility compliance and consistent design patterns.

### IV. Static Generation First
Frontend MUST be deployable as static files (SSG). No runtime server dependencies.
All dynamic behavior through client-side JavaScript consuming pre-generated data.
Build output MUST be self-contained and CDN-ready.

### V. Performance & Determinism
Transform pipeline MUST process 30k+ products in <10 seconds. Output MUST be
byte-identical for identical inputs. Frontend MUST load initial view in <2 seconds
on 3G connection. All operations MUST be predictable and measurable.

### VI. Design System First
Before creating any new UI component, MUST first check existing design system
components in `src/components/ui/` and `src/components/nutrition/`. If similar
functionality exists, extend or compose existing components rather than creating
new ones. New components MUST be justified with documentation of why existing
components are insufficient. This ensures consistency, reduces bundle size, and
maintains coherent design patterns across the application.

Rationale: Component proliferation leads to design inconsistency, increased
maintenance burden, and larger bundle sizes. Reusing proven components ensures
accessibility compliance and consistent user experience.

### VII. Component Composition Over Conditional Rendering
Components with multiple states (loading, empty, error, data) MUST use component
composition with early returns instead of complex conditional rendering within JSX.
Each component state MUST be a separate return path with clear separation of
concerns. Avoid nested ternary operations, complex boolean logic, and mixed state
handling within single JSX trees.

**Required Pattern**:
```tsx
// ✅ GOOD: Early returns with composition
if (isPending) return <Layout><Skeleton /></Layout>
if (error) return <Layout><Error /></Layout>
if (!data) return <Layout><EmptyState /></Layout>
return <Layout><DataView /></Layout>

// ❌ BAD: Complex conditional rendering
{isPending ? <Skeleton /> : error ? <Error /> : !data ? <Empty /> : <Data />}
```

**Rationale**: Complex conditional rendering creates cognitive overload, makes
components hard to extend, prevents proper TypeScript inference, and violates
single responsibility principle. Early returns with composition provide clear
mental models, easier testing, and better maintainability.

### VIII. Transform Pipeline First
When computation is needed, MUST prefer implementing it in the data transform
pipeline rather than client-side JavaScript. Transform pipeline MUST generate
pre-computed results for complex operations like category tree building,
health scoring, filtering aggregations, and statistical calculations. Frontend
MUST consume pre-generated data structures whenever possible to minimize
client-side computation and maximize loading performance.

**Rationale**: Client-side computation degrades user experience with slower
loading times, increased memory usage, and battery drain on mobile devices.
Transform pipeline runs once during build time with full system resources,
while frontend runs repeatedly on user devices with limited resources.
Pre-computation enables faster loading, better caching, and improved perceived
performance. Data-first architecture principle requires frontend to be a
presentation layer consuming optimized static assets.

### IX. Infrastructure-First Development
Before adding any new functionality, MUST first examine existing infrastructure
and components to understand current patterns, conventions, and available
building blocks. When adding to the transform pipeline, MUST read existing
transform modules in `src/data/transform/` to understand the established
architecture and integration points. When creating UI components, MUST review
existing design system components in `src/components/ui/` and
`src/components/nutrition/` to identify reusable patterns. New implementations
MUST integrate seamlessly with existing infrastructure rather than creating
parallel or disconnected solutions.

**Rationale**: Understanding existing infrastructure prevents duplicated effort,
ensures architectural consistency, maintains established patterns, and reduces
integration complexity. Reading existing code reveals established conventions,
error handling patterns, performance optimizations, and architectural decisions
that new code must respect. This approach produces cohesive systems where
components work together predictably, rather than fragmented codebases with
inconsistent approaches and integration challenges.

### X. SOLID Principles for Clean Architecture
Apply SOLID principles pragmatically to maintain clean, simple, and modular code
without over-engineering. Focus on practical application within the existing
data-first, static-generation architecture.

**Single Responsibility Principle (SRP)**: Each module, class, or function MUST
have one reason to change. Transform modules in `src/data/transform/` MUST focus
on single data transformations (ingredients, allergens, additives). UI components
MUST handle single UI concerns (display, interaction, state). Avoid God objects
and mixed responsibilities.

**Open/Closed Principle (OCP)**: Modules MUST be open for extension but closed
for modification. Transform pipeline MUST support new filter types without
modifying existing transform logic. UI components MUST accept configuration
through props rather than requiring internal modifications for variations.

**Liskov Substitution Principle (LSP)**: Subtypes MUST be substitutable for their
base types without breaking functionality. Repository interfaces MUST maintain
consistent contracts. Component variants MUST maintain compatible APIs.

**Interface Segregation Principle (ISP)**: Clients MUST NOT depend on interfaces
they don't use. Prefer focused interfaces over monolithic ones. Transform
functions MUST accept only required parameters. Component props MUST be minimal
and purpose-specific.

**Dependency Inversion Principle (DIP)**: High-level modules MUST NOT depend on
low-level modules; both MUST depend on abstractions. Transform pipeline MUST
use dependency injection for configuration. UI components MUST accept data
through props rather than directly accessing data sources.

**Simplicity Constraint**: SOLID application MUST NOT lead to over-engineering.
Prefer composition over inheritance. Use interfaces only when polymorphism is
needed. Avoid premature abstractions. If SOLID compliance requires significant
complexity, document justification in constitution amendment.

**Rationale**: SOLID principles promote maintainable, testable, and extensible
code while preventing common design pitfalls. Applied pragmatically within our
constraints, they enhance code quality without compromising simplicity or
performance. The simplicity constraint ensures principles serve the codebase
rather than driving unnecessary complexity.

## Technical Stack Requirements

**Transform Pipeline (Backend)**:
- Node.js 18+ with TypeScript ES modules
- better-sqlite3 for database generation and data transformation
- Vitest for testing framework
- Zero runtime dependencies beyond CSV parsing and SQLite database operations

**Webapp (Frontend)**:
- TypeScript 5.8+ with strict mode
- React 19+ with functional components and hooks
- Vite 7+ for build tooling and dev server
- TailwindCSS 4+ for styling (utility-first)
- sqlocal for browser-based SQLite database access
- kysely for type-safe database query construction
- Static Site Generation (SSG) via Vite build
- No state management libraries (use React built-ins)
- shadcn/ui components permitted for design system (copy-paste, zero runtime deps)
- No other UI component libraries (build custom with Tailwind + shadcn/ui)

**Database Infrastructure**:
- **Transform Pipeline**: better-sqlite3 for server-side database generation, schema creation, and bulk data operations during build process
- **Frontend**: sqlocal for client-side database access in browser with WebAssembly SQLite implementation
- **Query Layer**: kysely for type-safe, composable database queries with compile-time validation
- **Schema**: Normalized relational schema with 8 core entities (products, categories, nutrition, flags, scores, additives, search terms, product categories)
- **Output**: Single SQLite database file generated by transform pipeline, consumed by frontend for efficient querying

**Development Tools**:
- ESLint with TypeScript rules
- Vitest for unit and integration testing
- Storybook v9+ for component development and documentation
- Git for version control with conventional commits

## Development Workflow

**Pipeline Development**:
1. Write failing integration tests for new filter logic
2. Implement transform logic to make tests pass
3. Verify deterministic output with fixtures
4. Update documentation and schema

**Frontend Development**:
1. Review existing design system components and transform infrastructure before creating new ones
2. Design component with static data first
3. Create Storybook stories for component variants and states
4. Write component tests with realistic data scenarios
5. Implement using composition pattern with early returns for multiple states
6. Implement responsive design mobile-first
7. Verify SSG build produces optimized static files
8. Test performance with large datasets

**Quality Gates**:
- All tests must pass before merge
- TypeScript strict mode with zero errors
- ESLint with zero warnings
- Build must produce static files under 1MB gzipped
- Transform performance under 10 seconds for 30k products
- Complex computations must be implemented in transform pipeline, not frontend
- Must examine existing infrastructure before adding new functionality
- New components must document why existing ones are insufficient
- Components with multiple states must use early returns, not complex conditionals
- New components must have Storybook stories documenting all states and variants
- Code must follow SOLID principles without over-engineering
- Modules must have single responsibilities and focused interfaces
- Extensions must not require modifying existing, working code

## Governance

Constitution supersedes all other practices. Amendments require documentation of
impact analysis and migration plan. Complexity increases must be explicitly
justified with simpler alternatives documented as rejected.

All feature development must verify constitutional compliance. Performance
regressions and dependency additions are constitutional violations requiring
formal review process.

**Version**: 1.8.0 | **Ratified**: 2025-09-20 | **Last Amended**: 2025-09-24
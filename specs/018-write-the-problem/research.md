# Research: Frontend Architecture Problem Analysis

## Overview
Research findings for creating a comprehensive problem analysis document that will enable a frontend architect to make informed decisions about static site generation, data loading patterns, and filtering implementations.

## Current Problem Analysis

### Decision: SQLite/OPFS Integration Issues
**Rationale**: Current approach using wa-sqlite with OPFS creates unnecessary complexity for static data
- Performance issues: 43MB database download in browser
- Browser compatibility constraints (Chrome 102+ required)
- Complex WASM compilation and VFS setup
- Overkill for pre-processed static data

**Alternatives considered**:
- Continue with SQLite/OPFS approach
- Express backend with proxy during development
- Direct static file serving
- Next.js with Server Components + better-sqlite3

### Decision: Existing Data Pipeline Assets
**Rationale**: Excellent transform pipeline already produces exactly what's needed
- Pre-filtered datasets: `filtered-ali-cutting.jsonl` (4.6M), `filtered-ali-daily-protein.jsonl` (42M), etc.
- Lightweight index files: 348KB to 2.9MB for browsing
- Complete category tree: `category-tree.json` (3MB)
- Schema documentation and statistics already generated

**Alternatives considered**:
- Re-processing data in frontend
- Querying raw database in browser
- Building new data pipeline

### Decision: Static Site Generation Requirements
**Rationale**: Constitutional requirement for static deployment with performance goals
- Must deploy as static files only (no runtime servers)
- <2s initial load on 3G connection
- Advanced filtering with good performance
- CDN-ready build output

**Alternatives considered**:
- Runtime server with dynamic queries
- Client-side database approach (current problematic path)
- Hybrid static/dynamic approach

## Technology Research

### Decision: Static Generation Approaches
**Rationale**: Multiple viable paths exist, each with trade-offs
1. **Next.js App Router + Static Export**: Built-in SSG, Server Components, `generateStaticParams`
2. **Vite + Build-time Data Copy**: Simple copy of pre-filtered files to public/
3. **Next.js Pages Router + getStaticProps**: Classic SSG pattern
4. **Astro**: Purpose-built for static data sites

**Alternatives considered**:
- Continuing with current Vite approach
- Custom build-time generation scripts
- Third-party static generators

### Decision: Filtering Implementation Strategies
**Rationale**: Advanced filtering requires strategic approach for static sites
1. **Multiple Static Pages**: Pre-render pages per filter combination
2. **Client-side Filtering**: Load all data, filter in browser
3. **Hybrid Approach**: Static categories + client sub-filters
4. **Search Params + Client Filtering**: Single page with URL-based filters

**Alternatives considered**:
- Server-side dynamic filtering (violates static requirement)
- Search-only approach (insufficient for complex nutrition filters)

## Architecture Patterns Research

### Decision: Data Loading Patterns
**Rationale**: Progressive loading matches constitutional performance requirements
- Load lightweight index files first for immediate browsing
- Load detailed data on-demand or via build-time pre-rendering
- Leverage existing pre-filtered datasets (42MB daily-protein, 4.6MB cutting, etc.)

**Alternatives considered**:
- Load all data upfront (violates performance requirements)
- Complex lazy-loading with chunking
- Database queries in browser (current problematic approach)

### Decision: Performance Optimization Strategies
**Rationale**: Must meet constitutional <2s load time and advanced filtering performance
- Static pre-rendering eliminates computation time
- Use transform pipeline for heavy operations (constitutional requirement)
- Progressive enhancement with client-side refinement
- Browser caching of static assets

**Alternatives considered**:
- Client-side computation (violates constitutional Transform Pipeline First principle)
- Complex service worker caching
- Real-time data fetching

## Key Findings Summary

**What Works Well**:
- Existing data transform pipeline (constitutional compliance)
- Pre-filtered datasets ready for static consumption
- Clear performance and deployment requirements

**Problem Areas Identified**:
- Current SQLite/OPFS approach adds unnecessary complexity
- 43MB database download impacts performance
- Browser compatibility constraints limit user reach
- Advanced filtering vs static deployment tension needs resolution

**Architectural Decision Points**:
- Choose static generation approach (Next.js vs Vite vs Astro)
- Decide filtering implementation strategy (static pages vs client-side vs hybrid)
- Select data loading pattern (progressive vs pre-rendered)
- Balance performance vs filtering complexity

**Constitutional Alignment**:
- Transform Pipeline First: ✅ Leverage existing pre-processed data
- Static Generation First: ✅ Focus on static deployment approaches
- Performance & Determinism: ✅ <2s load time, advanced filtering performance
- Minimal Dependencies: ✅ Avoid unnecessary complexity (remove wa-sqlite)
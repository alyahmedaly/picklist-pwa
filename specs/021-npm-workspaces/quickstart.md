# Quickstart: @picklist/core Utilities Package

**Feature**: NPM Workspaces Migration - Phase 1 (Core Utilities Only)
**Date**: January 2025
**Status**: Ready for Implementation

## Prerequisites

- Node.js 22+ installed
- NPM 7+ (for native workspaces support)
- TypeScript 5.8+ globally available
- Git repository in clean state

## Step 1: Core Package Structure Creation

```bash
# Create core package directory only
mkdir -p packages/core/src

# Create core package.json
touch packages/core/package.json
```

## Step 2: Core Package Migration

```bash
# Move only utility files to core package (NOT parsing functions)
mkdir -p packages/core/src/utils
mv src/types packages/core/src/

# Move utility files only (keep parsing, scoring & nutrition functions in src/data/transform/)
cp src/data/transform/mergeDuplicate.ts packages/core/src/utils/
cp src/data/transform/sparsity.ts packages/core/src/utils/
cp src/data/transform/ordering.ts packages/core/src/utils/
cp src/data/transform/writer.ts packages/core/src/utils/
# Note: nutritionUtils.ts, portionUtils.ts stay for @picklist/scoring package
# Note: parseIngredients.ts, parseAllergens.ts stay for @picklist/parser package

# Update core package.json
echo '{
  "name": "@picklist/core",
  "version": "0.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}' > packages/core/package.json
```

## Step 3: Create Core Package Index

```bash
# Create barrel export file for utilities only
echo 'export * from "./utils/index";
export * from "./types/index";' > packages/core/src/index.ts

# Create utils index
echo 'export * from "./mergeDuplicate";
export * from "./sparsity";
export * from "./ordering";
export * from "./writer";' > packages/core/src/utils/index.ts

# Create types index
touch packages/core/src/types/index.ts
```

## Step 4: Root Workspace Configuration

```bash
# Update root package.json
npm pkg set workspaces='["packages/*"]'
npm pkg set scripts.build='npm run build --workspaces'
npm pkg set scripts.test='npm run test --workspaces'
npm pkg set scripts.dev='npm run dev --workspace=@picklist/web'

# Add TypeScript project reference for core package
echo '{
  "files": [],
  "references": [
    { "path": "packages/core" }
  ]
}' > tsconfig.json
```

## Step 5: Install and Build

```bash
# Install dependencies (core package only)
npm install

# Build core package
npm run build --workspace=@picklist/core

# Verify core package exports
node -e "console.log(require('./packages/core/dist/index.js'))"
```

## Step 6: Validation Tests

```bash
# Test that existing functionality still works (parsing functions remain in original location)
node src/scripts/transform-data.ts --input tests/fixtures/sample-small.csv --outDir baseline-output

# Test importing from new core package (utilities only)
node -e "
const { mergeDuplicates, calculateSparsity } = require('./packages/core/dist/index.js');
console.log('Core utilities import successful:', !!(mergeDuplicates && calculateSparsity));
"
```

## Success Criteria

✅ **Core package builds successfully**
- `npm run build --workspace=@picklist/core` completes without errors
- TypeScript compilation succeeds with proper declarations
- Package exports are accessible via clean API

✅ **Existing functionality preserved**
- Original transform-data.ts continues to work unchanged
- All transform functions remain available at original paths
- No breaking changes to existing code

✅ **Core utilities API accessible**
- Utility functions can be imported from `@picklist/core`
- TypeScript types are properly exported
- Package serves as foundation for future workspace packages (parser, CLI, etc.)

✅ **Workspace structure established**
- Root package.json configured for NPM workspaces
- TypeScript project references working
- Foundation ready for CLI, database, web packages in future phases

## Rollback Plan

If validation fails:
1. Restore from git: `git checkout -- .`
2. Remove core package: `rm -rf packages/`
3. Restore original package.json: `git checkout package.json tsconfig.json`
4. Reinstall dependencies: `npm install`

## Next Phase
After core utilities package success, subsequent phases will extract:
- Phase 2: @picklist/parser package (parseIngredients, parseAllergens, etc.)
- Phase 3: @picklist/scoring package (calculateAliScore, protein efficiency, etc.)
- Phase 4: @picklist/cli package
- Phase 5: @picklist/database package
- Phase 6: @picklist/web package
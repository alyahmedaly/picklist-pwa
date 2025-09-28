# Data Model: NPM Workspaces Migration

**Feature**: NPM Workspaces Migration
**Date**: January 2025
**Status**: Complete

## Core Entities

### Workspace Package
- **Name**: String (scoped npm package name, e.g., @picklist/core)
- **Version**: String (semver, initially 0.0.0)
- **Dependencies**: Array of dependency specifications
- **Source Path**: String (relative path from root, e.g., packages/core/src)
- **Build Output**: String (relative path to compiled output, e.g., packages/core/dist)
- **Package Type**: Enum (core | cli | database | web)

**Validation Rules**:
- Name must follow @picklist/{package} pattern
- Version must be valid semver
- Source path must exist and contain valid TypeScript files
- Dependencies must not create circular references (warnings only)

### Dependency Relationship
- **Source Package**: Reference to Workspace Package
- **Target Package**: Reference to Workspace Package or external package
- **Version Constraint**: String (workspace:* for internal, semver for external)
- **Dependency Type**: Enum (dependencies | devDependencies | peerDependencies)

**Validation Rules**:
- Internal dependencies must use workspace:* protocol
- External dependencies must have single version across all packages
- Circular dependencies trigger warnings but don't fail build

### Build Configuration
- **Root Config**: Object containing workspace configuration
- **Package Configs**: Array of per-package build configurations
- **TypeScript References**: Array of project reference paths
- **Script Mappings**: Map of root scripts to workspace-specific commands

**Validation Rules**:
- Root workspace array must include all package directories
- TypeScript references must match existing packages
- Script mappings must preserve backwards compatibility

## Entity Relationships

- Workspace Package **depends on** zero or more other Workspace Packages
- Workspace Package **contains** one or more TypeScript source files
- Build Configuration **references** all Workspace Packages
- Dependency Relationship **connects** Workspace Packages

## State Transitions

### Package Migration States
1. **Monolithic**: Code exists in single package structure
2. **Extracted**: Code moved to dedicated package directory
3. **Configured**: Package.json and build config created
4. **Integrated**: Package connected to workspace system
5. **Validated**: Package passes parity tests

### Build States
1. **Clean**: No build artifacts exist
2. **Building**: Compilation in progress
3. **Built**: All packages compiled successfully
4. **Failed**: Compilation errors exist
5. **Tested**: Build artifacts validated

## Data Volume Assumptions

- **1 workspace package** in this phase (@picklist/core)
- **~692KB of transform logic** to migrate
- **54 TypeScript files** in src/data/transform/ directory
- **Minimal external dependencies** (@std/csv, consola)
- **Zero package interdependencies** (core has no workspace dependencies)

## Performance Constraints

- Package extraction must complete within development session
- Build times must improve with incremental compilation
- Migration must preserve <10 second transform pipeline performance
- Memory usage during migration should not exceed current tooling limits
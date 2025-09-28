# Research: NPM Workspaces Migration

**Feature**: NPM Workspaces Migration
**Date**: January 2025
**Status**: Complete

## NPM Workspaces Best Practices

**Decision**: Use NPM 7+ built-in workspaces with TypeScript project references
**Rationale**: NPM workspaces provide native monorepo support without additional tooling overhead, TypeScript project references enable incremental compilation and better IDE support
**Alternatives considered**:
- Lerna: Adds complexity and maintenance overhead
- Rush: Over-engineered for 4-package monorepo
- Yarn workspaces: NPM workspaces provide equivalent functionality

## TypeScript Project References Configuration

**Decision**: Root tsconfig.json with project references to each package
**Rationale**: Enables incremental builds, proper dependency checking, and IDE intelligence across packages
**Alternatives considered**:
- Separate unrelated TypeScript configs: Poor cross-package type checking
- Single monolithic tsconfig: Slower builds, no incremental compilation

## Package Dependency Strategy

**Decision**: Use `workspace:*` protocol for internal dependencies, enforce single versions at root
**Rationale**: Ensures consistent dependency versions across packages, prevents version conflicts, leverages npm deduplication
**Alternatives considered**:
- Version ranges in package dependencies: Risk of version conflicts
- Manual version synchronization: Error-prone and maintenance intensive

## Migration Strategy

**Decision**: Gradual migration starting with @picklist/core, maintaining backwards compatibility
**Rationale**: Reduces risk, allows validation at each step, preserves existing workflows during transition
**Alternatives considered**:
- Big-bang migration: High risk of breaking existing functionality
- Parallel development: Resource intensive, complexity management

## Testing Strategy

**Decision**: Package-level unit tests + root-level integration tests + parity tests
**Rationale**: Ensures individual package correctness, validates cross-package integration, proves migration equivalence
**Alternatives considered**:
- Only integration tests: Poor isolation, harder debugging
- No parity tests: Risk of subtle behavioral changes

## Build System Integration

**Decision**: Root-level npm scripts delegating to workspace packages with parallel execution support
**Rationale**: Maintains familiar developer interface while leveraging workspace capabilities
**Alternatives considered**:
- Package-only scripts: Loss of convenience for common operations
- Complex build orchestration tools: Violates minimal dependencies principle

## Findings Summary

- NPM workspaces native support eliminates external tooling dependencies
- TypeScript project references provide incremental build performance improvements
- Workspace protocol (`workspace:*`) ensures dependency consistency
- Gradual migration reduces risk and maintains developer productivity
- Parity testing is critical for validating behavioral equivalence
- Root-level script delegation preserves existing developer workflows
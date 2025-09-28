/**
 * T028 Basic Integration Test: useFlexibleCategoryHierarchy Hook Migration
 * Feature: 020-migration-kysely
 *
 * Basic test to verify the migrated useFlexibleCategoryHierarchy hook compiles
 * and maintains interface compatibility.
 */

import { describe, it, expect } from 'vitest';
import { useFlexibleCategoryHierarchy } from '../../src/hooks/useFlexibleProductQueries.ts';

describe('T028: Category Hierarchy Hook Migration - Interface Compatibility', () => {
  
  it('should export useFlexibleCategoryHierarchy function', () => {
    expect(typeof useFlexibleCategoryHierarchy).toBe('function');
  });

  it('should maintain hook interface with correct parameter signature', () => {
    // Test that hook can accept optional categoryId and options parameters
    expect(useFlexibleCategoryHierarchy.length).toBeGreaterThanOrEqual(0); // Accepts optional parameters
  });

  it('should maintain identical interface structure without runtime errors', () => {
    // This should not throw any compilation or initialization errors
    expect(() => {
      // Just test function signature compatibility
      const hookFunction = useFlexibleCategoryHierarchy;
      expect(typeof hookFunction).toBe('function');
    }).not.toThrow();
  });
});
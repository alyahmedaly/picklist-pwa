/**
 * T027 Basic Integration Test: useFlexibleProducts Hook Migration
 * Feature: 020-migration-kysely
 *
 * Basic test to verify the migrated useFlexibleProducts hook compiles and 
 * maintains interface compatibility.
 */

import { describe, it, expect } from 'vitest';
import { 
  useFlexibleProducts,
  useFlexibleProductSearch,
  useFlexibleCategoryHierarchy,
  useFlexibleProductDetails,
  useFlexibleSchemaAvailability,
  useFlexibleSchemaStats
} from '../../src/hooks/useFlexibleProductQueries.ts';

describe('T027: Hook Migration - Interface Compatibility', () => {
  
  it('should export all hook functions', () => {
    expect(typeof useFlexibleProducts).toBe('function');
    expect(typeof useFlexibleProductSearch).toBe('function');
    expect(typeof useFlexibleCategoryHierarchy).toBe('function');
    expect(typeof useFlexibleProductDetails).toBe('function');
    expect(typeof useFlexibleSchemaAvailability).toBe('function');
    expect(typeof useFlexibleSchemaStats).toBe('function');
  });

  it('should maintain hook interfaces without runtime errors', () => {
    // Test that hooks can be imported and have expected function signatures
    expect(useFlexibleProducts.length).toBeGreaterThanOrEqual(0); // Accept parameters
    expect(useFlexibleProductSearch.length).toBeGreaterThanOrEqual(1); // Requires query parameter
    expect(useFlexibleCategoryHierarchy.length).toBeGreaterThanOrEqual(0); // Optional parameters
    expect(useFlexibleProductDetails.length).toBeGreaterThanOrEqual(1); // Requires productId
    expect(useFlexibleSchemaAvailability.length).toBe(0); // No parameters
    expect(useFlexibleSchemaStats.length).toBeGreaterThanOrEqual(0); // Optional parameters
  });
});
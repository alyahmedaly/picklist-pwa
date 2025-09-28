/**
 * @picklist/core utilities index
 * Re-exports all utility functions for clean package API
 */

// Data manipulation utilities
export { calculateSparsity } from '../../../parser/src/sparsity.ts';

// File I/O utilities moved to @picklist/output package

// Ordering and sorting utilities
export { canonicalOrderProducts, sortProducts, generateProductId } from './ordering.ts';

// String processing utilities
export {
  normalizeText,
  removePlaceholders,
  splitAndTrim,
  sanitizeForFilename,
} from './stringUtils.ts';

// Data validation utilities
export {
  validateProduct,
  validateNutrition,
  isValidSemver,
  isValidPackageName,
} from './validation.ts';

export { createLogger } from './logger.ts';

/**
 * Validation result for filter criteria
 */

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages if validation failed */
  errors: string[];
}

/** Conflict record capturing differing non-null values between duplicates. */

export interface DuplicateConflict {
  field: string; // field name with conflict
  first: unknown; // value from first occurrence
  second: unknown; // value from later occurrence
  note?: string; // optional explanation (e.g., 'numeric_tolerance_exceeded')
  path: string; // dot-separated path to field
  firstValue: unknown; // duplicate of 'first' for clarity
  secondValue: unknown; // duplicate of 'second' for clarity
}

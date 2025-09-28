# Research Topic: Malformed CSV Detection Thresholds

## Question
How often do row column counts deviate and what constitutes fatal vs recoverable error?

## Data Needed
- Count of lines with columns != header count
- Sample of offending lines

## Plan
1. First-pass tally mismatches.
2. Capture first 20 examples.

## Acceptance
- Threshold rule defined (e.g., >0 fatal) unless only trailing empty cells.

## Findings (Preliminary)
- Sampled ~100+ consecutive data rows: all matched header column count (106 columns) based on visual inspection.
- No partial line truncations observed in sample.
- Trailing NA stretch prevalent but consistent count.
- No evidence yet of lines ending with stray commas.

## Pending Verification
- Full-file automated scan still required to confirm zero mismatches.

## Proposed Threshold Rule
- If any row has column count != header count → FATAL (exit code 3) unless deviation is exactly fewer trailing columns that are all conceptually beyond last non-sparse column (not expected here given fixed header) – we will not implement lenient mode in v1.
- Record first N (20) offending line numbers in stats under `malformedSamples` (array) if encountered.

## Decision (Interim)
Adopt strict policy: zero mismatches tolerated. Implement scan in sparsity pass; abort early if detected. Will finalize after full scan script verification.

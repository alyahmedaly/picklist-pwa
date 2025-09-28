# Research Topic: Stats Diff Stability

## Question
How to ensure stats output remains reproducible and meaningful across runs and detect significant drift?

## Objectives
- Deterministic stat field ordering
- Controlled drift detection thresholds
- Clear separation of run-specific vs stable metrics

## Stats File Structure (proposed)
```
{
  version: 1,
  datasetHash: string,
  rowCountInput: number,
  rowCountOutput: number,
  droppedColumns: string[],
  duplicateGroups: number,
  duplicateConflicts: number,
  highDupDensityIds: string[],
  thresholdsEncountered: number,
  nullRate: { column: rateFloat },
  categoryDistribution: { category: count },
  performance?: { totalMs, transformMs, rssPeakBytes },
}
```

## Determinism Measures
- Sort arrays & object keys alphabetically (droppedColumns, highDupDensityIds)
- nullRate keys sorted; categoryDistribution keys sorted
- Exclude volatile timestamps from hashing (stats separate from record hashes)

## Drift Detection
Baseline comparison (optional):
- rowCountOutput change > 5% -> drift flag
- duplicateConflicts change > +20 absolute or >50% -> drift
- categoryDistribution any category count shift > 50% -> drift list
- nullRate any column shift > 0.15 absolute -> drift

## Algorithm
compareStats(current, baseline): produce { driftFlags: [], details: {...} }
Each threshold breach adds code (e.g., ROW_COUNT_DRIFT) to list.

## Test Cases
- Minor changes within thresholds -> no drift flags
- Large category shift triggers CATEGORY_DIST_DRIFT
- Null rate jump triggers NULL_RATE_DRIFT

## Decision
Implement deterministic serialization with sorted keys and optional baseline diff producing drift codes. Provide `--stats-baseline` to supply prior stats for drift analysis. Drift does not fail transform by default; flag exit code optional via `--fail-on-drift`.

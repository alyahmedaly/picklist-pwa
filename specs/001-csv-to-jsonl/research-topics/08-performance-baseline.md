# Research Topic: Performance Baseline

## Question
How to measure and enforce performance (<10s target, <30s hard) and memory (<150MB) for ~30k rows, 106 columns transform?

## Constraints
- Streaming I/O
- Node.js single-threaded baseline

## Plan
1. Implement timing hooks: t0, after sparsity pass, after transform complete.
2. Collect counters: rowsProcessed/sec, bytesRead, memoryPeak (process.rss()).
3. Establish baseline with unoptimized implementation (expect low seconds).
4. Add regression guard: fail if runtime > 1.3x recorded baseline median (stored in `perf-baseline.json`).

## Metrics
- totalDurationMs
- sparsityScanMs
- transformMs
- rowsPerSecond (transform phase)
- rssPeakBytes
- avgRowProcessingUs = transformMs*1000 / rowCount

## Instrumentation
Wrap phases with `performance.now()`. Capture peak RSS via sampling every N rows (e.g., 500) using `process.memoryUsage().rss`. Keep max.

## Storage
`perf-baseline.json` schema:
```
{
  version: 1,
  datasetHash: string,
  rowCount: number,
  columnCount: number,
  baseline: {
    totalMs: number,
    transformMs: number,
    rssPeakBytes: number
  },
  capturedAt: ISO8601
}
```

## Enforcement Logic
On run with `--perf-check`:
1. Load baseline file (if absent -> warn & create new baseline).
2. Compare: totalMs <= baseline.totalMs * 1.3, rssPeakBytes <= baseline.rssPeakBytes * 1.25.
3. If violation -> exit code PERF_REGRESSION.

## Test Cases
- Initial run creates baseline file.
- Subsequent run within limits passes.
- Artificial delay triggers failure.

## Decision
Adopt lightweight in-process instrumentation & JSON baseline file. Regression thresholds: time 1.3x, memory 1.25x. Provide explicit `--update-perf-baseline` flag to refresh baseline intentionally.

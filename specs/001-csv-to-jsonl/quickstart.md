# Quickstart – CSV to JSONL Transformer

## 1. Place Source CSV
Ensure raw file at `data/2024-10-23.csv`.

## 2. Run Transformation
```
node ./src/scripts/transform-data.ts \
  --in data/2024-10-23.csv \
  --out build/data \
  --log human
```

Optional flags:
```
--limit 500            # Process only first 500 rows (debug)
--pretty               # Pretty-print JSONL (debug only)
--log json             # Machine-readable progress logs
```

## 3. Output Artifacts
```
build/data/
  products.jsonl
  products-index.json
  stats.json
  schema.md
```

## 4. Verify Stats
Check `stats.json` keys: `recordsTotal`, `recordsExported`, `duplicatesMerged`, `sparsityExcludedFields`, `conflicts`, `durationMs`, `contentHash`.

## 5. Consume Data
Example (Node):
```js
import fs from 'node:fs';
for (const line of fs.readFileSync('build/data/products.jsonl','utf8').trim().split('\n')) {
  const product = JSON.parse(line); // use streaming iteration for large files
  // ...
}
```

## 6. Regeneration
Re-run command; artifacts are overwritten. Commit changes if diff meaningful.

## 7. Troubleshooting
| Issue | Cause | Resolution |
|-------|-------|------------|
| Missing output files | Path incorrect | Ensure `--out` directory exists or is creatable |
| Slow run | Large disk / CPU contention | Use `--limit` to sample; profile regex hotspots |
| Incorrect unit parse | Edge pattern unseen | Add test & extend regex list |

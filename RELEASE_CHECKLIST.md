# Release Checklist (Slim)

1. Clean install
   npm ci
2. Run full test suite
   npm test
3. Execute sample transform (sanity)
   npx ts-node src/scripts/transform-data.ts --input fixtures/sample-small.csv --outDir out-tmp --log human
4. Verify artifacts present & non-empty
   ls -lh out-tmp/products.jsonl out-tmp/products-index.json out-tmp/stats.json out-tmp/schema.md
5. (Optional) Diff against prior run for determinism (should be identical)
6. Tag (if needed)
   git tag -a vX.Y.Z -m "Transformer release vX.Y.Z" && git push --tags
7. Clean temporary output
   rm -rf out-tmp

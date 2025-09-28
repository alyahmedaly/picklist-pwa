# CLI Contract – Data Transformer

## Command
```
node src/scripts/transform-data.ts --in <input.csv> --out <outputDir> [options]
```

## Arguments
| Flag | Required | Description |
|------|----------|-------------|
| --in | Yes | Path to source CSV |
| --out | Yes | Output directory (created if missing) |
| --limit | No | Integer; process only first N data rows |
| --pretty | No | Pretty-print JSONL (for debugging; increases size) |
| --log | No | `human` (default) or `json` progress logs |

## Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Usage / argument error |
| 2 | File I/O error (read / write) |
| 3 | CSV parse failure |
| 4 | Internal logic error (unexpected) |

## STDOUT / Files
- Writes artifacts to `--out`.
- STDOUT: minimal success message (human) or final stats JSON (when `--log=json`).
- STDERR: progress logs, warnings.

## Sample Invocation
```
node src/scripts/transform-data.ts --in data/2024-10-23.csv --out build/data --log json
```

## Sample Output Line (products.jsonl)
```json
{"id":73,"name":"AH Franse baguettes","price":{"regular":0.75,"currency":"EUR"},"categories":["Bakkerij","Afbakbrood","Stokbrood en ciabatta"],"unit":{"raw":"2 stuks","amount":2,"amountUnit":"stuks"},"nutrition":{"kcal":241,"kJ":1023,"fat":1,"satFat":0.2,"carbs":50,"sugars":3.3,"fiber":1.7,"protein":7.2,"salt":0.9},"ingredients":["tarwebloem","water","gist","gefermenteerd tarwemeel","tarwemoutmeel","zout","antioxidant (ascorbinezuur [E300])"],"allergens":{"contains":["Glutenbevattende Granen","Tarwe"],"mayContain":["Melk","Sesamzaad","Gerst","Haver","Lactose","Rogge"]},"images":{"primary":"https://static.ah.nl/dam/product/AHI_43545239383738313133?revLabel=1&rendition=400x400_JPG_Q85&fileType=binary","low":"https://static.ah.nl/dam/product/AHI_43545239383738313133?revLabel=1&rendition=200x200_JPG_Q85&fileType=binary","med":"https://static.ah.nl/dam/product/AHI_43545239383738313133?revLabel=1&rendition=400x400_JPG_Q85&fileType=binary","high":"https://static.ah.nl/dam/product/AHI_43545239383738313133?revLabel=1&rendition=800x800_JPG_Q90&fileType=binary"},"flags":{"isFood":true},"added":{}}
```

## Non-Goals
- Tag inference / meta enrichment (future feature)
- SQLite export
- Advanced search index pre-generation

## Validation
Integration test runs CLI on `fixtures/sample-small.csv` expecting deterministic hash in stats for stable output.

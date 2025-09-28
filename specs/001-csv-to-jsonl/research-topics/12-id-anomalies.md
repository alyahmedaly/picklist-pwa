# Research Topic: ID Anomalies

## Question
How to detect and handle anomalous product identifiers (missing, malformed, duplicate burst patterns)?

## Scenarios
- Missing product_id
- Non-alphanumeric / unexpected length
- GTIN length invalid (should be 8, 12, 13, or 14 digits)
- Duplicate bursts (many duplicates in sequence) indicating upstream export issue

## Validation Rules
product_id:
- Trimmed length > 0
- Allowed chars: [A-Za-z0-9_-]
- Max length 64
GTIN:
- Digits only; length in {8,12,13,14}; optional leading zeros allowed

## Duplicate Monitoring
Maintain map count per product_id. Thresholds:
- If duplicates for an id exceed 10 -> flag highDupDensity
- If >5 consecutive rows share same product_id -> flag consecutiveDupBurst

## Algorithm
validateIds(row, state):
1. if !product_id or empty -> error MISSING_ID
2. if product_id invalid chars -> error INVALID_ID_CHARS
3. if product_id length>64 -> error ID_TOO_LONG
4. if gtin present and invalid length or non-digits -> error INVALID_GTIN
5. state.dupMap[id]++
6. track consecutive id vs prev; increment run length; if run length>5 -> state.flags.consecutiveDupBurst.add(id)
7. if dupMap[id]>10 -> state.flags.highDupDensity.add(id)

## Test Cases
- Empty id -> error
- Id with space -> error
- GTIN length 11 -> error
- 11 duplicates -> highDupDensity
- 6 consecutive same id -> consecutiveDupBurst

## Decision
Implement strict validation with error codes. Non-fatal duplicates proceed to merge pipeline; fatal malformed IDs cause row rejection. Stats include counts for anomalies and list (truncated) of high-density duplicate ids.

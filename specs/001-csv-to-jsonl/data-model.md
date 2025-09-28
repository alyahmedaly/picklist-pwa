# Data Model – CSV to JSONL Product Data Transformer

## Entities

### Product
Core denormalized record (one per unique ProductId).

| Field | Type | Description |
|-------|------|-------------|
| id | number | ProductId parsed as number (or string fallback if non-numeric) |
| name | string | ProductName |
| price | object | { regular: number; sale?: number; currency: 'EUR' } (omit sale if absent) |
| categories | string[] | Ordered non-NA Category1..CategoryN |
| unit | object | { raw: string; packCount?: number; amount?: number; amountUnit?: string } |
| nutrition | object | Omit keys missing: kcal, kJ, fat, satFat, carbs, sugars, fiber, protein, salt |
| ingredients | string[] | Ordered list after parsing/free-text split |
| allergens | object | { contains: string[]; mayContain: string[] } |
| images | object | { low?: string; med?: string; high?: string; primary: string } primary preference high>med>low |
| flags | object | { isFood: boolean; isPetFood?: boolean } |
| added | object | { sugarsPer100?: number; saltPer100?: number } |
| _meta? | object | Reserved for future tagging (currently omitted unless enabled) |

### IndexEntry
Lightweight subset for initial UI load.

| Field | Type | Description |
|-------|------|-------------|
| id | number | Product id |
| name | string | Product name |
| price | number | Regular price (or sale if present – rule: prefer sale) |
| image | string | Primary image URL |
| categories | string[] | Same as product (may truncate length >4) |
| isFood | boolean | Flag |

## Sparsity Handling
Excluded fields list captured in `schema.md` (computed). Core nutrition fields never excluded.

## Duplicate Merge Rules
Primitive precedence: first-win. Missing primitives filled. Arrays: union preserving first occurrence order. Images: any new non-empty URL added if not already present; primary recalculated by quality order.

## Validation Rules
- Product MUST have id & name.
- Price MUST include regular; sale MUST be < regular when present else ignored.
- Numeric parsing tolerant of comma decimals.
- Empty arrays omitted? (Decision: Keep allergens arrays even if empty for shape stability.)

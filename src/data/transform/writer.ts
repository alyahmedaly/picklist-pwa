import fs from 'node:fs';
import path from 'node:path';
import type { Product, IndexEntry } from './types.ts';
import { canonicalOrderProducts } from './ordering.ts';
import { INGREDIENT_PLACEHOLDERS } from '../../../packages/parser/src/product/parse/parseIngredients.ts';
import { ALLERGEN_WHITELIST } from '../../../packages/parser/src/product/parse/parseAllergens.ts';
import { writeCategoryTreeWithAliMetrics } from './categoryTreeBuilder.ts';

// Internal accumulator for stats (T025 will expose via dedicated stats module if needed)
const runtimeStats = { skippedIndexEntries: 0 };
export function getRuntimeStats() {
  return { ...runtimeStats };
}

/** Atomic write of products to JSONL file: write to temp then rename. */
export function writeProductsJsonlAtomic(filePath: string, products: Product[]): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  // Hashing removed: simply order products deterministically
  const ordered = canonicalOrderProducts(products);
  const tmp = filePath + '.tmp-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  const fd = fs.openSync(tmp, 'w');
  try {
    for (const p of ordered) {
      fs.writeSync(fd, JSON.stringify(p) + '\n');
    }
    fs.closeSync(fd);
    fs.renameSync(tmp, filePath); // atomic on same filesystem
  } catch (e) {
    try {
      fs.closeSync(fd);
    } catch {
      /* ignore */
    }
    try {
      fs.rmSync(tmp, { force: true });
    } catch {
      /* ignore */
    }
    throw e;
  }
}

/** Build lightweight index: choose sale price if present else regular; exclude heavy fields. */
export function buildIndex(products: Product[]): IndexEntry[] {
  const out: IndexEntry[] = [];
  for (const p of products) {
    const idMissing = p.id === undefined || p.id === null || p.id === '';
    const nameBlank = !p.name || !String(p.name).trim();
    const priceVal = p.price?.sale != null ? p.price.sale : p.price?.regular;
    const priceInvalid = typeof priceVal !== 'number' || Number.isNaN(priceVal);
    if (idMissing || nameBlank || priceInvalid) {
      runtimeStats.skippedIndexEntries++;
      continue; // T024 guard
    }
    const price = priceVal as number; // valid here (0 allowed)
    out.push({
      id: p.id,
      name: String(p.name).trim(),
      price,
      image: p.images?.primary,
      categories: p.categories,
      isFood: !!p.flags?.isFood,
    });
  }
  return out;
}

interface SchemaDocOptions {
  excludedColumns: string[];
  ordering: string;
}

/** Write simple schema documentation file including excluded columns. */
export function writeSchemaDoc(filePath: string, opts: SchemaDocOptions): void {
  const lines: string[] = [];
  lines.push('# Product Schema');
  lines.push('');
  lines.push('## Ordering');
  lines.push('Canonical ordering: ' + opts.ordering);
  lines.push('');
  lines.push('## Excluded Columns');
  if (opts.excludedColumns.length === 0) {
    lines.push('_None_');
  } else {
    for (const c of opts.excludedColumns) lines.push('- ' + c);
  }

  // T022 Localization section
  lines.push('');
  lines.push('## Localization');
  lines.push('This schema supports Dutch language localization with the following features:');
  lines.push('');
  lines.push('### Dutch Allergen Support');
  lines.push('- Supports Dutch allergen prefixes: "bevat", "kan sporen bevatten van"');
  lines.push('- Includes Dutch allergen terms: melk, ei, soja, tarwe, pinda, noten, etc.');
  lines.push('- Automatic Dutch-to-English allergen mapping');
  lines.push('');
  lines.push('### Dutch Phrase Extraction');
  lines.push('- Added sugar extraction from "Waarvan toegevoegde suikers X.Xg per 100 gram"');
  lines.push('- Added salt extraction from "Waarvan toegevoegd zout X.Xg per 100 gram"');
  lines.push('- Decimal comma normalization (e.g., "1,5" → 1.5)');
  lines.push('');
  lines.push('### Dutch Ingredient Processing');
  lines.push('- Dutch placeholder filtering: GEEN, NVT');
  lines.push('- Dutch artificial sweetener detection: aspartaam, steviolglycosiden, zoetstof');
  lines.push('- Dutch food classification: bakkerij, huishouden, zuivel, etc.');
  lines.push('');
  lines.push('### Inequality Parsing');
  lines.push('- Supports inequality symbols: < 0,01 g, ≤ 1,5 g');
  lines.push('- Multipack with inequalities: 6 x < 0,33 l');

  // T018 Nutritional Tags section
  lines.push('');
  lines.push('## Nutritional Tags');
  lines.push('Precomputed nutritional tags for food products following EU/Dutch standards:');
  lines.push('');
  lines.push('### Nutritional Computation');
  lines.push('- **Net Carbs**: Total carbs minus fiber (minimum 0)');
  lines.push(
    '- **Net Carbs Buckets**: very_low (<2g), low (2-5g), moderate (5-10g), high (10-20g), very_high (>20g)',
  );
  lines.push('- **Low Carb**: <10g net carbs per 100g (ketogenic threshold)');
  lines.push('');
  lines.push('### EU/Dutch Standards');
  lines.push('- **High Fiber**: ≥6g per 100g (EU Commission Regulation No 1924/2006)');
  lines.push('- **High Protein**: ≥20g per 100g (Dutch fitness standard)');
  lines.push('- **Protein Density**: low (<10g), moderate (10-20g), high (≥20g)');
  lines.push('');
  lines.push('### Dietary Classifications');
  lines.push('- **Vegan**: Excludes melk, ei, boter, kaas, vis, vlees, honing');
  lines.push('- **Vegetarian**: Excludes vis, vlees, kip, rund, varken (allows dairy)');
  lines.push('- **Lactose-Free**: Excludes melk, room, boter, kaas, lactose');
  lines.push('- **Gluten-Free**: Excludes tarwe, rogge, gerst, haver');
  lines.push('- **Plant-Based**: >80% plant ingredients by count');
  lines.push('');
  lines.push('### Tags Only for Food Products');
  lines.push('- Nutritional tags computed only for products classified as food');
  lines.push('- Non-food products (household, pet, etc.) do not receive nutritional tags');
  lines.push('- Requires either nutrition data or ingredients for computation');

  // T026 Hygiene Rules section
  lines.push('');
  lines.push('## Hygiene Rules');
  lines.push('### Ingredient Placeholders (filtered)');
  const placeholders = [...INGREDIENT_PLACEHOLDERS].sort((a, b) => a.localeCompare(b));
  for (const p of placeholders) lines.push('- ' + p);
  lines.push('');
  lines.push('### Allergen Whitelist (normalized)');
  const whitelist = [...ALLERGEN_WHITELIST].sort((a, b) => a.localeCompare(b));
  for (const w of whitelist) lines.push('- ' + w);
  lines.push('');
  lines.push('### Omission Normalization');
  lines.push('- Empty arrays removed (treated as absent)');
  lines.push('- Empty objects removed (treated as absent)');
  lines.push('- Hashing occurs after omission normalization for equivalence');
  const content = lines.join('\n') + '\n';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

// T025: Deterministic stats serialization helper (currently only skippedIndexEntries here)
export function writeHygieneStats(filePath: string): void {
  const statsObj = {
    skippedIndexEntries: runtimeStats.skippedIndexEntries,
  } as const;
  const json = JSON.stringify(statsObj, Object.keys(statsObj).sort(), 2) + '\n';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, json, 'utf8');
}


/**
 * Build and write category tree JSON from product data
 * Creates both hierarchical tree structure and flat category list with Ali metrics
 */
export function writeCategoryTree(filePath: string, products: Product[]): void {
  // Use the enhanced Ali metrics version for category tree generation
  writeCategoryTreeWithAliMetrics(filePath, products, {
    includeEmptyCategories: false, // Only include categories with products
    sortByProductCount: true,
    minProductCount: 1, // At least 1 product per category
    aliMetrics: {
      enabled: true, // Enable Ali metrics by default
    }
  });
}

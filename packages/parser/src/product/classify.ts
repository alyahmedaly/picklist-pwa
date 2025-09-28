import type { Flags } from '@picklist/types';

interface ClassifyInput {
  categories?: string[];
  ingredients?: string[];
}

interface ClassifyResult {
  flags: Pick<Flags, 'isFood' | 'isPetFood'>;
  errors?: string[];
}

// T021 Negative keyword list (lowercase); items containing these whole-word tokens become non-food unless safe-listed.
const NEGATIVE_KEYWORDS = Object.freeze([
  'supplement',
  'capsule',
  'tablet',
  'pill',
  'toy',
  'bundle',
  'pack',
  'set',
  'kit',
]);

// Safe-list terms that should NOT flip isFood even if substring overlaps (lowercase)
const NEGATIVE_SAFE_LIST = Object.freeze([
  'toy sauce', // example placeholder – adjust as domain clarifies
]);

/**
 * classify (T017) – Basic heuristic:
 *  - Food if any category in BEVERAGE, BAKERY, GROCERY lists or if ingredients non-empty.
 *  - Pet food if category contains 'pet' or 'dog' or 'cat'.
 *  - Both may be true (ambiguous); emits classification_mismatch error when both true.
 *  - Always returns flags.isFood boolean.
 */
const DEBUG_CLASSIFY =
  process.env['CLASSIFY_DEBUG'] === '1' || process.env['CLASSIFY_DEBUG'] === 'true';

export function classify(input: ClassifyInput): ClassifyResult {
  const cats = (input.categories || []).map((c) => c.toLowerCase());
  const ingr = input.ingredients || [];

  const foodCatKeywords = [
    // English terms
    'beverage',
    'bakery',
    'grocery',
    'snack',
    // Dutch terms
    'bakkerij',
    'drank',
    'voedsel',
    'zuivel',
    'vlees',
    'vis',
    'groente',
    'fruit',
  ];
  const isFoodByCat = cats.some((c) => foodCatKeywords.some((k) => c.includes(k)));
  const isFoodByIngredients =
    ingr.length > 0 && !cats.some((c) => c.includes('household') || c.includes('huishouden'));
  const isPetFood = cats.some((c) => /pet|dog|cat|huisdier/.test(c));
  let isFood = isFoodByCat || isFoodByIngredients;

  // T021: Apply negative keyword suppression
  let debugLog: Record<string, unknown> | undefined;
  if (isFood) {
    const nameTokens = cats; // reuse categories as proxy for product naming context (adjust when name field available)
    const negativeHit = nameTokens.some((tok) => containsNegative(tok));
    if (negativeHit) {
      const safe = nameTokens.some((tok) => NEGATIVE_SAFE_LIST.some((s) => tok.includes(s)));
      if (!safe) isFood = false;
      if (DEBUG_CLASSIFY) debugLog = { negativeHit, safe, tokens: nameTokens };
    }
  }

  const errors: string[] = [];
  if (isFood && isPetFood) errors.push('classification_mismatch');

  const result: ClassifyResult = {
    flags: { isFood, isPetFood },
    ...(errors.length ? { errors } : {}),
  };
  if (DEBUG_CLASSIFY && debugLog) {
    console.log(JSON.stringify({ kind: 'classify_debug', ...debugLog }));
  }
  return result;
}

function containsNegative(text: string): boolean {
  // Whole word or token boundary check
  for (const kw of NEGATIVE_KEYWORDS) {
    const re = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i');
    if (re.test(text)) return true;
  }
  return false;
}

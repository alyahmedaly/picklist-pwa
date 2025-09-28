import type { ParsedIngredients } from '@picklist/types';
/** Structured ingredient information with core/additives s
 * eparation */
export interface IngredientInfo {
  /** Core food ingredients (non-additive) */
  core: string[];
  /** E-number additives found in ingredients */
  additives: string[];
  /** Special statements (added sugar/salt warnings) */
  statements: string[];
  /** Total ingredient count */
  total: number;
}

// T017 Ingredient placeholder filtering (FR-DH-001)
// Frozen placeholder tokens (canonical). Variant forms like n/a, n.a. normalized via regex logic.
// Includes Dutch placeholders: GEEN, NVT
export const INGREDIENT_PLACEHOLDERS = Object.freeze([
  'NA',
  'N/A',
  'N.A.',
  '-',
  '--',
  'GEEN',
  'NVT',
]);

/**
 * parseIngredients (T011) – Lightweight heuristic parser.
 * Steps:
 * 1. Strip leading label like "INGREDIENTS:" case-insensitive.
 * 2. Split by commas while respecting balanced parentheses nesting.
 * 3. Trim each token; drop empty tokens.
 * 4. Derive flags:
 *    - addedSugarFlag: presence of sugar terms ("sugar", "cane sugar", "brown sugar") not negated by "unsweetened" claim.
 *    - addedSaltFlag: token contains 'salt' (sea salt, salt) excluding terms like 'salted caramel' still counts (simplify).
 *    - artificialSweetenersFlag: presence of known sweeteners list (aspartame, sucralose, acesulfame, saccharin, stevia extract, neotame, advantame).
 * Deterministic ordering: tokens preserved as encountered.
 */
export function parseIngredients(raw: string | undefined | null): ParsedIngredients {
  const original = raw ?? '';
  const cleanedLabel = original.replace(/^\s*ingredients?\s*[:.-]\s*/i, '');

  // Pre-process to separate Dutch added nutrient statements
  const cleanedForParsing = separateDutchStatements(cleanedLabel);

  const preliminary = splitRespectingParens(cleanedForParsing)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const filtered = preliminary
    .map(preserveParensButTrim)
    .filter((t) => t.length > 0)
    .filter(isNotPlaceholderToken);

  // T018: Deduplicate while preserving first occurrence order
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const t of filtered) {
    if (!seen.has(t)) {
      seen.add(t);
      deduped.push(t);
    }
  }

  const lowerAll = deduped.map((t) => t.toLowerCase());
  const hasUnsweetened = lowerAll.some((t) => /unsweetened/.test(t));
  const sugarTerms = [
    'sugar',
    'cane sugar',
    'brown sugar',
    'invert sugar',
    'glucose',
    'fructose',
    'corn syrup',
  ];
  const artificialList = [
    // English terms
    'aspartame',
    'sucralose',
    'acesulfame',
    'acesulfame k',
    'saccharin',
    'stevia',
    'neotame',
    'advantame',
    // Dutch terms
    'aspartaam',
    'steviolglycosiden',
    'zoetstof',
    'zoetstoffen',
    'saccharine',
    'sucralose',
  ];

  const addedSugarFlag =
    !hasUnsweetened && lowerAll.some((t) => sugarTerms.some((term) => t.includes(term)));
  const addedSaltFlag = lowerAll.some((t) => /\bsalt\b/.test(t));
  const artificialSweetenersFlag = lowerAll.some((t) =>
    artificialList.some((term) => t.includes(term)),
  );

  // T018: Extract Dutch added sugar/salt phrases
  const added = extractDutchAddedNutrients(original);

  // T014: Create structured IngredientInfo
  const ingredientInfo = createIngredientInfo(deduped, added);

  // Derive additional parsed fields required by ParsedIngredients contract
  const parsed = deduped; // For now parsed tokens equals deduped tokens (future: could normalize)
  const addedSugar = !!added?.sugarsPer100 || addedSugarFlag;
  const addedSalt = !!added?.saltPer100 || addedSaltFlag;
  const preservatives: string[] = []; // Placeholder (no extraction logic yet)
  const conflicts: string[] = []; // Placeholder for potential conflicting ingredient statements

  return {
    raw: original,
    tokens: deduped,
    flags: { addedSugarFlag, addedSaltFlag, artificialSweetenersFlag },
    ingredientInfo,
    ...(added && Object.keys(added).length > 0 ? { added } : {}),
    parsed,
    addedSugar,
    addedSalt,
    preservatives,
    conflicts,
  };
}

function splitRespectingParens(s: string): string[] {
  const out: string[] = [];
  let buf = '';
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') {
      depth++;
      buf += ch;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      buf += ch;
      continue;
    }
    if (ch === ',' && depth === 0) {
      out.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf) out.push(buf);
  return out;
}

function preserveParensButTrim(token: string): string {
  // Keep interior parentheses & percent signs; only trim obvious outer noise like trailing ! or . or spaces
  return token
    .replace(/^\s+|\s+$/g, '')
    .replace(/^[,;]+/, '')
    .replace(/[!;.]+$/g, '');
}

function isNotPlaceholderToken(token: string): boolean {
  if (token === 'Na') return true; // Preserve chemical symbol (sodium)
  const upper = token.toUpperCase();
  if (INGREDIENT_PLACEHOLDERS.includes(upper)) return false;
  const lettersOnly = upper.replace(/[^A-Z0-9]/g, '');
  if (lettersOnly === 'NA') return false; // covers n/a, n.a.
  if (/^-{1,2}$/.test(token)) return false;

  // Dutch placeholder phrases - be specific to avoid filtering valid ingredients
  if (/^GEEN\s+(toegevoegde|smaakstoffen|kleurstoffen|conserveermiddelen)/i.test(token))
    return false;
  if (/^NVT\s*\(/i.test(token)) return false; // NVT (overige toevoegingen), etc.

  // Dutch added nutrient statements - these are not ingredients
  if (/^Waarvan\s+toegevoegde\s+(?:suikers|zout)/i.test(token)) return false;

  return true;
}

function extractDutchAddedNutrients(
  text: string,
): { sugarsPer100?: number; saltPer100?: number } | undefined {
  const result: { sugarsPer100?: number; saltPer100?: number } = {};

  // Pattern for "Waarvan toegevoegde suikers X.Xg per 100 gram" (handles both . and , as decimal separator)
  const sugarMatch =
    /waarvan\s+toegevoegde\s+suikers\s+([0-9]+(?:[.,]\d+)?)\s*g\s+per\s+100\s+gram/i.exec(text);
  if (sugarMatch && sugarMatch[1]) {
    const value = parseFloat(sugarMatch[1].replace(',', '.'));
    if (!isNaN(value)) {
      result.sugarsPer100 = value;
    }
  }

  // Pattern for "Waarvan toegevoegd zout X.Xg per 100 gram" (handles both . and , as decimal separator)
  const saltMatch =
    /waarvan\s+toegevoegd\s+zout\s+([0-9]+(?:[.,]\d+)?)\s*g\s+per\s+100\s+gram/i.exec(text);
  if (saltMatch && saltMatch[1]) {
    const value = parseFloat(saltMatch[1].replace(',', '.'));
    if (!isNaN(value)) {
      result.saltPer100 = value;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function createIngredientInfo(
  tokens: string[],
  added?: { sugarsPer100?: number; saltPer100?: number },
): IngredientInfo {
  const core: string[] = [];
  const additives: string[] = [];
  const statements: string[] = [];

  // Separate core ingredients from E-number additives
  tokens.forEach((token) => {
    if (isENumberAdditive(token)) {
      additives.push(token);
    } else {
      core.push(token);
    }
  });

  // Add statements based on extracted added nutrients
  if (added?.sugarsPer100) {
    statements.push(`Added sugars: ${added.sugarsPer100}g per 100g`);
  }
  if (added?.saltPer100) {
    statements.push(`Added salt: ${added.saltPer100}g per 100g`);
  }

  return {
    core,
    additives,
    statements,
    total: tokens.length,
  };
}

function isENumberAdditive(ingredient: string): boolean {
  // Check for E-numbers in various formats: E300, E330, [E300], (E330), etc.
  const eNumberPattern = /\bE\d{3,4}\b/i;
  return eNumberPattern.test(ingredient);
}

function separateDutchStatements(text: string): string {
  // Separate Dutch added nutrient statements from ingredients
  // Pattern: ingredient followed by ". Waarvan toegevoegde..."
  return text.replace(/\.\s*(Waarvan\s+toegevoegde\s+(?:suikers|zout).*?)(?=,|$)/gi, ', $1');
}

// T019/T020: Allergen whitelist & URL filtering.

import type { AdditiveFlags } from '@picklist/types';
import type { AllergensInfo } from '@picklist/types';

// Includes Dutch allergens: melk, ei, tarwe, etc.
export const ALLERGEN_WHITELIST = Object.freeze([
  'milk',
  'egg',
  'eggs',
  'soy',
  'soybean',
  'soybeans',
  'wheat',
  'peanut',
  'peanuts',
  'almond',
  'almonds',
  'cashew',
  'cashews',
  'walnut',
  'walnuts',
  'pecan',
  'pecans',
  'hazelnut',
  'hazelnuts',
  'pistachio',
  'pistachios',
  'macadamia',
  'macadamias',
  'fish',
  'shellfish',
  'shrimp',
  'crab',
  'lobster',
  'sesame',
  'mustard',
  'sulfite',
  'tree nuts',
  'corn',
  // Dutch allergens
  'melk',
  'ei',
  'soja',
  'tarwe',
  'pinda',
  'noten',
  'amandel',
  'cashew',
  'walnoot',
  'pecannoot',
  'hazelnoot',
  'pistache',
  'macadamia',
  'vis',
  'schaaldier',
  'weekdier',
  'sesam',
  'mosterd',
  'sulfiet',
  'lupine',
  'gluten',
  'gerst',
  'rogge',
  'haver',
]);

// Dutch to English allergen mapping
const DUTCH_TO_ENGLISH: Record<string, string> = Object.freeze({
  melk: 'milk',
  ei: 'egg',
  soja: 'soy',
  tarwe: 'wheat',
  pinda: 'peanut',
  noten: 'tree nuts',
  amandel: 'almond',
  walnoot: 'walnut',
  pecannoot: 'pecan',
  hazelnoot: 'hazelnut',
  pistache: 'pistachio',
  vis: 'fish',
  schaaldier: 'shellfish',
  weekdier: 'shellfish',
  sesam: 'sesame',
  mosterd: 'mustard',
  sulfiet: 'sulfite',
  lupine: 'lupine', // Dutch-only allergen
  gluten: 'wheat',
  gerst: 'wheat',
  rogge: 'wheat',
  haver: 'wheat',
});

const PLURAL_MAP: Record<string, string> = Object.freeze({
  eggs: 'egg',
  peanuts: 'peanut',
  almonds: 'almond',
  cashews: 'cashew',
  walnuts: 'walnut',
  pecans: 'pecan',
  hazelnuts: 'hazelnut',
  pistachios: 'pistachio',
  macadamias: 'macadamia',
});

const URL_PATTERN = /^(https?:\/\/|https?$)/i; // simple token-level URL match; extended asset detection below
const ASSET_PATTERN = /https?:\/\/\S+\.(png|jpe?g|gif|webp|svg)/i;

/**
 * parseAllergens (T013) – Parses a free-form allergens string into structured AllergensInfo.
 * Supports segments like:
 *   "Contains: milk, wheat. May contain: peanuts, soy." (order flexible, punctuation optional)
 * Tree nut detail: if token starts with 'tree nuts' and has parentheses list, capture inside list as treeNutDetail.
 * Alias mapping collapses variants (e.g., 'wheat flour' -> 'wheat').
 * Empty tokens ignored. Output arrays sorted alphabetically for determinism.
 */
export function parseAllergens(
  raw: string | undefined | null,
  statsAccumulator?: { incrementDutchAllergenProducts(): void },
): AllergensInfo {
  const containsSet = new Set<string>();
  const maySet = new Set<string>();
  let treeNutDetail: string[] | undefined;

  if (!raw) return { contains: [], mayContain: [] };

  // Split segments by period to isolate clauses.
  const segments = raw
    .split(/\.+\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const seg of segments) {
    let mode: 'contains' | 'may' | undefined;
    let content = seg;
    if (/^contains\b/i.test(seg)) {
      mode = 'contains';
      content = seg.replace(/^contains\s*[:.-]?\s*/i, '');
    } else if (/^may contain\b/i.test(seg)) {
      mode = 'may';
      content = seg.replace(/^may contain\s*[:.-]?\s*/i, '');
    }
    // Dutch prefixes
    else if (/^bevat\b/i.test(seg)) {
      mode = 'contains';
      content = seg.replace(/^bevat\s*[:.-]?\s*/i, '');
    } else if (/^kan\s+(sporen\s+)?bevatten(\s+van)?\b/i.test(seg)) {
      mode = 'may';
      content = seg.replace(/^kan\s+(sporen\s+)?bevatten(\s+van)?\s*[:.-]?\s*/i, '');
    } else {
      // Heuristic: if segment includes patterns treat appropriately
      if (/may contain/i.test(seg)) {
        mode = 'may';
        content = seg.replace(/.*may contain\s*[:.-]?\s*/i, '');
      } else if (/contains/i.test(seg)) {
        mode = 'contains';
        content = seg.replace(/.*contains\s*[:.-]?\s*/i, '');
      } else if (/kan\s+(sporen\s+)?bevatten/i.test(seg)) {
        mode = 'may';
        content = seg.replace(/.*kan\s+(sporen\s+)?bevatten(\s+van)?\s*[:.-]?\s*/i, '');
      } else if (/bevat/i.test(seg)) {
        mode = 'contains';
        content = seg.replace(/.*bevat\s*[:.-]?\s*/i, '');
      } else {
        continue; // skip segment without markers
      }
    }

    const tokens = splitTokens(content);
    for (const token of tokens) {
      if (isUrlToken(token)) continue; // T020 URL filtering
      const norm = normalizeAlias(token);
      if (!norm) continue;
      // Tree nut detail detection
      if (/^tree nuts/i.test(token)) {
        const detail = extractParenList(token);
        if (detail.length) treeNutDetail = detail;
        // Normalize container token to 'tree nuts'
        if (mode === 'contains') containsSet.add('tree nuts');
        else if (mode === 'may') maySet.add('tree nuts');
        continue; // don't add raw variant again
      }
      if (isWhitelisted(norm)) {
        const singular = singularize(norm);
        if (mode === 'contains') containsSet.add(singular);
        else if (mode === 'may') maySet.add(singular);
      }
    }
  }

  const contains = Array.from(containsSet).sort();
  const mayContain = Array.from(maySet).sort();

  // T017: Dutch-only allergen counter logic
  if (statsAccumulator && raw) {
    const hasDutchAllergen = checkForDutchAllergens(raw);
    if (hasDutchAllergen) {
      statsAccumulator.incrementDutchAllergenProducts();
    }
  }

  return { contains, mayContain, ...(treeNutDetail ? { treeNutDetail } : {}) };
}

function splitTokens(s: string): string[] {
  // Split on commas, "and", or "en" (Dutch for "and") not inside parentheses
  const out: string[] = [];
  let buf = '';
  let depth = 0;

  // First handle "and"/"en" word boundaries, then commas
  const working = s.replace(/\b(and|en)\b/gi, ',');

  for (let i = 0; i < working.length; i++) {
    const ch = working[i];
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
  return out.map((t) => t.trim()).filter(Boolean);
}

function extractParenList(token: string): string[] {
  const m = /\(([^)]*)\)/.exec(token);
  if (!m || !m[1]) return [];
  return m[1]
    .split(/,/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeAlias(token: string): string | undefined {
  let t = token.trim().toLowerCase();
  if (!t) return undefined;
  // Remove trailing period
  t = t.replace(/\.+$/, '');

  // First check Dutch-to-English mapping
  if (DUTCH_TO_ENGLISH[t]) return DUTCH_TO_ENGLISH[t];

  const aliasMap: Record<string, string> = {
    'wheat flour': 'wheat',
    'milk powder': 'milk',
    'tree nut': 'tree nuts',
    'tree nuts': 'tree nuts',
  };
  if (aliasMap[t]) return aliasMap[t];
  return t;
}

function isUrlToken(token: string): boolean {
  const trimmed = token.trim();
  if (URL_PATTERN.test(trimmed)) return true;
  if (ASSET_PATTERN.test(trimmed)) return true;
  if (/^https?:\/\//i.test(trimmed)) return true; // general http/https prefix
  return false;
}

function isWhitelisted(token: string): boolean {
  return ALLERGEN_WHITELIST.includes(token);
}

function singularize(token: string): string {
  if (PLURAL_MAP[token]) return PLURAL_MAP[token];
  return token;
}

function checkForDutchAllergens(raw: string): boolean {
  const lower = raw.toLowerCase();

  // Check for Dutch prefixes
  if (/\bbevat\b/i.test(raw) || /\bkan\s+(sporen\s+)?bevatten/i.test(raw)) {
    return true;
  }

  // Check for Dutch allergen terms (not in English whitelist)
  const dutchOnlyAllergens = [
    'melk',
    'ei',
    'soja',
    'tarwe',
    'pinda',
    'noten',
    'amandel',
    'walnoot',
    'pecannoot',
    'hazelnoot',
    'pistache',
    'vis',
    'schaaldier',
    'weekdier',
    'sesam',
    'mosterd',
    'sulfiet',
    'lupine',
    'gluten',
    'gerst',
    'rogge',
    'haver',
  ];

  for (const dutch of dutchOnlyAllergens) {
    if (lower.includes(dutch)) {
      return true;
    }
  }

  return false;
}

/**
 * T017: Warning consolidation - Gather all safety warnings from various sources
 * into a unified warnings array for consumer protection
 */
export function consolidateWarnings(
  allergens?: AllergensInfo,
  additiveFlags?: AdditiveFlags,
): string[] {
  const warnings: string[] = [];

  // Additive-based warnings
  if (additiveFlags) {
    if (additiveFlags.requiresChildWarning) {
      warnings.push("Contains coloring that may affect children's activity and attention");
    }
    if (additiveFlags.requiresPKUWarning) {
      warnings.push('Contains aspartame - unsuitable for phenylketonuria (PKU)');
    }
    if (additiveFlags.containsAllergenicAdditives) {
      warnings.push('Contains sulfites - may cause allergic reactions');
    }
    if (additiveFlags.mayWorsenAsthmaEczema && !additiveFlags.requiresChildWarning) {
      // Only add if not already covered by child warning
      warnings.push('May worsen asthma and eczema symptoms');
    }
  }

  // Allergen-based warnings
  if (allergens) {
    if (allergens.contains.length > 0) {
      const allergenList = allergens.contains.join(', ');
      warnings.push(`Contains allergens: ${allergenList}`);
    }
    if (allergens.mayContain.length > 0) {
      const mayContainList = allergens.mayContain.join(', ');
      warnings.push(`May contain traces of: ${mayContainList}`);
    }
  }

  // Remove duplicates and sort for consistency
  return Array.from(new Set(warnings)).sort();
}

import type { AdditiveFlags, AdditiveInfo, AdditivesSummary } from '@picklist/types';
import { generateAdditiveFlags, generateWarningMessages } from './additive/additiveFlags.ts';
import { getENumberDefinition, NAME_TO_ENUMBER_MAP } from './additive/eNumberDatabase.ts';

/**
 * parseAdditives - Extract and analyze E-numbers from Dutch ingredient lists
 *
 * Based on regex patterns validated against 30,499 real Dutch products:
 * - Pattern: [E300], [E330], [E471] format (1,726× E330, 1,156× E202, 1,053× E300)
 * - Dutch categories: conserveermiddel, kleurstof, antioxidant, etc.
 * - Performance: <10s for 30k products (constitutional requirement)
 */

// Pre-compiled regex patterns for performance (constitutional requirement: <10s for 30k products)
const PATTERNS = {
  // Primary E-number extraction: [E300], [E330], etc.
  eNumberBracket: /\[E(\d{3,4}[a-z]?)\]/gi,

  // Dutch functional categories from Voedingscentrum research
  dutchCategory:
    /(conserveermiddel|kleurstof|antioxidant|smaakversterker|stabilisator|emulgator|verdikkingsmiddel|zuurteregelaar|geleermiddel|rijsmiddel|zoetstof|glansmiddel)/gi,

  // Complex compounds with multiple E-numbers: "conserveermiddel (natriumnitriet [E250], kaliumsorbaat [E202])"
  compounds: /([a-zA-Z]+(?:zuur|middel|stof|er))\s*\([^)]*\[E\d+[a-z]?\][^)]*\)/gi,

  // Alternative format: E-number without brackets "E300"
  eNumberDirect: /\bE(\d{3,4}[a-z]?)\b/gi,

  // Dutch additive names without E-numbers: "ascorbinezuur", "citroenzuur"
  dutchAdditiveNames:
    /(ascorbinezuur|citroenzuur|kaliumsorbaat|natriumbenzoaat|tartrazine|aspartaam|mononatriumglutamaat|curcumine)/gi,
};

// Note: Dutch category mapping moved to dutchCategoryMapper.ts

// Utility: escape strings for safe regex building
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Reuse precomputed NAME_TO_ENUMBER_MAP exported by the database module

export interface ParseAdditivesResult {
  additiveInfo: AdditiveInfo;
  additiveFlags: AdditiveFlags;
  additivesSummary: AdditivesSummary;
}

export function parseAdditives(ingredients: string[]): ParseAdditivesResult {
  // Combine all ingredients into single string for processing
  const fullIngredientText = ingredients.join(' ').toLowerCase();

  // Early exit for empty or no ingredients
  if (!fullIngredientText.trim()) {
    return createEmptyResult();
  }

  // Step 1: Extract E-numbers from various formats
  const eNumbers = new Set<string>();
  const dutchCategories: string[] = []; // Use array to preserve order

  // Extract from bracket format: [E300]
  let match;
  PATTERNS.eNumberBracket.lastIndex = 0;
  while ((match = PATTERNS.eNumberBracket.exec(fullIngredientText)) !== null) {
    if (match[1]) {
      eNumbers.add(`E${match[1].toUpperCase()}`);
    }
  }

  // Extract from direct format: E300
  PATTERNS.eNumberDirect.lastIndex = 0;
  while ((match = PATTERNS.eNumberDirect.exec(fullIngredientText)) !== null) {
    if (match[1]) {
      eNumbers.add(`E${match[1].toUpperCase()}`);
    }
  }

  // Extract Dutch category names - preserve order
  PATTERNS.dutchCategory.lastIndex = 0;
  while ((match = PATTERNS.dutchCategory.exec(fullIngredientText)) !== null) {
    if (match[1]) {
      const category = match[1].toLowerCase();
      if (!dutchCategories.includes(category)) {
        dutchCategories.push(category);
      }
    }
  }

  // Extract E-numbers from Dutch additive names using the precomputed NAME_TO_ENUMBER_MAP
  PATTERNS.dutchAdditiveNames.lastIndex = 0;
  while ((match = PATTERNS.dutchAdditiveNames.exec(fullIngredientText)) !== null) {
    if (match[1]) {
      const dutchName = match[1].toLowerCase();
      const eNumber = NAME_TO_ENUMBER_MAP.get(dutchName);
      if (eNumber) eNumbers.add(eNumber);
    }
  }

  // Additionally scan ingredient text for any known names from the precomputed map
  for (const [name, code] of NAME_TO_ENUMBER_MAP.entries()) {
    const re = new RegExp(`\b${escapeRegExp(name)}\b`, 'i');
    if (re.test(fullIngredientText)) {
      eNumbers.add(code);
    }
  }

  // Tokenized fallback: split on non-alphanumerics and check individual tokens
  // This is conservative and helps catch variants that the word-boundary regex misses
  const tokens = fullIngredientText.split(/[^a-z0-9]+/i).filter(Boolean);
  for (const tok of tokens) {
    const mapped = NAME_TO_ENUMBER_MAP.get(tok);
    if (mapped) eNumbers.add(mapped);
  }

  // Extract E-numbers and names inside compound/parenthetical groups for better coverage
  PATTERNS.compounds.lastIndex = 0;
  while ((match = PATTERNS.compounds.exec(fullIngredientText)) !== null) {
    const group = match[0];
    // pull E-numbers inside the group
    let innerMatch;
    PATTERNS.eNumberBracket.lastIndex = 0;
    while ((innerMatch = PATTERNS.eNumberBracket.exec(group)) !== null) {
      if (innerMatch[1]) eNumbers.add(`E${innerMatch[1].toUpperCase()}`);
    }
    PATTERNS.eNumberDirect.lastIndex = 0;
    while ((innerMatch = PATTERNS.eNumberDirect.exec(group)) !== null) {
      if (innerMatch[1]) eNumbers.add(`E${innerMatch[1].toUpperCase()}`);
    }

    // scan group for known names from the precomputed map
    for (const [name, code] of NAME_TO_ENUMBER_MAP.entries()) {
      const re = new RegExp(`\b${escapeRegExp(name)}\b`, 'i');
      if (re.test(group)) eNumbers.add(code);
    }
  }

  // Step 2: Validate E-numbers against database and classify
  const validENumbers: string[] = [];
  const functionalCategories = new Set<string>();
  const naturalAdditives: string[] = [];
  const syntheticAdditives: string[] = [];

  // Collections by function
  const preservatives: string[] = [];
  const colors: string[] = [];
  const antioxidants: string[] = [];
  const stabilizers: string[] = [];
  const sweeteners: string[] = [];
  const flavorEnhancers: string[] = [];

  // Preserve deterministic order: prefer the insertion order from NAME_TO_ENUMBER_MAP (DB-driven),
  // falling back to the earliest occurrence in the ingredient text when a code isn't present in the map.
  const namePriority = new Map<string, number>();
  let npIndex = 0;
  for (const [, code] of NAME_TO_ENUMBER_MAP.entries()) {
    if (!namePriority.has(code)) namePriority.set(code, npIndex++);
  }

  function firstIndexOfENumber(eNumber: string, haystack: string): number {
    const codeLower = eNumber.toLowerCase();
    let idx = haystack.indexOf(codeLower);
    if (idx === -1) idx = haystack.indexOf(codeLower.replace(/^e/, '\\[' + 'e'));
    for (const [name, code] of NAME_TO_ENUMBER_MAP.entries()) {
      if (code === eNumber) {
        const i = haystack.indexOf(name);
        if (i !== -1 && (idx === -1 || i < idx)) idx = i;
      }
    }
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  }

  const eNumberArray = Array.from(eNumbers).sort((a, b) => {
    const ia = firstIndexOfENumber(a, fullIngredientText);
    const ib = firstIndexOfENumber(b, fullIngredientText);
    if (ia !== ib) return ia - ib;
    const pa = namePriority.has(a) ? namePriority.get(a)! : Number.MAX_SAFE_INTEGER;
    const pb = namePriority.has(b) ? namePriority.get(b)! : Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });

  for (const eNumber of eNumberArray) {
    const definition = getENumberDefinition(eNumber);
    if (definition) {
      validENumbers.push(eNumber);
      functionalCategories.add(definition.functionalCategory);

      // Natural vs synthetic classification
      if (definition.isNaturallyOccurring) {
        naturalAdditives.push(eNumber);
      }
      if (definition.isSynthetic) {
        syntheticAdditives.push(eNumber);
      }

      // Functional collections
      if (definition.functionalCategory === 'Conserveermiddel') {
        preservatives.push(eNumber);
      }
      if (definition.functionalCategory === 'Kleurstof') {
        colors.push(eNumber);
      }
      if (definition.functionalCategory === 'Antioxidant') {
        antioxidants.push(eNumber);
      }
      if (definition.functionalCategory === 'Stabilisator') {
        stabilizers.push(eNumber);
      }
      if (definition.functionalCategory === 'Zoetstof') {
        sweeteners.push(eNumber);
      }
      if (definition.functionalCategory === 'Smaakversterker') {
        flavorEnhancers.push(eNumber);
      }
    }
  }

  // Step 3: Build AdditiveInfo structure
  const additiveInfo: AdditiveInfo = {
    eNumbers: validENumbers, // Preserve order as found
    dutchCategories: dutchCategories.slice().sort(), // Sort for consistency in additiveInfo
    functionalCategories: Array.from(functionalCategories).sort(),
    totalAdditives: validENumbers.length,
    naturalAdditives: naturalAdditives.sort(),
    syntheticAdditives: syntheticAdditives.sort(),
    preservatives: preservatives.sort(),
    colors: colors.sort(),
    antioxidants: antioxidants.sort(),
    stabilizers: stabilizers.sort(),
    sweeteners: sweeteners.sort(),
    flavorEnhancers: flavorEnhancers.sort(),
  };

  // Step 4: Generate safety and dietary flags
  const additiveFlags = generateAdditiveFlags(additiveInfo);

  // Step 5: Create consumer-friendly AdditivesSummary (preserve original order for categories)
  const additivesSummary = createAdditivesSummary(additiveInfo, additiveFlags, dutchCategories);

  return {
    additiveInfo,
    additiveFlags,
    additivesSummary,
  };
}

function createEmptyResult(): ParseAdditivesResult {
  const emptyInfo: AdditiveInfo = {
    eNumbers: [],
    dutchCategories: [],
    functionalCategories: [],
    totalAdditives: 0,
    naturalAdditives: [],
    syntheticAdditives: [],
    preservatives: [],
    colors: [],
    antioxidants: [],
    stabilizers: [],
    sweeteners: [],
    flavorEnhancers: [],
  };

  const emptyFlags = generateAdditiveFlags(emptyInfo);
  const emptySummary = createAdditivesSummary(emptyInfo, emptyFlags, []);

  return {
    additiveInfo: emptyInfo,
    additiveFlags: emptyFlags,
    additivesSummary: emptySummary,
  };
}

function createAdditivesSummary(
  additiveInfo: AdditiveInfo,
  additiveFlags: AdditiveFlags,
  dutchCategories: string[],
): AdditivesSummary {
  const { eNumbers, totalAdditives } = additiveInfo;

  // Create human-readable summary text
  let summary = '';
  const totalDetected = Math.max(totalAdditives, dutchCategories.length); // Use Dutch categories if no E-numbers validated
  if (totalDetected === 0) {
    summary = 'No additives detected';
  } else if (totalAdditives > 0) {
    // Combine categories: prefer Dutch categories (mapped) in original order, then append any missing categories derived from additiveInfo
    const dutchMapped = createCategoriesFromDutch(dutchCategories)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const inferred = createCategoriesText(additiveInfo)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const combined = [...dutchMapped];
    for (const c of inferred) {
      if (!combined.includes(c)) combined.push(c);
    }
    const categoryMappings = combined.join(', ');
    summary = `Contains ${totalAdditives} additive${totalAdditives > 1 ? 's' : ''}${categoryMappings ? ': ' + categoryMappings : ''}`;
  } else {
    // Use Dutch categories when E-numbers not in database
    const categoryMappings = createCategoriesFromDutch(dutchCategories);
    summary = `Contains ${dutchCategories.length} additive${dutchCategories.length > 1 ? 's' : ''}${categoryMappings ? ': ' + categoryMappings : ''}`;
  }

  // Collect warnings from flags by generating consumer-friendly messages (interpolated when possible)
  const warnings = generateWarningMessages(additiveFlags, additiveInfo);

  // Collect dietary restrictions
  const dietary: string[] = [];
  if (totalAdditives === 0) {
    dietary.push('Suitable for all diets');
  } else {
    if (additiveFlags.hasAnimalDerivedAdditives) {
      dietary.push('Contains animal-derived additives');
      dietary.push('Not suitable for vegans');
    }
    if (!additiveFlags.organicCompatible) {
      dietary.push('Not suitable for organic');
    }
    if (additiveFlags.allNaturalAdditives && totalAdditives > 0) {
      dietary.push('All natural additives');
    }
  }

  return {
    eNumbers: eNumbers.slice(), // Copy array
    summary,
    warnings,
    dietary,
    categories: dutchCategories.slice(), // Copy but preserve order as found
  };
}

function createCategoriesText(additiveInfo: AdditiveInfo): string {
  const categories: string[] = [];

  if (additiveInfo.preservatives.length > 0) categories.push('preservative');
  if (additiveInfo.colors.length > 0) categories.push('coloring');
  if (additiveInfo.antioxidants.length > 0) categories.push('antioxidant');
  if (additiveInfo.stabilizers.length > 0) categories.push('stabilizer');
  if (additiveInfo.sweeteners.length > 0) categories.push('sweetener');
  if (additiveInfo.flavorEnhancers.length > 0) categories.push('flavor enhancer');

  if (categories.length === 0) return '';

  // Use comma separation as expected by tests
  return categories.join(', ');
}

function createCategoriesFromDutch(dutchCategories: string[]): string {
  const englishCategories: string[] = [];

  // Map Dutch categories to English equivalents for consumer-friendly display
  for (const category of dutchCategories) {
    switch (category.toLowerCase()) {
      case 'conserveermiddel':
        englishCategories.push('preservative');
        break;
      case 'kleurstof':
        englishCategories.push('coloring');
        break;
      case 'antioxidant':
        englishCategories.push('antioxidant');
        break;
      case 'stabilisator':
        englishCategories.push('stabilizer');
        break;
      case 'verdikkingsmiddel':
        englishCategories.push('thickener');
        break;
      case 'emulgator':
        englishCategories.push('emulsifier');
        break;
      case 'smaakversterker':
        englishCategories.push('flavor enhancer');
        break;
      case 'zuurteregelaar':
        englishCategories.push('acidity regulator');
        break;
      case 'geleermiddel':
        englishCategories.push('gelling agent');
        break;
      case 'rijsmiddel':
        englishCategories.push('raising agent');
        break;
      case 'zoetstof':
        englishCategories.push('sweetener');
        break;
      case 'glansmiddel':
        englishCategories.push('glazing agent');
        break;
      default:
        // Keep unknown categories as-is
        englishCategories.push(category);
    }
  }

  return englishCategories.join(', ');
}

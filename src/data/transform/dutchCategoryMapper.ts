import type { FunctionalCategory } from './types.ts';

/**
 * Dutch Category Mapper for Food Additives
 *
 * Maps Dutch additive terminology to official EU functional categories
 * Based on Voedingscentrum research and EU regulation 1333/2008
 */

// Complete mapping of Dutch terms to FunctionalCategory values
export const DUTCH_TO_FUNCTIONAL_CATEGORY: Record<string, FunctionalCategory> = {
  // Core categories (most common in Dutch products)
  conserveermiddel: 'Conserveermiddel',
  kleurstof: 'Kleurstof',
  antioxidant: 'Antioxidant',
  smaakversterker: 'Smaakversterker',
  stabilisator: 'Stabilisator',
  emulgator: 'Emulgator',
  verdikkingsmiddel: 'Verdikkingsmiddel',
  zuurteregelaar: 'Zuurteregelaar',
  geleermiddel: 'Geleermiddel',
  zoetstof: 'Zoetstof',
  glansmiddel: 'Glansmiddel',

  // Extended categories (all 27 EU categories)
  antiklontermiddel: 'Antiklontermiddel',
  antischuimmiddel: 'Antischuimmiddel',
  bevochtigingsmiddel: 'Bevochtigingsmiddel',
  complexvormer: 'Complexvormer',
  contrastverhoger: 'Contrastverhoger',
  drijfgas: 'Drijfgas',
  draagstof: 'Draagstof',
  'gemodificeerd zetmeel': 'Gemodificeerd zetmeel',
  meelverbeteraar: 'Meelverbeteraar',
  rijsmiddel: 'Rijsmiddel',
  schuimmiddel: 'Schuimmiddel',
  smeltzout: 'Smeltzout',
  verpakkingsgas: 'Verpakkingsgas',
  verstevigingsmiddel: 'Verstevigingsmiddel',
  voedingszuur: 'Voedingszuur',
  vulstof: 'Vulstof',
};

// Alternative Dutch spellings and variations
export const DUTCH_SPELLING_VARIANTS: Record<string, string> = {
  // Plural forms
  conserveermiddelen: 'conserveermiddel',
  kleurstoffen: 'kleurstof',
  antioxidanten: 'antioxidant',
  smaakversterkers: 'smaakversterker',
  stabilisatoren: 'stabilisator',
  emulgatoren: 'emulgator',
  zoetstoffen: 'zoetstof',

  // Common variations
  kleur: 'kleurstof',
  kleurmiddel: 'kleurstof',
  smaakstof: 'smaakversterker',
  verdikker: 'verdikkingsmiddel',
  geleer: 'geleermiddel',
  conserveer: 'conserveermiddel',

  // Technical variants
  'e-nummer': 'additive', // Generic fallback
  additief: 'additive',
  hulpstof: 'draagstof',
};

// English to Dutch mapping (for reverse lookups)
export const FUNCTIONAL_TO_DUTCH_CATEGORY = {
  Antiklontermiddel: 'antiklontermiddel',
  Antioxidant: 'antioxidant',
  Antischuimmiddel: 'antischuimmiddel',
  Bevochtigingsmiddel: 'bevochtigingsmiddel',
  Complexvormer: 'complexvormer',
  Conserveermiddel: 'conserveermiddel',
  Contrastverhoger: 'contrastverhoger',
  Drijfgas: 'drijfgas',
  Draagstof: 'draagstof',
  Emulgator: 'emulgator',
  Geleermiddel: 'geleermiddel',
  'Gemodificeerd zetmeel': 'gemodificeerd zetmeel',
  Glansmiddel: 'glansmiddel',
  Kleurstof: 'kleurstof',
  Meelverbeteraar: 'meelverbeteraar',
  Rijsmiddel: 'rijsmiddel',
  Schuimmiddel: 'schuimmiddel',
  Smaakversterker: 'smaakversterker',
  Smeltzout: 'smeltzout',
  Stabilisator: 'stabilisator',
  Verdikkingsmiddel: 'verdikkingsmiddel',
  Verpakkingsgas: 'verpakkingsgas',
  Verstevigingsmiddel: 'verstevigingsmiddel',
  Voedingszuur: 'voedingszuur',
  Vulstof: 'vulstof',
  Zoetstof: 'zoetstof',
  Zuurteregelaar: 'zuurteregelaar',
} as const;

/**
 * Map Dutch category name to FunctionalCategory enum
 */
export function mapDutchToFunctionalCategory(dutchCategory: string): FunctionalCategory | null {
  const normalized = dutchCategory.toLowerCase().trim();

  // Direct mapping
  if (normalized in DUTCH_TO_FUNCTIONAL_CATEGORY) {
    return DUTCH_TO_FUNCTIONAL_CATEGORY[normalized] ?? null;
  }

  // Check spelling variants
  if (normalized in DUTCH_SPELLING_VARIANTS) {
    const canonical = DUTCH_SPELLING_VARIANTS[normalized];
    if (canonical && canonical in DUTCH_TO_FUNCTIONAL_CATEGORY) {
      return DUTCH_TO_FUNCTIONAL_CATEGORY[canonical] ?? null;
    }
  }

  return null;
}

/**
 * Map FunctionalCategory enum to Dutch category name
 */
export function mapFunctionalToDutchCategory(functionalCategory: FunctionalCategory): string {
  return FUNCTIONAL_TO_DUTCH_CATEGORY[functionalCategory] || functionalCategory.toLowerCase();
}

/**
 * Extract Dutch categories from ingredient text
 */
export function extractDutchCategories(ingredientText: string): string[] {
  const normalized = ingredientText.toLowerCase();
  const categories = new Set<string>();

  // Check for all known Dutch category patterns
  for (const dutchTerm of Object.keys(DUTCH_TO_FUNCTIONAL_CATEGORY)) {
    // Word boundary matching to avoid partial matches
    const pattern = new RegExp(`\\b${dutchTerm}\\b`, 'gi');
    if (pattern.test(normalized)) {
      categories.add(dutchTerm);
    }
  }

  // Check spelling variants
  for (const [variant, canonical] of Object.entries(DUTCH_SPELLING_VARIANTS)) {
    const pattern = new RegExp(`\\b${variant}\\b`, 'gi');
    if (pattern.test(normalized)) {
      categories.add(canonical);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Map multiple Dutch categories to functional categories
 */
export function mapDutchCategoriesBatch(dutchCategories: string[]): FunctionalCategory[] {
  const functionalCategories = new Set<FunctionalCategory>();

  for (const dutchCategory of dutchCategories) {
    const functional = mapDutchToFunctionalCategory(dutchCategory);
    if (functional) {
      functionalCategories.add(functional);
    }
  }

  return Array.from(functionalCategories).sort();
}

/**
 * Validate if a string is a recognized Dutch additive category
 */
export function isValidDutchCategory(category: string): boolean {
  const normalized = category.toLowerCase().trim();
  return normalized in DUTCH_TO_FUNCTIONAL_CATEGORY || normalized in DUTCH_SPELLING_VARIANTS;
}

/**
 * Get all supported Dutch category names
 */
export function getAllDutchCategories(): string[] {
  return Object.keys(DUTCH_TO_FUNCTIONAL_CATEGORY).sort();
}

/**
 * Get category explanation in Dutch
 */
export function getDutchCategoryExplanation(dutchCategory: string): string {
  const explanations: Record<string, string> = {
    conserveermiddel: 'Voorkomen bederf door bacteriën, schimmels of gisten',
    kleurstof: 'Geven kleur aan voedingsmiddelen',
    antioxidant: 'Voorkomen oxidatie en behouden smaak en kleur',
    smaakversterker: 'Versterken de natuurlijke smaak van voedsel',
    stabilisator: 'Behouden textuur en voorkomen scheiding',
    emulgator: 'Mengen vet en water tot gladde textuur',
    verdikkingsmiddel: 'Maken producten dikker en romiger',
    zuurteregelaar: 'Houden de juiste pH-waarde aan',
    geleermiddel: 'Zorgen voor gelachtige textuur',
    zoetstof: 'Geven zoete smaak met minder calorieën dan suiker',
    glansmiddel: 'Geven glanzende coating aan producten',
  };

  const normalized = dutchCategory.toLowerCase().trim();
  return explanations[normalized] || 'Voedingsadditief voor specifieke functie';
}

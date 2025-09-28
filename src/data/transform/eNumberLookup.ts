import type { ENumberDefinition } from '../../../packages/parser/src/product/parse/additive/eNumberDatabase.ts';
import {
  E_NUMBER_DATABASE,
  getENumberDefinition,
  isValidENumber,
  getENumbersByCategory,
  getSouthamptonSixENumbers,
  getAllergenicENumbers,
  getAnimalDerivedENumbers,
  getBannedENumbers,
} from '../../../packages/parser/src/product/parse/additive/eNumberDatabase.ts';
import type { FunctionalCategory } from './types.ts';

/**
 * E-Number Lookup utilities for food additive analysis
 *
 * Provides optimized lookup functions for the parseAdditives pipeline.
 * All functions use O(1) hash map access for performance.
 */

export interface ENumberClassification {
  isNatural: boolean;
  isSynthetic: boolean;
  isAnimalDerived: boolean;
  isOrganicCompatible: boolean;
  functionalCategory: FunctionalCategory;
  dutchCategory: string;
}

export interface SafetyWarnings {
  requiresChildWarning: boolean;
  requiresPKUWarning: boolean;
  isAllergen: boolean;
  mayWorsenAsthmaEczema: boolean;
  isBanned: boolean;
}

/**
 * Fast lookup for E-number classification
 */
export function classifyENumber(eNumber: string): ENumberClassification | null {
  const definition = getENumberDefinition(eNumber);
  if (!definition) {
    return null;
  }

  return {
    isNatural: definition.isNaturallyOccurring,
    isSynthetic: definition.isSynthetic,
    isAnimalDerived: definition.isAnimalDerived,
    isOrganicCompatible: definition.organicPermitted,
    functionalCategory: definition.functionalCategory,
    dutchCategory: definition.dutchCategoryName,
  };
}

/**
 * Fast lookup for safety warnings
 */
export function getENumberSafetyWarnings(eNumber: string): SafetyWarnings | null {
  const definition = getENumberDefinition(eNumber);
  if (!definition) {
    return null;
  }

  return {
    requiresChildWarning: definition.southamptonSix,
    requiresPKUWarning: definition.pkuWarning,
    isAllergen: definition.isAllergen,
    mayWorsenAsthmaEczema: definition.asthmaEczemaRisk,
    isBanned: Boolean(definition.bannedSince),
  };
}

/**
 * Batch classification for multiple E-numbers (optimized for pipeline)
 */
export function classifyENumbers(eNumbers: string[]): Map<string, ENumberClassification> {
  const results = new Map<string, ENumberClassification>();

  for (const eNumber of eNumbers) {
    const classification = classifyENumber(eNumber);
    if (classification) {
      results.set(eNumber, classification);
    }
  }

  return results;
}

/**
 * Get all E-numbers in a specific functional range (e.g., colors E100-E199)
 */
export function getENumberRange(startCode: number, endCode: number): ENumberDefinition[] {
  return Object.values(E_NUMBER_DATABASE)
    .filter((def) => {
      const numericCode = parseInt(def.code.substring(1));
      return numericCode >= startCode && numericCode <= endCode;
    })
    .sort((a, b) => parseInt(a.code.substring(1)) - parseInt(b.code.substring(1)));
}

/**
 * Search for E-numbers by Dutch name
 */
export function findENumberByDutchName(dutchName: string): ENumberDefinition | null {
  const normalizedName = dutchName.toLowerCase().trim();

  for (const definition of Object.values(E_NUMBER_DATABASE)) {
    if (definition.dutchNames.some((name) => name.toLowerCase() === normalizedName)) {
      return definition;
    }
  }

  return null;
}

/**
 * Get consumer guidance for E-number
 */
export function getConsumerGuidance(eNumber: string): string | null {
  const definition = getENumberDefinition(eNumber);
  return definition ? definition.voedingscentrumGuidance : null;
}

/**
 * Check if E-number requires special warnings
 */
export function requiresSpecialWarning(eNumber: string): boolean {
  const warnings = getENumberSafetyWarnings(eNumber);
  if (!warnings) return false;

  return (
    warnings.requiresChildWarning ||
    warnings.requiresPKUWarning ||
    warnings.isAllergen ||
    warnings.mayWorsenAsthmaEczema ||
    warnings.isBanned
  );
}

/**
 * Get all E-numbers suitable for organic products
 */
export function getOrganicCompatibleENumbers(): string[] {
  return Object.values(E_NUMBER_DATABASE)
    .filter((def) => def.organicPermitted)
    .map((def) => def.code)
    .sort();
}

/**
 * Validate E-number format (E followed by 3-4 digits, optional letter)
 */
export function isValidENumberFormat(input: string): boolean {
  return /^E\d{3,4}[a-z]?$/i.test(input.trim());
}

/**
 * Performance-optimized batch validation
 */
export function validateENumbers(eNumbers: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const eNumber of eNumbers) {
    if (isValidENumber(eNumber)) {
      valid.push(eNumber);
    } else {
      invalid.push(eNumber);
    }
  }

  return { valid, invalid };
}

/**
 * Get statistics about E-number usage patterns
 */
export function getENumberStatistics() {
  const all = Object.values(E_NUMBER_DATABASE);

  const categories: FunctionalCategory[] = [
    'Antiklontermiddel',
    'Antioxidant',
    'Antischuimmiddel',
    'Bevochtigingsmiddel',
    'Complexvormer',
    'Conserveermiddel',
    'Contrastverhoger',
    'Drijfgas',
    'Draagstof',
    'Emulgator',
    'Geleermiddel',
    'Gemodificeerd zetmeel',
    'Glansmiddel',
    'Kleurstof',
    'Meelverbeteraar',
    'Rijsmiddel',
    'Schuimmiddel',
    'Smaakversterker',
    'Smeltzout',
    'Stabilisator',
    'Verdikkingsmiddel',
    'Verpakkingsgas',
    'Verstevigingsmiddel',
    'Voedingszuur',
    'Vulstof',
    'Zoetstof',
    'Zuurteregelaar',
  ];

  return {
    total: all.length,
    natural: all.filter((def) => def.isNaturallyOccurring).length,
    synthetic: all.filter((def) => def.isSynthetic).length,
    animalDerived: all.filter((def) => def.isAnimalDerived).length,
    organicPermitted: all.filter((def) => def.organicPermitted).length,
    southamptonSix: getSouthamptonSixENumbers().length,
    allergens: getAllergenicENumbers().length,
    banned: getBannedENumbers().length,
    byCategory: Object.fromEntries(
      categories.map((category) => [category, getENumbersByCategory(category).length]),
    ),
  };
}

// Re-export commonly used functions for convenience
export {
  getENumberDefinition,
  isValidENumber,
  getENumbersByCategory,
  getSouthamptonSixENumbers,
  getAllergenicENumbers,
  getAnimalDerivedENumbers,
  getBannedENumbers,
};

import type { AdditiveFlags, AdditiveInfo } from '@picklist/types';
import {
  CONSUMER_GUIDANCE,
  getAllergenicENumbers,
  getAnimalDerivedENumbers,
  getENumberDefinition,
  getSouthamptonSixENumbers,
} from './eNumberDatabase.ts';

/**
 * Generate additive flags based on E-number analysis
 *
 * Implements safety warnings and dietary restrictions based on:
 * - Voedingscentrum guidelines
 * - EU regulation 1333/2008
 * - EFSA safety assessments
 */

export function generateAdditiveFlags(additiveInfo: AdditiveInfo): AdditiveFlags {
  // Early exit for empty additive info
  if (additiveInfo.totalAdditives === 0) {
    return createEmptyFlags();
  }

  // Normalize E-number inputs defensively and build definition map for reuse
  const normalizedENumbers = additiveInfo.eNumbers.map((e) => e.trim().toUpperCase());
  const defMap = new Map<string, ReturnType<typeof getENumberDefinition>>();
  for (const e of normalizedENumbers) {
    defMap.set(e, getENumberDefinition(e));
  }

  // Pre-compute sets for efficient lookups (normalized keys)
  const southamptonSixSet = new Set(getSouthamptonSixENumbers().map((s) => s.toUpperCase()));
  const allergenicSet = new Set(getAllergenicENumbers().map((s) => s.toUpperCase()));
  const animalDerivedSet = new Set(getAnimalDerivedENumbers().map((s) => s.toUpperCase()));

  // Safety warnings (mandatory by EU regulations)
  const requiresChildWarning = hasChildWarning(normalizedENumbers, southamptonSixSet);
  const containsAllergenicAdditives = hasAllergens(normalizedENumbers, allergenicSet);
  const requiresPKUWarning = hasPKUWarning(normalizedENumbers, defMap);
  const mayWorsenAsthmaEczema = hasAsthmaEczemaRisk(normalizedENumbers, defMap);

  // Dietary restrictions
  const hasAnimalDerivedAdditives = hasAnimalDerived(normalizedENumbers, animalDerivedSet);
  const organicCompatible = isOrganicCompatible(normalizedENumbers, defMap);

  // Consumer preferences
  const hasPreservatives = additiveInfo.preservatives.length > 0;
  const hasArtificialColors = hasArtificialColorsFlag(additiveInfo.colors);
  const hasArtificialSweeteners = hasArtificialSweetenersFlag(additiveInfo.sweeteners);
  const hasFlavorEnhancers = additiveInfo.flavorEnhancers.length > 0;

  // Clean label indicators
  const hasNaturalAlternatives = hasAlternatives(normalizedENumbers);
  const allNaturalAdditives = additiveInfo.syntheticAdditives.length === 0;

  return {
    // Safety warnings (mandatory by EU regulations)
    requiresChildWarning,
    containsAllergenicAdditives,
    requiresPKUWarning,
    mayWorsenAsthmaEczema,

    // Dietary restrictions
    hasAnimalDerivedAdditives,
    organicCompatible,

    // Consumer preferences
    hasPreservatives,
    hasArtificialColors,
    hasArtificialSweeteners,
    hasFlavorEnhancers,

    // Clean label indicators
    hasNaturalAlternatives,
    allNaturalAdditives,
  };
}

/**
 * Check if any E-numbers require child hyperactivity warnings (Southampton Six)
 */
function hasChildWarning(eNumbers: string[], southamptonSixSet: Set<string>): boolean {
  return eNumbers.some((eNumber) => southamptonSixSet.has(eNumber.trim().toUpperCase()));
}

/**
 * Check if any E-numbers are official allergens (sulfites)
 */
function hasAllergens(eNumbers: string[], allergenicSet: Set<string>): boolean {
  return eNumbers.some((eNumber) => allergenicSet.has(eNumber.trim().toUpperCase()));
}

/**
 * Check if any E-numbers require PKU warnings (aspartame)
 */
function hasPKUWarning(
  eNumbers: string[],
  defMap: Map<string, ReturnType<typeof getENumberDefinition>>,
): boolean {
  return eNumbers.some((eNumber) => {
    const def = defMap.get(eNumber.trim().toUpperCase()) ?? getENumberDefinition(eNumber);
    return def?.pkuWarning === true;
  });
}

/**
 * Check if any E-numbers may worsen asthma/eczema (benzoic acid group)
 */
function hasAsthmaEczemaRisk(
  eNumbers: string[],
  defMap: Map<string, ReturnType<typeof getENumberDefinition>>,
): boolean {
  return eNumbers.some((eNumber) => {
    const def = defMap.get(eNumber.trim().toUpperCase()) ?? getENumberDefinition(eNumber);
    return def?.asthmaEczemaRisk === true;
  });
}

/**
 * Check if any E-numbers are animal-derived
 */
function hasAnimalDerived(eNumbers: string[], animalDerivedSet: Set<string>): boolean {
  return eNumbers.some((eNumber) => animalDerivedSet.has(eNumber.trim().toUpperCase()));
}

/**
 * Check if all E-numbers are permitted in organic products
 */
function isOrganicCompatible(
  eNumbers: string[],
  defMap: Map<string, ReturnType<typeof getENumberDefinition>>,
): boolean {
  if (eNumbers.length === 0) return true; // Vacuously true

  return eNumbers.every((eNumber) => {
    const def = defMap.get(eNumber.trim().toUpperCase()) ?? getENumberDefinition(eNumber);
    return def?.organicPermitted === true;
  });
}

/**
 * Check if colors include artificial/synthetic ones
 */
function hasArtificialColorsFlag(colors: string[]): boolean {
  return colors.some((eNumber) => {
    const def = getENumberDefinition(eNumber.trim().toUpperCase());
    return def?.isSynthetic === true;
  });
}

/**
 * Check if sweeteners include artificial/synthetic ones
 */
function hasArtificialSweetenersFlag(sweeteners: string[]): boolean {
  return sweeteners.some((eNumber) => {
    const def = getENumberDefinition(eNumber.trim().toUpperCase());
    return def?.isSynthetic === true;
  });
}

/**
 * Check if E-numbers have natural alternatives available
 */
function hasAlternatives(eNumbers: string[]): boolean {
  const altKeys = new Set(
    Object.keys(CONSUMER_GUIDANCE.naturalAlternatives).map((k) => k.toUpperCase()),
  );
  return eNumbers.some((eNumber) => altKeys.has(eNumber.trim().toUpperCase()));
}

/**
 * Create empty flags for products with no additives
 */
function createEmptyFlags(): AdditiveFlags {
  return {
    // Safety warnings (all false for no additives)
    requiresChildWarning: false,
    containsAllergenicAdditives: false,
    requiresPKUWarning: false,
    mayWorsenAsthmaEczema: false,

    // Dietary restrictions (vacuously true/false)
    hasAnimalDerivedAdditives: false,
    organicCompatible: true, // Vacuously true - no additives to check

    // Consumer preferences (all false for no additives)
    hasPreservatives: false,
    hasArtificialColors: false,
    hasArtificialSweeteners: false,
    hasFlavorEnhancers: false,

    // Clean label indicators
    hasNaturalAlternatives: false,
    allNaturalAdditives: true, // Vacuously true - no synthetic additives present
  };
}

/**
 * Generate consumer-friendly warning messages
 */
export function generateWarningMessages(
  flags: AdditiveFlags,
  additiveInfo?: AdditiveInfo,
): string[] {
  const warnings: string[] = [];

  // Helper to format E-number with official name if available
  function formatENumber(code: string): string {
    const def = getENumberDefinition(code);
    if (def) return `${def.officialName} (${def.code})`;
    return code;
  }

  // Gather normalized E-numbers from additiveInfo when available
  const eNumbers = additiveInfo?.eNumbers?.map((e) => e.trim().toUpperCase()) ?? [];

  if (flags.requiresChildWarning) {
    // English child hyperactivity warning. Prefer listing the specific E-numbers/names when available.
    const southampton = getSouthamptonSixENumbers().map((s) => s.toUpperCase());
    const matched = eNumbers.filter((e) => southampton.includes(e));
    const subject = matched.length > 0 ? matched.map(formatENumber).join(', ') : '';
    if (subject) {
      warnings.push(`${subject}: may affect activity or attention of children`);
    } else {
      warnings.push('Contains coloring that may affect children');
    }
  }

  if (flags.requiresPKUWarning) {
    // PKU warning - mention aspartame/phenylalanine when detected
    const pkuMatches = eNumbers.filter((e) => {
      const d = getENumberDefinition(e);
      return d?.pkuWarning === true;
    });
    if (pkuMatches.length > 0) {
      warnings.push(
        `${pkuMatches.map(formatENumber).join(', ')}: contains phenylalanine — unsuitable for phenylketonuria`,
      );
    } else {
      warnings.push('Contains aspartame - unsuitable for phenylketonuria');
    }
  }

  if (flags.containsAllergenicAdditives) {
    // Allergen warnings (sulfites)
    const allergenMatches = eNumbers.filter((e) => {
      const d = getENumberDefinition(e);
      return d?.isAllergen === true;
    });
    if (allergenMatches.length > 0) {
      warnings.push(`${allergenMatches.map(formatENumber).join(', ')}: contains sulfites`);
    } else {
      warnings.push('Contains sulfites - may cause allergic reactions');
    }
  }

  if (flags.mayWorsenAsthmaEczema) {
    const asthmaMatches = eNumbers.filter((e) => {
      const d = getENumberDefinition(e);
      return d?.asthmaEczemaRisk === true;
    });
    if (asthmaMatches.length > 0) {
      warnings.push(
        asthmaMatches.map(formatENumber).join(', ') +
          ': Kan astma en eczeem verergeren bij gevoelige personen',
      );
    } else {
      warnings.push('Kan astma en eczeem verergeren bij gevoelige personen');
    }
  }

  return warnings;
}

/**
 * Generate dietary restriction indicators
 */
export function generateDietaryFlags(flags: AdditiveFlags): Record<string, boolean> {
  return {
    vegan: !flags.hasAnimalDerivedAdditives,
    vegetarian: !flags.hasAnimalDerivedAdditives, // Same as vegan for additives
    organic: flags.organicCompatible,
    cleanLabel: flags.allNaturalAdditives,
    childFriendly: !flags.requiresChildWarning,
    allergenFree: !flags.containsAllergenicAdditives,
  };
}

/**
 * Calculate additive complexity score (0-100)
 */
export function calculateComplexityScore(additiveInfo: AdditiveInfo, flags: AdditiveFlags): number {
  let score = 0;

  // Base complexity from number of additives
  score += Math.min(additiveInfo.totalAdditives * 10, 40);

  // Safety warnings increase complexity
  if (flags.requiresChildWarning) score += 15;
  if (flags.requiresPKUWarning) score += 15;
  if (flags.containsAllergenicAdditives) score += 10;
  if (flags.mayWorsenAsthmaEczema) score += 10;

  // Artificial additives increase complexity
  if (flags.hasArtificialColors) score += 10;
  if (flags.hasArtificialSweeteners) score += 10;

  // Natural additives reduce complexity
  if (flags.allNaturalAdditives && additiveInfo.totalAdditives > 0) {
    score = Math.max(score - 20, 0);
  }

  return Math.min(score, 100);
}

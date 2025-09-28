import { describe, test, expect } from 'vitest';
import {
  generateAdditiveFlags,
  generateWarningMessages,
} from '../src/product/parse/additive/additiveFlags.ts';
import type { AdditiveInfo, AdditiveFlags } from '@picklist/types';

/** T008: Unit test additive flags generation - MUST FAIL initially */

describe('Additive Flags Generation (T008)', () => {
  test('function exists and has correct signature', () => {
    // This test MUST fail until generateAdditiveFlags is implemented
    expect(typeof generateAdditiveFlags).toBe('function');
  });

  test('generates child warning flag for Southampton Six colors', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['E102', 'E300'], // tartrazine + vitamin C
      dutchCategories: ['kleurstof', 'antioxidant'],
      functionalCategories: ['Kleurstof', 'Antioxidant'],
      totalAdditives: 2,
      naturalAdditives: ['E300'],
      syntheticAdditives: ['E102'],
      preservatives: [],
      colors: ['E102'],
      antioxidants: ['E300'],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: [],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(additiveInfo);

    // Southampton Six detection
    expect(flags.requiresChildWarning).toBe(true);
    expect(flags.hasArtificialColors).toBe(true);
    expect(flags.allNaturalAdditives).toBe(false);
  });

  test('generates PKU warning flag for aspartame', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['E951'], // aspartame
      dutchCategories: ['zoetstof'],
      functionalCategories: ['Zoetstof'],
      totalAdditives: 1,
      naturalAdditives: [],
      syntheticAdditives: ['E951'],
      preservatives: [],
      colors: [],
      antioxidants: [],
      stabilizers: [],
      sweeteners: ['E951'],
      flavorEnhancers: [],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(additiveInfo);

    expect(flags.requiresPKUWarning).toBe(true);
    expect(flags.hasArtificialSweeteners).toBe(true);
    expect(flags.allNaturalAdditives).toBe(false);
  });

  test('generates allergenic flag for sulfites', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['E220'], // sulphur dioxide
      dutchCategories: ['conserveermiddel'],
      functionalCategories: ['Conserveermiddel'],
      totalAdditives: 1,
      naturalAdditives: [],
      syntheticAdditives: ['E220'],
      preservatives: ['E220'],
      colors: [],
      antioxidants: [],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: [],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(additiveInfo);

    expect(flags.containsAllergenicAdditives).toBe(true);
    expect(flags.hasPreservatives).toBe(true);
  });

  test('generates asthma/eczema warning for benzoic acid group', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['E211'], // sodium benzoate
      dutchCategories: ['conserveermiddel'],
      functionalCategories: ['Conserveermiddel'],
      totalAdditives: 1,
      naturalAdditives: [],
      syntheticAdditives: ['E211'],
      preservatives: ['E211'],
      colors: [],
      antioxidants: [],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: [],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(additiveInfo);

    expect(flags.mayWorsenAsthmaEczema).toBe(true);
    expect(flags.hasPreservatives).toBe(true);
  });

  test('generates animal-derived flag for carmine and beeswax', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['E120', 'E901'], // carmine, beeswax
      dutchCategories: ['kleurstof', 'glansmiddel'],
      functionalCategories: ['Kleurstof', 'Glansmiddel'],
      totalAdditives: 2,
      naturalAdditives: ['E120', 'E901'],
      syntheticAdditives: [],
      preservatives: [],
      colors: ['E120'],
      antioxidants: [],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: [],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(additiveInfo);

    expect(flags.hasAnimalDerivedAdditives).toBe(true);
    expect(flags.allNaturalAdditives).toBe(true); // Both are natural but animal-derived
  });

  test('generates organic compatibility flag correctly', () => {
    // All organic-permitted additives
    const organicCompatibleInfo: AdditiveInfo = {
      eNumbers: ['E300', 'E330'], // vitamin C, citric acid
      dutchCategories: ['antioxidant', 'voedingszuur'],
      functionalCategories: ['Antioxidant', 'Voedingszuur'],
      totalAdditives: 2,
      naturalAdditives: ['E300', 'E330'],
      syntheticAdditives: [],
      preservatives: [],
      colors: [],
      antioxidants: ['E300', 'E330'],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: [],
    };

    const organicFlags = generateAdditiveFlags(organicCompatibleInfo);
    expect(organicFlags.organicCompatible).toBe(true);

    // Non-organic additives
    const nonOrganicInfo: AdditiveInfo = {
      eNumbers: ['E102', 'E621'], // tartrazine, MSG
      dutchCategories: ['kleurstof', 'smaakversterker'],
      functionalCategories: ['Kleurstof', 'Smaakversterker'],
      totalAdditives: 2,
      naturalAdditives: [],
      syntheticAdditives: ['E102', 'E621'],
      preservatives: [],
      colors: ['E102'],
      antioxidants: [],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: ['E621'],
    };

    const nonOrganicFlags = generateAdditiveFlags(nonOrganicInfo);
    expect(nonOrganicFlags.organicCompatible).toBe(false);
  });

  test('generates flavor enhancer flag for MSG', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['E621'], // monosodium glutamate
      dutchCategories: ['smaakversterker'],
      functionalCategories: ['Smaakversterker'],
      totalAdditives: 1,
      naturalAdditives: ['E621'], // MSG is naturally occurring
      syntheticAdditives: [],
      preservatives: [],
      colors: [],
      antioxidants: [],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: ['E621'],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(additiveInfo);

    expect(flags.hasFlavorEnhancers).toBe(true);
    expect(flags.allNaturalAdditives).toBe(true);
  });

  test('generates natural alternatives flag when applicable', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['E621', 'E951'], // MSG, aspartame (both have natural alternatives)
      dutchCategories: ['smaakversterker', 'zoetstof'],
      functionalCategories: ['Smaakversterker', 'Zoetstof'],
      totalAdditives: 2,
      naturalAdditives: ['E621'],
      syntheticAdditives: ['E951'],
      preservatives: [],
      colors: [],
      antioxidants: [],
      stabilizers: [],
      sweeteners: ['E951'],
      flavorEnhancers: ['E621'],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(additiveInfo);

    expect(flags.hasNaturalAlternatives).toBe(true);
    expect(flags.allNaturalAdditives).toBe(false);
  });

  test('handles empty additive info correctly', () => {
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

    const flags: AdditiveFlags = generateAdditiveFlags(emptyInfo);

    // All flags should be false except those that are vacuously true
    expect(flags.requiresChildWarning).toBe(false);
    expect(flags.containsAllergenicAdditives).toBe(false);
    expect(flags.requiresPKUWarning).toBe(false);
    expect(flags.mayWorsenAsthmaEczema).toBe(false);
    expect(flags.hasAnimalDerivedAdditives).toBe(false);
    expect(flags.organicCompatible).toBe(true); // Vacuously true
    expect(flags.hasPreservatives).toBe(false);
    expect(flags.hasArtificialColors).toBe(false);
    expect(flags.hasArtificialSweeteners).toBe(false);
    expect(flags.hasFlavorEnhancers).toBe(false);
    expect(flags.hasNaturalAlternatives).toBe(false);
    expect(flags.allNaturalAdditives).toBe(true); // Vacuously true
  });

  test('handles complex multi-additive scenarios', () => {
    // Complex product with multiple additive types and warnings
    const complexInfo: AdditiveInfo = {
      eNumbers: ['E102', 'E951', 'E220', 'E211', 'E120', 'E621'],
      dutchCategories: [
        'kleurstof',
        'zoetstof',
        'conserveermiddel',
        'conserveermiddel',
        'kleurstof',
        'smaakversterker',
      ],
      functionalCategories: [
        'Kleurstof',
        'Zoetstof',
        'Conserveermiddel',
        'Conserveermiddel',
        'Kleurstof',
        'Smaakversterker',
      ],
      totalAdditives: 6,
      naturalAdditives: ['E120', 'E621'],
      syntheticAdditives: ['E102', 'E951', 'E220', 'E211'],
      preservatives: ['E220', 'E211'],
      colors: ['E102', 'E120'],
      antioxidants: [],
      stabilizers: [],
      sweeteners: ['E951'],
      flavorEnhancers: ['E621'],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(complexInfo);

    // Multiple warnings should be triggered
    expect(flags.requiresChildWarning).toBe(true); // E102 Southampton Six
    expect(flags.requiresPKUWarning).toBe(true); // E951 aspartame
    expect(flags.containsAllergenicAdditives).toBe(true); // E220 sulfite
    expect(flags.mayWorsenAsthmaEczema).toBe(true); // E211 benzoate
    expect(flags.hasAnimalDerivedAdditives).toBe(true); // E120 carmine

    // Category flags
    expect(flags.hasPreservatives).toBe(true);
    expect(flags.hasArtificialColors).toBe(true);
    expect(flags.hasArtificialSweeteners).toBe(true);
    expect(flags.hasFlavorEnhancers).toBe(true);

    // Overall assessments
    expect(flags.allNaturalAdditives).toBe(false);
    expect(flags.organicCompatible).toBe(false);
    expect(flags.hasNaturalAlternatives).toBe(true);
  });

  test('correctly identifies clean label scenarios', () => {
    // Clean label product with only natural additives
    const cleanLabelInfo: AdditiveInfo = {
      eNumbers: ['E300', 'E440'], // vitamin C, pectin
      dutchCategories: ['antioxidant', 'geleermiddel'],
      functionalCategories: ['Antioxidant', 'Geleermiddel'],
      totalAdditives: 2,
      naturalAdditives: ['E300', 'E440'],
      syntheticAdditives: [],
      preservatives: [],
      colors: [],
      antioxidants: ['E300'],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: [],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(cleanLabelInfo);

    expect(flags.allNaturalAdditives).toBe(true);
    expect(flags.organicCompatible).toBe(true);
    expect(flags.requiresChildWarning).toBe(false);
    expect(flags.containsAllergenicAdditives).toBe(false);
    expect(flags.hasArtificialColors).toBe(false);
    expect(flags.hasArtificialSweeteners).toBe(false);
  });

  test('validates all functional category flags', () => {
    const allCategoriesInfo: AdditiveInfo = {
      eNumbers: ['E202', 'E102', 'E300', 'E464', 'E951', 'E621'],
      dutchCategories: [
        'conserveermiddel',
        'kleurstof',
        'antioxidant',
        'stabilisator',
        'zoetstof',
        'smaakversterker',
      ],
      functionalCategories: [
        'Conserveermiddel',
        'Kleurstof',
        'Antioxidant',
        'Stabilisator',
        'Zoetstof',
        'Smaakversterker',
      ],
      totalAdditives: 6,
      naturalAdditives: ['E300', 'E621'],
      syntheticAdditives: ['E202', 'E102', 'E464', 'E951'],
      preservatives: ['E202'],
      colors: ['E102'],
      antioxidants: ['E300'],
      stabilizers: ['E464'],
      sweeteners: ['E951'],
      flavorEnhancers: ['E621'],
    };

    const flags: AdditiveFlags = generateAdditiveFlags(allCategoriesInfo);

    // Verify all category flags are set
    expect(flags.hasPreservatives).toBe(true);
    expect(flags.hasArtificialColors).toBe(true);
    expect(flags.hasArtificialSweeteners).toBe(true);
    expect(flags.hasFlavorEnhancers).toBe(true);
  });

  test('normalizes e-number inputs (case and whitespace) and detects warnings', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: [' e951 ', 'e102'], // lowercase/whitespace variants
      dutchCategories: ['zoetstof', 'kleurstof'],
      functionalCategories: ['Zoetstof', 'Kleurstof'],
      totalAdditives: 2,
      naturalAdditives: [],
      syntheticAdditives: ['E951', 'E102'],
      preservatives: [],
      colors: ['E102'],
      antioxidants: [],
      stabilizers: [],
      sweeteners: ['E951'],
      flavorEnhancers: [],
    };

    const flags = generateAdditiveFlags(additiveInfo);

    // Lowercase / whitespace inputs should be normalized and detected
    expect(flags.requiresPKUWarning).toBe(true); // E951 (aspartame)
    expect(flags.requiresChildWarning).toBe(true); // E102 Southampton Six
    expect(flags.hasArtificialSweeteners).toBe(true);
    expect(flags.hasNaturalAlternatives).toBe(true); // E951 has natural alternative (stevia)

    const warnings = generateWarningMessages(flags);
    // PKU template should be present (English)
    expect(warnings.some((w) => /phenylalanine|aspartame|phenylketonuria/i.test(w))).toBe(true);
  });

  test('natural alternatives detection is case-insensitive', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['e621'], // lowercase MSG
      dutchCategories: ['smaakversterker'],
      functionalCategories: ['Smaakversterker'],
      totalAdditives: 1,
      naturalAdditives: ['E621'],
      syntheticAdditives: [],
      preservatives: [],
      colors: [],
      antioxidants: [],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: ['E621'],
    };

    const flags = generateAdditiveFlags(additiveInfo);
    expect(flags.hasNaturalAlternatives).toBe(true);
  });

  test('animal-derived detection is case-insensitive', () => {
    const additiveInfo: AdditiveInfo = {
      eNumbers: ['e120'], // carmine lowercase
      dutchCategories: ['kleurstof'],
      functionalCategories: ['Kleurstof'],
      totalAdditives: 1,
      naturalAdditives: ['E120'],
      syntheticAdditives: [],
      preservatives: [],
      colors: ['E120'],
      antioxidants: [],
      stabilizers: [],
      sweeteners: [],
      flavorEnhancers: [],
    };

    const flags = generateAdditiveFlags(additiveInfo);
    expect(flags.hasAnimalDerivedAdditives).toBe(true);
  });
});

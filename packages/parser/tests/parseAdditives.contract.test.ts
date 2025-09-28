import { describe, test, expect } from 'vitest';
import { parseAdditives } from '../src/product/parse/parseAdditives.ts';
import { AdditiveFlags } from '../../types/src/product/AdditiveFlags.ts';
import { AdditiveInfo } from '../../types/src/product/AdditiveInfo.ts';
import { AdditivesSummary } from '../../types/src/product/AdditivesSummary.ts';

/** T004: Contract test for parseAdditives function signature - MUST FAIL initially */

describe('parseAdditives Contract (T004)', () => {
  test('function exists and has correct signature', () => {
    // This test MUST fail until parseAdditives is implemented
    expect(typeof parseAdditives).toBe('function');
  });

  test('returns AdditiveInfo and AdditiveFlags for Dutch ingredients with E-numbers', () => {
    const dutchIngredients = [
      'water',
      'conserveermiddel (natriumnitriet [E250])',
      'kleurstof: tartrazine (E102)',
      'antioxidant: ascorbinezuur (E300)',
    ];

    const result = parseAdditives(dutchIngredients);

    // Contract expectations - these MUST fail initially
    expect(result).toHaveProperty('additiveInfo');
    expect(result).toHaveProperty('additiveFlags');

    // AdditiveInfo structure contract
    const info: AdditiveInfo = result.additiveInfo;
    expect(info).toHaveProperty('eNumbers');
    expect(info).toHaveProperty('dutchCategories');
    expect(info).toHaveProperty('functionalCategories');
    expect(info).toHaveProperty('totalAdditives');
    expect(info).toHaveProperty('naturalAdditives');
    expect(info).toHaveProperty('syntheticAdditives');
    expect(info).toHaveProperty('preservatives');
    expect(info).toHaveProperty('colors');
    expect(info).toHaveProperty('antioxidants');

    // AdditiveFlags structure contract
    const flags: AdditiveFlags = result.additiveFlags;
    expect(flags).toHaveProperty('requiresChildWarning');
    expect(flags).toHaveProperty('containsAllergenicAdditives');
    expect(flags).toHaveProperty('requiresPKUWarning');
    expect(flags).toHaveProperty('hasPreservatives');
    expect(flags).toHaveProperty('hasArtificialColors');
    expect(flags).toHaveProperty('organicCompatible');
  });

  test('handles empty ingredient list', () => {
    const result = parseAdditives([]);

    expect(result.additiveInfo).toBeDefined();
    expect(result.additiveFlags).toBeDefined();
    expect(result.additiveInfo.totalAdditives).toBe(0);
    expect(result.additiveInfo.eNumbers).toEqual([]);
  });

  test('handles ingredients with no E-numbers', () => {
    const basicIngredients = ['water', 'flour', 'salt', 'yeast'];

    const result = parseAdditives(basicIngredients);

    expect(result.additiveInfo.totalAdditives).toBe(0);
    expect(result.additiveInfo.eNumbers).toEqual([]);
    expect(result.additiveFlags.hasPreservatives).toBe(false);
    expect(result.additiveFlags.hasArtificialColors).toBe(false);
  });

  test('detects Southampton Six colors requiring child warnings', () => {
    const ingredientsWithSouthamptonSix = [
      'kleurstof: tartrazine (E102)',
      'kleurstof: chinolinegeel (E104)',
    ];

    const result = parseAdditives(ingredientsWithSouthamptonSix);

    expect(result.additiveFlags.requiresChildWarning).toBe(true);
    expect(result.additiveFlags.hasArtificialColors).toBe(true);
    expect(result.additiveInfo.colors).toContain('E102');
    expect(result.additiveInfo.colors).toContain('E104');
  });

  test('detects PKU warning for aspartame', () => {
    const ingredientsWithAspartame = ['zoetstof: aspartaam (E951)'];

    const result = parseAdditives(ingredientsWithAspartame);

    expect(result.additiveFlags.requiresPKUWarning).toBe(true);
    expect(result.additiveInfo.sweeteners).toContain('E951');
  });

  test('identifies natural vs synthetic additives', () => {
    const mixedIngredients = [
      'antioxidant: ascorbinezuur (E300)', // Natural (Vitamin C)
      'zoetstof: aspartaam (E951)', // Synthetic
    ];

    const result = parseAdditives(mixedIngredients);

    expect(result.additiveInfo.naturalAdditives).toContain('E300');
    expect(result.additiveInfo.syntheticAdditives).toContain('E951');
    expect(result.additiveFlags.allNaturalAdditives).toBe(false);
  });

  test('handles Dutch functional category names', () => {
    const dutchCategories = [
      'conserveermiddel: kaliumsorbaat (E202)',
      'smaakversterker: mononatriumglutamaat (E621)',
      'kleurstof: cochenille (E120)',
    ];

    const result = parseAdditives(dutchCategories);

    expect(result.additiveInfo.dutchCategories).toContain('conserveermiddel');
    expect(result.additiveInfo.dutchCategories).toContain('smaakversterker');
    expect(result.additiveInfo.dutchCategories).toContain('kleurstof');
    expect(result.additiveFlags.hasPreservatives).toBe(true);
    expect(result.additiveFlags.hasFlavorEnhancers).toBe(true);
    expect(result.additiveFlags.hasAnimalDerivedAdditives).toBe(true); // E120 is from insects
  });

  test('detects allergens (sulfites)', () => {
    const ingredientsWithSulfites = ['conserveermiddel: zwaveldioxide (E220)'];

    const result = parseAdditives(ingredientsWithSulfites);

    expect(result.additiveFlags.containsAllergenicAdditives).toBe(true);
    expect(result.additiveInfo.preservatives).toContain('E220');
  });

  test('handles organic compatibility', () => {
    const organicCompatibleIngredients = [
      'antioxidant: ascorbinezuur (E300)', // Organic permitted
      'geleermiddel: pectine (E440)', // Organic permitted
    ];

    const result = parseAdditives(organicCompatibleIngredients);

    expect(result.additiveFlags.organicCompatible).toBe(true);
  });

  test('flags non-organic compatible additives', () => {
    const nonOrganicIngredients = [
      'kleurstof: tartrazine (E102)', // Not organic permitted
      'smaakversterker: mononatriumglutamaat (E621)', // Not organic permitted
    ];

    const result = parseAdditives(nonOrganicIngredients);

    expect(result.additiveFlags.organicCompatible).toBe(false);
  });

  test('counts total additives correctly', () => {
    const multipleAdditives = [
      'conserveermiddel: natriumbenzoaat (E211)',
      'kleurstof: tartrazine (E102)',
      'antioxidant: ascorbinezuur (E300)',
      'zoetstof: aspartaam (E951)',
    ];

    const result = parseAdditives(multipleAdditives);

    expect(result.additiveInfo.totalAdditives).toBe(4);
    expect(result.additiveInfo.eNumbers).toHaveLength(4);
    expect(result.additiveInfo.eNumbers).toContain('E211');
    expect(result.additiveInfo.eNumbers).toContain('E102');
    expect(result.additiveInfo.eNumbers).toContain('E300');
    expect(result.additiveInfo.eNumbers).toContain('E951');
  });
});

/** T006: Enhanced AdditivesSummary tests - MUST FAIL before implementation */
describe('parseAdditives - AdditivesSummary (T006)', () => {
  test('should return consumer-friendly AdditivesSummary structure', () => {
    const ingredients = [
      'conserveermiddel: natriumbenzoaat (E211)',
      'kleurstof: tartrazine (E102)',
      'antioxidant: ascorbinezuur (E300)',
    ];
    const result = parseAdditives(ingredients);

    // This test MUST fail - parseAdditives currently doesn't return additivesSummary
    expect(result).toHaveProperty('additivesSummary');
    // Expect generated (localized) warning messages derived from CONSUMER_GUIDANCE templates
    const summary = result.additivesSummary;
    // Order is not guaranteed; ensure all expected E-numbers were detected
    expect(summary.eNumbers).toEqual(expect.arrayContaining(['E211', 'E102', 'E300']));
    expect(summary.eNumbers).toHaveLength(3);
    expect(summary.summary).toBe('Contains 3 additives: preservative, coloring, antioxidant');
    // Child warning should be in English and reference children's activity/attention
    expect(
      summary.warnings.some((w) =>
        /affect activity|attention of children|may affect activity or attention of children/i.test(
          w,
        ),
      ),
    ).toBe(true);
    expect(summary.dietary).toContain('Not suitable for organic');
    expect(summary.categories).toEqual(['conserveermiddel', 'kleurstof', 'antioxidant']);
  });

  test('should create appropriate summary text for multiple categories', () => {
    const ingredients = [
      'conserveermiddel: kaliumsorbaat (E202)',
      'smaakversterker: mononatriumglutamaat (E621)',
      'zoetstof: aspartaam (E951)',
    ];
    const result = parseAdditives(ingredients);

    expect(result).toHaveProperty('additivesSummary');
    expect(result.additivesSummary.summary).toContain('3 additives');
    expect(result.additivesSummary.summary).toContain('preservative');
    expect(result.additivesSummary.summary).toContain('flavor enhancer');
    expect(result.additivesSummary.summary).toContain('sweetener');
  });

  test('should consolidate safety warnings in warnings array', () => {
    const ingredients = [
      'kleurstof: tartrazine (E102)', // Southampton Six
      'zoetstof: aspartaam (E951)', // PKU warning
      'conserveermiddel: zwaveldioxide (E220)', // Sulfite allergen
    ];
    const result = parseAdditives(ingredients);

    expect(result).toHaveProperty('additivesSummary');
    // Warnings should include English/generated messages matching the templates
    expect(
      result.additivesSummary.warnings.some((w) =>
        /affect activity|attention of children|may affect activity or attention of children/i.test(
          w,
        ),
      ),
    ).toBe(true);
    expect(
      result.additivesSummary.warnings.some((w) =>
        /phenylalanine|aspartame|PKU|phenylketonuria/i.test(w),
      ),
    ).toBe(true);
    expect(
      result.additivesSummary.warnings.some((w) =>
        /sulfites|sulfite|sulphur dioxide|zwaveldioxide/i.test(w),
      ),
    ).toBe(true);
  });

  test('should provide dietary restriction information', () => {
    const ingredients = [
      'kleurstof: cochenille (E120)', // Animal derived
      'antioxidant: ascorbinezuur (E300)', // Natural/vegan
    ];
    const result = parseAdditives(ingredients);

    expect(result).toHaveProperty('additivesSummary');
    expect(result.additivesSummary.dietary).toContain('Contains animal-derived additives');
    expect(result.additivesSummary.dietary).toContain('Not suitable for vegans');
  });

  test('should handle empty additives gracefully', () => {
    const result = parseAdditives([]);

    expect(result).toHaveProperty('additivesSummary');
    expect(result.additivesSummary).toMatchObject({
      eNumbers: [],
      summary: 'No additives detected',
      warnings: [],
      dietary: ['Suitable for all diets'],
      categories: [],
    } as AdditivesSummary);
  });

  test('should list Dutch functional categories correctly', () => {
    const ingredients = [
      'stabilisator: xanthaangom (E415)',
      'verdikkingsmiddel: guargom (E412)',
      'emulgator: lecithine (E322)',
    ];
    const result = parseAdditives(ingredients);

    expect(result).toHaveProperty('additivesSummary');
    expect(result.additivesSummary.categories).toEqual([
      'stabilisator',
      'verdikkingsmiddel',
      'emulgator',
    ]);
    expect(result.additivesSummary.summary).toMatch(/stabilizer.*thickener.*emulsifier/);
  });
});

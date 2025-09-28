import { describe, test, expect } from 'vitest';
import {
  E_NUMBER_DATABASE,
  CONSUMER_GUIDANCE,
  getENumberDefinition,
  isValidENumber,
  getENumbersByCategory,
  getSouthamptonSixENumbers,
  getAllergenicENumbers,
  getAnimalDerivedENumbers,
  getBannedENumbers,
} from '../../src/data/transform/eNumberDatabase.ts';
import { FunctionalCategory } from '../../src/data/transform/types.ts';

/** T007: Unit test E-number database lookups - MUST PASS (database already exists) */

describe('E-Number Database (T007)', () => {
  test('database contains expected high-frequency E-numbers from research', () => {
    // Most common E-numbers from research: E330 (1,726×), E202 (1,156×), E300 (1,053×)
    expect(E_NUMBER_DATABASE['E330']).toBeDefined(); // citric acid
    expect(E_NUMBER_DATABASE['E202']).toBeDefined(); // potassium sorbate
    expect(E_NUMBER_DATABASE['E300']).toBeDefined(); // ascorbic acid (Vitamin C)

    // Validate structure of high-frequency entries
    expect(E_NUMBER_DATABASE['E330'].officialName).toBe('Citric acid');
    expect(E_NUMBER_DATABASE['E330'].isNaturallyOccurring).toBe(true);
    expect(E_NUMBER_DATABASE['E300'].dutchNames).toContain('vitamine c');
  });

  test('database contains Southampton Six colors with child warnings', () => {
    const southamptonSix = ['E102', 'E104', 'E110', 'E122', 'E124', 'E129'];

    southamptonSix.forEach((eNumber) => {
      expect(E_NUMBER_DATABASE[eNumber]).toBeDefined();
      expect(E_NUMBER_DATABASE[eNumber].southamptonSix).toBe(true);
      expect(E_NUMBER_DATABASE[eNumber].functionalCategory).toBe('Kleurstof');
      expect(E_NUMBER_DATABASE[eNumber].voedingscentrumGuidance).toContain(
        'activiteit of oplettendheid',
      );
    });
  });

  test('database includes banned E-numbers with ban dates', () => {
    // E171 (titanium dioxide) banned August 2022
    expect(E_NUMBER_DATABASE['E171']).toBeDefined();
    expect(E_NUMBER_DATABASE['E171'].bannedSince).toBe('2022-08-07');
    expect(E_NUMBER_DATABASE['E171'].voedingscentrumGuidance).toContain(
      'verboden sinds augustus 2022',
    );
  });

  test('database includes allergens with proper flagging', () => {
    // Sulfites (E220-E228) are official allergens
    expect(E_NUMBER_DATABASE['E220']).toBeDefined();
    expect(E_NUMBER_DATABASE['E220'].isAllergen).toBe(true);
    expect(E_NUMBER_DATABASE['E220'].voedingscentrumGuidance).toContain('allergeen');
  });

  test('database includes PKU warnings for aspartame', () => {
    // E951 (aspartame) requires PKU warning
    expect(E_NUMBER_DATABASE['E951']).toBeDefined();
    expect(E_NUMBER_DATABASE['E951'].pkuWarning).toBe(true);
    expect(E_NUMBER_DATABASE['E951'].voedingscentrumGuidance).toContain('fenylalanine');
  });

  test('database includes animal-derived additives', () => {
    // E120 (carmine) from insects, E901 (beeswax)
    expect(E_NUMBER_DATABASE['E120']).toBeDefined();
    expect(E_NUMBER_DATABASE['E120'].isAnimalDerived).toBe(true);
    expect(E_NUMBER_DATABASE['E120'].voedingscentrumGuidance).toContain('vegetariër');

    expect(E_NUMBER_DATABASE['E901']).toBeDefined();
    expect(E_NUMBER_DATABASE['E901'].isAnimalDerived).toBe(true);
  });

  test('getENumberDefinition function works correctly', () => {
    // Test case sensitivity
    expect(getENumberDefinition('e300')).toBeDefined();
    expect(getENumberDefinition('E300')).toBeDefined();
    expect(getENumberDefinition('E300')).toEqual(getENumberDefinition('e300'));

    // Test non-existent E-number
    expect(getENumberDefinition('E999')).toBeUndefined();

    // Test structure
    const e300 = getENumberDefinition('E300')!;
    expect(e300.code).toBe('E300');
    expect(e300.officialName).toBe('Ascorbic acid');
    expect(e300.dutchNames).toContain('ascorbinezuur');
  });

  test('isValidENumber function works correctly', () => {
    // Valid E-numbers
    expect(isValidENumber('E300')).toBe(true);
    expect(isValidENumber('e300')).toBe(true);
    expect(isValidENumber('E102')).toBe(true);

    // Invalid E-numbers
    expect(isValidENumber('E999')).toBe(false);
    expect(isValidENumber('X300')).toBe(false);
    expect(isValidENumber('')).toBe(false);
  });

  test('getENumbersByCategory returns correct classifications', () => {
    // Colors
    const colors = getENumbersByCategory('Kleurstof');
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.some((def) => def.code === 'E102')).toBe(true); // tartrazine
    expect(colors.some((def) => def.code === 'E120')).toBe(true); // carmine

    // Preservatives
    const preservatives = getENumbersByCategory('Conserveermiddel');
    expect(preservatives.length).toBeGreaterThan(0);
    expect(preservatives.some((def) => def.code === 'E202')).toBe(true); // potassium sorbate

    // Antioxidants
    const antioxidants = getENumbersByCategory('Antioxidant');
    expect(antioxidants.length).toBeGreaterThan(0);
    expect(antioxidants.some((def) => def.code === 'E300')).toBe(true); // ascorbic acid
  });

  test('getSouthamptonSixENumbers returns complete list', () => {
    const southamptonSix = getSouthamptonSixENumbers();
    expect(southamptonSix).toHaveLength(6);
    expect(southamptonSix).toContain('E102');
    expect(southamptonSix).toContain('E104');
    expect(southamptonSix).toContain('E110');
    expect(southamptonSix).toContain('E122');
    expect(southamptonSix).toContain('E124');
    expect(southamptonSix).toContain('E129');
  });

  test('getAllergenicENumbers returns sulfites', () => {
    const allergenic = getAllergenicENumbers();
    expect(allergenic.length).toBeGreaterThan(0);
    expect(allergenic).toContain('E220'); // sulphur dioxide
    // May contain E221-E228 if added to database
  });

  test('getAnimalDerivedENumbers returns animal products', () => {
    const animalDerived = getAnimalDerivedENumbers();
    expect(animalDerived.length).toBeGreaterThan(0);
    expect(animalDerived).toContain('E120'); // carmine from insects
    expect(animalDerived).toContain('E901'); // beeswax
  });

  test('getBannedENumbers returns prohibited additives', () => {
    const banned = getBannedENumbers();
    expect(banned.length).toBeGreaterThan(0);
    expect(banned).toContain('E171'); // titanium dioxide
  });

  test('database entries have consistent structure', () => {
    // Test all entries have required fields
    Object.values(E_NUMBER_DATABASE).forEach((definition) => {
      expect(definition.code).toBeDefined();
      expect(definition.officialName).toBeDefined();
      expect(definition.dutchNames).toBeDefined();
      expect(Array.isArray(definition.dutchNames)).toBe(true);
      expect(definition.functionalCategory).toBeDefined();
      expect(definition.dutchCategoryName).toBeDefined();
      expect(definition.purpose).toBeDefined();
      expect(typeof definition.isNaturallyOccurring).toBe('boolean');
      expect(typeof definition.isSynthetic).toBe('boolean');
      expect(typeof definition.isAnimalDerived).toBe('boolean');
      expect(typeof definition.organicPermitted).toBe('boolean');
      expect(typeof definition.southamptonSix).toBe('boolean');
      expect(typeof definition.isAllergen).toBe('boolean');
      expect(typeof definition.pkuWarning).toBe('boolean');
      expect(typeof definition.asthmaEczemaRisk).toBe('boolean');
      expect(Array.isArray(definition.commonProducts)).toBe(true);
      expect(definition.voedingscentrumGuidance).toBeDefined();
    });
  });

  test('consumer guidance has required fields', () => {
    expect(CONSUMER_GUIDANCE.safetyMessage).toBe('E-nummers kun je veilig eten en drinken');
    expect(CONSUMER_GUIDANCE.officialPosition).toContain('voedingscentrum.nl');
    expect(CONSUMER_GUIDANCE.childWarningTemplate).toContain('activiteit of oplettendheid');
    expect(CONSUMER_GUIDANCE.pkuWarningTemplate).toContain('fenylalanine');
    expect(CONSUMER_GUIDANCE.allergenWarningTemplate).toContain('sulfiet');

    // Natural alternatives
    expect(CONSUMER_GUIDANCE.naturalAlternatives['E621']).toBe('gistextract');
    expect(CONSUMER_GUIDANCE.naturalAlternatives['E951']).toBe('stevia (E960)');

    // Dutch preferred names
    expect(CONSUMER_GUIDANCE.dutchPreferredNames['E330']).toBe('citroenzuur');
    expect(CONSUMER_GUIDANCE.dutchPreferredNames['E300']).toBe('vitamine C');

    // Category explanations for all 27 categories
    expect(Object.keys(CONSUMER_GUIDANCE.categoryExplanations)).toHaveLength(27);
    expect(CONSUMER_GUIDANCE.categoryExplanations['Kleurstof']).toContain('kleur');
    expect(CONSUMER_GUIDANCE.categoryExplanations['Conserveermiddel']).toContain('bederf');

    // Common misconceptions
    expect(Array.isArray(CONSUMER_GUIDANCE.commonMisconceptions)).toBe(true);
    expect(CONSUMER_GUIDANCE.commonMisconceptions.length).toBeGreaterThan(0);
  });

  test('database covers real-world E-numbers from research', () => {
    // Ensure all real-world E-numbers from data analysis are covered
    const realWorldENumbers = [
      'E300', // ascorbic acid (1,053×)
      'E330', // citric acid (1,726×)
      'E202', // potassium sorbate (1,156×)
      'E270', // lactic acid
      'E223', // sodium disulfite
      'E464', // hydroxypropylmethylcellulose
      'E127', // erytrosine
      'E101', // riboflavin
    ];

    realWorldENumbers.forEach((eNumber) => {
      expect(E_NUMBER_DATABASE[eNumber]).toBeDefined();
      expect(E_NUMBER_DATABASE[eNumber].voedingscentrumGuidance).toBeDefined();
    });
  });

  test('organic compatibility is correctly classified', () => {
    // Natural additives that are organic permitted
    expect(E_NUMBER_DATABASE['E300'].organicPermitted).toBe(true); // vitamin C
    expect(E_NUMBER_DATABASE['E330'].organicPermitted).toBe(true); // citric acid

    // Synthetic colors typically not organic permitted
    expect(E_NUMBER_DATABASE['E102'].organicPermitted).toBe(false); // tartrazine
    expect(E_NUMBER_DATABASE['E124'].organicPermitted).toBe(false); // ponceau 4R
  });
});

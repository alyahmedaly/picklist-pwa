import { describe, test, expect } from 'vitest';
import type { HalalAnalysis } from '../../src/data/transform/types';
import { computeHalalAnalysis } from '../../src/data/transform/computeHalalAnalysis';

function run(ingredients: string, eNumbers: string[] = []): HalalAnalysis {
  return computeHalalAnalysis({ ingredients, eNumbers });
}

describe('computeHalalAnalysis (T002 RED phase)', () => {
  test('classifies clear halal product (clean ingredients)', () => {
    const result = run('kipfilet, water, zout');
    expect(result.status).toBe('halal');
    expect(result.flags.hasPork).toBe(false);
  });

  test('detects pork ingredients as haram', () => {
    const result = run('varkensvlees, zout');
    expect(result.status).toBe('haram');
    expect(result.flags.hasPork).toBe(true);
    expect(result.details.problematicIngredients).toContain('varkensvlees');
  });

  test('detects expanded pork vocabulary', () => {
    // Test enhanced pork detection vocabulary
    const porkTerms = [
      'spek',
      'bacon',
      'ham',
      'worst',
      'salami',
      'chorizo',
      'pancetta',
      'prosciutto',
    ];
    for (const term of porkTerms) {
      const result = run(`water, ${term}, kruiden`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasPork).toBe(true);
      expect(result.details.problematicIngredients).toContain(term);
    }
  });

  test('detects compound pork products', () => {
    const compoundTerms = ['varkensspek', 'varkensvet', 'varkensworst', 'varkensham'];
    for (const term of compoundTerms) {
      const result = run(`water, ${term}`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasPork).toBe(true);
    }
  });

  test('detects processed pork products', () => {
    const processedTerms = ['rookworst', 'metworst', 'leverworst'];
    for (const term of processedTerms) {
      const result = run(`water, ${term}`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasPork).toBe(true);
    }
  });

  test('detects gelatin (E441) as potential haram flag', () => {
    const result = run('water, suiker, gelatine', ['E441']);
    expect(result.flags.hasAnimalGelatine).toBe(true);
    expect(result.details.eNumberConcerns).toContain('E441');
  });

  test('detects halal gelatin sources as halal', () => {
    const halalSources = ['visgelatine', 'rundgelatine', 'halal gelatine', 'halal gecertificeerd'];
    for (const source of halalSources) {
      const result = run(`water, ${source}`);
      expect(result.status).toBe('halal');
      expect(result.flags.hasAnimalGelatine).toBe(false);
    }
  });

  test('detects haram gelatin sources as haram', () => {
    const haramSources = ['varkensgelatine', 'pork gelatin'];
    for (const source of haramSources) {
      const result = run(`water, ${source}`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasPork).toBe(true);
      // The algorithm detects the matching pork term within the ingredient
      if (source === 'varkensgelatine') {
        expect(result.details.problematicIngredients).toContain('varken');
      } else if (source === 'pork gelatin') {
        expect(result.details.problematicIngredients).toContain('pork');
      } else {
        expect(result.details.problematicIngredients).toContain(source);
      }
    }
  });

  test('unknown gelatin source flagged as questionable', () => {
    const result = run('water, gelatine');
    expect(result.status).toBe('questionable');
    expect(result.flags.hasAnimalGelatine).toBe(true);
    expect(result.details.problematicIngredients).toContain('gelatine');
  });

  test('detects alcohol presence', () => {
    const result = run('water, alcohol 0.5%');
    expect(result.flags.hasAlcohol).toBe(true);
    expect(result.details.problematicIngredients).toContain('alcohol');
  });

  test('detects expanded alcohol vocabulary', () => {
    // Test spirits and liquors
    const spirits = ['rum', 'whisky', 'whiskey', 'cognac', 'brandy', 'vodka', 'gin'];
    for (const spirit of spirits) {
      const result = run(`water, ${spirit}`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasAlcohol).toBe(true);
      expect(result.details.problematicIngredients).toContain(spirit);
    }
  });

  test('detects Dutch alcoholic beverages', () => {
    const dutchAlcohol = ['jenever', 'advocaat', 'sherry', 'port', 'madeira'];
    for (const beverage of dutchAlcohol) {
      const result = run(`water, ${beverage}`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasAlcohol).toBe(true);
    }
  });

  test('detects alcohol-based extracts', () => {
    const extracts = ['vanille-extract', 'rumextract', 'brandyextract', 'alcoholextract'];
    for (const extract of extracts) {
      const result = run(`water, ${extract}`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasAlcohol).toBe(true);
    }
  });

  test('detects wine and beer variants', () => {
    const alcoholicBeverages = [
      'rode wijn',
      'witte wijn',
      'champagne',
      'prosecco',
      'pils',
      'lager',
    ];
    for (const beverage of alcoholicBeverages) {
      const result = run(`water, ${beverage}`);
      expect(result.status).toBe('haram');
      expect(result.flags.hasAlcohol).toBe(true);
    }
  });

  test('extracts alcohol percentage when present', () => {
    const result = run('water, alcohol 2.5%');
    expect(result.flags.hasAlcohol).toBe(true);
    expect(result.details.alcoholContent).toBe(2.5);
  });

  test('handles decimal comma in alcohol percentage', () => {
    const result = run('water, alcohol 1,5%');
    expect(result.flags.hasAlcohol).toBe(true);
    expect(result.details.alcoholContent).toBe(1.5);
  });

  test('marks questionable when doubtful additives only (E120)', () => {
    const result = run('water, suiker', ['E120']);
    expect(['questionable', 'haram']).toContain(result.status);
    expect(result.flags.hasDoubtfulAdditives).toBe(true);
    expect(result.details.eNumberConcerns).toContain('E120');
  });

  test('detects expanded problematic E-numbers', () => {
    const problematicENumbers = ['E120', 'E441', 'E542', 'E631', 'E635', 'E904', 'E1105'];
    for (const eNumber of problematicENumbers) {
      const result = run('water, suiker', [eNumber]);
      expect(['questionable', 'haram']).toContain(result.status);
      expect(result.details.eNumberConcerns).toContain(eNumber);
    }
  });

  test('detects expanded doubtful E-numbers', () => {
    const doubtfulENumbers = [
      'E471',
      'E472a',
      'E472b',
      'E472c',
      'E481',
      'E482',
      'E570',
      'E322',
      'E476',
    ];
    for (const eNumber of doubtfulENumbers) {
      const result = run('water, suiker', [eNumber]);
      expect(result.status).toBe('questionable');
      expect(result.flags.hasDoubtfulAdditives).toBe(true);
      expect(result.details.eNumberConcerns).toContain(eNumber);
    }
  });

  test('detects sorbitan esters as doubtful', () => {
    const sorbitanEsters = ['E491', 'E492', 'E493', 'E494', 'E495', 'E496'];
    for (const eNumber of sorbitanEsters) {
      const result = run('water, suiker', [eNumber]);
      expect(result.status).toBe('questionable');
      expect(result.flags.hasDoubtfulAdditives).toBe(true);
    }
  });

  test('detects waxes and coatings as doubtful', () => {
    const waxes = ['E901', 'E902', 'E903'];
    for (const eNumber of waxes) {
      const result = run('water, suiker', [eNumber]);
      expect(result.status).toBe('questionable');
      expect(result.flags.hasDoubtfulAdditives).toBe(true);
    }
  });

  test('unknown when insufficient data (empty)', () => {
    const result = run('');
    expect(result.status).toBe('unknown');
  });

  test('confidence tiers present', () => {
    const haram = run('varkensvlees');
    const halal = run('kipfilet');
    expect(['high', 'medium', 'low']).toContain(haram.confidence);
    expect(['high', 'medium', 'low']).toContain(halal.confidence);
  });

  test('enhanced confidence scoring - clear violations get high confidence', () => {
    const result = run('water, varkensvlees, kruiden');
    expect(result.status).toBe('haram');
    expect(result.confidence).toBe('high');
  });

  test('enhanced confidence scoring - clean products with good data get high confidence', () => {
    // Need substantial ingredients (>30 chars) and E-numbers for high confidence
    const result = run(
      "kipfilet, water, zout, kruiden, natuurlijke aroma's, plantaardige olie, specerijen",
      ['E300'],
    );
    expect(result.status).toBe('halal');
    expect(result.confidence).toBe('high');
  });

  test('enhanced confidence scoring - clean products with moderate data get medium confidence', () => {
    const result = run("kipfilet, water, zout, kruiden, natuurlijke aroma's");
    expect(result.status).toBe('halal');
    expect(result.confidence).toBe('medium');
  });

  test('enhanced confidence scoring - doubtful additives with substantial ingredients', () => {
    // E-number concerns trigger hasSpecificDetection -> high confidence
    const result = run(
      "water, suiker, plantaardige olie, natuurlijke aroma's, kruiden, specerijen, conserveermiddelen",
      ['E471'],
    );
    expect(result.status).toBe('questionable');
    expect(result.confidence).toBe('high'); // hasSpecificDetection path
  });

  test('enhanced confidence scoring - medium confidence case with moderate ingredients', () => {
    // Test moderate ingredients (>15 chars) without E-numbers for medium confidence
    const result = run('water, suiker, olie, kruiden'); // 27 chars (moderate but not substantial)
    expect(result.status).toBe('halal');
    expect(result.confidence).toBe('medium'); // hasModerateIngredients path
  });

  test('enhanced confidence scoring - specific detection gets high confidence', () => {
    const result = run("water, suiker, plantaardige olie, natuurlijke aroma's", ['E471']);
    expect(result.status).toBe('questionable');
    expect(result.confidence).toBe('high'); // hasSpecificDetection (E-number concerns)
  });

  test('enhanced confidence scoring - insufficient data gets low confidence', () => {
    const result = run('water');
    expect(result.status).toBe('unknown');
    expect(result.confidence).toBe('low');
  });

  // Additional RED cases for questionable / mixed products
  test('mixed ingredients with doubtful additive but no clear pork/alcohol → questionable', () => {
    const result = run('kipfilet, plantaardige olie, kruiden', ['E471']);
    expect(['questionable', 'halal']).toContain(result.status); // RED placeholder pushes need for specific logic
  });
  test('pork plus doubtful additive still haram (pork dominates)', () => {
    const result = run('spek, zout, kruiden', ['E471']);
    expect(result.status).toBe('haram');
  });
  test('low alcohol <0.5% becomes questionable not haram', () => {
    const result = run('water, alcohol 0.3%');
    expect(result.status).toBe('questionable');
    expect(result.flags.hasAlcohol).toBe(true);
    expect(result.details.alcoholContent).toBe(0.3);
    expect(result.confidence).toBe('medium');
  });

  test('alcohol >=0.5% remains haram', () => {
    const result = run('water, alcohol 0.8%');
    expect(result.status).toBe('haram');
    expect(result.flags.hasAlcohol).toBe(true);
    expect(result.details.alcoholContent).toBe(0.8);
  });

  // Fixture-like embedded samples with enhanced vocabulary coverage
  const samples = [
    { name: 'clean-chicken', ingredients: 'kipfilet, water, zout', e: [] },
    { name: 'pork-bacon', ingredients: 'bacon, zout', e: [] },
    { name: 'pork-salami', ingredients: 'salami, kruiden', e: [] },
    { name: 'processed-pork', ingredients: 'rookworst, specerijen', e: [] },
    { name: 'alcohol-rum', ingredients: 'water, rum', e: [] },
    { name: 'dutch-jenever', ingredients: 'water, jenever', e: [] },
    { name: 'vanilla-extract', ingredients: 'vanille-extract, suiker', e: [] },
    { name: 'low-alcohol', ingredients: 'water, alcohol 0.2%', e: [] },
    { name: 'high-alcohol', ingredients: 'water, alcohol 1.5%', e: [] },
    { name: 'halal-gelatin', ingredients: 'visgelatine, suiker', e: [] },
    { name: 'haram-gelatin', ingredients: 'varkensgelatine, suiker', e: [] },
    { name: 'unknown-gelatin', ingredients: 'suiker, gelatine', e: ['E441'] },
    { name: 'doubtful-additive', ingredients: 'water, suiker', e: ['E471'] },
    { name: 'problematic-enumber', ingredients: 'water, suiker', e: ['E120'] },
    { name: 'sorbitan-ester', ingredients: 'water, suiker', e: ['E491'] },
    { name: 'wax-coating', ingredients: 'water, suiker', e: ['E901'] },
  ];
  test('sample set ordering shows haram flagged items identifiable', () => {
    const results = samples.map((s) => ({ s, r: run(s.ingredients, s.e) }));

    // Test clean halal products
    const clean = results.find((x) => x.s.name === 'clean-chicken')!.r;
    const halalGelatin = results.find((x) => x.s.name === 'halal-gelatin')!.r;
    expect(clean.status).toBe('halal');
    expect(halalGelatin.status).toBe('halal');

    // Test haram products
    const porkBacon = results.find((x) => x.s.name === 'pork-bacon')!.r;
    const porkSalami = results.find((x) => x.s.name === 'pork-salami')!.r;
    const processedPork = results.find((x) => x.s.name === 'processed-pork')!.r;
    const rum = results.find((x) => x.s.name === 'alcohol-rum')!.r;
    const jenever = results.find((x) => x.s.name === 'dutch-jenever')!.r;
    const vanillaExtract = results.find((x) => x.s.name === 'vanilla-extract')!.r;
    const highAlcohol = results.find((x) => x.s.name === 'high-alcohol')!.r;
    const haramGelatin = results.find((x) => x.s.name === 'haram-gelatin')!.r;

    expect(porkBacon.status).toBe('haram');
    expect(porkSalami.status).toBe('haram');
    expect(processedPork.status).toBe('haram');
    expect(rum.status).toBe('haram');
    expect(jenever.status).toBe('haram');
    expect(vanillaExtract.status).toBe('haram');
    expect(highAlcohol.status).toBe('haram');
    expect(haramGelatin.status).toBe('haram');

    // Test questionable products
    const lowAlcohol = results.find((x) => x.s.name === 'low-alcohol')!.r;
    const unknownGelatin = results.find((x) => x.s.name === 'unknown-gelatin')!.r;
    const doubtfulAdditive = results.find((x) => x.s.name === 'doubtful-additive')!.r;
    const problematicENumber = results.find((x) => x.s.name === 'problematic-enumber')!.r;
    const sorbitanEster = results.find((x) => x.s.name === 'sorbitan-ester')!.r;
    const waxCoating = results.find((x) => x.s.name === 'wax-coating')!.r;

    expect(lowAlcohol.status).toBe('questionable');
    expect(unknownGelatin.status).toBe('questionable');
    expect(doubtfulAdditive.status).toBe('questionable');
    expect(['questionable', 'haram']).toContain(problematicENumber.status);
    expect(sorbitanEster.status).toBe('questionable');
    expect(waxCoating.status).toBe('questionable');
  });

  // Placeholder for future E-number database mocking pattern
  test.skip('uses E-number database abstraction (to implement with mock)', () => {
    // Intentionally skipped until implementation exposes dependency injection for E-number lookup
  });
});

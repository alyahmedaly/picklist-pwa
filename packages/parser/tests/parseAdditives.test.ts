import { describe, test, expect } from 'vitest';
import { parseAdditives } from '../src/product/parse/parseAdditives.ts';

describe('parseAdditives integration tests', () => {
  test('detects E-number from Dutch name (gistextract -> E621)', () => {
    const result = parseAdditives(['Suiker', 'gistextract']);
    expect(result.additiveInfo.eNumbers).toContain('E621');
  });

  test('detects pectin (E440) from dutch name', () => {
    const result = parseAdditives(['Appelmoes (pektine)']);
    expect(result.additiveInfo.eNumbers).toContain('E440');
  });

  test('parses compound parenthetical group with multiple E-numbers', () => {
    const result = parseAdditives([
      'Conserveermiddel (natriumnitriet [E250], kaliumsorbaat [E202])',
    ]);
    expect(result.additiveInfo.eNumbers).toContain('E250');
    expect(result.additiveInfo.eNumbers).toContain('E202');
  });

  test('parses slash-separated E-numbers', () => {
    const result = parseAdditives(['Kleurstoffen: E102/E110']);
    expect(result.additiveInfo.eNumbers).toContain('E102');
    expect(result.additiveInfo.eNumbers).toContain('E110');
  });

  test('parses a real-world Dutch ingredient line and detects citroenzuur (E330) and category', () => {
    const ingredients = [
      'Ingrediënten: wei-eiwitisolaat (MELK), zuurteregelaars (appelzuur, citroenzuur), aroma, resistente dextrine, koolzaadolie, kleurstof (bietenrood), zoetstof (sucralose), antischuimmiddel (siliciumdioxide)',
    ];

    const result = parseAdditives(ingredients);

    // citroenzuur should be detected as E330
    expect(result.additiveInfo.eNumbers).toContain('E330');

    // dutch category 'zuurteregelaar' should be captured by the category regex
    expect(result.additivesSummary.categories).toContain('zuurteregelaar');
  });

  test('parses integration Body & Fit Clear whey cherry', () => {
    const ingredients = 'Ingrediënten: wei-eiwitisolaat (MELK), zuurteregelaars (appelzuur, citroenzuur), aroma, resistente dextrine, koolzaadolie, kleurstof (bietenrood), zoetstof (sucralose), antischuimmiddel (siliciumdioxide)';
    const result = parseAdditives([ingredients]);
    // DB currently contains a subset of these additives; ensure expected E-numbers are detected
    expect(result.additiveInfo.eNumbers).toMatchSnapshot(ingredients);
  });

  test('Optimum Nutrition Gold standard whey double rich chocolate', () => {
    const ingredients = "Ingrediënten: WEI-eiwitmengsel (93 %) [MELK] (WEI-eiwitisolaat, WEI-eiwitconcentraat, gehydrolyseerd WEI-eiwitisolaat, emulgator: SOJAlecithine), magere cacaopoeder, aroma’s, verdikkingsstof (xanthaangom), zoetstoffen (sucralose, acesulfaam-K). Kan bevatten: Gluten, Ei, Noten en Pinda's";
    const result = parseAdditives([
      ingredients 
    ]);
    // DB currently contains a subset of these additives; ensure expected E-numbers are detected
    expect(result.additiveInfo.eNumbers).toMatchSnapshot(ingredients);
  });

  test('Lassie Zilvervlies rijst minuutje', () => {
    const ingredients =  'Ingrediënten: voorgestoomde zilvervliesrijst (97%) [water, zilvervliesrijst], zonnebloemolie, zout, emulgator: zonnebloemlecithine';
    const result = parseAdditives([
     ingredients
    ]);
    // DB currently contains a subset of these additives; ensure expected E-numbers are detected
    expect(result.additiveInfo.eNumbers).toMatchSnapshot(ingredients);
  });

  test('Lassie Zilvervlies rijst panklaar', () => {
    const ingredients =  'Ingrediënten: voorgestoomde zilvervliesrijst (98%), zonnebloemolie, zout, emulgator: zonnebloemlecithine. Kan sporen van gluten bevatten';
    const result = parseAdditives([
        ingredients 
    ]);
    // DB currently contains a subset of these additives; ensure expected E-numbers are detected
    expect(result.additiveInfo.eNumbers).toMatchSnapshot(ingredients);
  });

  test("BioToday Minirolls meergranen", ()=>{
      const ingredients =  'Ingrediënten: Mais* 82%, rijst* 15%, chiazaad* (Salvia hispanica), lijnzaad*, amaranth*, zeezout, *=biologisch Kan sporen bevatten van glutenbevattende granen, soja';
    const result = parseAdditives([
        ingredients 
    ]);
    // DB currently contains a subset of these additives; ensure expected E-numbers are detected
    expect(result.additiveInfo.eNumbers).toMatchSnapshot(ingredients);
  })

  test("AH Extra lang lekker volkoren bollen", ()=>{
    const ingredients = "Ingrediënten: volkoren tarwemeel, water, bakkersgist, tarwegluten, suiker, dextrose, volkoren moutmeel (gerst, tarwe), natriumgereduceerd gejodeerd zeezout, emulgator (natriumstearoyl-2-lactylaat [E481], mono- en diglyceriden van vetzuren [E471], mono- en diglyceriden van vetzuren, veresterd met monoacetyl- en diacetylwijnsteenzuur [E472e]), volkoren tarwezuurdesem, tarwezemel, meelverbeteraar (ascorbinezuur [E300]), plantaardige olie (koolzaad, raap), tarwezetmeel, aroma, conserveermiddel (calciumpropionaat [E282]), melkeiwit, erwteneiwit, maltodextrine"
        const result = parseAdditives([
        ingredients 
    ]);
    // DB currently contains a subset of these additives; ensure expected E-numbers are detected
    expect(result.additiveInfo.eNumbers).toMatchSnapshot(ingredients);
  })
});

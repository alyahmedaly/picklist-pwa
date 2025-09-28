import { describe, test, expect } from 'vitest';
import { classifyDietary } from '../../src/data/transform/compute/computeNutritionalTags.ts';
import type { AllergensInfo } from '../../src/data/transform/types.ts';

/** T007: Unit test for Dutch ingredient analysis for dietary restrictions */

describe('Dutch Ingredient Classification', () => {
  describe('Vegan Classification', () => {
    test('excludes animal products: melk, ei, boter, kaas, vis, vlees, honing', () => {
      const dairyIngredients = ['water', 'tarwebloem', 'melk', 'zout'];
      const eggIngredients = ['bloem', 'ei', 'suiker'];
      const butterIngredients = ['tarwe', 'boter', 'gist'];
      const cheeseIngredients = ['kaas', 'kruiden'];
      const fishIngredients = ['vis', 'olie'];
      const meatIngredients = ['vlees', 'kruiden'];
      const honeyIngredients = ['honing', 'noten'];

      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(dairyIngredients, emptyAllergens).vegan).toBe(false);
      expect(classifyDietary(eggIngredients, emptyAllergens).vegan).toBe(false);
      expect(classifyDietary(butterIngredients, emptyAllergens).vegan).toBe(false);
      expect(classifyDietary(cheeseIngredients, emptyAllergens).vegan).toBe(false);
      expect(classifyDietary(fishIngredients, emptyAllergens).vegan).toBe(false);
      expect(classifyDietary(meatIngredients, emptyAllergens).vegan).toBe(false);
      expect(classifyDietary(honeyIngredients, emptyAllergens).vegan).toBe(false);
    });

    test('allows plant-based ingredients', () => {
      const veganIngredients = ['water', 'tarwebloem', 'gist', 'zout', 'suiker', 'olie'];
      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(veganIngredients, emptyAllergens).vegan).toBe(true);
    });

    test('recognizes compound ingredient names', () => {
      const ingredients = ['halfvolle melk', 'roomboter', 'kipvlees'];
      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(ingredients, emptyAllergens).vegan).toBe(false);
    });
  });

  describe('Vegetarian Classification', () => {
    test('excludes meat and fish: vis, vlees, kip, rund, varken', () => {
      const fishIngredients = ['water', 'vis', 'zout'];
      const meatIngredients = ['vlees', 'kruiden'];
      const chickenIngredients = ['kip', 'specerijen'];
      const beefIngredients = ['rund', 'olie'];
      const porkIngredients = ['varken', 'kruiden'];

      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(fishIngredients, emptyAllergens).vegetarian).toBe(false);
      expect(classifyDietary(meatIngredients, emptyAllergens).vegetarian).toBe(false);
      expect(classifyDietary(chickenIngredients, emptyAllergens).vegetarian).toBe(false);
      expect(classifyDietary(beefIngredients, emptyAllergens).vegetarian).toBe(false);
      expect(classifyDietary(porkIngredients, emptyAllergens).vegetarian).toBe(false);
    });

    test('allows dairy and eggs for vegetarians', () => {
      const vegetarianIngredients = ['melk', 'ei', 'boter', 'kaas', 'honing', 'tarwe'];
      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(vegetarianIngredients, emptyAllergens).vegetarian).toBe(true);
    });
  });

  describe('Lactose-Free Classification', () => {
    test('excludes lactose ingredients: melk, room, boter, kaas, lactose', () => {
      const milkIngredients = ['water', 'melk', 'suiker'];
      const creamIngredients = ['room', 'vanilla'];
      const butterIngredients = ['boter', 'zout'];
      const cheeseIngredients = ['kaas', 'kruiden'];
      const lactoseIngredients = ['lactose', 'aroma'];

      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(milkIngredients, emptyAllergens).lactoseFree).toBe(false);
      expect(classifyDietary(creamIngredients, emptyAllergens).lactoseFree).toBe(false);
      expect(classifyDietary(butterIngredients, emptyAllergens).lactoseFree).toBe(false);
      expect(classifyDietary(cheeseIngredients, emptyAllergens).lactoseFree).toBe(false);
      expect(classifyDietary(lactoseIngredients, emptyAllergens).lactoseFree).toBe(false);
    });

    test('considers dairy allergens for lactose-free determination', () => {
      const ingredients = ['water', 'suiker', 'aroma'];
      const dairyAllergens: AllergensInfo = {
        contains: ['melk'],
        mayContain: [],
      };
      const noDairyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(ingredients, dairyAllergens).lactoseFree).toBe(false);
      expect(classifyDietary(ingredients, noDairyAllergens).lactoseFree).toBe(true);
    });
  });

  describe('Gluten-Free Classification', () => {
    test('excludes gluten ingredients: tarwe, rogge, gerst, haver', () => {
      const wheatIngredients = ['tarwe', 'water', 'gist'];
      const ryeIngredients = ['rogge', 'zout'];
      const barleyIngredients = ['gerst', 'honing'];
      const oatIngredients = ['haver', 'melk'];

      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(wheatIngredients, emptyAllergens).glutenFree).toBe(false);
      expect(classifyDietary(ryeIngredients, emptyAllergens).glutenFree).toBe(false);
      expect(classifyDietary(barleyIngredients, emptyAllergens).glutenFree).toBe(false);
      expect(classifyDietary(oatIngredients, emptyAllergens).glutenFree).toBe(false);
    });

    test('considers gluten allergens for gluten-free determination', () => {
      const ingredients = ['rijst', 'mais', 'suiker'];
      const glutenAllergens: AllergensInfo = {
        contains: ['glutenbevattende granen'],
        mayContain: [],
      };
      const noGlutenAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(ingredients, glutenAllergens).glutenFree).toBe(false);
      expect(classifyDietary(ingredients, noGlutenAllergens).glutenFree).toBe(true);
    });
  });

  describe('Plant-Based Classification', () => {
    test('requires >80% plant ingredients', () => {
      // 4 out of 5 ingredients are plant-based (80% - borderline)
      const borderlineIngredients = ['tarwe', 'water', 'zout', 'suiker', 'melk'];
      // 4 out of 4 ingredients are plant-based (100%)
      const fullPlantIngredients = ['tarwe', 'water', 'zout', 'suiker'];
      // 2 out of 5 ingredients are plant-based (40%)
      const lowPlantIngredients = ['melk', 'ei', 'boter', 'tarwe', 'water'];

      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(borderlineIngredients, emptyAllergens).plantBased).toBe(false); // exactly 80% should be false
      expect(classifyDietary(fullPlantIngredients, emptyAllergens).plantBased).toBe(true);
      expect(classifyDietary(lowPlantIngredients, emptyAllergens).plantBased).toBe(false);
    });

    test('calculates plant percentage correctly', () => {
      // 5 out of 6 ingredients are plant-based (83.3% > 80%)
      const highPlantIngredients = ['tarwe', 'water', 'zout', 'suiker', 'olie', 'melk'];
      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      expect(classifyDietary(highPlantIngredients, emptyAllergens).plantBased).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty ingredients list', () => {
      const emptyIngredients: string[] = [];
      const emptyAllergens: AllergensInfo = { contains: [], mayContain: [] };

      const result = classifyDietary(emptyIngredients, emptyAllergens);
      expect(result.vegan).toBe(true); // No animal products = vegan
      expect(result.vegetarian).toBe(true);
      expect(result.lactoseFree).toBe(true);
      expect(result.glutenFree).toBe(true);
      expect(result.plantBased).toBe(true); // No ingredients = 100% plant-based
    });

    test('handles mixed dietary classifications', () => {
      const mixedIngredients = ['tarwe', 'melk', 'suiker']; // Contains gluten + dairy
      const mixedAllergens: AllergensInfo = {
        contains: ['melk', 'glutenbevattende granen'],
        mayContain: [],
      };

      const result = classifyDietary(mixedIngredients, mixedAllergens);
      expect(result.vegan).toBe(false); // Contains milk
      expect(result.vegetarian).toBe(true); // No meat/fish
      expect(result.lactoseFree).toBe(false); // Contains milk
      expect(result.glutenFree).toBe(false); // Contains wheat + gluten allergen
      expect(result.plantBased).toBe(false); // Only 66% plant-based
    });
  });
});

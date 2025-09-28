import type { AllergensInfo } from '@picklist/types';
import type { Nutrition } from '@picklist/types';
import type { NutritionalTags } from '@picklist/types';

// EU/Dutch nutritional standards
export const EU_HIGH_FIBER_THRESHOLD = 6; // ≥6g per 100g (EU Commission Regulation No 1924/2006)
export const DUTCH_HIGH_PROTEIN_THRESHOLD = 20; // ≥20g per 100g (Dutch fitness standard)
export const LOW_CARB_THRESHOLD = 10; // <10g net carbs per 100g (Ketogenic threshold)

export const PROTEIN_DENSITY_THRESHOLDS = {
  low: 10, // <10g protein per 100g
  moderate: 20, // 10-20g protein per 100g, ≥20g = high
};

/**
 * Computes net carbs (carbs - fiber, minimum 0)
 */
export function computeNetCarbs(carbs?: number, fiber?: number): number | undefined {
  if (carbs === undefined || isNaN(carbs) || carbs < 0) return undefined;
  const fiberValue = fiber && !isNaN(fiber) && fiber >= 0 ? fiber : 0;
  const result = Math.max(0, carbs - fiberValue);
  return Math.round(result * 1000) / 1000; // Round to 3 decimal places for precision
}

/**
 * Computes net carbs bucket classification
 */
export function computeNetCarbsBucket(
  netCarbs?: number,
): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' | undefined {
  if (netCarbs === undefined || isNaN(netCarbs)) return undefined;

  if (netCarbs < 2) return 'very_low';
  if (netCarbs <= 5) return 'low'; // 2-5g inclusive
  if (netCarbs <= 10) return 'moderate'; // 5-10g inclusive
  if (netCarbs <= 20) return 'high'; // 10-20g inclusive
  return 'very_high'; // >20g
}

/**
 * Computes protein density bucket classification
 */
export function computeProteinBucket(
  protein?: number,
): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' | undefined {
  if (protein === undefined || isNaN(protein)) return undefined;

  if (protein < 5) return 'very_low';
  if (protein <= 10) return 'low'; // 5-10g inclusive
  if (protein <= 20) return 'moderate'; // 10-20g inclusive
  if (protein <= 30) return 'high'; // 20-30g inclusive
  return 'very_high'; // >30g
}

/**
 * EU high fiber standard: ≥6g per 100g
 */
export function computeHighFiberFlag(fiber?: number): boolean {
  if (fiber === undefined || isNaN(fiber)) return false;
  return fiber >= EU_HIGH_FIBER_THRESHOLD;
}

/**
 * Dutch high protein standard: ≥20g per 100g
 */
export function computeHighProteinFlag(protein?: number): boolean {
  if (protein === undefined || isNaN(protein)) return false;
  return protein >= DUTCH_HIGH_PROTEIN_THRESHOLD;
}

/**
 * Low carb classification: <10g net carbs per 100g
 */
export function computeLowCarbFlag(netCarbs?: number): boolean {
  if (netCarbs === undefined || isNaN(netCarbs)) return false;
  return netCarbs < LOW_CARB_THRESHOLD;
}

/**
 * Protein density classification
 */
export function computeProteinDensity(protein?: number): 'low' | 'moderate' | 'high' | undefined {
  if (protein === undefined || isNaN(protein)) return undefined;

  if (protein < PROTEIN_DENSITY_THRESHOLDS.low) return 'low';
  if (protein < PROTEIN_DENSITY_THRESHOLDS.moderate) return 'moderate';
  return 'high';
}

/**
 * Dietary classification based on Dutch ingredient patterns
 */
export function classifyDietary(
  ingredients: string[],
  allergens: AllergensInfo,
): {
  vegan: boolean;
  vegetarian: boolean;
  lactoseFree: boolean;
  glutenFree: boolean;
  plantBased: boolean;
} {
  const ingredientText = ingredients.join(' ').toLowerCase();
  const allergenText = [...allergens.contains, ...allergens.mayContain].join(' ').toLowerCase();

  // Animal products (non-vegan)
  const animalProducts = [
    'melk',
    'ei',
    'boter',
    'kaas',
    'vis',
    'vlees',
    'honing',
    'room',
    'yoghurt',
  ];
  const hasAnimalProducts =
    animalProducts.some((product) => ingredientText.includes(product)) ||
    allergenText.includes('melk') ||
    allergenText.includes('ei') ||
    allergenText.includes('vis');

  // Meat/fish (non-vegetarian)
  const meatFish = ['vis', 'vlees', 'kip', 'rund', 'varken'];
  const hasMeatFish = meatFish.some((meat) => ingredientText.includes(meat));

  // Lactose sources
  const lactoseSources = ['melk', 'room', 'boter', 'kaas', 'lactose', 'yoghurt'];
  const hasLactose =
    lactoseSources.some((source) => ingredientText.includes(source)) ||
    allergenText.includes('melk');

  // Gluten sources
  const glutenSources = ['tarwe', 'rogge', 'gerst', 'haver'];
  const hasGluten =
    glutenSources.some((source) => ingredientText.includes(source)) ||
    allergenText.includes('gluten');

  // Plant-based calculation (>80% plant ingredients)
  const plantIngredients = ['water', 'tarwe', 'gist', 'zout', 'suiker', 'olie', 'rijst', 'mais'];
  const plantCount = ingredients.filter(
    (ingredient) =>
      plantIngredients.some((plant) => ingredient.toLowerCase().includes(plant)) ||
      !animalProducts.some((animal) => ingredient.toLowerCase().includes(animal)),
  ).length;

  const plantPercentage = ingredients.length > 0 ? plantCount / ingredients.length : 1;

  return {
    vegan: !hasAnimalProducts,
    vegetarian: !hasMeatFish,
    lactoseFree: !hasLactose,
    glutenFree: !hasGluten,
    plantBased: plantPercentage > 0.8,
  };
}

/**
 * Main function to compute all nutritional tags
 */
export function computeNutritionalTags(
  nutrition?: Nutrition,
  ingredients?: string[],
  allergens?: AllergensInfo,
): NutritionalTags | undefined {
  // Only compute tags if we have nutrition data or ingredients
  if (!nutrition && (!ingredients || ingredients.length === 0)) {
    return undefined;
  }

  const tags: NutritionalTags = {};

  // Net carbs computation
  if (nutrition?.carbs !== undefined) {
    const netCarbs = computeNetCarbs(nutrition.carbs, nutrition.fiber);
    if (netCarbs !== undefined) {
      tags.netCarbs = netCarbs;
      tags.lowCarb = computeLowCarbFlag(netCarbs);
    }
    const netCarbsBucket = computeNetCarbsBucket(netCarbs);
    if (netCarbsBucket !== undefined) {
      tags.netCarbsBucket = netCarbsBucket;
    }
  }

  // Protein-based tags
  if (nutrition?.protein !== undefined) {
    tags.highProtein = computeHighProteinFlag(nutrition.protein);
    const proteinDensity = computeProteinDensity(nutrition.protein);
    if (proteinDensity !== undefined) {
      tags.proteinDensity = proteinDensity;
    }
  }

  // Fiber tags (always set, defaults to false for missing data)
  tags.highFiber = computeHighFiberFlag(nutrition?.fiber);

  // Dietary classifications (requires ingredients)
  if (ingredients && ingredients.length > 0) {
    const allergensInfo = allergens || { contains: [], mayContain: [] };
    const dietary = classifyDietary(ingredients, allergensInfo);

    tags.vegan = dietary.vegan;
    tags.vegetarian = dietary.vegetarian;
    tags.lactoseFree = dietary.lactoseFree;
    tags.glutenFree = dietary.glutenFree;
    tags.plantBased = dietary.plantBased;
  }

  // Only return tags if we computed something
  const hasContent = Object.keys(tags).length > 0;
  return hasContent ? tags : undefined;
}
